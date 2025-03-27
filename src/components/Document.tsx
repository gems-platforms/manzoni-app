import React, {
    useEffect,
    useRef,
    useState
} from "react";
import {toast} from "sonner";

import {JSONContent} from "@tiptap/react";
import {Content, generateJSON} from "@tiptap/core";

import TextEditor from "../text-editor/TextEditor";

import {useModel} from "../contexts/useModel";
import {useDocument} from "../contexts/useDocument";

import {
    StyledDocumentHeader,
    StyledToggleSidebarIcon
} from "../styled";


import {Doc} from "../../types";
import {emptyDoc} from "../../utils";

import {editorExtensions} from "../text-editor/extensions/editorExtensions";

import ModelsModal from "../modals/ModelsModal";
import TemplatesModal from "../modals/TemplatesModal";
import TemplateModal, {OpenTemplateModalAction} from "../modals/TemplateModal";
import {useTheme} from "../contexts/useTheme";
import {Tooltip} from "./Tooltip";
import Dropdown, {DropdownOption} from "./Dropdown";

interface DocumentProps {
    documentId: string,
    isDocumentListVisible: boolean,
    onToggleDocsList: () => void
}

const Document: React.FC<DocumentProps> = ({
    documentId,
    isDocumentListVisible,
    onToggleDocsList
}) => {
    const {theme} = useTheme();

    const {
        loadedModelId,
        modelGroups,
        loadModel
    } = useModel();

    const loadedModalIdRef = useRef<string>();

    const {
        selectedDocument,
        openDocument
    } = useDocument();

    const [isLoadingModel, setIsLoadingModel] = useState(false);

    const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [textGenerationIsRunning, setTextGenerationIsRunning] = useState(false);

    const [document, setDocument] = useState<Doc | null>(null);

    const [modelOptions, setModelOptions] = useState<DropdownOption[]>([]);
    const [selectedModelOption, setSelectedModelOption] = useState<DropdownOption | undefined>();

    const [editorContent, setEditorContent] = useState<Content>("");

    const [modelOptionsIsVisible, setModelOptionsIsVisible] = useState(false);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [modelsModalIsVisible, setModelsModalIsVisible] = useState(false);

    const [templateModalAction, setTemplateModalAction] = useState<OpenTemplateModalAction | undefined>();

    useEffect(() => {
        const getDoc = async () => {
            const doc = await openDocument(documentId);
            setDocument(doc);
        };

        if (documentId != null) {
            getDoc();
        }
    }, [documentId]);

    useEffect(() => {
        loadedModalIdRef.current = loadedModelId;
    }, [loadedModelId]);

    useEffect(() => {
        if (document && document.tiptapJson) {
            const content = JSON.parse(document.tiptapJson);

            if (content) {
                setEditorContent(content);
            }
        }
    }, [document]);

    const generateDraft = async (templateId: string, prompt: string) => {
        setIsLoadingGeneration(true);
        setIsGenerating(true);

        setEditorContent(JSON.parse(emptyDoc));

        // generate text
        let generatedContent = "";

        // Define event listeners for real-time streaming
        const handleChunk = async (event: any, chunk: string) => {
            setIsLoadingGeneration(false);

            generatedContent = JSON.stringify(generateJSON(chunk, editorExtensions));

            // save generated text in the document
            setEditorContent(JSON.parse(generatedContent));
        };

        const handleCompletion = async () => {
            setIsGenerating(false);

            // save document
            if (selectedDocument) {
                await window.electronAPI.saveDocument(selectedDocument.id, generatedContent);
            }

            // update template stats
            await window.electronAPI.usedTemplate(templateId);

            // Clean up listeners
            window.electronAPI.ipcRenderer.removeAllListeners("text-chunk");
            window.electronAPI.ipcRenderer.removeAllListeners("text-chunk-success");
            window.electronAPI.ipcRenderer.removeAllListeners("text-chunk-abort");
            window.electronAPI.ipcRenderer.removeAllListeners("text-chunk-error");
        };

        const handleSuccess = async () => {
            // confirmation banner
            if (loadedModalIdRef.current) {
                const loadedModel = await window.electronAPI.fetchModel(loadedModalIdRef.current);
                if (loadedModel.parameters != null && loadedModel.parameters <= 7000000000) {
                    toast.info(
                        `${loadedModel.name} is a small model and can generate poor quality content. Check important info.`, {
                            duration: 10000
                        }
                    );
                } else {
                    toast.info("AI can make mistakes. Check important info.");
                }

                handleCompletion();
            }
        };

        const handleAbort = (event: any, abortMessage: any) => {
            toast.info(abortMessage);
            handleCompletion();
        };

        const handleError = (event: any, errorMessage: any) => {
            toast.error(errorMessage);
            handleCompletion(); // Clean up listeners on error
        };

        // Attach listeners for streaming events
        window.electronAPI.ipcRenderer.on("text-chunk", handleChunk);
        window.electronAPI.ipcRenderer.on("text-chunk-success", handleSuccess);
        window.electronAPI.ipcRenderer.on("text-chunk-abort", handleAbort);
        window.electronAPI.ipcRenderer.on("text-chunk-error", handleError);

        await window.electronAPI.generateText(
            `
                You are a writing assistant. 
                Generate a detailed draft based on the following user request.  
                Avoid repetitive language.
                Use the following html tags to structure the outline: <p>, <h1>, <h2>, <h3>, <ol>, <ul>, <li>, <b>, <i>.

                Request: ${prompt}
            `
        );
    };

    useEffect(() => {
        if (modelGroups != null && modelGroups.length === 2) {
            // installed models group is not empty
            setModelOptions(modelGroups[0]!.options);
        } else {
            // the installed models group is empty
            setModelOptions([]);
        }
    }, [modelGroups]);

    useEffect(() => {
        if (modelOptions && selectedDocument) {
            setSelectedModelOption(modelOptions.find((o) => o.value === selectedDocument.modelId) || undefined);
        }
    }, [modelOptions, selectedDocument]);

    const selectModel = (documentId: string, documentModelId: string) => {
        // Set selected model and loading states
        setSelectedModelOption(modelOptions.find((o) => o.value === documentModelId));

        // Load the model
        setIsLoadingModel(true);
        toast.promise(
            loadModel(documentId, documentModelId), // The promise to track
            {
                loading: "Loading model...",
                success: (data) => {
                    setIsLoadingModel(false);

                    // Customize the success message with model name or other data
                    return `${data.name || "Model"} is ready!`;
                },
                error: () => {
                    setIsLoadingModel(false);

                    // Custom error message
                    return "Failed to load the model.";
                }
            }
        );
    };

    const saveDocument = async (json: JSONContent) => {
        if (selectedDocument) {
            const newContent = JSON.stringify(json);
            await window.electronAPI.saveDocument(selectedDocument.id, newContent);
        }
    };

    const updateDocumentContent = (content: JSONContent) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveDocument(content);
        }, 1000);
    };

    const toggleSelect = () => {
        setModelOptionsIsVisible((prev) => !prev);
    };

    const abortTextGeneration = async () => {
        await window.electronAPI.abortTextGeneration();
    };

    useEffect(() => {
        // Cleanup function that stops text generation on unmount
        return () => {
            abortTextGeneration();
        };
    }, []);

    return (
        <>
            <>
                <div>
                    <StyledDocumentHeader>
                        <Tooltip
                            tooltipText={isDocumentListVisible ? "Close sidebar" : "Open sidebar"}
                        >
                            <StyledToggleSidebarIcon
                                style={{flex: "0 0 auto"}}
                                size={32}
                                onClick={() => onToggleDocsList()}
                            />
                        </Tooltip>
                        <div style={{
                            display: "flex",
                            width: 300,
                            flex: "1",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        >
                            <Dropdown
                                width={300}
                                options={modelGroups}
                                placeholder="Choose model"
                                isDisabled={isLoadingModel || isLoadingGeneration || isGenerating || textGenerationIsRunning}
                                value={selectedModelOption}
                                menuIsOpen={modelOptionsIsVisible}
                                onChange={(selectedOption) => {
                                    if (selectedOption.value === "explore_manage_models") {
                                        setModelsModalIsVisible(true);
                                    } else if (documentId != null) {
                                        selectModel(documentId, selectedOption.value);
                                    }
                                }}
                                onMenuOpen={() => setModelOptionsIsVisible(true)}
                                onMenuClose={() => setModelOptionsIsVisible(false)}
                                onFocus={toggleSelect}
                            />
                        </div>
                    </StyledDocumentHeader>
                    <TextEditor
                        documentId={documentId}
                        documentModelId={selectedModelOption ? selectedModelOption.value : undefined}
                        loadedModelId={loadedModelId}
                        content={editorContent}
                        onOpenTemplateModal={(action: OpenTemplateModalAction) => setTemplateModalAction(action)}
                        onAbortTextGeneration={abortTextGeneration}
                        onTextGenerationIsRunning={setTextGenerationIsRunning}
                        onJson={(json: JSONContent) => updateDocumentContent(json)}
                        theme={theme}
                        isLoading={isLoadingGeneration}
                        isGenerating={isGenerating}
                    />
                </div>
            </>

            <ModelsModal
                isOpen={modelsModalIsVisible}
                onRequestClose={() => setModelsModalIsVisible(false)}
            />

            <TemplatesModal
                isOpen={
                    templateModalAction != null && (
                        templateModalAction.type === "close_template_from_templates" ||
                        templateModalAction.type === "open_templates_from_document" ||
                        templateModalAction.type === "open_template_from_templates"
                    ) ? true : false
                }
                onTemplateSelected={(action) => setTemplateModalAction(action)}
                onRequestClose={() => setTemplateModalAction(undefined)}
            />

            <TemplateModal
                isOpen={
                    templateModalAction && (
                        templateModalAction.type === "open_template_from_document" ||
                        templateModalAction.type === "open_template_from_templates"
                    ) ? true : false
                }
                templateAction={templateModalAction}
                onGenerate={(templateId, prompt) => {
                    generateDraft(templateId, prompt);
                    setTemplateModalAction(undefined);
                }}
                onRequestClose={(action) => setTemplateModalAction(action)}
            />
        </>
    );
};

export default Document;
