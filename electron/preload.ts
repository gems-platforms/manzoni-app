// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {ipcRenderer, contextBridge} from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    os: process.platform,
    ipcRenderer: {
        send: (channel: string, data?: any) => ipcRenderer.send(channel, data),
        on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) =>
            ipcRenderer.on(channel, (event, ...args) => callback(event, ...args)),
        removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
    },
    loadModel: (documentId: string, documentModelId: string, loadedModelId: string | undefined) => ipcRenderer.invoke("load-model", documentId, documentModelId, loadedModelId),
    fetchModels: (isDownloaded?: number) => ipcRenderer.invoke("fetch-models", isDownloaded),
    fetchModel: (modelId: string) => ipcRenderer.invoke("fetch-model", modelId),
    abortTextGeneration: () => ipcRenderer.invoke("abort-text-generation"),
    generateText: (userMessage: string) => ipcRenderer.invoke("generate-text", userMessage),
    downloadModel: (modelId: string, modelUrl: string) => ipcRenderer.invoke("download-model", modelId, modelUrl),
    cancelDownloadModel: (modelId: string) => ipcRenderer.invoke("cancel-download-model", modelId),
    deleteModel: (modelId: string) => ipcRenderer.invoke("delete-model", modelId),
    fetchDocuments: (documentIds?: string[]) => ipcRenderer.invoke("fetch-documents", documentIds),
    openDocument: (documentId: string) => ipcRenderer.invoke("open-document", documentId),
    saveDocument: (docId: string, content: string) => ipcRenderer.invoke("save-document", docId, content),
    renameDocument: (docId: string, newFileName: string) => ipcRenderer.invoke("rename-document", docId, newFileName),
    createDocument: () => ipcRenderer.invoke("create-document"),
    deleteDocument: (docId: string) => ipcRenderer.invoke("delete-document", docId),
    fetchTemplates: () => ipcRenderer.invoke("fetch-templates"),
    fetchTemplatesRecentlyUsed: () => ipcRenderer.invoke("fetch-templates-recently-used"),
    fetchTemplatesSuggested: () => ipcRenderer.invoke("fetch-templates-suggested"),
    fetchPromptForTemplate: (templateId: string) => ipcRenderer.invoke("fetch-prompt-for-template", templateId),
    usedTemplate: (templateId: string) => ipcRenderer.invoke("used-template", templateId),
    downloadAndInstallUpdate: () => ipcRenderer.invoke("download-install-update"),
    getAppVersion: () => ipcRenderer.invoke("get-app-version")
});
