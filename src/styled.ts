import {Link} from "react-router-dom";
import {BounceLoader, PulseLoader} from "react-spinners";

import styled, {createGlobalStyle} from "styled-components";

import {
    ArrowLeft02Icon,
    ArrowTurnBackwardIcon,
    CloudDownloadIcon,
    Delete01Icon,
    PencilEdit02Icon,
    ReloadIcon,
    SidebarLeftIcon
} from "hugeicons-react";

const hexToRgb = (hex: string) => {
    // Remove the '#' if it exists
    hex = hex.replace(/^#/, "");

    // Expand shorthand (e.g., #333 to #333333)
    if (hex.length === 3) {
        hex = hex.split("").map((char) => char + char)
            .join("");
    }

    // Parse the r, g, b values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
};

export const StyledGlobal = createGlobalStyle`
    body, input, button, textarea, select {
        font-family: 'Inter', sans-serif;
    }

    body {
        margin: auto;
        position: fixed;
        width: 100vw;
        height: 100vh;
        background-color: ${(props) => props.theme.background};
    }

    * {
        user-select: none;
        --shadow: 0px 12px 33px 0px rgba(0, 0, 0, .06), 0px 3.618px 9.949px 0px rgba(0, 0, 0, .04);
        --scrollbar-width: 8px;
    }

    *::-webkit-scrollbar {
        width: var(--scrollbar-width);
    }

    *::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.scrollbarThumbBackground};
        border-radius: 10px;
    }

    *::-webkit-scrollbar-track {
        background-color: transparent;
    }

    @keyframes bounce {
        0% {
            transform: scale(0.9);
            opacity: 0;
        }
        50% {
            transform: scale(1.02);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .ReactModal__Overlay {
        animation: bounce 0.5s ease-out;
    }
`;

export const StyledLayout = styled.div`
    display: flex;
    height: 100vh;
    background-color: ${(props) => props.theme.layoutBackground};
`;

export const StyledListItem = styled.li<{$active: boolean, $isDeleting?: boolean}>`
    padding: 10px;
    height: 30px;
    cursor: pointer;
    background-color: ${({theme, $active, $isDeleting}) => ($isDeleting ? theme.documentListItemDangerBackground : $active ? theme.documentListItemBackground : "transparent")};
    display: flex;
    justify-content: space-between;
    border-radius: 10px;
    align-items: center;
    color: ${(props) => props.theme.documentListItemText};

    span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: clip; /* No ellipsis */
        flex-grow: 1;
        margin-right: 10px;
        position: relative;

        /* Gradient dissolve effect */
        mask-image: linear-gradient(to right, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0));
    }

    input {
        background-color: transparent;
        outline: 0;
        border: 0;
        color: ${(props) => props.theme.documentListItemText};
    }

    &:hover {
        background-color: ${({theme, $isDeleting}) => ($isDeleting ?
        theme.documentListItemDangerBackground :
        theme.documentListItemBackground)}
    }
`;

export const StyledDocumentList = styled.div<{$visible: boolean}>`
    flex-basis: 300px;
    background-color: ${(props) => props.theme.documentListBackground};
    transition: flex-basis 0.3s ease-in-out, opacity 0.3s ease-in-out;
    border-right: 1px solid ${(props) => props.theme.documentListBorder};

    /* Reduce the flex-basis to 0 when hidden */
    flex-basis: ${(props) => (props.$visible ? "300px" : "0")};
    opacity: ${(props) => (props.$visible ? 1 : 0)};
    overflow: hidden; /* Hide content when minimized */
`;

export const StyledDocumentHeader = styled.div`
    display: flex;
    padding: 20px;
    height: 60px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${(props) => props.theme.documentHeaderBorder};
    background-color: ${(props) => props.theme.documentHeaderBackground};
    position: sticky;
    z-index: 200;
`;

export const StyledButton = styled.button<{$type: "primary" | "secondary" | "danger"}>`
    width: 100%;
    height: ${(props) => (props.$type === "primary" ? "60px" : "45px")};
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 10px;
    background-color: ${(props) => (props.$type === "primary" ? props.theme.buttonBackground : "transparent")};
    color: ${(props) => (props.$type === "danger" ?
        props.theme.buttonDangerText :
        props.$type === "primary" ?
            props.theme.buttonText :
            props.theme.buttonSecondaryText)
};
    text-align: center;
    border: ${(props) => (props.$type === "primary" ? `1px solid ${props.theme.buttonBorder}` : 0)};
    outline: 0;
    cursor: pointer;
    font-weight: 600;
`;

export const StyledButtonWithIcon = styled.button<{$type: "primary" | "secondary" | "danger"}>`
    display: flex;
    background-color: ${(props) => (props.$type === "primary" ? props.theme.buttonBackground : "transparent")};
    color: ${(props) => (props.$type === "danger" ?
        props.theme.buttonDangerText :
        props.$type === "primary" ?
            props.theme.buttonText :
            props.theme.buttonSecondaryText)
};
    border-radius: 10px;
    width: 100%;
    height: 45px;
    text-align: center;
    border: 1px solid ${(props) => props.theme.buttonBorder};
    outline: 0;
    cursor: pointer;
    font-weight: 600;
    align-items: center;
    padding: 10px;
    justify-content: center;

    svg {
        width: 22px;
        height: 22px;
    }

    span {
        margin-left: 5px;
    }
`;

export const StyledButtonTheme = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${(props) => props.theme.buttonThemeBackground};
    color: ${(props) => props.theme.buttonThemeText};
    height: 40px;
    width: 40px;
    border-radius: 20px;
    text-align: center;
    border: 1px solid ${(props) => props.theme.buttonThemeBorder};
    outline: 0;
    cursor: pointer;
    align-items: center;

    svg {
        width: 18px;
        height: 18px;
    }
`;

export const StyledModalContent = styled.div`
    position: absolute;
    padding: 20px;
    inset: 40px; /* Sets a consistent distance from all edges */
    border-radius: 15px;
    border: 1px solid ${(props) => props.theme.modalBorder};
    overflow: hidden;
    background-color: ${(props) => props.theme.modalBackground};
    z-index: 200;
    outline: 0;
`;

export const StyledModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 300;
    background-color: ${(props) => `rgba(${hexToRgb(props.theme.modalBackground)}, 0.75)`};
`;

export const StyledNavLink = styled(Link)`
    width: 100%;
    display: flex;
    align-items: center;
    text-decoration: none;
    background-color: transparent;
    color: ${(props) => props.theme.navLinkText};
    font-weight: 600;

    span {
        margin-left: 5px;
    }

    svg {
        height: 22px;
        width: 22px;
        color: ${(props) => props.theme.navLinkText};
    }
`;

export const StyledDownloadIcon = styled(CloudDownloadIcon)`
    color: ${(props) => props.theme.downloadIcon};
    cursor: pointer;

    &:hover {
        color: ${(props) => props.theme.downloadIconHover};
    }
`;

export const StyledDeleteIcon = styled(Delete01Icon)<{$visible: boolean}>`
    color: ${(props) => props.theme.deleteIcon};
    visibility: ${({$visible}) => ($visible ? "visible" : "hidden")};
    cursor: pointer;

    &:hover {
        color: ${(props) => props.theme.deleteIconHover};
    }
`;

export const StyledEditIcon = styled(PencilEdit02Icon)<{$visible: boolean}>`
    color: ${(props) => props.theme.editIcon};
    visibility: ${({$visible}) => ($visible ? "visible" : "hidden")};
    cursor: pointer;
    margin-top: 1px;
    margin-right: 5px;

    &:hover {
        color: ${(props) => props.theme.editIconHover};
    }
`;

export const StyledReloadIcon = styled(ReloadIcon)<{$visible: boolean}>`
    color: ${(props) => props.theme.reloadIcon};
    cursor: pointer;
    visibility: ${({$visible}) => ($visible ? "visible" : "hidden")};

    &:hover {
        color: ${(props) => props.theme.reloadIconHover};
    }
`;

export const StyledToggleSidebarIcon = styled(SidebarLeftIcon)`
    color: ${(props) => props.theme.toggleSidebarIcon};
    cursor: pointer;

    &:hover {
        color: ${(props) => props.theme.toggleSidebarIconHover};
    }
`;

export const StyledTooltip = styled.div<{$isVisible: boolean}>`
    position: fixed;
    background: ${(props) => (props.theme.tooltipBackground)};
    color: ${(props) => (props.theme.tooltipText)};
    padding: 8px 12px;
    border-radius: 10px;
    white-space: nowrap;
    opacity: ${(props) => (props.$isVisible ? 1 : 0)};
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 1000;
    border: 0.2px solid ${(props) => props.theme.tooltipBorder};
    box-shadow: var(--shadow);
`;

export const StyledInput = styled.input`
    background-color: ${(props) => props.theme.inputBackground};
    width: 100%;
    outline: 0;
    border: 0;
    height: 30px;
    color: ${(props) => props.theme.inputText};
`;

export const StyledHeader1 = styled.h1`
    font-size: 2.5em;
    color: ${(props) => props.theme.header1};
`;

export const StyledHeader2 = styled.h2`
    font-size: 1.5em;
    color: ${(props) => props.theme.header2};
`;

export const StyledHeader3 = styled.h3`
    color: ${(props) => props.theme.header3};
`;

export const StyledHeader4 = styled.h4`
    color: ${(props) => props.theme.header4};
`;

export const StyledParagraph = styled.p`
    color: ${(props) => props.theme.paragraph};
`;

export const StyledModelCard = styled.div<{$isDeleting: boolean}>`
    padding: 20px;
    border-radius: 10px;
    border: 1px solid ${({theme}) => theme.cardBorder};
    background-color: ${({theme, $isDeleting}) => ($isDeleting ? theme.cardDangerBackground : theme.cardBackground)};
    color: ${({theme}) => theme.cardText};
    position: relative;
    overflow: hidden;
`;

export const StyledTemplateCard = styled.div`
    padding: 20px;
    border-radius: 10px;
    border: 1px solid ${(props) => props.theme.cardBorder};
    background-color: ${(props) => props.theme.cardBackground};
    position: relative;

    ${StyledHeader3} {
        display: flex;
        align-items: center;
        position: relative;
        height: 25px;

        .right-arrow-icon {
            display: none; /* Icon is hidden by default */
            margin-left: 5px;
            transition: all 0.3s ease;
        }
    }

    &:hover ${StyledHeader3} .right-arrow-icon {
        display: inline-block;
    }
`;

export const StyledTable = styled.table`
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    border: 1px solid ${(props) => props.theme.tableBorder};
    border-radius: 10px;
    overflow: hidden;
`;

export const StyledTableRow = styled.tr`
    &:last-child td {
        border-bottom: none; /* Remove bottom border on the last row to prevent double thickness */
    }
`;

export const StyledTableCell = styled.td`
    border-right: 1px solid ${(props) => props.theme.tableCellBorder};
    border-bottom: 1px solid ${(props) => props.theme.tableCellBorder};
    padding: 8px;
    text-align: left;
    width: 100px;

    h4 {
        color: ${(props) => props.theme.tableCellHeader};
        margin-top: 0;
        margin-bottom: 5px;
        font-size: 14px;
    }

    p {
        color: ${(props) => props.theme.tableCellParagraph};
        margin: 0;
        height: 25px;
        line-height: 25px;
    }

    a {
        color: ${(props) => props.theme.tableCellParagraph};
        margin: 0;
        height: 25px;
        line-height: 25px;
    }
`;

export const StyledProgressBarStroke = styled.div`
    width: 100px; 
    background-color: ${(props) => props.theme.progressBarStrokeBackground};
    border: 1px solid ${(props) => props.theme.progressBarStrokeBorder};
    height: 10px;
    border-radius: 10px;
    overflow: hidden;
`;
export const StyledProgressBarTrail = styled.div`
    height: 10px;
    background-color: ${(props) => props.theme.progressBarTrail};
`;

export const StyledProgressBarPercent = styled.span`
    margin-left: 10px;
    font-weight: bold;
    color: ${(props) => props.theme.progressBarPercent};
`;

export const StyledTemplateEditor = styled.div`
    .tiptap {
        height: 300px;
        border: 1px solid ${(props) => props.theme.templateEditorBorder};
        border-radius: 10px;
        padding: 20px;
        box-sizing: border-box;
        outline: 0;
        margin-bottom: 20px;
        overflow-y: auto;
        background-color: ${(props) => props.theme.templateEditorBackground};

        color: ${(props) => props.theme.editorText};

        p {
            font-size: 1em
        }

        .highlight-square-bracket {
            background-color: ${(props) => props.theme.templatePlaceholderBackground};
            border-radius: 5px;
            padding: 2px;
            color: ${(props) => props.theme.templatePlaceholderColor};
        }
    }
`;

export const StyledPromptEditor = styled.div`
    .tiptap {
        outline: 0;

        color: ${(props) => props.theme.editorText};
    
        h1, 
        h2, 
        h3 {
            margin-top: 1em;
        }

        h1 {
            font-size: 2.4em;
        }
        
        h2 {
            font-size: 1.9em;
        }
        
        h3 {
            font-size: 1.3em;
        }

        p {
            font-size: 1em
        }

        ul, 
        ol {
            padding: 0 1rem;
            margin: 1.25rem 1rem 1.25rem 0.4rem;
            li p {
                margin-top: 0.6em;
                margin-bottom: 0.6em;
            }
        }

        blockquote {
            border-left: 3px solid ${(props) => props.theme.editorBlockquoteBorder};
            margin: 1.5rem 0;
            padding-left: 1rem;
        }
    }
`;

export const StyledTextEditor = styled.div<{$showBottomPadding: boolean}>`
    .tiptap {
        outline: 0;
        color: ${(props) => props.theme.editorText};

        h1, 
        h2, 
        h3 {
            margin-top: 1em;
        }

        h1 {
            font-size: 2.4em;
        }
        
        h2 {
            font-size: 1.9em;
        }
        
        h3 {
            font-size: 1.3em;
        }

        p {
            font-size: 1em
        }

        a {
            color: ${(props) => props.theme.editorLink};
            text-decoration: underline;
            text-decoration-color: ${(props) => props.theme.editorLink};
            cursor: pointer;
        }

        ul, 
        ol {
            padding: 0 1rem;
            margin: 1.25rem 1rem 1.25rem 0.4rem;
            li p {
                margin-top: 0.6em;
                margin-bottom: 0.6em;
            }
        }

        blockquote {
            border-left: 3px solid ${(props) => props.theme.editorBlockquoteBorder};
            margin: 1.5rem 0;
            padding-left: 1rem;
        }

        ul[data-type="taskList"] {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        ul[data-type="taskList"] p {
            margin: 0;
        }

        ul[data-type="taskList"] li {
            display: flex;
        }

        ul[data-type="taskList"] li > label {
            flex: 0 0 auto;
            margin-right: 0.5rem;
            user-select: none;
        }

        ul[data-type="taskList"] li > div {
            flex: 1 1 auto;
        }

        /* Conditionally add bottom padding and clickable area */
        ${({$showBottomPadding}) => $showBottomPadding && `
            padding-bottom: 400px;
            position: relative;

            /* Make the bottom area clickable */
            &::after {
                content: '';
                display: block;
                height: 400px; /* This is the clickable area */
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                pointer-events: none; /* Allow clicks without interference */
            }
        `}
    }
`;

export const StyledEditorMenuContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: max-content;
    padding: 5px;
    border-radius: 10px;
    border: 0.2px solid ${(props) => props.theme.editorMenuContainerBorder};
    background-color: ${(props) => props.theme.editorMenuContainerBackground};
    box-shadow: var(--shadow);
    color: ${(props) => props.theme.editorMenuContainerText};
`;

export const StyledEditorListButton = styled.button<{$active?: boolean, $selected: boolean}>`
    display: inline-flex;
    align-items: center;    
    background-color: ${(props) => (props.$selected ? props.theme.editorMenuButtonBackgroundSelected : "transparent")};
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    border: 0;
    outline: 0;
    flex-shrink: 0;
    flex-basis: auto;
    user-select: none;
    color: ${(props) => (props.$active ? "rgb(4, 165, 198)" : props.theme.editorMenuButtonText)};

    svg {
        stroke-width: 2.3;
    }
`;

export const StyledEditorMenuButton = styled.button<{$active?: boolean}>`
    display: inline-flex;
    align-items: center;
    background-color: transparent;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    border: 0;
    outline: 0;
    flex-shrink: 0;
    flex-basis: auto;
    user-select: none;
    color: ${(props) => (props.$active ? "rgb(4, 165, 198)" : props.theme.editorMenuButtonText)};

    &:hover {
        background-color: ${(props) => props.theme.editorMenuButtonBackgroundSelected};
    }

    svg {
        stroke-width: 2.3;
    }
`;

export const StyledEditorMenuTintButton = styled.div<{$editorColor?: string}>`
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background-color: ${(props) => props.$editorColor ?? props.theme.editorMenuTintButtonDefault};
    margin-right: 3px;
`;

export const StyledEditorCommandsList = styled.div`
    display: flex;
    flex-direction: column;
    width: 240px; 
    height: auto;
    max-height: 300px; 
    overflow-y: auto;
    padding: 5px;
    border-radius: 10px;
    border: 0.2px solid ${(props) => props.theme.editorMenuContainerBorder};
    background-color: ${(props) => props.theme.editorMenuContainerBackground};
    box-shadow: var(--shadow);
`;

export const StyledEditorPromptsList = styled.div`
    display: flex;
    box-shadow: var(--shadow);
    flex-direction: column;
    padding: 5px;
    border-radius: 10px;
    border: 0.2px solid ${(props) => props.theme.editorMenuContainerBorder};
    background-color: ${(props) => props.theme.editorMenuContainerBackground};
    color: ${(props) => props.theme.editorMenuContainerText};
`;

export const StyledEditorTemplatesList = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 15px 15px 15px;
    border-radius: 10px;
    border: 0.2px solid ${(props) => props.theme.editorMenuContainerBorder};
    background-color: ${(props) => props.theme.editorMenuContainerBackground};
    box-shadow: var(--shadow);
    color: ${(props) => props.theme.editorMenuContainerText};
    width: 400px;
    height: auto;
    outline: 0;

    hr.divider {
        width: 100%;
        border: 0.5px solid ${(props) => props.theme.editorMenuContainerLabelText};
    }

    span.label {
        font-weight: bold;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 12px;
        color: ${(props) => props.theme.editorMenuContainerLabelText};
    }
`;

export const StyledEditorMenuCommandTintButton = styled.div<{$editorTint?: string, $selectedTint?: string}>`
    width: 25px;
    height: 25px;
    border-radius: 5px;
    background-color: ${(props) => props.$editorTint ?? props.theme.editorMenuTintButtonDefault};
    margin-right: 3px;
    cursor: pointer;
`;

export const StyledEditorCommandsIcon = styled.div`
    color: ${({theme}) => theme.aiIcon};
    background-color: "transparent";
`;

export const StyledEnterIcon = styled(ArrowTurnBackwardIcon)`
    color: ${({theme}) => theme.enterIcon};
`;

export const StyledBackIcon = styled(ArrowLeft02Icon)`
    color: ${(props) => props.theme.backIcon};
    cursor: pointer;

    &:hover {
        color: ${(props) => props.theme.backIconHover};
    }
`;

export const StyledLoadingIcon = styled(PulseLoader).attrs((props) => ({
    color: props.theme.loadingIcon // Pass the color as a prop to PulseLoader
}))``;

export const StyledBounceLoader = styled(BounceLoader).attrs((props) => ({
    color: props.theme.loadingIcon // Pass the color as a prop to PulseLoader
}))``;

export const StyledLoadingText = styled.p`
    fontWeight: 600;
    color: ${(props) => props.theme.loadingText};
    margin-bottom: 0;
`;
