import {ipcMain} from "electron";
import State from "../state";
import {Template} from "../../types";

// Handler to get the list of templates
export function fetchTemplates() {
    ipcMain.handle("fetch-templates", async () => {
        const state = State.getInstance();
        const db = state.getDatabase();

        const templates = (db.prepare("SELECT id, name, description, category FROM templates").all() as Template[]).map((template) => {
            return {
                id: template.id,
                name: template.name,
                category: template.category,
                description: template.description
            };
        });

        return templates;
    });
}
