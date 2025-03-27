import path from "path";
import fs, {createWriteStream} from "fs";
import {app, ipcMain} from "electron";
import axios from "axios";
import State from "../state";

export function downloadModel() {
    ipcMain.handle("download-model", async (event, modelId, modelUrl) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        const segments = modelUrl.split("/");
        const modelName = segments[segments.length - 1]; // e.g., model.gguf
        const modelPath = path.join(app.getPath("userData"), "models", modelName);

        // Ensure cache directory exists
        const modelDir = path.join(app.getPath("userData"), "models");
        if (!fs.existsSync(modelDir)) {
            fs.mkdirSync(modelDir);
        }

        // Check if the model is already cached
        if (fs.existsSync(modelPath)) {
            return modelPath;
        }

        // Create a write stream to save the model
        const writer = createWriteStream(modelPath);

        // Create an AbortController to handle cancellation
        const controller = new AbortController();
        const signal: AbortSignal = controller.signal;

        // Add the controller to the downloads map
        state.setActiveDownload(modelId, {controller, writer, modelPath});

        try {
            // Perform the download using axios
            const response = await axios({
                method: "get",
                url: modelUrl,
                responseType: "stream", // We need a stream to handle large files
                signal // Use the AbortController's signal for cancellation
            });

            // Check if the response is OK
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const totalSize = parseInt(response.headers["content-length"], 10);
            let downloadedSize = 0;
            let prevPercentage = 0;

            // Track download progress
            response.data.on("data", (chunk: Buffer) => {
                downloadedSize += chunk.length;
                const percentage = Math.floor((downloadedSize / totalSize) * 100);

                // Send progress back to renderer process
                if (!event.sender.isDestroyed() && percentage > prevPercentage) {
                    event.sender.send("download-progress", modelId, percentage);
                    prevPercentage = percentage;
                }
            });

            // Pipe the response stream to the write stream
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on("finish", () => {
                    if (!state.hasActiveDownload(modelId)) {
                        if (!event.sender.isDestroyed()) {
                            event.sender.send("download-progress", modelId, undefined);
                        }
                        return reject(new Error("Download was cancelled"));
                    }

                    // Ensure the file is completely written and not being canceled
                    writer.close(() => {
                        console.log(`Download completed and saved at: ${modelPath}`);

                        // Assuming modelsDb is defined elsewhere in your code
                        db.prepare("UPDATE models SET isDownloaded = ?, modelPath = ? WHERE id = ?")
                            .run(1, modelPath, modelId);

                        state.deleteActiveDownload(modelId); // Clean up after download is finished

                        resolve(modelPath);
                    });
                });

                writer.on("error", (error) => {
                    // Handle any error during download
                    console.error("Download error:", error);
                    reject(error);
                });
            });
        } catch (error) {
            // Delete the partially downloaded file if there's an error
            if (fs.existsSync(modelPath)) {
                fs.unlinkSync(modelPath);
            }

            // Handle cancellation if the signal is triggered
            if (axios.isCancel(error)) {
                console.log(`Download cancelled for model ID ${modelId}`);
                state.deleteActiveDownload(modelId); // Clean up after cancellation
                return Promise.reject(new Error("Download was cancelled"));
            } else if (error instanceof Error) {
                console.error("Error occurred during download:", error.message);

                if (error.message === "canceled") {
                    state.deleteActiveDownload(modelId); // Clean up after cancellation
                    return Promise.reject(new Error("Download was cancelled"));
                }
            } else {
                console.log("Unknown error occurred in download-model");
            }

            throw error; // Rethrow the error for the caller to handle
        }
    });
}
