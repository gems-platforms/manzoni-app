
import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Content,
    JSONContent
} from "@tiptap/core";

import {
    useEditor,
    EditorContent,
    BubbleMenu
} from "@tiptap/react";

import {
    ArrowDown01Icon,
    ArrowUp01Icon,
    Link02Icon,
    StopIcon,
    TextBoldIcon,
    TextItalicIcon,
    TextStrikethroughIcon,
    TextUnderlineIcon
} from "hugeicons-react";

import "tippy.js/dist/backdrop.css";
import "tippy.js/animations/shift-away.css";

import {EditorState} from "@tiptap/pm/state";
import {Document} from "@tiptap/extension-document";
import {Text} from "@tiptap/extension-text";
import {Blockquote} from "@tiptap/extension-blockquote";
import {Bold} from "@tiptap/extension-bold";
import {BulletList} from "@tiptap/extension-bullet-list";
import {ListItem} from "@tiptap/extension-list-item";
import {Dropcursor} from "@tiptap/extension-dropcursor";
import {HardBreak} from "@tiptap/extension-hard-break";
import {Heading} from "@tiptap/extension-heading";
import {History} from "@tiptap/extension-history";
import {HorizontalRule} from "@tiptap/extension-horizontal-rule";
import {Italic} from "@tiptap/extension-italic";
import {OrderedList} from "@tiptap/extension-ordered-list";
import {Paragraph} from "@tiptap/extension-paragraph";
import {Strike} from "@tiptap/extension-strike";
import {Typography} from "@tiptap/extension-typography";
import {Link} from "@tiptap/extension-link";
import {Placeholder} from "@tiptap/extension-placeholder";
import {Underline} from "@tiptap/extension-underline";
import {TextStyle} from "@tiptap/extension-text-style";
import {TaskList} from "@tiptap/extension-task-list";
import {TaskItem} from "@tiptap/extension-task-item";

import {toast} from "sonner";

import {OpenTemplateModalAction} from "../modals/TemplateModal";

import {Theme} from "../contexts/ThemeContext";

import {Template} from "../../types";

import {darkTheme, lightTheme} from "../theme";

import {
    StyledBounceLoader,
    StyledButtonWithIcon,
    StyledEditorMenuButton,
    StyledEditorMenuContainer,
    StyledEditorMenuTintButton,
    StyledTextEditor
} from "../styled";

import {Color} from "./extensions/Color";
import EnterKey from "./extensions/EnterKey";
import {Highlight} from "./extensions/Highlight";
import GlobalStorageExtension from "./extensions/GlobalStorage";

import EditorCommands from "./suggestions/editor-commands/EditorCommands";
import EditorMenuCommands from "./suggestions/editor-menu-commands/EditorMenuCommands";
import ColorMenuCommands from "./suggestions/color-menu-commands/ColorMenuCommands";
import LinkMenuCommands from "./suggestions/link-menu-commands/LinkMenuCommands";
import AiRewriteMenuCommands from "./suggestions/ai-rewrite-menu-commands/AiRewriteMenuCommands";
import {getHexColor} from "./suggestions/utils";
import AskAiCommands from "./suggestions/ask-ai-commands/AskAiCommands";

import "./editor.css";

import TemplatesBubbleMenu, {
    ListedTemplatesLabelType,
    TemplatesBubbleMenuRef
} from "./TemplatesBubbleMenu";

import AiEditingIcon from "./ai-editing-stroke-rounded";

interface TextEditorProps {
    documentId: string,
    documentModelId?: string,
    loadedModelId?: string,
    content: string | Content,
    onOpenTemplateModal: (action: OpenTemplateModalAction) => void,
    onAbortTextGeneration: () => void,
    onTextGenerationIsRunning: (isRunning: boolean) => void,
    theme: Theme,
    isLoading: boolean,
    isGenerating: boolean,
    onJson?: (content: JSONContent) => void,
    onFocus?: () => void,
    onBlur?: () => void
}

