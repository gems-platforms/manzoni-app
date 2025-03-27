import {Editor, Extension} from "@tiptap/core";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        globalStorage: {
            setDocumentId: (id: string | null) => ReturnType,
            setDocumentModelId: (id: string | null) => ReturnType,
            setLoadedModelId: (id: string | null) => ReturnType
        }
    }
}

const GlobalStorageExtension = Extension.create({
    name: "globalStorage",

    addOptions() {
        return {
            onTextGenerationIsRunning: () => {}
        };
    },

    addStorage() {
        return {
            documentId: null,
            documentModelId: null,
            loadedModelId: null
        };
    },

    addCommands() {
        return {
            setDocumentId: (id) => ({editor}: {editor: Editor}) => {
                editor.storage.globalStorage.documentId = id;
                return true;
            },
            setDocumentModelId: (id) => ({editor}: {editor: Editor}) => {
                editor.storage.globalStorage.documentModelId = id;
                return true;
            },
            setLoadedModelId: (id) => ({editor}: {editor: Editor}) => {
                editor.storage.globalStorage.loadedModelId = id;
                return true;
            }
        };
    }
});

export default GlobalStorageExtension;
