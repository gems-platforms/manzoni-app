// Reference: https://codesandbox.io/s/react-hooks-navigate-list-with-keyboard-eowzo?file=/../index.js

import React, {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useMemo
} from "react";

import {toast} from "sonner";

import {TextSelection} from "@tiptap/pm/state";

import {
    EditorContent,
    useEditor
} from "@tiptap/react";
import {
    Content,
    Editor,
    Range,
    generateJSON,
    getHTMLFromFragment
} from "@tiptap/core";
import {Document} from "@tiptap/extension-document";
import {Text} from "@tiptap/extension-text";
import {Blockquote} from "@tiptap/extension-blockquote";
import {Bold} from "@tiptap/extension-bold";
import {BulletList} from "@tiptap/extension-bullet-list";
import {ListItem} from "@tiptap/extension-list-item";
import {Heading} from "@tiptap/extension-heading";
import {Italic} from "@tiptap/extension-italic";
import {OrderedList} from "@tiptap/extension-ordered-list";
import {Paragraph} from "@tiptap/extension-paragraph";
import {Strike} from "@tiptap/extension-strike";
import {Typography} from "@tiptap/extension-typography";
import {Link} from "@tiptap/extension-link";
import {Underline} from "@tiptap/extension-underline";
import {TextStyle} from "@tiptap/extension-text-style";
import {TaskList} from "@tiptap/extension-task-list";
import {TaskItem} from "@tiptap/extension-task-item";
import HardBreak from "@tiptap/extension-hard-break";
import {
    ArrowReloadHorizontalIcon,
    ArrowRight01Icon,
    Cancel01Icon,
    HugeiconsProps,
    StopIcon,
    TextCheckIcon,
    TextWrapIcon
} from "hugeicons-react";
import {Highlight} from "../extensions/Highlight";
import {Color} from "../extensions/Color";

import {
    StyledBackIcon,
    StyledBounceLoader,
    StyledButtonWithIcon,
    StyledEditorListButton,
    StyledEditorMenuContainer,
    StyledEditorPromptsList,
    StyledEnterIcon,
    StyledHeader3,
    StyledHeader4,
    StyledParagraph,
    StyledPromptEditor
} from "../../styled";

import Dropdown, {DropdownOption} from "../../components/Dropdown";
import EnterInput from "../../components/EnterInput";

import {editorExtensions} from "../extensions/editorExtensions";

import {useModel} from "../../contexts/useModel";
import {Model} from "../../../types";
import {Theme} from "../../contexts/ThemeContext";
import {EditorCommandsIconWrapper} from "../suggestions/EditorCommandsIconWrapper";
import {AskAiPrompt} from "../suggestions/ask-ai-commands/AskAiCommands";
import {RewritePrompt} from "../suggestions/ai-rewrite-menu-commands/AiRewriteMenuCommands";

export type PromptFamily = "ask" | "edit";
export type PromptAction = "enter" | "open";
export type CommandAction = "insert" | "replace";

export interface PromptItem {
    id: string,
    icon: React.FC<Omit<HugeiconsProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
    label: string,
    prompt: string,
    question?: string,
    nextAction: PromptAction
}

export interface EditPromptItem extends PromptItem {
    command?: ({editor, action, text}: {editor: Editor, action: CommandAction, text: string | Content}) => void
}

export interface AskPromptItem extends PromptItem {
    command?: ({editor, text}: {editor: Editor, text: string | Content}) => void
}

interface PromptListItemProps {
    currentIndex: number,
    isSelected: boolean,
    item: PromptItem,
    selectItem: (item: number) => void,
    hoverItem: (item: PromptItem | null) => void
}

const PromptListItem: React.FC<PromptListItemProps> = ({
    currentIndex,
    isSelected,
    item,
    selectItem,
    hoverItem
}) => {
    return (
        <StyledEditorListButton
            $selected={isSelected}
            style={{textAlign: "left", width: "100%"}}
            key={currentIndex}
            onClick={() => selectItem(currentIndex)}
            onMouseEnter={() => hoverItem(item)}
            onMouseLeave={() => hoverItem(null)}
        >
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
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                >
                    <EditorCommandsIconWrapper icon={item.icon} size={18} />
                    &nbsp;
                    <div style={{margin: 5}}>{item.label}</div>
                </div>
                {isSelected && item.nextAction === "enter" && <StyledEnterIcon size={18} />}
                {item.nextAction === "open" && <ArrowRight01Icon size={18} />}
            </div>
        </StyledEditorListButton>
    );
};

