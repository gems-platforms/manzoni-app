import {Editor, escapeForRegEx, Range} from "@tiptap/core";
import {Decoration, DecorationSet} from "@tiptap/pm/view";
import {ResolvedPos} from "@tiptap/pm/model";
import {EditorState, Plugin, PluginKey} from "@tiptap/pm/state";
import {toast} from "sonner";

export interface Trigger {
  char: string,
  allowSpaces: boolean,
  allowToIncludeChar: boolean,
  allowedPrefixes: string[] | null,
  startOfLine: boolean,
  $position: ResolvedPos
}

export type SuggestionMatch = {
  range: Range,
  query: string,
  text: string
} | null;

export function findSuggestionMatch(config: Trigger): SuggestionMatch {
    const {
        char,
        allowSpaces: allowSpacesOption,
        allowToIncludeChar,
        allowedPrefixes,
        startOfLine,
        $position
    } = config;

    const allowSpaces = allowSpacesOption && !allowToIncludeChar;

    const escapedChar = escapeForRegEx(char);
    const suffix = new RegExp(`\\s${escapedChar}$`);
    const prefix = startOfLine ? "^" : "";
    const finalEscapedChar = allowToIncludeChar ? "" : escapedChar;
    const regexp = allowSpaces
        ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${finalEscapedChar}|$)`, "gm")
        : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${finalEscapedChar}]*`, "gm");

    const text = $position.nodeBefore?.isText && $position.nodeBefore.text;

    if (!text) {
        return null;
    }

    const textFrom = $position.pos - text.length;
    const match = Array.from(text.matchAll(regexp)).pop();

    if (!match || match.input === undefined || match.index === undefined) {
        return null;
    }

    // JavaScript doesn't have lookbehinds. This hacks a check that first character
    // is a space or the start of the line
    const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);
    const matchPrefixIsAllowed = new RegExp(`^[${allowedPrefixes?.join("")}\0]?$`).test(matchPrefix);

    if (allowedPrefixes !== null && !matchPrefixIsAllowed) {
        return null;
    }

    // The absolute position of the match in the document
    const from = textFrom + match.index;
    let to = from + match[0].length;

    // Edge case handling; if spaces are allowed and we're directly in between
    // two triggers
    if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
        match[0] += " ";
        to += 1;
    }

    // If the $position is located within the matched substring, return that range
    if (from < $position.pos && to >= $position.pos) {
        return {
            range: {
                from,
                to
            },
            query: match[0].slice(char.length),
            text: match[0]
        };
    }

    return null;
}

interface AskAiSuggestionProps {
    char: string,
    allowSpaces?: boolean,
    allowToIncludeChar?: boolean,
    allowedPrefixes?: string[],
    startOfLine?: boolean,
    pluginKey: string,
    editor: Editor,
    decorationTag?: string,
    decorationClass?: string,
    onExit: () => null,
    command: ({editor, props}: {
        editor: Editor,
        props: any
    }) => void,
    allow?: (props: {editor: Editor, state: EditorState, range: Range, isActive?: boolean}) => boolean,
    items: () => any[],
    render: () => any,
    isGeneratingText: () => false,
    isLoadingModel: () => false
}

export function AskAiSuggestion({
    char,
    allowSpaces = false,
    allowToIncludeChar = false,
    allowedPrefixes = [" "],
    startOfLine = false,
    pluginKey,
    editor,
    decorationTag = "span",
    decorationClass = "suggestion",
    onExit,
    command,
    allow = () => true,
    items,
    render,
    isGeneratingText,
    isLoadingModel
}: AskAiSuggestionProps) {
    let props: any;
    const renderer = render?.();
    const key = new PluginKey(pluginKey);

    let isOpen = false;
    let range = {from: 0, to: 0};

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
                        items: items(),
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

                    props.editor
                        .chain()
                        .focus()
                        .deleteSelection()
                        .deleteRange(range)
                        .setTextSelection(range.from)
                        .run();

                    onExit();
                    renderer?.onExit?.();
                }
            };
        },

        state: {
            // Initialize the plugin's internal state.
            init() {
                return {
                    active: false,
                    range: {
                        from: 0,
                        to: 0
                    }
                };
            },

            // Apply changes to the plugin state from menu interaction
            apply: (tr, prev, _oldState, state) => {
                const {selection} = tr;
                const {from, to} = selection;

                const next = {
                    ...prev,
                    decorationId: null as string | null
                };

                const match = findSuggestionMatch({
                    char,
                    allowSpaces,
                    allowToIncludeChar,
                    allowedPrefixes,
                    startOfLine,
                    $position: selection.$from
                });

                // We can only be suggesting if there is a selection
                if (((isLoadingModel() || isGeneratingText() || (match && allow({
                    editor,
                    state,
                    range: match.range,
                    isActive: prev.active
                }))) && editor.storage.globalStorage.documentModelId != null)) {
                    const decorationId = `id_${Math.floor(Math.random() * 0xFFFFFFFF)}`;
                    next.active = true;
                    next.decorationId = decorationId;
                    next.range = match ? match.range : {from, to};
                    range = next.range;
                    isOpen = true;
                } else {
                    next.active = false;
                }

                if (!next.active) {
                    next.decorationId = null;
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

            handleTextInput: (view, from, to, text) => {
                const {state} = view;
                const {selection} = state;
                const {$from} = selection;

                // Check if the cursor is at the start of the line (start of the paragraph)
                const isAtStartOfLine = $from.parent.isTextblock && $from.pos === $from.start();

                // Add your condition for the text input and whether the user is at the beginning of the line
                if (
                    text === " " &&
                    editor.storage.globalStorage.documentModelId == null &&
                    isAtStartOfLine &&
                    selection.empty
                ) {
                    toast.warning("Choose an AI model.");
                    return true;
                }
                return;
            },

            handleClick: (view) => {
                const {active, range} = key.getState(view.state);

                if (!active && !isOpen) {
                    return false;
                }

                if (!isGeneratingText() && !isLoadingModel()) {
                    isOpen = false;

                    if (range && props && props.editor) {
                        props.editor
                            .chain()
                            .focus()
                            .deleteSelection()
                            .deleteRange(range)
                            .setTextSelection(range.from)
                            .run();
                    }

                    onExit();
                    renderer?.onExit?.();
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
