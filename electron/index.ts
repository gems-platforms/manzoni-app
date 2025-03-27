import fs from "fs";
import path, {dirname} from "path";
import {fileURLToPath} from "url";

import {
    BrowserWindow,
    app,
    dialog,
    globalShortcut
} from "electron";

import {
    installExtension,
    REACT_DEVELOPER_TOOLS
} from "@tomjs/electron-devtools-installer";

import {autoUpdater} from "electron-updater";
import log from "electron-log";
import {setupIpcHandlers} from "./ipcHandlers";
import State from "./state";

const __dirname = dirname(fileURLToPath(import.meta.url));

log.transports.file.level = "info";
autoUpdater.logger = log;

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── index.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

// Set the app support directory based on the environment
const isDev = VITE_DEV_SERVER_URL != null;
const appName = isDev ? "Manzoni-dev" : "Manzoni";
const userDataPath = app.getPath("appData"); // Get the app data path
const appSupportFolder = path.join(userDataPath, appName);

// Set the user data path
app.setPath("userData", appSupportFolder);

// Ensure the support folder exists
if (!fs.existsSync(appSupportFolder)) {
    fs.mkdirSync(appSupportFolder, {recursive: true});
}

let mainWindow: BrowserWindow | null;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1290,
        height: 870,
        minWidth: 1290,
        minHeight: 870,
        icon: "./assets/icons/icon.png",
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // and load the index.html of the app.
    if (VITE_DEV_SERVER_URL) { // http://localhost:5173
        mainWindow.loadURL(VITE_DEV_SERVER_URL);

        installExtension(REACT_DEVELOPER_TOOLS) // equals to installExtension("nhdogjmejiglipccpnnnanhbledajbpd")
            .then((ext) => console.log(`Added Extension:  ${ext.name}`))
            .catch((err) => console.log("An error occurred: ", err));

        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
    }

    // Prevent page refreshes in prod (keep them in dev for convenience)
    if (!isDev) {
        globalShortcut.register("F5", () => {
            return;
        });

        globalShortcut.register("CommandOrControl+R", () => {
            return;
        });
    }

    if (mainWindow != null) {
        const state = State.getInstance();
        const activeDownloads = state.getActiveDownloads();

        // Handle the close event
        mainWindow.on("close", (event) => {
            if (activeDownloads.size > 0) {
            // Prevent the default close action
                event.preventDefault();

                // Show a confirmation dialog
                const response = dialog.showMessageBoxSync(mainWindow!, {
                    type: "question",
                    buttons: ["Yes", "No"],
                    title: "Confirm",
                    message: "A model is downloading, if you quit the app you will lose the progress. Are you sure?"
                });

                // If the user chooses 'Yes' (button index 0), allow the app to quit
                if (response === 0) {
                    app.quit(); // Quit the app completely
                }
            // If 'No' is chosen, do nothing and the app will remain open
            } else {
                app.quit();
            }
        });

        // Clean up
        mainWindow.on("closed", () => {
            mainWindow = null;
        });
    }
};

// Set up IPC handlers before the window is created
setupIpcHandlers(); // Ensure handlers are set up before any IPC calls

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Handle app closure
app.on("before-quit", (event) => {
    // clean up shortcuts on quit
    globalShortcut.unregisterAll();

    const state = State.getInstance();
    const activeDownloads = state.getActiveDownloads();

    // Check if any downloads are in progress
    if (activeDownloads.size > 0) {
        console.log("Downloads in progress, cancelling them before quitting...");

        // Loop through each download and cancel it
        for (const [modelId, download] of activeDownloads.entries()) {
            const {controller, writer, modelPath} = download;
            // Abort the request
            controller.abort();

            // Close the write stream
            writer.close();

            // Delete the partially downloaded file
            if (fs.existsSync(modelPath)) {
                fs.unlinkSync(modelPath);
                console.log(`Partially downloaded file deleted: ${modelPath}`);
            }

            // Clean up the downloads map
            state.deleteActiveDownload(modelId);
        }

        // Optionally, delay app quit to ensure all downloads are canceled
        setTimeout(() => {
            console.log("All downloads canceled, quitting the app...");
            app.quit(); // Quit the app after cleaning up
        }, 500); // Give it a small delay to handle the cleanup

        // Prevent default quit behavior until cleanup is done
        event.preventDefault();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
