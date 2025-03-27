import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    atom,
    useAtom
} from "jotai";

import {
    useNavigate
} from "react-router-dom";

import {
    Cancel01Icon,
    Delete03Icon,
    Settings01Icon,
    Tick02Icon
} from "hugeicons-react";

import {
    StyledButton,
    StyledButtonWithIcon,
    StyledDeleteIcon,
    StyledEditIcon,
    StyledListItem
} from "../styled";

import {Doc} from "../../types";

import {useDocument} from "../contexts/useDocument";

import {Tooltip} from "./Tooltip";

type DebounceFunction = <T extends never[]>(
  func: (...args: T) => void,
  delay: number
) => (...args: T) => void;

const debounce: DebounceFunction = (func, delay) => {
    let timeoutId: NodeJS.Timeout | null;

    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, delay);
    };
};

const scrollRestorationAtom = atom<
  Record<string, {
    scrollTop: number,
    scrollLeft: number,
    isSmooth: boolean
  }>
>({});

interface ScrollRestorationOptions {
  debounceTime?: number,
  persist?: false | "localStorage" | "sessionStorage"
}

function useScrollRestoration<U extends HTMLElement>(
    key: string,
    {debounceTime = 100, persist = false}: ScrollRestorationOptions = {}
) {
    const [scrollRestoration, setScrollRestoration] = useAtom(
        scrollRestorationAtom
    );
    const [element, setElement] = useState<U | null>(null);
    const ref = useCallback((element: U | null) => {
        if (element) {
            setElement(element);
        }
    }, []);

    const currentScrollRestoration = scrollRestoration[key];
    const hasRestoration = key in scrollRestoration;

    // add event listener
    useEffect(() => {
        if (!element) return;

        const handleScroll = debounce(() => {
            const scrollTop = element.scrollTop;
            const scrollLeft = element.scrollLeft;

            setScrollRestoration((prevScrollRestoration) => ({
                ...prevScrollRestoration,
                [key]: {scrollTop, scrollLeft, isSmooth: false}
            }));
        }, debounceTime);

        element.addEventListener("scroll", handleScroll);
        return () => {
            element.removeEventListener("scroll", handleScroll);
        };
    }, [debounceTime, key, element, persist, setScrollRestoration]);

    // restore or initialize scroll
    useEffect(() => {
        if (!element) return;

        if (hasRestoration && currentScrollRestoration) {
            element.scrollTo({
                left: currentScrollRestoration.scrollLeft,
                top: currentScrollRestoration.scrollTop,
                behavior: currentScrollRestoration.isSmooth ? "smooth" : "auto"
            });
        } else {
            let initialScrollRestoration = {
                scrollTop: element.scrollTop,
                scrollLeft: element.scrollLeft,
                isSmooth: false
            };

            if (persist === "localStorage") {
                const savedScrollRestoration = localStorage.getItem(
                    `scrollRestoration-${key}`
                );
                if (savedScrollRestoration) {
                    initialScrollRestoration = JSON.parse(savedScrollRestoration);
                }
            }

            if (persist === "sessionStorage") {
                const savedScrollRestoration = sessionStorage.getItem(
                    `scrollRestoration-${key}`
                );
                if (savedScrollRestoration) {
                    initialScrollRestoration = JSON.parse(savedScrollRestoration);
                }
            }

            setScrollRestoration((prevScrollRestoration) => ({
                ...prevScrollRestoration,
                [key]: initialScrollRestoration
            }));
        }
    }, [
        currentScrollRestoration,
        element,
        key,
        persist,
        hasRestoration,
        setScrollRestoration
    ]);

    // persist scroll restoration
    useEffect(() => {
        if (!persist || !currentScrollRestoration) return;

        if (persist === "localStorage") {
            localStorage.setItem(
                `scrollRestoration-${key}`,
                JSON.stringify(currentScrollRestoration)
            );
        } else if (persist === "sessionStorage") {
            sessionStorage.setItem(
                `scrollRestoration-${key}`,
                JSON.stringify(currentScrollRestoration)
            );
        }
    }, [key, persist, currentScrollRestoration]);

    const setScroll = (
        {x, y}: {x?: number, y?: number},
        isSmooth: boolean = false
    ) => {
        if (element) {
            element.scrollTo({
                left: x !== undefined ? x : element.scrollLeft,
                top: y !== undefined ? y : element.scrollTop,
                behavior: isSmooth ? "smooth" : "auto" // Smooth scrolling when setScroll is called
            });
        }

        setScrollRestoration((prevScrollRestoration) => {
            // Ensure prevScrollRestoration is not undefined, and prevScrollRestoration[key] is defined
            if (prevScrollRestoration && prevScrollRestoration[key]) {
                return {
                    ...prevScrollRestoration,
                    [key]: {
                        scrollLeft: x !== undefined ? x : prevScrollRestoration[key].scrollLeft,
                        scrollTop: y !== undefined ? y : prevScrollRestoration[key].scrollTop,
                        isSmooth
                    }
                };
            }

            // If prevScrollRestoration is undefined or prevScrollRestoration[key] is undefined, return a default value
            return {
                ...prevScrollRestoration,
                [key]: {
                    scrollLeft: x ?? 0, // Default value for scrollLeft
                    scrollTop: y ?? 0, // Default value for scrollTop
                    isSmooth
                }
            };
        });
    };

    return {ref, setScroll};
}

interface MemoizedListItemProps {
  doc: Doc,
  isActive: boolean,
  navToDoc: (doc: Doc) => void,
  renameDocument: (docId: string, newName: string) => void,
  deleteDocument: (doc: Doc) => void
}