// eslint-disable-next-line
function TextEditor({ 
    documentId,
    documentModelId,
    loadedModelId,
    content,
    onOpenTemplateModal,
    onAbortTextGeneration,
    onTextGenerationIsRunning,
    theme = "dark",
    isLoading = false,
    isGenerating = false,
    onJson,
    onFocus,
    onBlur
}: TextEditorProps) {
    const isInitialized = useRef(false);

    const [isInlineMenuOpen, setIsInlineMenuOpen] = useState(false);
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
    const [isEditorMenuOpen, setIsEditorMenuOpen] = useState(false);

    const [isTemplateMenuVisible, setIsTemplateMenuVisible] = useState(false);

    const [listedTemplates, setListedTemplates] = useState<Template[]>([]);
    const [listedTemplatesLabel, setListedTemplatesLabel] = useState<ListedTemplatesLabelType>();

    const [activeElement, setActiveElement] = useState<string | null>(null);
    const [activeColor, setActiveColor] = useState<string>();

    const extensions = [
        GlobalStorageExtension,
        EnterKey.configure({
            enableEnterKey: !isTemplateMenuVisible
        }),
        Document,
        Text,
        Blockquote,
        Bold,
        BulletList.configure({
            itemTypeName: "listItem"
        }),
        ListItem,
        Dropcursor.configure({
            color: "#377dff",
            width: 5
        }),
        HardBreak,
        Heading.configure({
            levels: [1, 2, 3]
        }),
        History,
        HorizontalRule,
        Italic,
        OrderedList.configure({
            itemTypeName: "listItem"
        }),
        Paragraph,
        Strike,
        Highlight.configure({
            multicolor: true,
            theme
        }),
        Typography,
        Underline,
        TextStyle,
        Link.configure({
            openOnClick: true
        }),
        Color.configure({
            types: ["textStyle"],
            theme
        }),
        TaskList.configure({
            itemTypeName: "taskItem"
        }),
        TaskItem.configure({
            nested: true
        }),
        Placeholder.configure({
            emptyNodeClass: "is-empty",
            placeholder: ({editor}) => {
                if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
                    return "List";
                } else if (editor.isActive("taskList")) {
                    return "To-do";
                } else if (editor.isActive("heading", {level: 1})) {
                    return "Heading 1";
                } else if (editor.isActive("heading", {level: 2})) {
                    return "Heading 2";
                } else if (editor.isActive("heading", {level: 3})) {
                    return "Heading 3";
                } else if (editor.isActive("blockquote")) {
                    return "Quote";
                } else if (editor.isActive("horizontalRule")) {
                    return "Press enter";
                } else {
                    return "Write, press 'space' for AI, '/' for commands...";
                }
            },
            showOnlyWhenEditable: true, // show decorations only when editor is editable
            showOnlyCurrent: true, // show decorations only in currently selected node
            includeChildren: true // show decorations also for nested nodes
        }),
        EditorCommands.configure({
            onStart: () => {
                setIsInlineMenuOpen(true);
            },
            onExit: () => {
                setIsInlineMenuOpen(false);
            }
        }),
        EditorMenuCommands.configure({
            onExit: () => {
                setIsEditorMenuOpen(false);
            }
        }),
        ColorMenuCommands.configure({
            onExit: () => {
                setIsColorMenuOpen(false);
            },
            theme
        }),
        LinkMenuCommands.configure({
            onExit: () => {
                setIsLinkMenuOpen(false);
            }
        }),
        AiRewriteMenuCommands.configure({
            onRunningAi: (isGenerating: boolean) => {
                onTextGenerationIsRunning(isGenerating);
            },
            currentTheme: theme === "light" ? lightTheme : darkTheme
        }),
        AskAiCommands.configure({
            onRunningAi: (isGenerating: boolean) => {
                onTextGenerationIsRunning(isGenerating);
            },
            currentTheme: theme === "light" ? lightTheme : darkTheme
        })
    ];

    const textEditor = useEditor({
        extensions,

        content: content,

        shouldRerenderOnTransaction: false,

        editable: false,

        onUpdate({editor}) {
            if (editor.isEditable) {
                if (onJson && isInitialized.current) {
                    onJson(editor.getJSON());
                }

                isInitialized.current = true;
            }
        },

        onSelectionUpdate({editor}) {
            if (editor.isActive("heading", {level: 1})) {
                setActiveElement("Heading 1");
            } else if (editor.isActive("heading", {level: 2})) {
                setActiveElement("Heading 2");
            } else if (editor.isActive("heading", {level: 3})) {
                setActiveElement("Heading 3");
            } else if (editor.isActive("bulletList")) {
                setActiveElement("Bullet list");
            } else if (editor.isActive("orderedList")) {
                setActiveElement("Numbered list");
            } else if (editor.isActive("taskList")) {
                setActiveElement("To-do list");
            } else if (editor.isActive("blockquote")) {
                setActiveElement("Quote");
            } else if (editor.isActive("paragraph")) {
                setActiveElement("Text");
            } else {
                setActiveElement(null);
            }

            const color = getHexColor(
                editor.getAttributes("textStyle").color ||
                editor.getAttributes("highlight").color, theme
            );
            setActiveColor(color);

            const {state} = editor;
            const {selection} = state;
            const {from, to} = selection;

            // Get the selected text
            const selectedText = editor.state.doc.textBetween(from, to, " ");

            // Remove selection if it's empty or only whitespace
            if (!selectedText.trim()) {
                editor.commands.setTextSelection(selection.from);
            }
        },

        onFocus() {
            if (onFocus) {
                onFocus();
            }
        },

        onBlur() {
            setIsTemplateMenuVisible(false);

            if (onBlur) {
                onBlur();
            }
        }
    });

    const templatesBubbleMenuRef = useRef<TemplatesBubbleMenuRef>(null);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!templatesBubbleMenuRef.current) return;

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    templatesBubbleMenuRef.current.navigateDown();
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    templatesBubbleMenuRef.current.navigateUp();
                    break;
                case "Enter":
                    event.preventDefault();
                    templatesBubbleMenuRef.current.selectItem();
                    break;
                default:
                    break;
            }
        };

        if (isTemplateMenuVisible) {
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("keydown", handleKeyDown);
        }

        if (textEditor) {
            textEditor.storage.enableEnterKey = !isTemplateMenuVisible;
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isTemplateMenuVisible, textEditor]);

    useEffect(() => {
        const fetchTemplatesRecentlyUsed = async () => {
            const recent = await window.electronAPI.fetchTemplatesRecentlyUsed();
            setListedTemplates(recent);
            setListedTemplatesLabel("recent");

            if (recent.length === 0) {
                const suggested = await window.electronAPI.fetchTemplatesSuggested();
                setListedTemplates(suggested);
                setListedTemplatesLabel("suggested");
            }
        };

        if (textEditor && textEditor.isEmpty) {
            fetchTemplatesRecentlyUsed();
        }

        setTimeout(() => {
            if (textEditor && textEditor.isEmpty) {
                textEditor.commands.focus();
            }
        }, 250);
    }, [textEditor]);

    useEffect(() => {
        if (textEditor) {
            if (documentId) {
                textEditor.commands.setDocumentId(documentId);
            } else {
                textEditor.commands.setDocumentId(null);
            }
        }
    }, [textEditor, documentId]);

    useEffect(() => {
        if (textEditor) {
            if (documentModelId) {
                textEditor.commands.setDocumentModelId(documentModelId);
            } else {
                textEditor.commands.setDocumentModelId(null);
            }
        }
    }, [textEditor, documentModelId]);

    useEffect(() => {
        if (textEditor) {
            if (loadedModelId) {
                textEditor.commands.setLoadedModelId(loadedModelId);
            } else {
                textEditor.commands.setLoadedModelId(null);
            }
        }
    }, [textEditor, loadedModelId]);

    useEffect(() => {
        if (textEditor && content) {
            // set the editor content
            textEditor.commands.setContent(content);
            textEditor.setEditable(!isLoading && !isGenerating);

            setTimeout(() => {
                if (textEditor.isEmpty && !isLoading && !isGenerating) {
                    textEditor.commands.focus();
                }
            }, 250);

            // clear the history after loading new document
            const newEditorState = EditorState.create({
                doc: textEditor.state.doc,
                plugins: textEditor.state.plugins,
                schema: textEditor.state.schema
            });
            textEditor.view.updateState(newEditorState);
        }
    }, [textEditor, content, isLoading, isGenerating]);

    return (
        <>
            <div className={`text-editor-scrollable-container 
                ${isInlineMenuOpen ||
                    isLinkMenuOpen ||
                    isEditorMenuOpen ||
                    isColorMenuOpen ? "no-scroll" : ""}`}
            >
                {textEditor && (
                    <>
                        <TemplatesBubbleMenu
                            documentId={documentId}
                            editor={textEditor}
                            listedTemplates={listedTemplates}
                            listedTemplatesLabel={listedTemplatesLabel}
                            onShouldShow={setIsTemplateMenuVisible}
                            onOpen={(action) => onOpenTemplateModal(action)}
                            ref={templatesBubbleMenuRef}
                        />
                        <BubbleMenu
                            pluginKey="editorBubbleMenu"
                            shouldShow={({editor, state}) => {
                                const {selection} = state;

                                // Ensure selection is not empty and there's an active selection
                                if (selection.empty) {
                                    return false;
                                }


                                // Keep the BubbleMenu hidden for certain node types, e.g., horizontalRule
                                if (editor.isActive("horizontalRule")) {
                                    return false;
                                }

                                // Ensure the menu stays visible while the editor is editable
                                return editor.isEditable && editor.view.hasFocus();
                            }}
                            tippyOptions={{
                                maxWidth: "auto",
                                onMount(instance) {
                                    const {popper} = instance;
                                    popper.classList.add("custom-bubble-menu");
                                },
                                popperOptions: {
                                    modifiers: [
                                        {
                                            name: "applyStyles",
                                            enabled: true,
                                            phase: "main",
                                            fn: ({state}) => {
                                                const {popper, reference} = state.elements;
                                                const referenceRect = reference.getBoundingClientRect();

                                                const container = document.querySelector(".text-editor-scrollable-container");
                                                if (container) {
                                                    const containerRect = container.getBoundingClientRect();

                                                    // Determine if the reference (selection) is out of the container
                                                    const selectionVisible = (
                                                        referenceRect.bottom > containerRect.top &&
                                                    referenceRect.top < containerRect.bottom
                                                    );

                                                    if (selectionVisible) {
                                                        let top, left;

                                                        // Calculate the intended position at top-center of the selection
                                                        // Above the selection
                                                        top = referenceRect.top - popper.offsetHeight - 10;
                                                        // Centered horizontally
                                                        left = referenceRect.left + (referenceRect.width / 2) - (popper.offsetWidth / 2);

                                                        // Check if the popper goes above the container
                                                        if (top < containerRect.top + 10) {
                                                            top = containerRect.top + 10; // Lock at the top
                                                        }

                                                        // Check if the popper goes below the container
                                                        if (top + popper.offsetHeight > containerRect.bottom) {
                                                            top = containerRect.bottom - popper.offsetHeight; // Lock at the bottom
                                                        }

                                                        // Check if the popper goes beyond the left side of the container
                                                        if (left < containerRect.left) {
                                                            left = containerRect.left; // Lock to the left
                                                        }

                                                        // Check if the popper goes beyond the right side of the container
                                                        if (left + popper.offsetWidth > containerRect.right) {
                                                            left = containerRect.right - popper.offsetWidth; // Lock to the right
                                                        }

                                                        // Apply the styles
                                                        popper.style.position = "absolute"; // Use absolute positioning
                                                        popper.style.top = `${top}px`;
                                                        popper.style.left = `${left}px`;
                                                        popper.classList.remove("bubble-hidden"); // Ensure bubble is visible
                                                    } else {
                                                    // Hide the bubble if the selection is out of the view
                                                        popper.classList.add("bubble-hidden");
                                                    }
                                                }
                                            }
                                        }

                                    ]
                                }
                            }}
                            editor={textEditor}
                        >
                            <StyledEditorMenuContainer>
                                <StyledEditorMenuButton
                                    type="button"
                                    onClick={() => {
                                        if (documentModelId == null) {
                                            toast.warning("Choose an AI model.");
                                        } else {
                                            textEditor
                                                .chain()
                                                .focus()
                                                .hideColorMenuCommands()
                                                .hideLinkMenuCommands()
                                                .hideEditorMenuCommands()
                                                .toggleAiRewriteMenuCommands()
                                                .run();
                                        }
                                    }}
                                >
                                    <AiEditingIcon size={18} />
                                    &nbsp;
                                    <span>AI Edit</span>
                                </StyledEditorMenuButton>
                                {
                                    activeElement && <StyledEditorMenuButton
                                        type="button"
                                        onClick={() => {
                                            textEditor
                                                .chain()
                                                .focus()
                                                .hideColorMenuCommands()
                                                .hideLinkMenuCommands()
                                                .hideAiRewriteMenuCommands()
                                                .toggleEditorMenuCommands()
                                                .run();

                                            setIsEditorMenuOpen(!isEditorMenuOpen);
                                        }}
                                    >
                                        <span style={{marginRight: 3}}>
                                            { activeElement }
                                        </span>
                                        {
                                            isEditorMenuOpen ?
                                                <ArrowUp01Icon size={18} /> :
                                                <ArrowDown01Icon size={18} />
                                        }
                                    </StyledEditorMenuButton>
                                }
                                <StyledEditorMenuButton
                                    $active={textEditor.isActive("link")}
                                    type="button"
                                    onClick={() => {
                                        textEditor
                                            .chain()
                                            .focus()
                                            .hideColorMenuCommands()
                                            .hideEditorMenuCommands()
                                            .hideAiRewriteMenuCommands()
                                            .toggleLinkMenuCommands()
                                            .run();

                                        setIsLinkMenuOpen(!isLinkMenuOpen);
                                    }}
                                >
                                    <Link02Icon size={18} />
                                </StyledEditorMenuButton>
                                <StyledEditorMenuButton
                                    $active={textEditor.isActive("bold")}
                                    type="button"
                                    onClick={() => {
                                        textEditor
                                            .chain()
                                            .focus()
                                            .hideColorMenuCommands()
                                            .hideEditorMenuCommands()
                                            .hideLinkMenuCommands()
                                            .hideAiRewriteMenuCommands()
                                            .toggleBold()
                                            .run();
                                    }}
                                >
                                    <TextBoldIcon size={18} />
                                </StyledEditorMenuButton>
                                <StyledEditorMenuButton
                                    $active={textEditor.isActive("italic")}
                                    type="button"
                                    onClick={() => {
                                        textEditor
                                            .chain()
                                            .focus()
                                            .hideColorMenuCommands()
                                            .hideEditorMenuCommands()
                                            .hideLinkMenuCommands()
                                            .hideAiRewriteMenuCommands()
                                            .toggleItalic()
                                            .run();
                                    }}
                                >
                                    <TextItalicIcon size={18} />
                                </StyledEditorMenuButton>
                                <StyledEditorMenuButton
                                    $active={textEditor.isActive("underline")}
                                    type="button"
                                    onClick={() => {
                                        textEditor
                                            .chain()
                                            .focus()
                                            .hideColorMenuCommands()
                                            .hideEditorMenuCommands()
                                            .hideLinkMenuCommands()
                                            .hideAiRewriteMenuCommands()
                                            .toggleUnderline()
                                            .run();
                                    }}
                                >
                                    <TextUnderlineIcon size={18} />
                                </StyledEditorMenuButton>
                                <StyledEditorMenuButton
                                    $active={textEditor.isActive("strike")}
                                    type="button"
                                    onClick={() => {
                                        textEditor
                                            .chain()
                                            .focus()
                                            .hideColorMenuCommands()
                                            .hideEditorMenuCommands()
                                            .hideLinkMenuCommands()
                                            .hideAiRewriteMenuCommands()
                                            .toggleStrike()
                                            .run();
                                    }}
                                >
                                    <TextStrikethroughIcon size={18} />
                                </StyledEditorMenuButton>
                                <StyledEditorMenuButton
                                    type="button"
                                    onClick={() => {
                                        textEditor
                                            .chain()
                                            .focus()
                                            .hideEditorMenuCommands()
                                            .hideLinkMenuCommands()
                                            .hideAiRewriteMenuCommands()
                                            .toggleColorMenuCommands()
                                            .run();

                                        setIsColorMenuOpen(!isColorMenuOpen);
                                    }}
                                >
                                    <StyledEditorMenuTintButton $editorColor={activeColor} />
                                    {
                                        isColorMenuOpen ?
                                            <ArrowUp01Icon size={18} /> :
                                            <ArrowDown01Icon size={18} />
                                    }

                                </StyledEditorMenuButton>
                            </StyledEditorMenuContainer>
                        </BubbleMenu>
                    </>
                )}

                <div style={{
                    maxWidth: 700,
                    marginLeft: "auto",
                    marginRight: "auto",
                    paddingTop: 30
                }}
                >
                    {
                        textEditor && textEditor.isEmpty && isLoading ?
                            <StyledBounceLoader size={18} />
                            :
                            <>
                                <StyledTextEditor $showBottomPadding={!isGenerating}>
                                    <EditorContent editor={textEditor} />
                                </StyledTextEditor>
                                {
                                    isGenerating && <StyledButtonWithIcon
                                        style={{width: 160}}
                                        onClick={() => onAbortTextGeneration()}
                                        $type="danger"
                                    >
                                        <StopIcon />
                                        &nbsp;
                                        Stop generating
                                    </StyledButtonWithIcon>
                                }
                            </>
                    }
                </div>
            </div>
        </>
    );
}

export default TextEditor;
