import {Extension, Editor} from "@tiptap/core";
import tippy, {Instance as TippyInstance} from "tippy.js";
import {ReactRenderer} from "@tiptap/react";
import {MenuSuggestion} from "../MenuSuggestion";
import {applyStylesModifier} from "../utils";
import CommandsLink from "../../components/CommandsLink";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        linkMenuCommands: {
            showLinkMenuCommands: () => ReturnType,
            hideLinkMenuCommands: () => ReturnType,
            toggleLinkMenuCommands: () => ReturnType
        }
    }
}

interface MenuItem {
    id: string,
    action: "add" | "remove",
    command: ({editor, url}: {editor: Editor, url: string}) => void
}

const LinkMenuCommands = Extension.create({
    name: "link-menu-commands",

    addOptions() {
        return {
            onExit: () => {},
            suggestion: {

            }
        };
    },

    // Save some data within your extension instance
    // This data is mutable
    // Access it within the extension under this.storage
    addStorage() {
        return {
            isOpen: false
        };
    },

    addCommands() {
        return {
            showLinkMenuCommands: () => () => {
                this.storage.isOpen = true;
                return true;
            },
            hideLinkMenuCommands: () => () => {
                this.storage.isOpen = false;
                return true;
            },
            toggleLinkMenuCommands: () => () => {
                this.storage.isOpen = !this.storage.isOpen;
                return true;
            }
        };
    },

    addProseMirrorPlugins() {
        return [
            MenuSuggestion({
                pluginKey: "link-menu-suggestion",
                command: ({editor, props}: {editor: Editor, props: any}) => {
                    props.command({editor});
                },
                editor: this.editor,
                isOpen: () => this.storage.isOpen,
                onExit: () => {
                    this.storage.isOpen = false;

                    const {onExit} = this.options;
                    onExit();

                    return null;
                },
                items: (): MenuItem[] => {
                    return [
                        {
                            id: "0dafc377-c672-4037-88c0-9826007e858b",
                            action: "add",
                            command: ({editor, url}: {editor: Editor, url: string}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .extendMarkRange("link")
                                    .setLink({href: url})
                                    .toggleLinkMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "1fcda6b2-c6e2-4a1f-9196-5a7b80400324",
                            action: "remove",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetLink()
                                    .toggleLinkMenuCommands()
                                    .run();
                            }
                        }
                    ];
                },
                render: () => {
                    let component: ReactRenderer | null = null;
                    let popup: TippyInstance[] | null = null;

                    return {
                        onStart: (props: any) => {
                            component = new ReactRenderer(CommandsLink, {
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
                                    modifiers: [applyStylesModifier]
                                }
                            });
                        },

                        onExit: () => {
                            if (popup && popup.length > 0 && popup[0] && !popup[0].state.isDestroyed) {
                                popup[0].destroy();
                            }

                            if (component) {
                                component.destroy();
                                component = null;
                            }
                        }
                    };
                }
            })
        ];
    }
});

export default LinkMenuCommands;
