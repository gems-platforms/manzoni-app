import {Extension} from "@tiptap/core";

const EnterKey = Extension.create({
    name: "enter-key",

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                if (this.editor.storage.enableEnterKey) {
                    return false; // Allow default "Enter" behavior
                }

                return true; // Prevent "Enter" from creating a new line
            }
        };
    }
});

export default EnterKey;
