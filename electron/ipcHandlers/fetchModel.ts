import {ipcMain} from "electron";
import State from "../state";

export function fetchModel() {
    ipcMain.handle("fetch-model", async (event, modelId) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        return db.prepare("SELECT * FROM models WHERE id = ?").get(modelId);
    });
}
