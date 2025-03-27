import React, {useEffect, useState} from "react";

import {toast} from "sonner";

import {ArrowDownLeft01Icon} from "hugeicons-react";

import {
    EditorContent,
    useEditor
} from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import History from "@tiptap/extension-history";
import HardBreak from "@tiptap/extension-hard-break";
import HighlightSquareBracket from "../text-editor/extensions/decorators/HighlightSquareBracket";

import {
    countWords,
    MIN_DRAFT_PROMPT_WORDS_LENGTH
} from "../../utils";

import {
    StyledButton,
    StyledButtonWithIcon,
    StyledHeader1,
    StyledHeader2,
    StyledParagraph,
    StyledTemplateEditor
} from "../styled";

import {useModel} from "../contexts/useModel";

import Modal from "../components/Modal";
import Dropdown, {DropdownOption} from "../components/Dropdown";

import {useDocument} from "../contexts/useDocument";
import ModelsModal from "./ModelsModal";

export interface OpenTemplateModalAction {
    documentId: string,
    type: "close_template_from_templates" |
      "open_template_from_templates" |
      "open_template_from_document" |
      "open_templates_from_document",
    templateId?: string,
    templateName?: string,
    templateDescription?: string
  }

interface TemplateModalProps {
    isOpen: boolean,
    templateAction?: OpenTemplateModalAction,
    onGenerate: (templateId: string, prompt: string) => void,
    onRequestClose: (action?: OpenTemplateModalAction) => void
}

