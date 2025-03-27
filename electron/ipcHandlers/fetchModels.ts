import {ipcMain} from "electron";
import State from "../state";

export function fetchModels() {
    ipcMain.handle("fetch-models", async (event, isDownloaded) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        if (isDownloaded != null) {
            return db.prepare("SELECT * FROM models WHERE isDownloaded = ?").all(isDownloaded);
        }
        return db.prepare("SELECT * FROM models").all();
    });
}
