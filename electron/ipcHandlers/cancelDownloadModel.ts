import fs from "fs";
import {ipcMain} from "electron";
import State from "../state";

export function cancelDownloadModel() {
    ipcMain.handle("cancel-download-model", async (event, modelId) => {
        const state = State.getInstance();

        const download = state.getActiveDownload(modelId);

        if (download) {
            const {controller, writer, modelPath} = download;

            // Abort the request
            controller.abort();

            // Close the write stream
            writer.close();

            // Delete the partially downloaded file
            if (fs.existsSync(modelPath)) {
                fs.unlinkSync(modelPath);
                console.log(`Partially downloaded file deleted: ${modelPath}`);
            }

            // Send download-progress with undefined to indicate cancellation
            if (!event.sender.isDestroyed()) {
                event.sender.send("download-progress", modelId, undefined);
            }

            state.deleteActiveDownload(modelId); // Clean up after cancellation

            return true;
        } else {
            return false;
        }
    });
}