const TemplateModal: React.FC<TemplateModalProps> = ({
    isOpen,
    templateAction,
    onGenerate,
    onRequestClose
}) => {
    const {
        loadedModelId,
        modelGroups,
        loadModel
    } = useModel();

    const {selectedDocument} = useDocument();

    const [isLoadingModel, setIsLoadingModel] = useState(false);

    const [prompt, setPrompt] = useState("");

    const [modelOptions, setModelOptions] = useState<DropdownOption[]>([]);
    const [selectedModelOption, setSelectedModelOption] = useState<DropdownOption>();

    const [modelsModalIsVisible, setModelsModalIsVisible] = useState(false);

    const extensions = [
        Document,
        Text,
        Paragraph,
        HardBreak,
        Placeholder.configure({
            emptyNodeClass: "is-empty",
            placeholder: ({editor}) => {
                // Check if the editor's first node exists and is empty
                if (editor.isEmpty) {
                    return "Type something... The more context provided, the more original the generated content will be.";
                }

                // No placeholder otherwise
                return "";
            }
        }),
        History,
        HighlightSquareBracket
    ];

    const templateEditor = useEditor({
        extensions,
        content: "",
        editable: true,
        shouldRerenderOnTransaction: false,
        onUpdate({editor}) {
            setPrompt(editor.getText());
        }
    });

    useEffect(() => {
        if (modelOptions && selectedDocument) {
            setSelectedModelOption(modelOptions.find((o) => o.value === selectedDocument.modelId) || undefined);
        }
    }, [modelOptions, selectedDocument]);

    useEffect(() => {
        if (modelGroups && modelGroups.length === 2) {
            // installed models group is not empty
            setModelOptions(modelGroups[0]!.options);
        } else {
            // the installed models group is empty
            setModelOptions([]);
        }
    }, [modelGroups]);

    useEffect(() => {
        const fetchPrompt = async () => {
            const p = await window.electronAPI.fetchPromptForTemplate(templateAction!.templateId!);

            templateEditor!.commands.setContent(p);

            setPrompt(p);
        };

        if (isOpen && templateEditor != null && templateAction != null && templateAction.templateId != null) {
            fetchPrompt();
        }
    }, [isOpen, templateEditor, templateAction]);

    const selectModel = (documentId: string, documentModelId: string) => {
        // Set selected model and loading states
        setSelectedModelOption(modelOptions.find((o) => o.value === documentModelId));

        setIsLoadingModel(true);

        // Load the model
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

    const generateDraft = () => {
        if (templateAction && templateAction.templateId) {
            try {
                onGenerate(templateAction.templateId, prompt);
            } catch (error) {
                toast.error(`${templateAction.templateName?.toLowerCase()} draft creation failed.`);

                console.error("Error during draft creation process:", error);
            }
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            shouldCloseOnEsc={true}
            onRequestClose={() => {
                if (templateAction) {
                    if (templateAction.type === "open_template_from_document") {
                        onRequestClose();
                    } else {
                        onRequestClose({
                            documentId: templateAction.documentId,
                            type: "close_template_from_templates"
                        });
                    }
                }
            }}
        >
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
            }}
            >
                <div>
                    <StyledHeader1 style={{marginTop: 0}}>
                        Generate { templateAction && templateAction.templateName?.toLowerCase() }
                    </StyledHeader1>
                    <StyledParagraph>
                        { templateAction && templateAction.templateDescription }
                    </StyledParagraph>
                </div>
                <StyledButtonWithIcon
                    $type="secondary"
                    style={{width: "auto"}}
                    onClick={() => {
                        if (templateAction) {
                            if (templateAction.type === "open_template_from_document") {
                                onRequestClose();
                            } else {
                                onRequestClose({
                                    documentId: templateAction.documentId,
                                    type: "close_template_from_templates"
                                });
                            }
                        }
                    }}
                >
                    <ArrowDownLeft01Icon />
                    {
                        templateAction && templateAction.type === "open_template_from_document" ?
                            <span>Back to document</span> :
                            <span>Back to templates</span>
                    }
                </StyledButtonWithIcon>
            </div>
            <div style={{
                width: 800,
                height: "100%",
                marginLeft: "auto",
                marginRight: "auto"
            }}
            >
                <div style={{
                    width: "100%",
                    height: "calc(100vh - 200px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                >
                    <StyledHeader2>
                        Instruct AI on what to draft
                    </StyledHeader2>
                    <div style={{
                        width: 800,
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginBottom: 20
                    }}
                    >
                        <StyledTemplateEditor>
                            <EditorContent editor={templateEditor} />
                        </StyledTemplateEditor>
                    </div>
                    <StyledHeader2>
                        Choose an AI model to generate the draft
                    </StyledHeader2>
                    {
                        modelGroups && <div style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 40
                        }}
                        >
                            <Dropdown
                                width={350}
                                placeholder="Choose model"
                                options={modelGroups}
                                isDisabled={isLoadingModel}
                                value={selectedModelOption}
                                onChange={(selectedOption) => {
                                    if (selectedOption.value === "explore_manage_models") {
                                        setModelsModalIsVisible(true);
                                    } else if (selectedDocument && selectedDocument.id && selectedOption.value) {
                                        selectModel(selectedDocument.id, selectedOption.value);
                                    }
                                }}
                            />
                        </div>
                    }
                    <StyledButton
                        $type="primary"
                        style={{width: 350, height: 45}}
                        disabled={isLoadingModel}
                        onClick={() => {
                            if (prompt && countWords(prompt) <= MIN_DRAFT_PROMPT_WORDS_LENGTH) {
                                toast.warning(`Provide a prompt with a minimum length of ${MIN_DRAFT_PROMPT_WORDS_LENGTH} words.`);
                            } else if (templateEditor && templateEditor.storage.highlightSquareBracket.hasPlaceholders) {
                                toast.warning("Fill or remove all the placeholders.");
                            } else if (selectedModelOption == null || selectedModelOption.value == null) {
                                toast.warning("Choose an AI model.");
                            } else {
                                if (selectedDocument != null && (selectedDocument.modelId != loadedModelId || loadedModelId == null)) {
                                    setIsLoadingModel(true);

                                    // Load the model
                                    toast.promise(
                                        loadModel(selectedDocument!.id, selectedDocument!.modelId!), // The promise to track
                                        {
                                            loading: "Loading model...",
                                            success: (data) => {
                                                setIsLoadingModel(false);

                                                // trigger draft generation
                                                generateDraft();

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
                                } else {
                                    generateDraft();
                                }
                            }
                        }}
                    >
                        Generate
                    </StyledButton>
                </div>
            </div>

            <ModelsModal
                isOpen={modelsModalIsVisible}
                onRequestClose={() => setModelsModalIsVisible(false)}
            />
        </Modal>
    );
};

export default TemplateModal;
