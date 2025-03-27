import path from "path";
import fs from "fs";
import {app} from "electron";
import {Template} from "../../types";
import State from "../state";

export function createTemplatesTable() {
    // Initialize the templates database
    const state = State.getInstance();
    const db = state.getDatabase();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          prompt TEXT NOT NULL,
          lastSelectedAt DATETIME,
          selectionCount INTEGER DEFAULT 0
        )
      `).run();

    // Prepare statements for database operations
    const insertStmt = db.prepare(`
        INSERT INTO templates (
          id,
          name,
          description,
          category,
          prompt
        ) VALUES (?, ?, ?, ?, ?)
      `);

    const updateStmt = db.prepare(`
        UPDATE templates
        SET name = ?,
            description = ?,
            category = ?,
            prompt = ?
        WHERE id = ?
      `);

    const deleteStmt = db.prepare("DELETE FROM templates WHERE id = ?");

    // Get existing templates from the database
    const selectAllStmt = db.prepare("SELECT id FROM templates");
    const existingTemplates: Template[] = selectAllStmt.all() as Template[];
    const existingTemplateIds = new Set(existingTemplates.map((template) => template.id));

    // Track the templates present in templates.json
    const templateIdsInFile = new Set();

    // Load templates from JSON file
    const templatesFilePath = path.join(app.getAppPath(), "public", "templates.json");
    const templatesBuffer = fs.readFileSync(templatesFilePath, "utf-8");
    const templates = JSON.parse(templatesBuffer);

    // Synchronize templates.json with the database
    templates.forEach((template: Template) => {
        templateIdsInFile.add(template.id);
        if (existingTemplateIds.has(template.id)) {
            // Update if the template already exists in the database
            const existingTemplate = db.prepare("SELECT * FROM templates WHERE id = ?").get(template.id) as Template;

            if (
                existingTemplate.name !== template.name ||
                  existingTemplate.description !== template.description ||
                  existingTemplate.category !== template.category ||
                  existingTemplate.prompt !== template.prompt
            ) {
                updateStmt.run(
                    template.name,
                    template.description,
                    template.category,
                    template.prompt,
                    template.id
                );
            }
        } else {
            // Insert if the template does not exist in the database
            insertStmt.run(
                template.id,
                template.name,
                template.description,
                template.category,
                template.prompt
            );
        }
    });

    // Remove templates from the database that are not in templates.json
    existingTemplateIds.forEach((id) => {
        if (!templateIdsInFile.has(id)) {
            deleteStmt.run(id);
        }
    });
};
