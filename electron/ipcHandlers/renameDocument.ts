import {ipcMain} from "electron";
import State from "../state";

export function renameDocument() {
    ipcMain.handle("rename-document", async (event, docId, newFileName) => {
        try {
            const state = State.getInstance();
            const db = state.getDatabase();

            // Check if a document with the same name (excluding the current document) already exists
            const checkQuery = `
                SELECT COUNT(*) as count
                FROM documents
                WHERE name = ? AND id != ?
            `;
            const result = db.prepare(checkQuery).get(newFileName, docId) as {count: number};

            if (result.count > 0) {
                throw new Error(`A document with the name "${newFileName}" already exists. Please choose a different name.`);
            }

            // Update the document's name and file path in the database
            const updateQuery = `
                UPDATE documents
                SET name = ?
                WHERE id = ?
            `;
            db.prepare(updateQuery).run(newFileName, docId);

            return {
                id: docId,
                name: newFileName
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to rename file: ${error.message}`);
            } else {
                throw new Error("Unknown error occurred during document rename");
            }
        }
    });
}
