import {Color as TiptapColor} from "@tiptap/extension-color";
import {getHexColor} from "../suggestions/utils";
import {Theme} from "../../contexts/ThemeContext";

interface ColorOptions {
    types: string[],
    theme: Theme
}

export const Color = TiptapColor.extend<ColorOptions>({
    addOptions() {
        return {
            types: ["textStyle"],
            theme: "light"
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    color: {
                        default: null,
                        parseHTML: (element) => element.style.color?.replace(/['"]+/g, ""),
                        renderHTML: (attributes) => {
                            const color = attributes.color;
                            if (!color) {
                                return {};
                            };

                            const hexColor = getHexColor(color, this.options.theme); // Convert placeholder to hex based on theme

                            return {
                                style: `color: ${hexColor}` // Apply the color style to the text
                            };
                        }
                    }
                }
            }
        ];
    }
});
