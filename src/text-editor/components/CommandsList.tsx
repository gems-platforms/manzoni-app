// Reference: https://codesandbox.io/s/react-hooks-navigate-list-with-keyboard-eowzo?file=/../index.js

import React, {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle
} from "react";

import {Editor, Range} from "@tiptap/core";

import {HugeiconsProps} from "hugeicons-react";
import {
    StyledEditorCommandsList,
    StyledEditorListButton
} from "../../styled";
import {EditorCommandsIconWrapper} from "../suggestions/EditorCommandsIconWrapper";

interface CommandItem {
    id: string,
    title: string,
    image: React.FC<Omit<HugeiconsProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
    command: (options: {editor: Editor, range: Range}) => void
}

interface CommandsListProps {
    items: CommandItem[],
    editor: Editor,
    range: Range
}

export interface CommandsListRef {
    onKeyDown: ({event}: {event: KeyboardEvent}) => boolean
}

const CommandsList = forwardRef<CommandsListRef, CommandsListProps>((props, ref) => {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const [hasMouseMoved, setHasMouseMoved] = useState<boolean>(false);

    const [hasKeyPressed, setHasKeyPressed] = useState<boolean>(false);

    const [hovered, setHovered] = useState<CommandItem | null>(null);

    function selectItem(index: number) {
        const item = props.items[index];
        if (item) {
            item.command({editor: props.editor, range: props.range});
        }
    }

    function upHandler() {
        const index = (selectedIndex + props.items.length - 1) % props.items.length;

        if (selectedIndex === 0 && scrollRef.current) {
            scrollRef.current.scrollBy(0, 50 * props.items.length); // scroll 50px to the top (-)
        } else if (index < props.items.length - 6 && scrollRef.current) {
            scrollRef.current.scrollBy(0, -50);
        }

        setSelectedIndex(index);
    }

    function downHandler() {
        const index = (selectedIndex + 1) % props.items.length;

        if (selectedIndex === props.items.length - 1 && scrollRef.current) {
            scrollRef.current.scrollBy(0, -50 * props.items.length); // scroll 50px to the bottom (+)
        } else if (index > 5 && scrollRef.current) {
            scrollRef.current.scrollBy(0, 50);
        }

        setSelectedIndex(index);
    }

    function enterHandler() {
        selectItem(selectedIndex);
    }

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useEffect(() => {
        if (props.items.length && hovered) {
            const index = props.items.findIndex((i) => i.id === hovered.id);
            setSelectedIndex(index);
        }
    }, [props.items, hovered]);

    useEffect(() => {
        const handleMouseMove = () => {
            setHasMouseMoved(true);
            setHasKeyPressed(false);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            // Clean up the event listener
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({event}: {event: KeyboardEvent}) => {
            setHasKeyPressed(true);
            setHovered(null);

            if (event.key === "ArrowUp") {
                upHandler();
                return true;
            }

            if (event.key === "ArrowDown") {
                downHandler();
                return true;
            }

            if (event.key === "Enter") {
                enterHandler();
                return true;
            }

            return false;
        }
    }));

    return (
        <>
            {
                props.items.length > 0 && selectedIndex != null && <StyledEditorCommandsList ref={scrollRef}>
                    {
                        props.items.map((item, index) => (
                            <StyledEditorListButton
                                $selected={index === selectedIndex}
                                key={index}
                                onClick={() => selectItem(index)}
                                onMouseEnter={() => {
                                    if (hasMouseMoved && !hasKeyPressed) {
                                        setHovered(item);
                                    }
                                }}
                                onMouseLeave={() => {
                                    setHovered(null);
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}
                                >
                                    { item.image && <EditorCommandsIconWrapper icon={item.image} size={18} /> }
                                    <div style={{margin: 5}}>
                                        {item.title}
                                    </div>
                                </div>
                            </StyledEditorListButton>
                        ))
                    }
                </StyledEditorCommandsList>
            }
        </>
    );
});

export default CommandsList;
