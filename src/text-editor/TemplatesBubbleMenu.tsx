import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useEffect
} from "react";

import {Editor} from "@tiptap/core";
import {BubbleMenu} from "@tiptap/react";

import {
    ArrowUpRight01Icon,
    Clock01Icon,
    IdeaIcon,
    NoteIcon
} from "hugeicons-react";

import {
    StyledEditorListButton,
    StyledEditorTemplatesList
} from "../styled";
import {Template} from "../../types";
import {OpenTemplateModalAction} from "../modals/TemplateModal";

interface MemoizedTemplateItemProps {
    currentIndex: number,
    isSelected: boolean,
    item: Template | {id: string, name: string},
    onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined,
    setHovered: React.Dispatch<React.SetStateAction<Template | {id: string, name: string} | undefined>>
}

const MemoizedTemplateItem = React.memo<MemoizedTemplateItemProps>(({
    currentIndex,
    isSelected,
    item,
    onClick,
    setHovered
}) => {
    return (
        <StyledEditorListButton
            style={{
                textAlign: "left",
                width: "100%",
                borderRadius: 10
            }}
            key={currentIndex}
            $selected={isSelected}
            onClick={onClick}
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(undefined)}
        >
            <span style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: 25
            }}
            >
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                }}
                >
                    {
                        item.id === "all_templates" && <>
                            <NoteIcon size={20} />
                                &nbsp;
                        </>
                    }
                    { item.name }
                </div>
                &nbsp;
                {
                    isSelected && <ArrowUpRight01Icon size={18} />
                }
            </span>
        </StyledEditorListButton>
    );
}, (prevProps, nextProps) => {
    // Only re-render if the active state changes
    return prevProps.isSelected === nextProps.isSelected;
});

export type ListedTemplatesLabelType = "recent" | "suggested";

export interface TemplatesBubbleMenuRef {
    navigateDown: () => void,
    navigateUp: () => void,
    selectItem: () => void
}

interface TemplatesBubbleMenuProps {
    documentId: string,
    editor: Editor,
    listedTemplates: Template[],
    listedTemplatesLabel?: ListedTemplatesLabelType,
    onShouldShow: (show: boolean) => void,
    onOpen: (action: OpenTemplateModalAction) => void
}

const TemplatesBubbleMenu = forwardRef<TemplatesBubbleMenuRef, TemplatesBubbleMenuProps>(({
    documentId,
    editor,
    listedTemplates,
    listedTemplatesLabel,
    onShouldShow,
    onOpen
}, ref) => {
    const allTemplates = [{id: "all_templates", name: "View templates"}];

    const items = [...listedTemplates, ...allTemplates];

    const [currentIndex, setCurrentIndex] = useState(0);

    const [hovered, setHovered] = useState<Template | {id: string, name: string}>();

    // Expose navigation and selection functions to the parent component
    useImperativeHandle(ref, () => ({
        navigateDown: () => {
            setHovered(undefined);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        },
        navigateUp: () => {
            setHovered(undefined);
            setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
        },
        selectItem: () => {
            setHovered(undefined);
            if (currentIndex < listedTemplates.length) {
                const selectedTemplate = listedTemplates[currentIndex];
                if (selectedTemplate) {
                    onOpen({
                        documentId: documentId,
                        type: "open_template_from_document",
                        templateId: selectedTemplate.id,
                        templateName: selectedTemplate.name,
                        templateDescription: selectedTemplate.description
                    });
                }
            } else {
                onOpen({
                    documentId: documentId,
                    type: "open_templates_from_document"
                });
            }
        }
    }));

    useEffect(() => {
        if (items.length && hovered) {
            const index = items.findIndex((i) => i.id === hovered.id);
            setCurrentIndex(index);
        }
    }, [items, hovered]);

    return (
        <BubbleMenu
            pluginKey="templatesBubbleMenu"
            editor={editor}
            shouldShow={({editor, state}) => {
                const doc = state.doc;
                if (editor.isEmpty) {
                    const allNodes = doc.content.content;
                    const nonParagraphNodes = allNodes.filter((node) => node.type.name !== "paragraph");
                    if (nonParagraphNodes.length > 0) {
                        onShouldShow(false);
                        return false;
                    };
                    const paragraphs = allNodes.filter((node) => node.type.name === "paragraph");
                    const emptyParagraphs = paragraphs.filter((paragraph) => paragraph.content.size === 0);
                    const shouldShow = emptyParagraphs.length <= 1;
                    onShouldShow(shouldShow);
                    return shouldShow;
                }
                onShouldShow(false);
                return false;
            }}
            tippyOptions={{
                placement: "bottom",
                zIndex: 100,
                popperOptions: {
                    modifiers: [{
                        name: "preventOverflow",
                        options: {boundary: editor.view.dom, tether: false}
                    }]
                }
            }}
        >
            <StyledEditorTemplatesList style={{width: 320}}>
                <h3>What do you want to write today?</h3>
                {
                    listedTemplates && listedTemplates.length > 0 && <div>
                        <span className="label" style={{marginBottom: 10}}>
                            {
                                listedTemplatesLabel === "recent" ? <>
                                    <Clock01Icon size={18} style={{marginRight: 3}} />
                                    RECENTLY USED
                                </> : <>
                                    <IdeaIcon size={18} style={{marginRight: 3}} />
                                    SUGGESTED
                                </>
                            }
                        </span>
                        {
                            listedTemplates.map((template, i) => (
                                <MemoizedTemplateItem
                                    key={i}
                                    currentIndex={i}
                                    isSelected={i === currentIndex}
                                    item={template}
                                    onClick={() => {
                                        onOpen({
                                            documentId: documentId,
                                            type: "open_template_from_document",
                                            templateId: template.id,
                                            templateName: template.name,
                                            templateDescription: template.description
                                        });
                                    }}
                                    setHovered={setHovered}
                                />
                            ))
                        }

                        <hr className="divider" />
                    </div>
                }
                {
                    allTemplates.map((template, i) => (
                        <MemoizedTemplateItem
                            key={i}
                            currentIndex={i}
                            isSelected={currentIndex === items.length - 1}
                            item={template}
                            onClick={() => {
                                onOpen({
                                    documentId: documentId,
                                    type: "open_templates_from_document"
                                });
                            }}
                            setHovered={setHovered}
                        />
                    ))
                }
            </StyledEditorTemplatesList>
        </BubbleMenu>
    );
});

export default TemplatesBubbleMenu;
