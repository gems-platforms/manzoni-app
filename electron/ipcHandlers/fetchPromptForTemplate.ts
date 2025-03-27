import {ipcMain} from "electron";
import State from "../state";

export function fetchPromptForTemplate() {
    ipcMain.handle("fetch-prompt-for-template", async (event, templateId) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        const templateRecord = db.prepare("SELECT prompt FROM templates WHERE id = ?").get(templateId) as {prompt: string};

        if (templateRecord) {
            const {prompt} = templateRecord;
            return prompt;
        } else {
            throw new Error(`Template with id ${templateId} not found`);
        }
    });
}
