import path from "path";
import fs from "fs";
import {app} from "electron";
import {v4 as uuidv4} from "uuid";
import {Doc} from "../../types";
import {formatDate} from "../../utils";
import State from "../state";

export async function addDocument(): Promise<Doc | undefined> {
    try {
        const state = State.getInstance();
        const db = state.getDatabase();

        // Set the file name for the onboarding document or a regular document
        const fileName = "Untitled";
        let uniqueFileName = fileName;
        let counter = 1;

        // Check for duplicate document names and ensure uniqueness (skip for onboarding)
        let isRunning = true;
        while (isRunning) {
            const checkQuery = "SELECT COUNT(*) as count FROM documents WHERE name = ?";
            const result = db.prepare(checkQuery).get(uniqueFileName) as {count: number};

            if (result.count === 0) {
                // If no document with this name exists, break out of the loop
                isRunning = false;
                break;
            }

            // If a document with the same name exists, append a counter to make it unique
            uniqueFileName = `${fileName} (${counter++})`;
        }

        let documentContent;

        // Determine which content file to read
        const contentFileName = "defaultContent.json";
        const contentFilePath = path.join(app.getAppPath(), "public", contentFileName);

        try {
            const contentBuffer = fs.readFileSync(contentFilePath, "utf-8");
            documentContent = JSON.parse(contentBuffer);
        } catch (error) {
            console.error(`Error reading ${contentFileName}:`, error);
            return; // Exit if there was an error reading the content
        }

        const randomId = uuidv4({
            rng: () => new Uint8Array(16).map(() => Math.floor(Math.random() * 256))
        });

        // Insert the new document into the database
        const insertQuery = `
            INSERT INTO documents (id, name, tiptapJson, createdAt)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP);
        `;
        db.prepare(insertQuery).run(randomId, uniqueFileName, JSON.stringify(documentContent));

        return {
            id: randomId,
            name: uniqueFileName,
            tiptapJson: JSON.stringify(documentContent),
            createdAt: formatDate(new Date())
        };
    } catch (e) {
        console.log(e);
        return;
    }
}
