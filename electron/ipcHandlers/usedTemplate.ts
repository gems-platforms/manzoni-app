import {ipcMain} from "electron";
import State from "../state";

export function usedTemplate() {
    ipcMain.handle("used-template", (event, templateId) => {
        const state = State.getInstance();
        const db = state.getDatabase();

        db.prepare(`
          UPDATE templates
          SET selectionCount = selectionCount + 1, lastSelectedAt = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(templateId);
    });
}
