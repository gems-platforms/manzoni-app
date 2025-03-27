import {Editor, Extension, Range} from "@tiptap/core";
import {PluginKey} from "@tiptap/pm/state";
import {Suggestion} from "@tiptap/suggestion";
import {ReactRenderer} from "@tiptap/react";

import tippy, {Instance as TippyInstance} from "tippy.js";

import {
    CheckmarkSquare02Icon,
    Heading01Icon,
    Heading02Icon,
    Heading03Icon,
    LeftToRightListBulletIcon,
    LeftToRightListNumberIcon,
    QuoteDownIcon,
    SolidLine01Icon
} from "hugeicons-react";
import CommandsList, {CommandsListRef} from "../../components/CommandsList";

const EditorCommands = Extension.create({
    name: "node-commands",

    addOptions() {
        return {
            onStart: () => {},
            onExit: () => {}
        };
    },

    addProseMirrorPlugins() {
        const {onStart, onExit} = this.options;

        return [
            Suggestion({
                char: "/",

                pluginKey: new PluginKey("node-suggestion"),

                command: ({editor, range, props}) => {
                    props.command({editor, range});
                },

                editor: this.editor,

                startOfLine: true,

                allow(props) {
                    const {editor} = props;
                    const {$from} = editor.state.selection;

                    // Get the current node at the current selection position
                    const currentNode = $from.node($from.depth);

                    // Check if the current position is the start of an empty line (i.e., no content and no node)
                    return currentNode.type.name === "paragraph";
                },

                items: ({query}) => {
                    return [
                        {
                            id: "9c33910c-019b-4206-bfe9-da1c0f98dbb6",
                            title: "Heading 1",
                            subtitle: "Big section heading.",
                            image: Heading01Icon,
                            command: ({editor, range}: {editor: Editor, range: Range}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setNode("heading", {level: 1})
                                    .run();
                            }
                        },
                        {
                            id: "4158ccb8-64fb-4f10-b37b-f797e8256c2b",
                            title: "Heading 2",
                            subtitle: "Medium section heading.",
                            image: Heading02Icon,
                            command: ({editor, range}: {editor: Editor, range: Range}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setNode("heading", {level: 2})
                                    .run();
                            }
                        },
                        {
                            id: "52d8e4f7-f9f7-4fee-9afa-a264bca0e58f",
                            title: "Heading 3",
                            subtitle: "Small section heading.",
                            image: Heading03Icon,
                            command: ({editor, range}: {editor: Editor, range: Range}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setNode("heading", {level: 3})
                                    .run();
                            }
                        },
                        {
                            id: "de663b97-6803-42a6-a441-ddcc2fd59308",
                            title: "Bulleted list",
                            subtitle: "Create a simple bulleted list.",
                            image: LeftToRightListBulletIcon,
                            command: ({editor, range}: {editor: Editor, range: Range}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleBulletList()
                                    .run();
                            }
                        },
                        {
                            id: "396d6b38-7b2d-4c5a-8738-8fc22d56562f",
                            title: "Numbered list",
                            subtitle: "Create a list with numbering.",
                            image: LeftToRightListNumberIcon,
                            command: ({editor, range}: {editor: Editor, range: Range}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleOrderedList()
                                    .run();
                            }
                        },
                        {
                            id: "527a5675-e232-4f63-8770-490f79cde2fa",
                            title: "To-do list",
                            subtitle: "Track tasks with a to-do list.",
                            image: CheckmarkSquare02Icon,
                            command: ({editor, range}: {editor: Editor, range: Range}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleTaskList()
                                    .run();
                            }
                        },
                        {
                            id: "ca9e3df7-0f46-4cf6-8bfd-20d0fd0aa47b",
                            title: "Quote",
                            subtitle: "Capture a quote.",
                            image: QuoteDownIcon,
                            command: ({editor, range}: {editor: Editor, range: Range}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleBlockquote()
                                    .run();
                            }
                        },
                        {
                            id: "574d8b8f-987e-4195-863c-4a7e440e5c75",
                            title: "Divider",
                            subtitle: "Visually divide blocks.",
                            image: SolidLine01Icon,
                            command: ({editor, range}: {editor: Editor, range: Range}) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setHorizontalRule()
                                    .run();
                            }
                        }
                    ]
                        .filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
                        .slice(0, 11);
                },

                render: () => {
                    let component: ReactRenderer<CommandsListRef> | null = null;
                    let popup: TippyInstance[] | null = null;

                    let clickListener: ((event: MouseEvent) => void) | null = null;

                    return {
                        onStart: (props: any) => {
                            if (onStart) {
                                onStart();
                            }

                            component = new ReactRenderer(CommandsList, {
                                props,
                                editor: props.editor
                            });

                            popup = tippy("body", {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: props.editor.isFocused, // only if the user is typing
                                interactive: true,
                                trigger: "manual",
                                placement: "auto",
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
                                }
                            });

                            // Add click listener
                            clickListener = () => {
                                // Destroy the popup if click is outside
                                if (popup && popup[0] && popup[0].state.isShown) {
                                    popup[0].destroy();
                                }

                                if (onExit) {
                                    onExit();
                                }
                            };

                            document.addEventListener("click", clickListener);
                        },

                        onUpdate(props) {
                            component?.updateProps(props);

                            if (popup && popup[0]) {
                                const getReferenceClientRect = (): DOMRect => {
                                    if (props.clientRect instanceof DOMRect) {
                                        return props.clientRect;
                                    } else {
                                        return new DOMRect();
                                    }
                                };

                                popup[0].setProps({
                                    getReferenceClientRect: getReferenceClientRect
                                });
                            }
                        },

                        onKeyDown(props) {
                            if (props.event.key === "Escape" || props.event.key === "Enter") {
                                if (popup && popup[0] && popup[0].state.isShown) {
                                    if (onExit) {
                                        onExit();
                                    }

                                    popup[0].destroy();
                                }
                            }

                            return component?.ref?.onKeyDown(props) ?? false;
                        },

                        onExit() {
                            // Remove the click listener
                            if (clickListener) {
                                document.removeEventListener("click", clickListener);
                                clickListener = null;
                            }

                            if (popup && popup[0] && !popup[0].state.isDestroyed) {
                                if (onExit) {
                                    onExit();
                                }

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

export default EditorCommands;
