import {Editor} from "@tiptap/core";
import {Plugin, PluginKey} from "@tiptap/pm/state";
import {Decoration, DecorationSet} from "@tiptap/pm/view";

interface MenuSuggestionProps {
    pluginKey: string,
    editor: Editor,
    decorationTag?: string,
    decorationClass?: string,
    onExit?: () => null,
    isOpen?: () => boolean,
    command?: ({editor, props}: {
        editor: Editor,
        props: any
    }) => void,
    items?: () => any[],
    render?: () => any
}

export function MenuSuggestion({
    pluginKey,
    editor,
    decorationTag = "span",
    decorationClass = "suggestion",
    onExit = () => null,
    isOpen = () => false,
    command = () => null,
    items = () => [],
    render = () => ({})
}: MenuSuggestionProps) {
    let props: any;
    const renderer = render?.();
    const key = new PluginKey(pluginKey);

    return new Plugin({
        key: key,

        view: () => {
            return {
                update: (view, prevState) => {
                    const prev = key.getState(prevState);
                    const next = key.getState(view.state);

                    const started = !prev.active && next.active;
                    const stopped = prev.active && !next.active;

                    const handleStart = started;
                    const handleExit = stopped;

                    // Cancel when suggestion isn't active
                    if (!handleStart && !handleExit) {
                        return;
                    }

                    const state = handleExit && !handleStart
                        ? prev
                        : next;

                    const decorationNode = document.querySelector(`[data-decoration-id="${state.decorationId}"]`);

                    props = {
                        editor: editor,
                        items: isOpen() ? items() : [],
                        command: (commandProps: any) => {
                            command({
                                editor: editor,
                                props: commandProps
                            });
                        },
                        decorationNode,
                        // virtual node for popper.js or tippy.js
                        // this can be used for building popups without a DOM node
                        clientRect: decorationNode
                            ? () => {
                                // because of `items` can be asynchrounous we’ll search for the current docoration node
                                const {decorationId} = key.getState(editor.state);
                                const currentDecorationNode = document.querySelector(`[data-decoration-id="${decorationId}"]`);

                                return currentDecorationNode?.getBoundingClientRect();
                            }
                            : null
                    };

                    if (handleExit) {
                        onExit();
                        renderer?.onExit?.(props);
                    }

                    if (handleStart) {
                        renderer?.onStart?.(props);
                    }
                },

                destroy: () => {
                    if (!props) {
                        return;
                    }
                    onExit();
                    renderer?.onExit?.(props);
                }
            };
        },

        state: {
            // Initialize the plugin's internal state.
            init() {
                return {
                    active: false,
                    composing: false,
                    range: {}
                };
            },

            // Apply changes to the plugin state from menu interaction
            apply: (tr, prev) => {
                const {composing} = editor.view;
                const {selection} = tr;
                const {empty, from, to} = selection;

                const next = {...prev, decorationId: null as string | null};
                next.composing = composing;

                // We can only be suggesting if there is a selection
                // or a composition is active
                if (!empty || editor.view.composing) {
                    if (isOpen()) {
                        const decorationId = `id_${Math.floor(Math.random() * 0xFFFFFFFF)}`;
                        next.active = true;
                        next.decorationId = decorationId;
                        next.range = {from, to};
                    } else {
                        next.active = false;
                    }
                } else {
                    next.active = false;
                }

                if (!next.active) {
                    next.decorationId = null;
                    next.range = {};
                }

                return next;
            }
        },

        props: {
            // Call the keydown hook if suggestion is open.
            handleKeyDown: (view, event) => {
                const {active} = key.getState(view.state);

                if (!active) {
                    return false;
                }

                return renderer?.onKeyDown?.({view, event}) || false;
            },

            handleClick: (view) => {
                const {active} = key.getState(view.state);

                if (!active) {
                    return false;
                }

                onExit();
                renderer?.onExit?.(props);

                return true;
            },

            // Setup decorator on the currently active suggestion.
            decorations(state) {
                const {active, range, decorationId} = key.getState(state);

                if (!active) {
                    return null;
                }

                return DecorationSet.create(state.doc, [
                    Decoration.inline(range.from, range.to, {
                        nodeName: decorationTag,
                        class: `${decorationClass} active-suggestion`,
                        "data-decoration-id": decorationId
                    })
                ]);
            }
        }
    });
}
