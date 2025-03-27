import {ipcMain} from "electron";
import State from "../state";
import {Doc} from "../../types";

// Handler to fetch documents from the database
// If an array of document IDs is provided, it returns only those documents
// Otherwise, it returns all documents in the database
export function fetchDocuments() {
    ipcMain.handle("fetch-documents", async (event, documentIds = null) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        let query = "SELECT * FROM documents";
        let params = [];

        // If an array of IDs is passed, modify the query and parameters
        if (Array.isArray(documentIds) && documentIds.length > 0) {
            const placeholders = documentIds.map(() => "?").join(", ");
            query += ` WHERE id IN (${placeholders})`;
            params = documentIds;
        }

        const documents = db.prepare(query).all(...params) as Doc[];
        return documents;
    });
}
