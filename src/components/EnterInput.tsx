import {ArrowTurnBackwardIcon} from "hugeicons-react";
import React, {useEffect, useState} from "react";
import {StyledInput} from "../styled";

interface EnterInputProps {
    placeholder: string,
    type?: string,
    onEnter: (value: string) => void,
    onDelete?: () => void,
    onChange?: (value: string) => void,
    onArrowUp?: () => void,
    onArrowDown?: () => void,
    value?: string,
    showEnterButtonWithText?: boolean,
    showEnterButton?: boolean
}

const EnterInput: React.FC<EnterInputProps> = ({
    placeholder,
    type,
    onEnter,
    onDelete,
    onChange,
    onArrowUp,
    onArrowDown,
    value = "",
    showEnterButtonWithText = true,
    showEnterButton = true
}) => {
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (value != null) {
            setInputValue(value);
        }
    }, [value]);

    const handleEnterKeyPress = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onEnter(inputValue);
        }

        if (e.key === "Backspace" && onDelete != null) {
            onDelete();
        }

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            if (e.key === "ArrowUp" && onArrowUp != null) {
                onArrowUp();
            } else if (e.key === "ArrowDown" && onArrowDown != null) {
                onArrowDown();
            }
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                fontWeight: 600
            }}
        >
            <StyledInput
                autoFocus
                type={type}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    if (onChange != null) {
                        onChange(e.target.value);
                    }
                }}
                onKeyDown={handleEnterKeyPress}
            />
            {
                (showEnterButtonWithText ? (inputValue != null && inputValue.length > 0) : showEnterButton) && (
                    <ArrowTurnBackwardIcon size={18} />
                )
            }
        </div>
    );
};

export default EnterInput;
