import {ReactNode, useEffect, useState} from "react";
import {Blockchain01Icon} from "hugeicons-react";
import {toast} from "sonner";
import {Model} from "../../types";
import {DropdownGroup, DropdownOption} from "../components/Dropdown";
import {getModelIcon} from "../assets";
import {useDocument} from "./useDocument";
import {DownloadProgress, ModelContext} from "./ModelContext";

// Define the provider's prop types
interface ModelProviderProps {
    children: ReactNode
}

// Create a provider component
export const ModelProvider: React.FC<ModelProviderProps> = ({children}) => {
    const {updateDocumentModel} = useDocument();

    const [installedModels, setInstalledModels] = useState<Model[]>([]);
    const [availableModels, setAvailableModels] = useState<Model[]>([]);

    const [loadedModelId, setLoadedModelId] = useState<string>();

    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});

    const [modelGroups, setModelGroups] = useState<DropdownGroup[]>([]);

    const fetchModels = async () => {
        const groups: DropdownGroup[] = [];

        const installed = await window.electronAPI.fetchModels(1);
        setInstalledModels(installed);

        if (installed) {
            const options: DropdownOption[] = installed.map((model) => ({
                value: model.id,
                label: <div style={{display: "flex", alignItems: "center"}}>
                    {
                        model.type && getModelIcon(model.type, 20, 20)
                    }
                    <span style={{marginLeft: 10}}>
                        { model.name }
                    </span>
                </div>
            }));

            groups.push({
                label: "Installed models",
                options: options
            });
        }
        groups.push({
            label: "Explore and manage models",
            options: [
                {
                    value: "explore_manage_models",
                    label: <div style={{display: "flex", alignItems: "center"}}>
                        <Blockchain01Icon size={20} />
                        <span style={{marginLeft: 10}}>View models</span>
                    </div>
                }
            ]
        });
        setModelGroups(groups);

        const available = await window.electronAPI.fetchModels();

        // sort models by the number of parameters (from least to most)
        const sortedAvailableModels = available.sort((a, b) => ((a.parameters ?? 0) - (b.parameters ?? 0)));

        setAvailableModels(sortedAvailableModels);
    };

    useEffect(() => {
        fetchModels();

        // Handle download progress events
        const handleDownloadProgress = (event: any, modelId: number, percentage: number) => {
            setDownloadProgress((prevProgress) => ({
                ...prevProgress,
                [modelId]: percentage
            }));
        };

        window.electronAPI.ipcRenderer.on("download-progress", handleDownloadProgress);

        return () => {
            // Clean up the listener on unmount
            window.electronAPI.ipcRenderer.removeAllListeners("download-progress");
        };
    }, []);

    const loadModel = async (documentId: string, documentModelId: string): Promise<Model> => {
        const model = await window.electronAPI.loadModel(documentId, documentModelId, loadedModelId);
        if (model != null) {
            updateDocumentModel(model.id);
            setLoadedModelId(model.id);
        }

        return model;
    };

    const cancelDownloadModel = async (modelId: string): Promise<boolean> => {
        const isCanceled = await window.electronAPI.cancelDownloadModel(modelId);

        await fetchModels();

        return isCanceled;
    };

    const deleteModel = async (modelId: string): Promise<boolean> => {
        const isDeleted = await window.electronAPI.deleteModel(modelId);

        if (loadedModelId === modelId) {
            setLoadedModelId(undefined);
        }

        await fetchModels();

        return isDeleted;
    };

    const downloadModel = async (modelName: string, modelId: string, modelUrl: string) => {
        // Set the initial progress to 0% when starting the download
        setDownloadProgress((prevProgress) => ({
            ...prevProgress,
            [modelId]: 0
        }));

        await window.electronAPI.downloadModel(modelId, modelUrl);

        toast.success(`${modelName} downloaded successfully!`);

        // Remove the model from the downloading list
        setDownloadProgress((prevProgress) => {
            const {[modelId]: _, ...remainingProgress} = prevProgress;
            return remainingProgress;
        });


        await fetchModels();
    };

    return (
        <ModelContext.Provider value={{
            modelGroups,
            availableModels,
            installedModels,
            loadedModelId,
            downloadProgress,
            fetchModels,
            loadModel,
            downloadModel,
            deleteModel,
            cancelDownloadModel
        }}
        >
            { children }
        </ModelContext.Provider>
    );
};
