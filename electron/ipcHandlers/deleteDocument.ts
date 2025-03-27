import {ipcMain} from "electron";
import State from "../state";
import {addDocument} from "../functions/addDocument";

export function deleteDocument() {
    ipcMain.handle("delete-document", async (event, docId) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        const deleteQuery = `
            DELETE FROM documents WHERE id = ?
        `;
        const result = db.prepare(deleteQuery).run(docId);

        // Check if any row was affected by the deletion
        if (result.changes > 0) {
            // Fetch the remaining documents to check the count
            const remainingDocuments = db.prepare("SELECT * FROM documents").all();

            // If no documents remain, call the create-document logic
            if (remainingDocuments.length === 0) {
                // Reuse the create-document logic to create a new empty document
                const newDocument = await addDocument();

                return {
                    deleted: true,
                    createdNew: true,
                    newDocument
                };
            }

            return {
                deleted: true,
                createdNew: false
            };
        } else {
            return {
                deleted: false,
                createdNew: false,
                message: "No matching document record found in the database."
            };
        }
    });
}