// Memoized List Item to avoid unnecessary re-renders
const MemoizedListItem: React.FC<MemoizedListItemProps> = React.memo(({
    doc,
    isActive,
    navToDoc,
    renameDocument,
    deleteDocument
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [newName, setNewName] = useState(doc.name);

    const handleRename = () => {
        if (newName.trim() !== "") {
            renameDocument(doc.id, newName);
            setIsEditing(false); // Exit editing mode
        }
    };

    const handleDelete = () => {
        deleteDocument(doc);
        setIsDeleting(false);
    };

    useEffect(() => {
        if (doc != null && !isEditing) {
            setNewName(doc.name);
        }
    }, [doc, isEditing]);

    useEffect(() => {
        if (!isActive) {
            setIsEditing(false);
            setIsDeleting(false);
        }
    }, [isActive]);

    return (
        <StyledListItem
            $active={isActive}
            $isDeleting={isDeleting}
            onClick={() => navToDoc(doc)}
        >
            {
                isEditing && isActive && <>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleRename(); // Rename on Enter key press
                            }
                        }}
                        autoFocus
                    />
                    <div style={{
                        display: "flex"
                    }}
                    >
                        <Tooltip
                            tooltipText="Confirm"
                        >
                            <Tick02Icon onClick={(e) => {
                                e.stopPropagation();
                                handleRename();
                            }}
                            />
                        </Tooltip>
                        <Tooltip
                            tooltipText="Cancel"
                        >
                            <Cancel01Icon onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(false);
                            }}
                            />
                        </Tooltip>
                    </div>
                </>
            }
            {
                isDeleting && isActive && <>
                    <span>{doc.name}</span>
                    <div style={{
                        display: "flex"
                    }}
                    >
                        <Tooltip
                            tooltipText="Confirm"
                        >
                            <Delete03Icon onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            />
                        </Tooltip>
                        <Tooltip
                            tooltipText="Cancel"
                        >
                            <Cancel01Icon onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleting(false);
                            }}
                            />
                        </Tooltip>
                    </div>
                </>
            }
            {
                !isEditing && !isDeleting && <>
                    <span>{doc.name}</span>
                    {
                        isActive && <>
                            <div style={{
                                display: "flex"
                            }}
                            >
                                <Tooltip
                                    tooltipText="Edit document name"
                                >
                                    <StyledEditIcon
                                        size={25}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering navToDoc on click
                                            setIsEditing((prev) => !prev);
                                        }}
                                        $visible={isActive}
                                    />
                                </Tooltip>
                                <Tooltip
                                    tooltipText="Delete document"
                                >
                                    <StyledDeleteIcon
                                        size={25}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering navToDoc on click
                                            setIsDeleting((prev) => !prev);
                                        }}
                                        $visible={isActive}
                                    />
                                </Tooltip>
                            </div>
                        </>
                    }
                </>
            }
        </StyledListItem>
    );
}, (prevProps, nextProps) => {
    // Only re-render if the active state changes
    return prevProps.isActive === nextProps.isActive && prevProps.doc === nextProps.doc;
});

interface DocumentListProps {
  documentId?: string
}

const DocumentList: React.FC<DocumentListProps> = ({documentId}) => {
    const navigate = useNavigate();

    const {ref, setScroll} = useScrollRestoration("scrollKey", {
        debounceTime: 200,
        persist: "sessionStorage"
    });

    const {
        documents,
        newDocument,
        deleteDocument,
        renameDocument
    } = useDocument();

    const [settingsModelIsVisible, setSettingsModalIsVisible] = useState(false);

    const navToDoc = (document: Doc) => {
        navigate(`/documents/${document.id}`);
    };

    const onNewDocument = useCallback(async () => {
        const newDoc = await newDocument();
        navToDoc(newDoc);

        setTimeout(() => {
            const container = document.querySelector(".scroll-container");
            setScroll({x: 0, y: container != null ? container.scrollHeight : 0}, true);
        }, 500);
    }, [newDocument, navToDoc]);

    const onDeleteDocument = useCallback(async (doc: Doc) => {
        const fallbackDoc = await deleteDocument(doc);

        setTimeout(() => {
            navToDoc(fallbackDoc);
        }, 250);
    }, [deleteDocument, navToDoc]);

    return (
        <>
            <div style={{
                padding: 20
            }}
            >
                <div style={{height: 80}}>
                    <StyledButton
                        $type="primary"
                        onClick={onNewDocument}
                    >
              + New Document
                    </StyledButton>
                </div>
                <div
                    className="scroll-container"
                    style={{
                        height: "calc(100vh - 165px)",
                        overflowY: "scroll",
                        width: 268,
                        padding: "0 8px 0 0"
                    }}
                    ref={ref}
                >
                    <ul style={{listStyleType: "none", padding: 0}}>
                        {
                            documents.map((doc) => (
                                <MemoizedListItem
                                    key={doc.id}
                                    doc={doc}
                                    isActive={documentId == doc.id}
                                    navToDoc={navToDoc}
                                    renameDocument={renameDocument}
                                    deleteDocument={onDeleteDocument}
                                />
                            ))
                        }
                    </ul>
                </div>

                <StyledButtonWithIcon
                    $type="secondary"
                    onClick={() => navigate("/settings")}
                >
                    <Settings01Icon />
                    <span>Settings</span>
                </StyledButtonWithIcon>
            </div>
        </>
    );
};

export default DocumentList;
