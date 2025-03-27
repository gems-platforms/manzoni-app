import fs from "fs";
import path from "path";
import {app, ipcMain} from "electron";
import State from "../state";

export function deleteModel() {
    ipcMain.handle("delete-model", async (event, modelId) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        // Query the database to get the model's download URL and name
        const model = db.prepare("SELECT downloadUrl FROM models WHERE id = ?").get(modelId) as {downloadUrl: string};

        if (!model) {
            throw new Error(`Model with ID ${modelId} not found`);
        }

        const segments = model.downloadUrl.split("/");
        const modelName = segments[segments.length - 1]; // model.gguf
        const modelPath = path.join(app.getPath("userData"), "models", `${modelName}`);

        // Check if the file exists before attempting to delete it
        if (fs.existsSync(modelPath)) {
            try {
            // Delete the file
                fs.unlinkSync(modelPath);
                console.log(`Deleted file at: ${modelPath}`);

                // Update the models table to set isDownloaded to 0
                db.prepare("UPDATE models SET isDownloaded = ? WHERE id = ?").run(0, modelId);

                // Update the documents table to set modelId to NULL for all records where modelId matches the specified modelId
                db.prepare("UPDATE documents SET modelId = NULL WHERE modelId = ?").run(modelId);

                return true;
            } catch (error) {
                console.error("Error deleting file:", error);
                return false;
            }
        } else {
            console.error("File does not exist:", modelPath);
            return {
                success: false,
                message: "Model file does not exist"
            };
        }
    });
}
