import {Extension} from "@tiptap/core";
import {Plugin, EditorState} from "@tiptap/pm/state";
import {Decoration, DecorationSet} from "@tiptap/pm/view";

// Define a type for the callback function used in createHighlightSquareBracketPlugin
type HighlightCallback = (hasPlaceholders: boolean) => void;

// Create the ProseMirror decoration plugin
const createHighlightSquareBracketPlugin = (callback: HighlightCallback): Plugin => {
    return new Plugin({
        state: {
            init(_, {doc}: {doc: any}) {
                const decorations = findBracketDecorations(doc);
                callback(decorations.length > 0); // Update the flag during initialization
                return DecorationSet.create(doc, decorations);
            },
            apply(tr, oldDecorationSet: DecorationSet, oldState: EditorState, newState: EditorState): DecorationSet {
                if (tr.docChanged) {
                    const decorations = findBracketDecorations(newState.doc);
                    callback(decorations.length > 0); // Update the flag when the document changes
                    return DecorationSet.create(newState.doc, decorations);
                }
                return oldDecorationSet;
            }
        },
        props: {
            decorations(state: EditorState): DecorationSet | undefined {
                return this.getState(state);
            }
        }
    });
};

// Helper function to find decorations for square brackets
function findBracketDecorations(doc: any): Decoration[] {
    const decorations: Decoration[] = [];
    const regex = /\[([^\[\]]+)\]/g; // Match text inside brackets

    doc.descendants((node: any, pos: number) => {
        if (!node.isText || !node.text.includes("[")) {
            return; // Skip nodes without brackets
        }

        let match;
        while ((match = regex.exec(node.text)) !== null) {
            const start = pos + match.index;
            const end = start + match[0].length;

            // Ensure the matched range is valid (i.e., still surrounded by brackets)
            if (node.text[start - pos] === "[" && node.text[end - pos - 1] === "]") {
                decorations.push(
                    Decoration.inline(start, end, {class: "highlight-square-bracket"})
                );
            }
        }
    });

    return decorations;
}

// Create the TipTap extension
const HighlightSquareBracket = Extension.create({
    name: "highlightSquareBracket",

    addProseMirrorPlugins() {
    // Use a callback to track the decoration state
        return [
            createHighlightSquareBracketPlugin((hasPlaceholders: boolean) => {
                this.editor.storage.highlightSquareBracket.hasPlaceholders = hasPlaceholders;
            })
        ];
    },

    onCreate() {
    // Initialize the storage flag
        this.editor.storage.highlightSquareBracket = {hasPlaceholders: false};
    }
});

export default HighlightSquareBracket;
