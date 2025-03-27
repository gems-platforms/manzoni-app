import {ipcMain} from "electron";
import {addDocument} from "../functions/addDocument";

export function createDocument() {
    ipcMain.handle("create-document", async (event) => {
        return await addDocument();
    });
}
