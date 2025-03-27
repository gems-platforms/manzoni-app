
import {ipcMain} from "electron";
import State from "../state";
import {Template} from "../../types";

export function fetchTemplatesSuggested() {
    ipcMain.handle("fetch-templates-suggested", async () => {
        const state = State.getInstance();
        const db = state.getDatabase();

        const suggestedTemplates = db.prepare(`
          SELECT id, name, description, category
          FROM templates
          WHERE id IN (?, ?, ?)
        `).all("linkedin_post", "seo_post", "cold_email") as Template[];

        return suggestedTemplates.map((template) => ({
            id: template.id,
            name: template.name,
            category: template.category,
            description: template.description
        }));
    });
}
