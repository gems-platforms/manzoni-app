import {
    Model,
    Template,
    Doc
} from "../types";

export {};

declare global {
  interface Window {
    electronAPI: {
      os: string,
      ipcRenderer: {
        send: (channel: string, data?: any) => void,
        on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void,
        removeAllListeners: (channel: string) => void
      },
      loadModel: (documentId: string, documentModelId: string, loadedModelId: string | undefined) => Promise<Model>,
      fetchModels: (isDownloaded?: number) => Promise<Model[]>,
      fetchModel: (modelId: string) => Promise<Model>,
      abortTextGeneration: () => Promise<any>,
      generateText: (userMessage: string) => Promise<any>,
      downloadModel: (modelId: string, modelUrl: string) => Promise<any>,
      cancelDownloadModel: (modelId: string) => Promise<boolean>,
      deleteModel: (modelId: string) => Promise<boolean>,
      fetchDocuments: (documentIds?: string[]) => Promise<Doc[]>,
      openDocument: (documentId: string) => Promise<Doc>,
      saveDocument: (docId: string, content: string) => Promise<any>,
      renameDocument: (docId: string, newFileName: string) => Promise<Doc>,
      createDocument: () => Promise<Doc>,
      deleteDocument: (docId: string) => Promise<any>,
      fetchTemplates: () => Promise<Template[]>,
      fetchTemplatesRecentlyUsed: () => Promise<Template[]>,
      fetchTemplatesSuggested: () => Promise<Template[]>,
      fetchPromptForTemplate: (templateId: string) => Promise<string>,
      usedTemplate: (templateId: string) => Promise<void>,
      downloadAndInstallUpdate: () => Promise<Array<string>>,
      getAppVersion: () => Promise<string>
    }
  };
}
