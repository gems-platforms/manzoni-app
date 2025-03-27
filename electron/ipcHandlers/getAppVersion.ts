import {app, ipcMain} from "electron";

export function getAppVersion() {
    ipcMain.handle("get-app-version", () => app.getVersion());
}
