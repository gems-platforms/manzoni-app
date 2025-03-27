import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {debounce} from "lodash"; // For debouncing the resize event

import {
    StyledHeader2,
    StyledListItem
} from "../styled";

import {Template} from "../../types";

import TemplateCard from "./TemplateCard";

const useDetectScrollEnd = (onScrollEnd: () => void, delay: number = 150) => {
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current); // Reset the timer
            }

            // Set a new timer that triggers the callback after the delay
            scrollTimeout.current = setTimeout(() => {
                onScrollEnd(); // Call the scroll end handler
            }, delay);
        };

        const container = document.querySelector("#cards-list-container"); // Replace with your container reference
        if (!container) {
            console.error("Container element not found.");
            return;
        }

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [onScrollEnd, delay]);
};

interface CategoriesListProps {
    categories: string[],
    selectedCategory?: string,
    onCategoryClick: (category: string) => void
}

const CategoriesList: React.FC<CategoriesListProps> = ({
    categories,
    selectedCategory,
    onCategoryClick
}) => {
    return (
        <div style={{
            height: "100%",
            overflowY: "scroll",
            padding: "0 8px 0 0",
            width: 220
        }}
        >
            {categories.map((category, i) => (
                <StyledListItem
                    key={i}
                    $active={selectedCategory === category}
                    onClick={() => onCategoryClick(category)}
                >
                    {category}
                </StyledListItem>
            ))}
        </div>
    );
};

interface TemplateCardsListProps {
    templates: Template[],
    categories: string[],
    cardRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void,
    onClick: (templateId: string, templateName: string, templateDescription: string) => void
}

const TemplateCardsList: React.FC<TemplateCardsListProps> = ({
    templates,
    categories,
    cardRefs,
    onScroll,
    onClick
}) => {
    const groupedItems: {[key: string]: Template[]} = categories.reduce((acc, category) => {
        acc[category] = templates.filter((template) => template.category === category);
        return acc;
    }, {} as {[key: string]: Template[]});

    const scrollViewRef = useRef<any>(null);
    const [marginBottom, setMarginBottom] = useState(20);

    useEffect(() => {
        const adjustMargin = () => {
            if (scrollViewRef.current) {
                const scrollViewHeight = scrollViewRef.current.offsetHeight;
                const categoryElements = Object.values(cardRefs.current);
                const lastCategory = categoryElements[categoryElements.length - 1];

                if (lastCategory) {
                    const lastCategoryHeight = lastCategory.offsetHeight;

                    const newMargin = scrollViewHeight - lastCategoryHeight;
                    setMarginBottom(newMargin < 20 ? 20 : newMargin);
                }
            }
        };

        const debouncedAdjustMargin = debounce(adjustMargin, 200);
        adjustMargin(); // Initial adjustment

        window.addEventListener("resize", debouncedAdjustMargin); // Debounced resize handler

        return () => {
            window.removeEventListener("resize", debouncedAdjustMargin);
            debouncedAdjustMargin.cancel(); // Clean up debounce timer
        };
    }, [categories, groupedItems, cardRefs]);

    return (
        <div
            style={{
                overflowY: "auto",
                height: "100%",
                padding: "0px 8px 0 20px",
                boxSizing: "border-box",
                alignContent: "center"
            }}
            id="cards-list-container"
            onScroll={onScroll}
            ref={scrollViewRef}
        >
            <div style={{marginBottom}}>
                {
                    categories.map((category, i) => (
                        <div
                            key={i}
                            ref={(el) => {
                                cardRefs.current[category] = el;
                            }}
                            style={{
                                marginBottom: 50
                            }}
                        >
                            <StyledHeader2>
                                {category}
                            </StyledHeader2>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    gap: 20
                                }}
                            >
                                {
                                    groupedItems && groupedItems[category] && groupedItems[category].map((template, i) => (
                                        <TemplateCard
                                            key={i}
                                            template={template}
                                            onClick={onClick}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

interface TemplatesListProps {
    onTemplateSelected: (templateId: string, templateName: string, templateDescription: string) => void
}

const TemplatesList: React.FC<TemplatesListProps> = ({onTemplateSelected}) => {
    const [categories, setCategories] = useState<string[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
    const cardRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

    const categoryClickedRef = useRef(false);

    const handleCategoryClick = (category: string) => {
        categoryClickedRef.current = true;

        setSelectedCategory(category);

        if (cardRefs.current[category]) {
            cardRefs.current[category]?.scrollIntoView({
                behavior: "smooth",
                block: "start" // Ensures the header is fully visible at the top
            });
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!categoryClickedRef.current) {
            const container = e.target as HTMLDivElement;
            const scrollPos = container.scrollTop;

            let activeCategory: string | null = null;

            Object.keys(cardRefs.current).forEach((category) => {
                const ref = cardRefs.current[category];
                if (ref) {
                    const offsetTop = ref.offsetTop;
                    const offsetHeight = ref.offsetHeight; // Get the height of the category header

                    // You could adjust this threshold based on your design needs
                    const threshold = container.offsetHeight / 3; // You could tweak this value

                    if (scrollPos >= offsetTop - threshold && scrollPos < offsetTop + offsetHeight) {
                        activeCategory = category;
                    }
                }
            });

            if (activeCategory && activeCategory !== selectedCategory) {
                setSelectedCategory(activeCategory);
            }
        }
    };

    useDetectScrollEnd(() => {
        categoryClickedRef.current = false;
    }, 200);

    useEffect(() => {
        const fetchTemplates = async () => {
            const t = await window.electronAPI.fetchTemplates();
            setTemplates(t);
        };

        fetchTemplates();
    }, []);

    useEffect(() => {
        if (templates) {
            const c = [...new Set(templates.map((template) => template.category))];

            // Sort the categories alphabetically
            const sortedCategories = [...c].sort((a, b) => a.localeCompare(b));

            setCategories(sortedCategories);
            setSelectedCategory(sortedCategories[0]);
        }
    }, [templates]);

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "row",
                height: "100%"
            }}
            >
                <div style={{
                    flexBasis: 300
                }}
                >
                    <CategoriesList
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryClick={handleCategoryClick}
                    />
                </div>
                <div style={{flexGrow: 1}}>
                    <TemplateCardsList
                        templates={templates}
                        categories={categories}
                        cardRefs={cardRefs}
                        onScroll={handleScroll}
                        onClick={onTemplateSelected}
                    />
                </div>
            </div>
        </>

    );
};

export default TemplatesList;
