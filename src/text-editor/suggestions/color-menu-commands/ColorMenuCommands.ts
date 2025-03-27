import tippy, {Instance as TippyInstance} from "tippy.js";
import {ReactRenderer} from "@tiptap/react";

import {Extension, Editor} from "@tiptap/core";
import {MenuSuggestion} from "../MenuSuggestion";

const orangeTextPlaceholder = "orangeText";
const yellowTextPlaceholder = "yellowText";
const greenTextPlaceholder = "greenText";
const blueTextPlaceholder = "blueText";
const purpleTextPlaceholder = "purpleText";
const pinkTextPlaceholder = "pinkText";
const redTextPlaceholder = "redText";

const orangeHighlightPlaceholder = "orangeHighlight";
const yellowHighlightPlaceholder = "yellowHighlight";
const greenHighlightPlaceholder = "greenHighlight";
const blueHighlightPlaceholder = "blueHighlight";
const purpleHighlightPlaceholder = "purpleHighlight";
const pinkHighlightPlaceholder = "pinkHighlight";
const redHighlightPlaceholder = "redHighlight";

import CommandsTint from "../../components/CommandsTint";
import {applyStylesModifier} from "../utils";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        colorMenuCommands: {
            showColorMenuCommands: () => ReturnType,
            hideColorMenuCommands: () => ReturnType,
            toggleColorMenuCommands: () => ReturnType
        }
    }
}

const ColorMenuCommands = Extension.create({
    name: "color-menu-commands",

    addOptions() {
        return {
            onExit: () => {},
            theme: "light"
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
            showColorMenuCommands: () => () => {
                this.storage.isOpen = true;
                return true;
            },
            hideColorMenuCommands: () => () => {
                this.storage.isOpen = false;
                return true;
            },
            toggleColorMenuCommands: () => () => {
                this.storage.isOpen = !this.storage.isOpen;
                return true;
            }
        };
    },

    addProseMirrorPlugins() {
        return [
            MenuSuggestion({
                pluginKey: "color-menu-suggestion",

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

                command: ({editor, props}) => {
                    props.command({editor});
                },

                items: () => {
                    return [
                        {
                            id: "0ad2d286-164c-4ac3-ae2b-eb6eff2019a6",
                            title: "Default",
                            type: "color",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .unsetColor()
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "e23c451c-b742-4408-a4d2-e52d3ee6ce3d",
                            title: "Orange",
                            placeholder: orangeTextPlaceholder,
                            type: "color",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .setColor(orangeTextPlaceholder)
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "637fb6e4-cda4-47f8-8de0-19ee35ab72df",
                            title: "Yellow",
                            placeholder: yellowTextPlaceholder,
                            type: "color",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .setColor(yellowTextPlaceholder)
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "d33c1733-7094-4865-b5cc-1ef61da78e64",
                            title: "Green",
                            placeholder: greenTextPlaceholder,
                            type: "color",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .setColor(greenTextPlaceholder)
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "f6f989cf-ad54-4811-b58a-cd4dcb93bc05",
                            title: "Blue",
                            placeholder: blueTextPlaceholder,
                            type: "color",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .setColor(blueTextPlaceholder)
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "f27a041d-1a6b-4f48-a6f8-70b03fe5bc6e",
                            title: "Purple",
                            placeholder: purpleTextPlaceholder,
                            type: "color",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .setColor(purpleTextPlaceholder)
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "4cb89ae7-6128-4a85-8c2d-7cc26dbbf70f",
                            title: "Pink",
                            placeholder: pinkTextPlaceholder,
                            type: "color",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .setColor(pinkTextPlaceholder)
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "30eb7131-2873-4825-8aee-d3c77bb12328",
                            title: "Red",
                            placeholder: redTextPlaceholder,
                            type: "color",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .setColor(redTextPlaceholder)
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "20b7b199-c858-4959-8089-749560d8701e",
                            title: "Default background",
                            type: "highlight",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetHighlight()
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "d7a95f74-0a83-49af-ac34-1e82aa57157f",
                            title: "Orange background",
                            placeholder: orangeHighlightPlaceholder,
                            type: "highlight",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetColor()
                                    .setHighlight({color: orangeHighlightPlaceholder})
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "3ffa142f-be01-41ba-9c77-51e4150cb50f",
                            title: "Yellow background",
                            placeholder: yellowHighlightPlaceholder,
                            type: "highlight",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetColor()
                                    .setHighlight({color: yellowHighlightPlaceholder})
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "5eeda43e-2b38-411e-b8cc-8036faad8531",
                            title: "Green background",
                            placeholder: greenHighlightPlaceholder,
                            type: "highlight",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetColor()
                                    .setHighlight({color: greenHighlightPlaceholder})
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "dbac86db-d86d-476f-8ceb-65cf3c2d0d78",
                            title: "Blue background",
                            placeholder: blueHighlightPlaceholder,
                            type: "highlight",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetColor()
                                    .setHighlight({color: blueHighlightPlaceholder})
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "8d9d9471-b969-45ab-96e0-96bdadd35a57",
                            title: "Purple background",
                            placeholder: purpleHighlightPlaceholder,
                            type: "highlight",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetColor()
                                    .setHighlight({color: purpleHighlightPlaceholder})
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "49384ea9-5770-4bcd-8fd0-8cd34494b9e7",
                            title: "Pink background",
                            placeholder: pinkHighlightPlaceholder,
                            type: "highlight",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetColor()
                                    .setHighlight({color: pinkHighlightPlaceholder})
                                    .toggleColorMenuCommands()
                                    .run();
                            }
                        },
                        {
                            id: "552e2427-eacd-43c3-9112-bbb92933d5c5",
                            title: "Red background",
                            placeholder: redHighlightPlaceholder,
                            type: "highlight",
                            command: ({editor}: {editor: Editor}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .unsetColor()
                                    .setHighlight({color: redHighlightPlaceholder})
                                    .toggleColorMenuCommands()
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
                            props.theme = this.options.theme;

                            component = new ReactRenderer(CommandsTint, {
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

export default ColorMenuCommands;
