import {
    createContext
} from "react";

import {DropdownGroup} from "../components/Dropdown";

import {Model} from "../../types";

// Define the structure for download tracking
export interface DownloadProgress {
    [modelId: string]: number // Keyed by modelId, value is progress (percentage)
}

// Define the structure of the context value
export interface ModelContextType {
    installedModels: Model[],
    availableModels: Model[],
    loadedModelId: string | undefined,
    modelGroups: DropdownGroup[],
    downloadProgress: DownloadProgress,
    fetchModels: () => Promise<void>,
    loadModel: (documentId: string, documentModelId: string) => Promise<Model>,
    downloadModel: (modelName: string, modelId: string, modelUrl: string) => Promise<void>,
    deleteModel: (modelId: string) => Promise<boolean>,
    cancelDownloadModel: (modelId: string) => Promise<boolean>
}

// Define the initial value for the context (null before it's provided)
export const ModelContext = createContext<ModelContextType | undefined>(undefined);