export interface PromptsListRef {
    onKeyDown: ({event}: {event: KeyboardEvent}) => boolean
}

interface PromptsListProps {
    currentTheme: Theme,
    documentId: string,
    documentModelId: string,
    loadedModelId: string,
    items: PromptItem[],
    editor: Editor,
    range: Range,
    family: PromptFamily
}

const PromptsList = forwardRef<PromptsListRef, PromptsListProps>((props, ref) => {
    const {
        currentTheme,
        documentId,
        documentModelId,
        loadedModelId,
        family
    } = props;

    const {loadModel} = useModel();

    const scrollRef = useRef<HTMLDivElement | null>(null);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
    const [hoveredItem, setHoveredItem] = useState<PromptItem | null>(null);

    const [changeToneOption, setChangeToneOption] = useState<DropdownOption>();

    const [newText, setNewText] = useState<string | Content | null>(null);

    const [isLoadingModel, setIsLoadingModel] = useState(false);

    const [currentLoadedModelId, setCurrentLoadedModelId] = useState<string | null>(null);

    const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [documentModel, setDocumentModel] = useState<Model | null>(null);

    const [inputValue, setInputValue] = useState("");

    const extensions = [
        Document,
        Text,
        Blockquote,
        Bold,
        BulletList.configure({
            itemTypeName: "listItem"
        }),
        ListItem,
        Heading.configure({
            levels: [1, 2, 3]
        }),
        Italic,
        OrderedList.configure({
            itemTypeName: "listItem"
        }),
        Paragraph,
        Strike,
        Highlight.configure({
            multicolor: true,
            theme: currentTheme
        }),
        HardBreak,
        Typography,
        Underline,
        TextStyle,
        Link.configure({
            openOnClick: true
        }),
        Color.configure({
            types: ["textStyle"],
            theme: currentTheme
        }),
        TaskList.configure({
            itemTypeName: "taskItem"
        }),
        TaskItem.configure({
            nested: true
        })
    ];

    const generatedTextEditor = useEditor({
        extensions,
        content: "",
        editable: false
    });

    useEffect(() => {
        async function getDocumentModel() {
            const model = await window.electronAPI.fetchModel(documentModelId);
            setDocumentModel(model);
        }

        if (documentModelId) {
            getDocumentModel();
        } else {
            setDocumentModel(null);
        }
    }, [documentModelId]);

    useEffect(() => {
        setCurrentLoadedModelId(loadedModelId);
    }, [loadedModelId]);

    useEffect(() => {
        if (newText && generatedTextEditor) {
            generatedTextEditor.commands.setContent(newText);
        }
    }, [newText]);

    // Filter prompts based on user input
    const filteredPrompts = useMemo(() => {
        setSelectedItem(null);

        // remove first element (custom prompt placeholder)
        const items = props.items.slice(1);

        if (!inputValue) return items;
        return items.filter((item) =>
            item.prompt.toLowerCase().includes(inputValue.toLowerCase())
        );
    }, [inputValue, props.items]);

    const getSelectedHTML = () => {
        if (!props.editor) {
            return;
        }

        let html;

        // Get the selected fragment
        props.editor.chain().focus()
            .command(({tr}) => {
                html = getHTMLFromFragment(
                    tr.doc.slice(tr.selection.from, tr.selection.to).content,
                    props.editor.schema
                );
                return true;
            })
            .run();

        return html;
    };

    async function generate(prompt: string) {
        props.editor.setOptions({editable: false});

        if (family === "edit") {
            props.editor.commands.setIsGeneratingTextEdit(true);
        } else if (family === "ask") {
            props.editor.commands.setIsGeneratingTextAnswer(true);
        }

        setNewText(null);

        setIsLoadingGeneration(true);
        setIsGenerating(true);

        // Define event listeners for real-time streaming
        const handleChunk = (event: any, chunk: string) => {
            setIsLoadingGeneration(false);

            const htmlToJson = generateJSON(chunk, editorExtensions);
            setNewText(htmlToJson);
        };

        const handleCompletion = () => {
            setIsGenerating(false);

            // Clean up listeners
            window.electronAPI.ipcRenderer.removeAllListeners("text-chunk");
            window.electronAPI.ipcRenderer.removeAllListeners("text-chunk-success");
            window.electronAPI.ipcRenderer.removeAllListeners("text-chunk-abort");
            window.electronAPI.ipcRenderer.removeAllListeners("text-chunk-error");
        };

        const handleSuccess = () => {
            handleCompletion();
        };

        const handleAbort = () => {
            handleCompletion();
        };

        const handleError = (event: any, errorMessage: string): void => {
            toast.error(errorMessage);
            handleCompletion(); // Clean up listeners on error
        };

        // Attach listeners for streaming events
        window.electronAPI.ipcRenderer.on("text-chunk", handleChunk);
        window.electronAPI.ipcRenderer.on("text-chunk-success", handleSuccess);
        window.electronAPI.ipcRenderer.on("text-chunk-abort", handleAbort);
        window.electronAPI.ipcRenderer.on("text-chunk-error", handleError);

        if (family === "edit") {
            const inputHtml = getSelectedHTML();
            await window.electronAPI.generateText(
                `
                    You are a skilled proofreader.
                    The user will provide HTML text along with a specific editing request. 
                    Rewrite the provided HTML content according to the user's request.
                    Organize your response with a clear structure, using the following HTML tags appropriately: 
                    <p>, <h1>, <h2>, <h3>, <ol>, <ul>, <li>, <b>, and <i>. 
                    Avoid redundant language.
                    Html text: ${inputHtml}
                    Request: ${prompt}
                `
            );
        } else if (family === "ask") {
            await window.electronAPI.generateText(
                `
                    You are a skilled writer.
                    Meet the user's request.
                    Organize your response with a clear structure, using the following HTML tags appropriately:
                    <p>, <h1>, <h2>, <h3>, <ol>, <ul>, <li>, <b>, and <i>.
                    Avoid redundant language.
                    Request: ${prompt}
                `
            );
        }
    }

    function prepareGeneration(prompt: string) {
        if (documentModelId != currentLoadedModelId || currentLoadedModelId == null) {
            setIsLoadingModel(true);

            if (family === "edit") {
                props.editor.commands.setIsLoadingModelForEdit(true);
            } else if (family === "ask") {
                props.editor.commands.setIsLoadingModelForAnswer(true);
            }

            // Load model
            toast.promise(
                loadModel(documentId, documentModelId), // The promise to track
                {
                    loading: "Loading model...",
                    success: (data) => {
                        setCurrentLoadedModelId(documentModelId);
                        setIsLoadingModel(false);

                        if (family === "edit") {
                            props.editor.commands.setIsLoadingModelForEdit(false);
                        } else if (family === "ask") {
                            props.editor.commands.setIsLoadingModelForAnswer(false);
                        }

                        generate(prompt);

                        // Customize the success message with model name or other data
                        return `${data.name || "Model"} is ready!`;
                    },
                    error: () => {
                        setIsLoadingModel(false);

                        if (family === "edit") {
                            props.editor.commands.setIsLoadingModelForEdit(false);
                        } else if (family === "ask") {
                            props.editor.commands.setIsLoadingModelForAnswer(false);
                        }

                        // Custom error message
                        return "Failed to load the model.";
                    }
                }
            );
        } else {
            generate(prompt);
        }
    }

    function selectItem(index: number) {
        const item = filteredPrompts[index] || null;
        if (
            item &&
            item.nextAction !== "open"
        ) {
            prepareGeneration(item.prompt);
        }
        setSelectedItem(item);
    }

    function runCustomPrompt(prompt: string) {
        const item = props.items[0]; // custom prompt
        if (item) {
            item.prompt = prompt;
            item.label = prompt;
            setSelectedItem(item);
            prepareGeneration(prompt);
        }
    }

    function changeTonePromptRequest(tone: string) {
        if (tone != null && tone.length > 0) {
            const prompt = `
                Rewrite using a ${tone} tone.
                Do not change the original meaning and do not add or take away concepts.
            `;

            const item = filteredPrompts.find((i) => i.id === RewritePrompt.ChangeTone.id);

            if (item) {
                item.label += `: ${tone}`;
                setSelectedItem(item);
                prepareGeneration(prompt);
            }
        }
    }

    function keywordsPromptRequest(keywords: string) {
        if (keywords != null && keywords.length > 0) {
            const prompt = `
                Rewrite including these keywords: ${keywords}. 
                Do not change the original meaning and do not add or take away concepts.
            `;

            const item = filteredPrompts.find((i) => i.id === RewritePrompt.Keywords.id);

            if (item) {
                item.label += `: ${keywords}`;
                setSelectedItem(item);
                prepareGeneration(prompt);
            }
        }
    }

    function writeOutlinePromptRequest(request: string) {
        if (request != null && request.length > 0) {
            const prompt = `
                Draft me an outline with the following topic and format: ${request}
            `;

            const item = filteredPrompts.find((i) => i.id === AskAiPrompt.WriteOutline.id);

            if (item) {
                item.label = `Write outline: ${request}`;
                setSelectedItem(item);
                prepareGeneration(prompt);
            }
        }
    }

    function brainstormIdeasPromptRequest(request: string) {
        if (request != null && request.length > 0) {
            const prompt = `
                Brainstorm ideas about: ${request}
            `;

            const item = filteredPrompts.find((i) => i.id === AskAiPrompt.BrainstormIdeas.id);

            if (item) {
                item.label = `Barinstorm ideas: ${request}`;
                setSelectedItem(item);
                prepareGeneration(prompt);
            }
        }
    }

    function reset() {
        props.editor.setOptions({editable: true});

        if (family === "edit") {
            props.editor.commands.setIsGeneratingTextEdit(false);
        } else if (family === "ask") {
            props.editor.commands.setIsGeneratingTextAnswer(false);
        }

        setSelectedItem(null);

        setChangeToneOption(undefined);

        setInputValue("");

        setNewText(null);

        const {state, view} = props.editor;
        const {selection} = state;

        // Store the current selection range
        const {from, to} = selection;

        // Restore the text selection
        view.dispatch(
            view.state.tr.setSelection(
                TextSelection.create(view.state.doc, from, to)
            )
        );

        // Focus the editor to ensure the selection is visible
        view.focus();
    }

    function retry() {
        if (selectedItem) {
            prepareGeneration(selectedItem.prompt);
        }
    }

    function keep() {
        if (selectedItem) {
            const item = selectedItem as AskPromptItem;
            if (item.command && newText) {
                item.command({
                    editor: props.editor,
                    text: newText
                });

                reset();
            }
        }
    }

    function insert() {
        if (selectedItem) {
            const item = selectedItem as EditPromptItem;
            if (item.command && newText) {
                item.command({
                    editor: props.editor,
                    action: "insert",
                    text: newText
                });

                reset();
            }
        }
    }

    function replace() {
        if (selectedItem) {
            const item = selectedItem as EditPromptItem;
            if (item.command && newText) {
                item.command({
                    editor: props.editor,
                    action: "replace",
                    text: newText
                });

                reset();
            }
        }
    }

    async function abort() {
        await window.electronAPI.abortTextGeneration();
    }

    useEffect(() => {
        // Cleanup function that stops text generation on unmount
        return () => {
            abort();
        };
    }, []);

    function upHandler() {
        const index = (selectedIndex + filteredPrompts.length - 1) % filteredPrompts.length;

        if (selectedIndex === 0 && scrollRef.current) {
            scrollRef.current.scrollBy(0, 50 * filteredPrompts.length); // scroll 50px to the top (-)
        } else if (index < filteredPrompts.length - 6 && scrollRef.current) {
            scrollRef.current.scrollBy(0, -50);
        }
        setSelectedIndex(index);
    }

    function downHandler() {
        const index = (selectedIndex + 1) % filteredPrompts.length;

        if (selectedIndex === filteredPrompts.length - 1 && scrollRef.current) {
            scrollRef.current.scrollBy(0, -50 * filteredPrompts.length); // scroll 50px to the bottom (+)
        } else if (index > 5 && scrollRef.current) {
            scrollRef.current.scrollBy(0, 50);
        }
        setSelectedIndex(index);
    }

    function enterHandler() {
        selectItem(selectedIndex);
    }

    useEffect(() => setSelectedIndex(0), [filteredPrompts]);

    useEffect(() => {
        if (filteredPrompts.length && hoveredItem) {
            const index = filteredPrompts.findIndex((i) => i.id === hoveredItem.id);
            setSelectedIndex(index);
        }
    }, [filteredPrompts, hoveredItem]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({event}) => {
            if (isLoadingModel || isLoadingGeneration || isGenerating || newText != null) {
                return false;
            }

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
            <div
                style={{
                    position: "relative",
                    top: family === "ask" ? "-40px" : 0
                }}
            >
                <StyledEditorMenuContainer style={{
                    position: "relative",
                    left: "-5px",
                    margin: "0 0 3px 0",
                    width: 700,
                    padding: "5px 15px",
                    boxSizing: "border-box",
                    display: newText == null &&
                        !isLoadingModel &&
                        !isLoadingGeneration &&
                        !isGenerating &&
                        selectedItem?.id !== AskAiPrompt.WriteOutline.id &&
                        selectedItem?.id !== AskAiPrompt.BrainstormIdeas.id ? "block" : "none",
                    transition: "display 0.3s ease"
                }}
                >
                    <EnterInput
                        placeholder="Ask AI anything..."
                        onEnter={(prompt) => {
                            if (filteredPrompts != null && filteredPrompts.length > 0) {
                                enterHandler();
                            } else {
                                runCustomPrompt(prompt);
                            }
                        }}
                        onDelete={() => {
                            if (inputValue != null && inputValue.length === 0) {
                                reset();
                            };
                        }}
                        value={inputValue}
                        onChange={(value) => setInputValue(value)}
                        onArrowUp={upHandler}
                        onArrowDown={downHandler}
                        showEnterButtonWithText={false}
                        showEnterButton={filteredPrompts != null && filteredPrompts.length === 0}
                    />
                </StyledEditorMenuContainer>
                <StyledEditorPromptsList
                    style={{
                        position: "relative",
                        left: "-5px",
                        width: isLoadingModel ||
                        isGenerating ||
                        newText != null ||
                        (selectedItem &&
                            (
                                selectedItem.id === AskAiPrompt.BrainstormIdeas.id ||
                                selectedItem.id === AskAiPrompt.WriteOutline.id
                            )
                        ) ? 700 : 350,
                        height: "auto",
                        boxSizing: "border-box",
                        overflowY: (selectedItem && selectedItem.id === RewritePrompt.ChangeTone.id) ? "unset" : "auto",
                        transition: "width 0.3s ease",
                        display: newText != null ||
                        (filteredPrompts != null && filteredPrompts.length > 0) ||
                        isLoadingModel ||
                        isLoadingGeneration ||
                        isGenerating ? "block" : "none"
                    }}
                    ref={scrollRef}
                >
                    {
                        !isLoadingModel &&
                        !isLoadingGeneration &&
                        !isGenerating &&
                        newText == null &&
                        filteredPrompts != null &&
                        filteredPrompts.length > 0 && <>
                            {
                                selectedItem == null && <div>
                                    {filteredPrompts.map((item, index) => (
                                        <PromptListItem
                                            key={index}
                                            currentIndex={index}
                                            isSelected={index === selectedIndex}
                                            item={item}
                                            selectItem={selectItem}
                                            hoverItem={setHoveredItem}
                                        />
                                    ))}
                                </div>
                            }
                            {
                                selectedItem && selectedItem.id === RewritePrompt.ChangeTone.id &&
                                newText == null && <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "auto",
                                    justifyContent: "space-between",
                                    width: "100%"
                                }}
                                >
                                    <div style={{
                                        padding: "0 10px",
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        width: "100%",
                                        boxSizing: "border-box"
                                    }}
                                    >
                                        <StyledBackIcon
                                            size={25}
                                            onClick={() => reset()}
                                        />
                                        <div style={{flexGrow: 1}}>
                                            <Dropdown
                                                placeholder="Choose tone"
                                                width="100%"
                                                options={[
                                                    {
                                                        value: "custom",
                                                        label: "Custom tone"
                                                    },
                                                    {
                                                        value: "friendly",
                                                        label: "Friendly"
                                                    },
                                                    {
                                                        value: "relaxed",
                                                        label: "Relaxed"
                                                    },
                                                    {
                                                        value: "professional",
                                                        label: "Professional"
                                                    },
                                                    {
                                                        value: "bold",
                                                        label: "Bold"
                                                    },
                                                    {
                                                        value: "adventurous",
                                                        label: "Adventurous"
                                                    },
                                                    {
                                                        value: "witty",
                                                        label: "Witty"
                                                    },
                                                    {
                                                        value: "persuasive",
                                                        label: "Persuasive"
                                                    },
                                                    {
                                                        value: "empathetic",
                                                        label: "Empathetic"
                                                    }
                                                ]}
                                                value={changeToneOption}
                                                onChange={(e) => {
                                                    if (e.value !== "custom") {
                                                        changeTonePromptRequest(e.value);
                                                    } else {
                                                        setChangeToneOption(e);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {
                                        changeToneOption != null && changeToneOption.value === "custom" && <div style={{
                                            padding: "0 10px"
                                        }}
                                        >
                                            <EnterInput
                                                placeholder="Try 'Sassy', 'Casual', or 'Steve Jobs'"
                                                onEnter={(tone) => changeTonePromptRequest(tone)}
                                            />
                                        </div>
                                    }
                                </div>
                            }
                            {
                                selectedItem && selectedItem.id === RewritePrompt.Keywords.id &&
                                newText == null && <>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "auto",
                                        justifyContent: "space-between",
                                        width: "100%"
                                    }}
                                    >
                                        <div style={{
                                            padding: "0 10px",
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            width: "100%",
                                            boxSizing: "border-box"
                                        }}
                                        >
                                            <StyledBackIcon
                                                size={25}
                                                onClick={() => reset()}
                                            />
                                            <div style={{flexGrow: 1}}>
                                                <EnterInput
                                                    placeholder="Keywords (separated by commas)"
                                                    onEnter={(keywords) => keywordsPromptRequest(keywords)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                            {
                                selectedItem &&
                                selectedItem.id === AskAiPrompt.WriteOutline.id &&
                                newText == null && <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "auto",
                                    justifyContent: "space-between",
                                    width: "100%"
                                }}
                                >
                                    <div style={{
                                        padding: "0 10px",
                                        display: "inline-block",
                                        whiteSpace: "nowrap",
                                        width: "100%",
                                        boxSizing: "border-box"
                                    }}
                                    >
                                        <StyledHeader4>
                                            {selectedItem.question}
                                        </StyledHeader4>
                                        <EnterInput
                                            placeholder="Ask AI anything..."
                                            onEnter={(request) => writeOutlinePromptRequest(request)}
                                        />
                                    </div>
                                </div>
                            }
                            {
                                selectedItem && selectedItem.id === AskAiPrompt.BrainstormIdeas.id &&
                                newText == null && <>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "auto",
                                        justifyContent: "space-between",
                                        width: "100%"
                                    }}
                                    >
                                        <div style={{
                                            padding: "0 10px",
                                            display: "inline-block",
                                            whiteSpace: "nowrap",
                                            width: "100%",
                                            boxSizing: "border-box"
                                        }}
                                        >
                                            <StyledHeader4>
                                                {selectedItem.question}
                                            </StyledHeader4>
                                            <EnterInput
                                                placeholder="Ask AI anything..."
                                                onEnter={(request) => brainstormIdeasPromptRequest(request)}
                                            />
                                        </div>
                                    </div>
                                </>
                            }
                        </>
                    }
                    {
                        (
                            isLoadingModel ||
                            isLoadingGeneration ||
                            isGenerating ||
                            newText != null
                        ) && <div style={{padding: 10}}>
                            {
                                selectedItem && <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}
                                >
                                    <EditorCommandsIconWrapper
                                        icon={selectedItem.icon}
                                        size={22}
                                    />
                                    &nbsp;
                                    <StyledHeader3>
                                        { selectedItem.label }
                                    </StyledHeader3>
                                </div>
                            }

                            {
                                newText == null && (isLoadingModel || isLoadingGeneration) ? <p>
                                    <StyledBounceLoader size={18} />
                                </p> : <div style={{
                                    maxHeight: 170,
                                    overflowY: "auto",
                                    marginTop: 0,
                                    fontWeight: "normal"
                                }}
                                >
                                    <StyledPromptEditor>
                                        <EditorContent editor={generatedTextEditor} />
                                    </StyledPromptEditor>
                                </div>
                            }


                            {
                                family === "edit" && <div style={{
                                    display: "grid",
                                    gridGap: 10,
                                    gridTemplateColumns: "1fr 1fr 1fr 1fr"
                                }}
                                >
                                    {
                                        !isLoadingModel && !isGenerating && <>
                                            <StyledButtonWithIcon
                                                onClick={() => replace()}
                                                $type="primary"
                                            >
                                                <TextCheckIcon />
                                                &nbsp;
                                                Overwrite
                                            </StyledButtonWithIcon>
                                            <StyledButtonWithIcon
                                                onClick={() => insert()}
                                                $type="primary"
                                            >
                                                <TextWrapIcon />
                                                &nbsp;
                                                Insert below
                                            </StyledButtonWithIcon>
                                            <StyledButtonWithIcon
                                                onClick={() => retry()}
                                                $type="secondary"
                                            >
                                                <ArrowReloadHorizontalIcon />
                                                &nbsp;
                                                Try again
                                            </StyledButtonWithIcon>
                                            <StyledButtonWithIcon
                                                onClick={() => reset()}
                                                $type="danger"
                                            >
                                                <Cancel01Icon />
                                                <span>Discard</span>
                                            </StyledButtonWithIcon>
                                        </>
                                    }
                                    {
                                        !isLoadingModel &&
                                        !isLoadingGeneration &&
                                        isGenerating && <>
                                            <StyledButtonWithIcon
                                                onClick={() => abort()}
                                                $type="danger"
                                            >
                                                <StopIcon />
                                                &nbsp;
                                                Stop generating
                                            </StyledButtonWithIcon>
                                        </>
                                    }
                                </div>
                            }

                            {
                                family === "ask" && <div style={{
                                    display: "grid",
                                    gridGap: 10,
                                    gridTemplateColumns: "1fr 1fr 1fr"
                                }}
                                >
                                    {
                                        !isLoadingModel && !isGenerating && <>
                                            <StyledButtonWithIcon
                                                onClick={() => keep()}
                                                $type="primary"
                                            >
                                                <TextCheckIcon />
                                                &nbsp;
                                                Keep
                                            </StyledButtonWithIcon>
                                            <StyledButtonWithIcon
                                                onClick={() => retry()}
                                                $type="secondary"
                                            >
                                                <ArrowReloadHorizontalIcon />
                                                &nbsp;
                                                Try again
                                            </StyledButtonWithIcon>
                                            <StyledButtonWithIcon
                                                onClick={() => reset()}
                                                $type="danger"
                                            >
                                                <Cancel01Icon />
                                                <span>Discard</span>
                                            </StyledButtonWithIcon>
                                        </>
                                    }
                                    {
                                        !isLoadingModel &&
                                        !isLoadingGeneration &&
                                        isGenerating && <>
                                            <StyledButtonWithIcon
                                                onClick={() => abort()}
                                                $type="danger"
                                            >
                                                <StopIcon />
                                                &nbsp;
                                                Stop generating
                                            </StyledButtonWithIcon>
                                        </>
                                    }
                                </div>
                            }

                            {
                                !isLoadingModel &&
                                !isLoadingGeneration &&
                                !isGenerating &&
                                newText != null && <StyledParagraph
                                    style={{
                                        marginBottom: 0,
                                        fontSize: 12
                                    }}
                                >
                                    {
                                        documentModel && documentModel.parameters && documentModel.parameters <= 7000000000 ?
                                            `${documentModel.name} is a small model and can generate poor quality content. 
                                            Check important info.` :
                                            "AI can make mistakes. Check important info."
                                    }
                                </StyledParagraph>
                            }
                        </div>
                    }
                </StyledEditorPromptsList>
            </div>
        </>
    );
});

export default PromptsList;
