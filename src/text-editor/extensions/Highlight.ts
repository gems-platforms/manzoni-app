import {Highlight as TiptapHighlight} from "@tiptap/extension-highlight";
import {getHexColor} from "../suggestions/utils";
import {Theme} from "../../contexts/ThemeContext";

interface HighlightOptions {
    theme: Theme,
    multicolor: boolean
}

export const Highlight = TiptapHighlight.extend<HighlightOptions>({
    addOptions() {
        return {
            multicolor: false,
            theme: "light"
        };
    },

    addAttributes() {
        return {
            color: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-color") || element.style.backgroundColor,
                renderHTML: (attributes) => {
                    const color = attributes.color;

                    if (!color) {
                        return {};
                    }

                    const hexColor = getHexColor(color, this.options.theme); // Get the correct color for the current mode
                    return {
                        style: `background-color: ${hexColor}; color: inherit;`,
                        "data-color": color // Keep the placeholder in the DOM for switching
                    };
                }
            }
        };
    }
});
