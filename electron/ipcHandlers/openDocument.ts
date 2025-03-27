import {ipcMain} from "electron";
import State from "../state";
import {Doc} from "../../types";

export function openDocument() {
    // Handler to open a single document given its path
    ipcMain.handle("open-document", async (event, documentId) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        const documentRecord = db.prepare("SELECT * FROM documents WHERE id = ?").get(documentId) as Doc;

        return documentRecord;
    });
}
