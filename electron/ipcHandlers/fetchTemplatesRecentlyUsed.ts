import {ipcMain} from "electron";
import State from "../state";
import {Template} from "../../types";

export function fecthTemplatesRecentlyUsed() {
    ipcMain.handle("fetch-templates-recently-used", async () => {
        const state = State.getInstance();
        const db = state.getDatabase();

        const recentTemplates = db.prepare(`
          SELECT id, name, description, category
          FROM templates
          WHERE lastSelectedAt IS NOT NULL
          ORDER BY lastSelectedAt DESC
          LIMIT 5
        `).all() as Template[];

        // If selectionCount criteria is met, return the top 3 templates
        return recentTemplates.map((template) => ({
            id: template.id,
            name: template.name,
            category: template.category,
            description: template.description
        }));
    });
}
