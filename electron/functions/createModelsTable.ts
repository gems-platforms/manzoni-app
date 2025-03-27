import path from "path";
import fs from "fs";
import {app} from "electron";
import {Model} from "../../types";
import State from "../state";

// Function to populate the MODELS table with predefined models (this will be done by the developer)
export function createModelsTable() {
    // Initialize the models database
    const state = State.getInstance();
    const db = state.getDatabase();

    // Read and parse localModels.json
    const modelsFilePath = path.join(app.getAppPath(), "public", "localModels.json");
    const modelsBuffer = fs.readFileSync(modelsFilePath, "utf-8");
    const models = JSON.parse(modelsBuffer);

    // Create the models table if it doesn't exist
    db.prepare(`
          CREATE TABLE IF NOT EXISTS models (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              size INTEGER NOT NULL DEFAULT 0,
              parameters INTEGER,
              quantMethod TEXT,
              languages TEXT, -- e.g. 'en','it','fr','de','es'
              type TEXT,
              downloadUrl TEXT NOT NULL,
              licenseType TEXT,
              licenseUrl TEXT,
              modelPath TEXT,
              moreInfoUrl TEXT,
              isDownloaded INTEGER NOT NULL DEFAULT 0
          )
      `).run();

    const existingModelsStmt = db.prepare("SELECT * FROM models");
    const existingModels: Model[] = existingModelsStmt.all() as Model[];

    // Create a map of existing models for quick lookup by ID
    const existingModelsMap: Map<string, Model> = new Map(
        existingModels.map((model: Model) => [model.id, model])
    );


    // Prepare SQL statements for insert and update
    const insertStmt = db.prepare(`
        INSERT INTO models (
          id,
          name,
          size,
          parameters,
          quantMethod,
          languages,
          type,
          downloadUrl,
          licenseType,
          licenseUrl,
          moreInfoUrl,
          isDownloaded
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStmt = db.prepare(`
        UPDATE models
        SET
            name = ?,
            size = ?,
            parameters = ?,
            quantMethod = ?,
            languages = ?,
            type = ?,
            downloadUrl = ?,
            licenseType = ?,
            licenseUrl = ?,
            moreInfoUrl = ?
        WHERE id = ?
    `);

    models.forEach((model: Model) => {
        const existingModel = existingModelsMap.get(model.id);

        if (!existingModel) {
            // Model does not exist, insert it
            insertStmt.run(
                model.id,
                model.name,
                model.size,
                model.parameters,
                model.quantMethod,
                model.languages,
                model.type,
                model.downloadUrl,
                model.licenseType,
                model.licenseUrl,
                model.moreInfoUrl,
                0
            );
        } else {
            // Model exists, check for updates
            const isUpdated =
            model.name !== existingModel.name ||
            model.size !== existingModel.size ||
            model.parameters !== existingModel.parameters ||
            model.quantMethod !== existingModel.quantMethod ||
            model.languages !== existingModel.languages ||
            model.type !== existingModel.type ||
            model.downloadUrl !== existingModel.downloadUrl ||
            model.licenseType !== existingModel.licenseType ||
            model.licenseUrl !== existingModel.licenseUrl ||
            model.moreInfoUrl !== existingModel.moreInfoUrl;

            if (isUpdated) {
            // Update the model in the database
                updateStmt.run(
                    model.name,
                    model.size,
                    model.parameters,
                    model.quantMethod,
                    model.languages,
                    model.type,
                    model.downloadUrl,
                    model.licenseType,
                    model.licenseUrl,
                    model.moreInfoUrl,
                    model.id
                );
            }
        }
    });
};
