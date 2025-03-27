import path from "path";
import fs from "fs";
import {app} from "electron";
import {Model} from "../../types";
import State from "../state";
import {addDocument} from "./addDocument";

export const createDocumentsTable = async () => {
    // Initialize the documents database
    const state = State.getInstance();
    const db = state.getDatabase();

    // 'createdAt' will be stored as a TEXT value in the format 'YYYY-MM-DD HH:MM:SS'
    db.prepare(`
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            tiptapJson TEXT NOT NULL,
            modelId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (modelId) REFERENCES models(id)
        );
    `).run();

    // make sure there's always a document available
    const result = db.prepare("SELECT COUNT(*) as count FROM documents").get() as {count: number};
    if (result.count === 0) {
        await addDocument();
    }

    // Remove models that are not in localModels.json and not referenced by documents
    const existingModelsStmt = db.prepare("SELECT * FROM models");
    const existingModels: Model[] = existingModelsStmt.all() as Model[];

    const referencedModelsStmt = db.prepare("SELECT DISTINCT modelId FROM documents");
    const referencedModels = new Set<string>(
        referencedModelsStmt.all().map((row: any) => row.modelId as string)
    );

    // Read and parse localModels.json
    const modelsFilePath = path.join(app.getAppPath(), "public", "localModels.json");
    const modelsBuffer = fs.readFileSync(modelsFilePath, "utf-8");
    const models = JSON.parse(modelsBuffer);

    const modelsToRemove = existingModels.filter(
        (existingModel) =>
            !models.some((model: Model) => model.id === existingModel.id) && // Not in localModels.json
              !referencedModels.has(existingModel.id) // Not referenced by documents
    );

    const deleteStmt = db.prepare("DELETE FROM models WHERE id = ?");
    modelsToRemove.forEach((model) => {
        // remove the downloaded model file (if exists)
        const segments = model.downloadUrl.split("/");
        const modelName = segments[segments.length - 1]; // model.gguf
        const modelPath = path.join(app.getPath("userData"), "models", `${modelName}`);

        // Check if the file exists before attempting to delete it
        if (fs.existsSync(modelPath)) {
            try {
                // Delete the file
                fs.unlinkSync(modelPath);
                console.log(`Deleted file at: ${modelPath}`);
            } catch (error) {
                console.error("Error deleting file:", error);
            }
        }

        // remove the model record from database
        deleteStmt.run(model.id);
    });
};
