import tippy, {Instance as TippyInstance} from "tippy.js";
import {Extension, Editor} from "@tiptap/core";
import {ReactRenderer} from "@tiptap/react";

import {
    CheckmarkSquare02Icon,
    Heading01Icon,
    Heading02Icon,
    Heading03Icon,
    HugeiconsProps,
    LeftToRightListBulletIcon,
    LeftToRightListNumberIcon,
    QuoteDownIcon,
    TextIcon
} from "hugeicons-react";

import CommandsList, {CommandsListRef} from "../../components/CommandsList";
import {applyStylesModifier} from "../utils";
import {MenuSuggestion} from "../MenuSuggestion";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        editorMenuCommands: {
            showEditorMenuCommands: () => ReturnType,
            hideEditorMenuCommands: () => ReturnType,
            toggleEditorMenuCommands: () => ReturnType
        }
    }
}

interface MenuItem {
    id: string,
    title: string,
    subtitle: string,
    image: React.FC<Omit<HugeiconsProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
    command: ({editor}: {editor: Editor}) => void
}

const EditorMenuCommands = Extension.create({
    name: "editor-menu-commands",

    addOptions() {
        return {
            onExit: () => {}
        };
    },

    // save some data within your extension instance
    // this data is mutable
    // access it within the extension under this.storage
    addStorage() {
        return {
            isOpen: false
        };
    },

    addCommands() {
        return {
            showEditorMenuCommands: () => () => {
                this.storage.isOpen = true;
                return true;
            },
            hideEditorMenuCommands: () => () => {
                this.storage.isOpen = false;
                return true;
            },
            toggleEditorMenuCommands: () => () => {
                this.storage.isOpen = !this.storage.isOpen;
                return true;
            }
        };
    },

    addProseMirrorPlugins() {
        return [
            MenuSuggestion({
                pluginKey: "editor-menu-suggestion",
                command: ({editor, props}: {editor: Editor, props: any}) => {
                    props.command({editor});
                },
                editor: this.editor,
                isOpen: () => this.storage.isOpen,
                onExit: () => {
                    this.storage.isOpen = false;

                    const {onExit} = this.options;

                    if (onExit) {
                        onExit();
                    }

                    return null;
                },
                items: (): MenuItem[] => {
                    return [
                        {
                            id: "2ad8c718-c047-4e47-806d-3dd9a55e9585",
                            title: "Text",
                            subtitle: "Just start writing with plain text.",
                            image: TextIcon,
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setParagraph()
                                    .toggleEditorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "75e0d091-f92e-4538-96a0-1b2df921b60e",
                            title: "Heading 1",
                            subtitle: "Big section heading.",
                            image: Heading01Icon,
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setParagraph()
                                    .setNode("heading", {level: 1})
                                    .toggleEditorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "637fb6e4-cda4-47f8-8de0-19ee35ab72df",
                            title: "Heading 2",
                            subtitle: "Medium section heading.",
                            image: Heading02Icon,
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setParagraph()
                                    .setNode("heading", {level: 2})
                                    .toggleEditorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "38dab286-16c3-47bf-ae0f-21428b344139",
                            title: "Heading 3",
                            subtitle: "Small section heading.",
                            image: Heading03Icon,
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setParagraph()
                                    .setNode("heading", {level: 3})
                                    .toggleEditorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "a7c55b5c-ff71-4d74-bc50-535e75e67e20",
                            title: "Bulleted list",
                            subtitle: "Create a simple bulleted list.",
                            image: LeftToRightListBulletIcon,
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setParagraph()
                                    .toggleBulletList()
                                    .toggleEditorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "83dd4f00-54dc-4953-ba34-5547270a83d6",
                            title: "Numbered list",
                            subtitle: "Create a list with numbering.",
                            image: LeftToRightListNumberIcon,
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setParagraph()
                                    .toggleOrderedList()
                                    .toggleEditorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "063d528d-d4cc-45ba-a9eb-217c80671337",
                            title: "To-do list",
                            subtitle: "Track tasks with a to-do list.",
                            image: CheckmarkSquare02Icon,
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setParagraph()
                                    .toggleTaskList()
                                    .toggleEditorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "9e3c8494-becc-457e-9265-0d2677db8ea9",
                            title: "Quote",
                            subtitle: "Capture a quote.",
                            image: QuoteDownIcon,
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setParagraph()
                                    .setBlockquote()
                                    .toggleEditorMenuCommands()
                                    .run();
                            }
                        }
                    ];
                },
                render: () => {
                    let component: ReactRenderer<CommandsListRef> | null = null;
                    let popup: TippyInstance[] | null = null;

                    return {
                        onStart: (props: any) => {
                            component = new ReactRenderer(CommandsList, {
                                props,
                                editor: props.editor
                            });

                            popup = tippy("body", {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: "manual",
                                popperOptions: {
                                    modifiers: [
                                        applyStylesModifier
                                    ]
                                }
                            });
                        },

                        onKeyDown: (props: any) => {
                            if (props.event.key === "Escape" || props.event.key === "Enter") {
                                if (popup && popup[0] && popup[0].state.isShown) {
                                    popup[0].destroy();
                                }
                            }

                            return component?.ref?.onKeyDown(props);
                        },

                        onExit: () => {
                            if (popup && popup[0] && !popup[0].state.isDestroyed) {
                                popup[0].destroy();
                            }

                            if (component) {
                                component.destroy();
                            }
                        }
                    };
                }
            })
        ];
    }
});

export default EditorMenuCommands;
