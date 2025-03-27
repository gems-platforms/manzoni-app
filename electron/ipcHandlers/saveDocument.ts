import {ipcMain} from "electron";
import State from "../state";

export function saveDocument() {
    ipcMain.handle("save-document", async (event, docId, content) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        // Update the document's content in the database
        const updateQuery = `
            UPDATE documents
            SET tiptapJson = ?
            WHERE id = ?
        `;
        db.prepare(updateQuery).run(content, docId);

        return {saved: true};
    });
}
