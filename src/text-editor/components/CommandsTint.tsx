import {UnavailableIcon} from "hugeicons-react";
import React, {useEffect, useState} from "react";
import {
    StyledEditorMenuCommandTintButton,
    StyledEditorMenuContainer
} from "../../styled";

import {getHexColor} from "../suggestions/utils";

interface CommandItem {
  type: "color" | "highlight",
  placeholder?: string,
  command: (options: {editor: any, range: any}) => void
}

interface CommandsTintProps {
  theme: any, // Replace `any` with the appropriate theme type if available
  editor: {
    getAttributes: (attribute: string) => {color?: string}
  } | null,
  items: CommandItem[],
  range: any // Replace `any` with the appropriate range type if available
}

export default function CommandsTint(props: CommandsTintProps) {
    const {theme, editor, items, range} = props;

    const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(null);
    const [colors, setColors] = useState<CommandItem[]>([]);
    const [highlights, setHighlights] = useState<CommandItem[]>([]);

    useEffect(() => {
        if (editor) {
            const placeholder = editor.getAttributes("textStyle").color;
            if (placeholder) {
                setSelectedPlaceholder(placeholder);
            } else {
                setSelectedPlaceholder(null);
            }
        }
    }, [editor]);

    useEffect(() => {
        if (items) {
            const c = items.filter((i) => i.type === "color");
            setColors(c);

            const h = items.filter((i) => i.type === "highlight");
            setHighlights(h);
        }
    }, [items]);

    function selectTint(item: CommandItem) {
        if (item) {
            item.command({editor, range});
        }
    }

    return (
        <StyledEditorMenuContainer>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 10,
                    width: 260,
                    height: 125
                }}
            >
                <div style={{marginBottom: 10}}>
                    <span>Color</span>
                    <div
                        style={{
                            display: "flex",
                            gap: 5,
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 10
                        }}
                    >
                        {colors.map((item, index) => (
                            <StyledEditorMenuCommandTintButton
                                key={index}
                                $editorTint={getHexColor(item.placeholder || "", theme)}
                                $selectedTint={getHexColor(selectedPlaceholder || "", theme)}
                                onClick={() => selectTint(item)}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <span>Highlight</span>
                    <div
                        style={{
                            display: "flex",
                            gap: 5,
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 10,
                            justifyContent: "center"
                        }}
                    >
                        {highlights.map((item, index) => (
                            <div key={index}>
                                {item.placeholder ? (
                                    <StyledEditorMenuCommandTintButton
                                        $editorTint={getHexColor(item.placeholder, theme)}
                                        $selectedTint={getHexColor(selectedPlaceholder || "", theme)}
                                        onClick={() => selectTint(item)}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: 25,
                                            height: 25,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >
                                        <UnavailableIcon size={22} onClick={() => selectTint(item)} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StyledEditorMenuContainer>
    );
}
