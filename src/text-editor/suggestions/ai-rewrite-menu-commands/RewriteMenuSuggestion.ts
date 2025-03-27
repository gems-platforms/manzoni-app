import {Editor} from "@tiptap/core";
import {Plugin, PluginKey} from "@tiptap/pm/state";
import {Decoration, DecorationSet} from "@tiptap/pm/view";

interface RewriteMenuSuggestionProps {
    pluginKey: string,
    editor: Editor,
    decorationTag?: string,
    decorationClass?: string,
    onExit: () => null,
    isOpen: () => boolean,
    command: ({editor, props}: {
        editor: Editor,
        props: any
    }) => void,
    items: () => any[],
    render: () => any,
    isGeneratingText: () => false,
    isLoadingModel: () => false
}

export function RewriteMenuSuggestion({
    pluginKey,
    editor,
    decorationTag = "span",
    decorationClass = "suggestion",
    onExit,
    isOpen,
    command,
    items,
    render,
    isGeneratingText,
    isLoadingModel
}: RewriteMenuSuggestionProps) {
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
                        isGeneratingText: () => isGeneratingText(),
                        isLoadingModel: () => isLoadingModel(),
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
                                const currentDecorationNodes = document.querySelectorAll(`[data-decoration-id="${decorationId}"]`);

                                // Function to get the closest block-level parent of the decoration node
                                function getClosestBlockParent(node: Element) {
                                    while (node && node.nodeType === 1) { // Element node
                                        const display = window.getComputedStyle(node).display;
                                        if (display === "block" || display === "flex" || display === "grid") {
                                            return node; // Found a block-level element
                                        }
                                        node = node.parentNode as Element; // Move up to the parent node
                                    }
                                    return null;
                                }

                                // Array to hold the bounding rectangles of all selected nodes
                                const boundingRects: any[] = [];

                                if (currentDecorationNodes.length > 0) {
                                    currentDecorationNodes.forEach((currentDecorationNode) => {
                                        // Get the closest block-level parent of the decoration node
                                        const blockParent = getClosestBlockParent(currentDecorationNode);

                                        if (blockParent) {
                                            // Get the bounding rect of the block-level parent
                                            boundingRects.push(blockParent.getBoundingClientRect());
                                        } else {
                                            // If no block parent, fallback to the decoration node itself
                                            boundingRects.push(currentDecorationNode.getBoundingClientRect());
                                        }
                                    });
                                }

                                // Combine bounding rectangles
                                if (boundingRects.length > 0) {
                                    const combinedRect = boundingRects.reduce((acc, rect) => {
                                        return {
                                            top: Math.min(acc.top, rect.top),
                                            left: Math.min(acc.left, rect.left),
                                            right: Math.max(acc.right, rect.right),
                                            bottom: Math.max(acc.bottom, rect.bottom),
                                            width: Math.max(acc.right, rect.right) - Math.min(acc.left, rect.left),
                                            height: Math.max(acc.bottom, rect.bottom) - Math.min(acc.top, rect.top)
                                        };
                                    }, {
                                        top: Number.POSITIVE_INFINITY,
                                        left: Number.POSITIVE_INFINITY,
                                        right: Number.NEGATIVE_INFINITY,
                                        bottom: Number.NEGATIVE_INFINITY
                                    });

                                    // Return the bounding rect of the text selection
                                    return {
                                        width: combinedRect.width,
                                        height: combinedRect.height,
                                        top: combinedRect.top,
                                        bottom: combinedRect.bottom,
                                        left: 0, // Position the popup always on the left margin of the editor's text if model is loaded,
                                        // otherwise in correspondence of the text selection
                                        right: combinedRect.right
                                    };
                                }

                                return;
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
                    range: {}
                };
            },

            // Apply changes to the plugin state from menu interaction
            apply: (tr, prev) => {
                const {selection} = tr;
                const {empty, from, to} = selection;

                const next = {...prev, decorationId: null as string | null};

                // We can only be suggesting if there is a selection
                if (!empty || isGeneratingText() || isLoadingModel()) {
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

                if (!isGeneratingText() && !isLoadingModel()) {
                    onExit();
                    renderer?.onExit?.(props);
                }

                return true;
            },

            handleTripleClick: () => {
                return isGeneratingText() || isLoadingModel();
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
