import {
    Extension,
    Editor,
    Content
} from "@tiptap/core";

import tippy, {
    Instance as TippyInstance,
    sticky
} from "tippy.js";

import {ReactRenderer} from "@tiptap/react";

import {
    HandPointingRight01Icon,
    Key01Icon,
    MagicWand01Icon,
    Megaphone01Icon,
    PenTool03Icon,
    SparklesIcon,
    TextAlignJustifyCenterIcon,
    TextAlignLeftIcon,
    Tick02Icon
} from "hugeicons-react";

import PromptsList, {
    CommandAction,
    EditPromptItem,
    PromptItem,
    PromptsListRef
} from "../../components/PromptsList";

import {adjustScrollIfNeeded} from "../utils";

import {RewriteMenuSuggestion} from "./RewriteMenuSuggestion";

// Define the type for RewritePrompt
interface RewritePromptType {
    Custom: PromptItem,
    ImproveWriting: PromptItem,
    FixSpellingGrammar: PromptItem,
    MakeLonger: PromptItem,
    MakeShorter: PromptItem,
    ChangeTone: PromptItem,
    SimplifyLanguage: PromptItem,
    Keywords: PromptItem,
    PassiveToActive: PromptItem
}

export const RewritePrompt: RewritePromptType = {
    Custom: {
        id: "custom",
        icon: PenTool03Icon,
        label: "Ask AI anything...",
        prompt: "Custom prompt",
        nextAction: "enter"
    },
    ImproveWriting: {
        id: "improve-writing",
        icon: MagicWand01Icon,
        label: "Improve writing",
        prompt: "Improve writing without changing its meaning and without adding or taking away concepts.",
        nextAction: "enter"
    },
    FixSpellingGrammar: {
        id: "fix-spelling-grammar",
        icon: Tick02Icon,
        label: "Fix spelling and grammar",
        prompt: "Take the text provided and rewrite it into a clear, grammatically correct version while preserving the original meaning as closely as possible. Correct any spelling mistakes, punctuation errors, verb tense issues, word choice problems, and other grammatical mistakes.",
        nextAction: "enter"
    },
    MakeLonger: {
        id: "make-longer",
        icon: TextAlignJustifyCenterIcon,
        label: "Expand the concept",
        prompt: "Expand the concept. Keep the content provided as is and add 1 or 2 sentences that add details.",
        nextAction: "enter"
    },
    MakeShorter: {
        id: "make-shorter",
        icon: TextAlignLeftIcon,
        label: "Condense the concept",
        prompt: "Condense the concept. Express the same meaning in fewer words. The resulting content cannot be longer than that provided.",
        nextAction: "enter"
    },
    ChangeTone: {
        id: "change-tone",
        icon: Megaphone01Icon,
        label: "Change the tone",
        prompt: "Change the tone",
        nextAction: "open"
    },
    SimplifyLanguage: {
        id: "simplify-language",
        icon: SparklesIcon,
        label: "Simplify the language",
        prompt: "Take the text provided and rewrite it in a way that is easy for young learners in grades 3-5 to read and understand. Simplify advanced vocabulary, break down long sentences, explain difficult concepts in plain language, and present the information in a clear, engaging way. The short rewritten text should convey the core ideas of the original text in an age-appropriate manner.",
        nextAction: "enter"
    },
    Keywords: {
        id: "keywords",
        icon: Key01Icon,
        label: "Rewrite with keywords",
        prompt: "Rewrite with keywords",
        nextAction: "open"
    },
    PassiveToActive: {
        id: "passive-to-active",
        icon: HandPointingRight01Icon,
        label: "Change from passive to active voice",
        prompt: "Rewrite the following text from passive voice to active voice while maintaining the original meaning.",
        nextAction: "enter"
    }
};

function insertContent(editor: Editor, text: Content) {
    const {state} = editor;
    const {selection} = state;
    const {to} = selection;
    editor
        .chain()
        .focus()
        .insertContentAt(to, text)
        .toggleAiRewriteMenuCommands()
        .run();
}

