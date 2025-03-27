import tippy, {Instance as TippyInstance, sticky} from "tippy.js";
import {Extension, Editor, Content} from "@tiptap/core";
import {ReactRenderer} from "@tiptap/react";
import {PenTool03Icon} from "hugeicons-react";
import PromptsList, {
    AskPromptItem,
    PromptItem,
    PromptsListRef
} from "../../components/PromptsList";
import {adjustScrollIfNeeded} from "../utils";
import {AskAiSuggestion} from "./AskAiSuggestion";

interface AskAiPromptType {
    Custom: PromptItem,
    WriteOutline: PromptItem,
    BrainstormIdeas: PromptItem
}

export const AskAiPrompt: AskAiPromptType = {
    Custom: {
        id: "custom",
        icon: PenTool03Icon,
        prompt: "Custom prompt",
        label: "Ask AI anything...",
        nextAction: "enter"
    },
    WriteOutline: {
        id: "write-outline",
        icon: PenTool03Icon,
        prompt: "Draft an outline...",
        question: "Describe topic and format for the outline. I'll help you draft it.",
        label: "Draft an outline...",
        nextAction: "open"
    },
    BrainstormIdeas: {
        id: "brainstorm-ideas",
        icon: PenTool03Icon,
        prompt: "Brainstorm ideas...",
        question: "What to brainstorm about? I'll help you come up with ideas.",
        label: "Brainstorm ideas...",
        nextAction: "open"
    }
};

function insertContent(editor: Editor, text: Content) {
    const {state} = editor;
    const {selection} = state;
    const {from, to} = selection;

    editor
        .chain()
        .focus()
        .deleteRange({from: from - 1, to})
        .insertContentAt(from - 1, text)
        .run();
}


declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        askAiCommands: {
            setIsGeneratingTextAnswer: (isGenerating: boolean) => ReturnType,
            setIsLoadingModelForAnswer: (isLoading: boolean) => ReturnType
        }
    }
}

const AskAiCommands = Extension.create({
    name: "ask-ai-commands",

    addOptions() {
        return {
            onRunningAi: () => {},
            currentTheme: null
        };
    },

    addStorage() {
        return {
            isGeneratingText: false,
            isLoadingModel: false
        };
    },

    addCommands() {
        return {
            setIsGeneratingTextAnswer: (isGenerating) => () => {
                const onRunningAi = this.options.onRunningAi;
                if (onRunningAi) {
                    onRunningAi(isGenerating);
                }

                this.storage.isGeneratingText = isGenerating;
                return true;
            },
            setIsLoadingModelForAnswer: (isLoading) => () => {
                const onRunningAi = this.options.onRunningAi;
                if (onRunningAi) {
                    onRunningAi(isLoading);
                }

                this.storage.isLoadingModel = isLoading;
                return true;
            }
        };
    },

    addProseMirrorPlugins() {
        return [
            AskAiSuggestion({
                char: " ",

                pluginKey: "ask-ai-suggestion",

                editor: this.editor,

                command: ({editor, props}: {editor: Editor, props: any}) => {
                    props.command({editor});
                },

                allow: (props) => {
                    const {state} = props;
                    const {$from} = state.selection;

                    // Get the last character typed
                    const lastCharacter = state.doc.textBetween($from.pos - 1, $from.pos, " ");

                    // Ensure the user actively typed a space, not just moved the cursor
                    if (lastCharacter !== " ") return false;

                    // Check if the line was completely empty before the space was typed
                    return $from.parent.textContent.trim().length === 0;
                },

                items: () => {
                    const prompts: Array<AskPromptItem> = [];

                    Object.keys(AskAiPrompt).forEach((key) => {
                        const askAiPrompt = AskAiPrompt[key as keyof AskAiPromptType];
                        prompts.push({
                            id: askAiPrompt.id,
                            icon: askAiPrompt.icon,
                            label: askAiPrompt.label,
                            prompt: askAiPrompt.prompt,
                            question: askAiPrompt.question,
                            nextAction: askAiPrompt.nextAction,
                            command: ({editor, text}) => insertContent(editor, text)
                        });
                    });

                    return prompts;
                },

                render: () => {
                    let component: ReactRenderer<PromptsListRef> | null = null;
                    let popup: TippyInstance[] | null = null;

                    return {
                        onStart: (props: any) => {
                            component = new ReactRenderer(PromptsList, {
                                props: {
                                    ...props,
                                    currentTheme: this.options.currentTheme,
                                    documentId: this.editor.storage.globalStorage.documentId,
                                    documentModelId: this.editor.storage.globalStorage.documentModelId,
                                    loadedModelId: this.editor.storage.globalStorage.loadedModelId,
                                    family: "ask"
                                },
                                editor: props.editor
                            });

                            popup = tippy("body", {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                onMount: (instance) => {
                                    const {popper} = instance;
                                    popper.classList.add("custom-bubble-menu");

                                    const focusableElement = popper.querySelector("input");
                                    if (focusableElement) {
                                        focusableElement.focus(); // Move focus to the popup element
                                    } else {
                                        popper.focus(); // Fallback focus if no focusable element found
                                    }
                                },
                                onHide: () => {
                                    if (props.isGeneratingText() || props.isLoadingModel()) {
                                        return false;
                                    }
                                    return;
                                },
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                sticky: true,
                                plugins: [sticky],
                                trigger: "manual",
                                placement: "bottom",
                                zIndex: 100,
                                popperOptions: {
                                    modifiers: [
                                        {
                                            name: "preventOverflow",
                                            options: {
                                                boundary: props.editor.view.dom, // Constrain to the editor's boundary
                                                tether: false
                                            }
                                        },
                                        {
                                            name: "flip",
                                            options: {
                                                fallbackPlacements: [] // Disable flipping to other sides
                                            }
                                        }
                                    ]
                                },
                                onCreate(instance) {
                                    const onTransitionEnd = () => {
                                        // Call the adjust function and wait for scroll animation to finish
                                        adjustScrollIfNeeded(instance).then(() => {
                                            // Remove the event listener after scroll animation finishes
                                            instance.popper.removeEventListener("transitionend", onTransitionEnd);
                                        });
                                    };

                                    // Add the event listener
                                    instance.popper.addEventListener("transitionend", onTransitionEnd);
                                }
                            });
                        },

                        onKeyDown(props: any) {
                            return component?.ref?.onKeyDown(props) ?? false;
                        },

                        onExit() {
                            if (popup && popup[0] && !popup[0].state.isDestroyed) {
                                popup[0].destroy();
                            }

                            if (component) {
                                component.destroy();
                            }
                        }
                    };
                },

                onExit: () => null,

                isGeneratingText: () => this.storage.isGeneratingText,

                isLoadingModel: () => this.storage.isLoadingModel
            })
        ];
    }
});

export default AskAiCommands;