function replaceContent(editor: Editor, text: Content) {
    const {state} = editor;
    const {selection} = state;
    const {from, to} = selection;
    editor
        .chain()
        .focus()
        .deleteRange({from, to}) // Delete the current selection
        .insertContent(text) // Insert the new text
        .toggleAiRewriteMenuCommands()
        .run();
}

function runCommand(editor: Editor, action: CommandAction, text: Content) {
    if (action === "insert") {
        insertContent(editor, text);
    } else if (action === "replace") {
        replaceContent(editor, text);
    }
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        aiRewriteMenuCommands: {
            showAiRewriteMenuCommands: () => ReturnType,
            hideAiRewriteMenuCommands: () => ReturnType,
            toggleAiRewriteMenuCommands: () => ReturnType,
            setIsGeneratingTextEdit: (isGenerating: boolean) => ReturnType,
            setIsLoadingModelForEdit: (isLoading: boolean) => ReturnType
        }
    }
}

const AiRewriteMenuCommands = Extension.create({
    name: "ai-rewrite-menu-commands",

    addOptions() {
        return {
            onRunningAi: () => {},
            currentTheme: null
        };
    },

    // save some data within your extension instance
    // this data is mutable
    // access it within the extension under this.storage
    addStorage() {
        return {
            isOpen: false,
            isGeneratingText: false,
            isLoadingModel: false
        };
    },

    addCommands() {
        return {
            showAiRewriteMenuCommands: () => () => {
                this.storage.isOpen = true;
                return true;
            },
            hideAiRewriteMenuCommands: () => () => {
                this.storage.isOpen = false;
                return true;
            },
            toggleAiRewriteMenuCommands: () => () => {
                this.storage.isOpen = !this.storage.isOpen;
                return true;
            },
            setIsGeneratingTextEdit: (isGenerating) => () => {
                const onRunningAi = this.options.onRunningAi;
                if (onRunningAi) {
                    onRunningAi(isGenerating);
                }

                this.storage.isGeneratingText = isGenerating;
                return true;
            },
            setIsLoadingModelForEdit: (isLoading) => () => {
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
            RewriteMenuSuggestion({
                pluginKey: "ai-rewrite-menu-suggestion",

                editor: this.editor,

                command: ({editor, props}: {editor: Editor, props: any}) => {
                    props.command({editor});
                },

                items: () => {
                    const prompts: Array<EditPromptItem> = [];

                    Object.keys(RewritePrompt).forEach((key) => {
                        // Use `keyof` to access the correct type of `RewritePrompt`
                        const prompt = RewritePrompt[key as keyof RewritePromptType];
                        prompts.push({
                            id: prompt.id,
                            icon: prompt.icon,
                            label: prompt.label,
                            prompt: prompt.prompt,
                            nextAction: prompt.nextAction,
                            command: ({editor, action, text}) => runCommand(editor, action, text)
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
                                    family: "edit"
                                },
                                editor: props.editor
                            });

                            popup = tippy("body", {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                onMount: (instance) => {
                                    const {popper} = instance;
                                    popper.classList.add("custom-bubble-menu");

                                    setTimeout(() => {
                                        const focusableElement = popper.querySelector("input");
                                        if (focusableElement) {
                                            focusableElement.focus(); // Move focus to the popup element
                                        } else {
                                            popper.focus(); // Fallback focus if no focusable element found
                                        }
                                    }, 50);
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
                            return component?.ref?.onKeyDown(props);
                        },

                        onExit: () => {
                            this.storage.isOpen = false;

                            if (popup && popup[0] && !popup[0].state.isDestroyed) {
                                popup[0].destroy();
                            }

                            if (component) {
                                component.destroy();
                            }
                        }
                    };
                },

                isOpen: () => this.storage.isOpen,

                onExit: () => this.storage.isOpen,

                isGeneratingText: () => this.storage.isGeneratingText,

                isLoadingModel: () => this.storage.isLoadingModel
            })
        ];
    }
});

export default AiRewriteMenuCommands;
