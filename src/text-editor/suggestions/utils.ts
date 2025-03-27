import {Instance as TippyInstance} from "tippy.js";
import {Modifier} from "@popperjs/core";
import {Theme} from "../../contexts/ThemeContext";

export function adjustScrollIfNeeded(instance: TippyInstance): Promise<void> {
    return new Promise((resolve) => {
        const container = document.querySelector(".text-editor-scrollable-container");
        const popper = instance.popper;
        const popperRect = popper.getBoundingClientRect();

        if (container) {
            const containerRect = container.getBoundingClientRect();

            // Check if the popper is out of visible bounds and scroll if needed
            if (popperRect.bottom > containerRect.bottom || popperRect.top < containerRect.top) {
                const scrollAmount = popperRect.bottom > containerRect.bottom
                    ? popperRect.bottom - containerRect.bottom
                    : containerRect.top - popperRect.top;

                // Scroll the container with smooth behavior
                container.scrollTo({
                    top: container.scrollTop + scrollAmount,
                    behavior: "smooth"
                });

                // Estimate scroll duration based on scroll distance (for smoother UX)
                const duration = Math.abs(scrollAmount) / 2; // Adjust speed if necessary

                // Wait for the scroll animation to finish
                setTimeout(() => {
                    resolve();
                }, duration);
            } else {
                // No scroll needed, resolve immediately
                resolve();
            }
        }
    });
}

export const applyStylesModifier: Modifier<"applyStyles", {}> = {
    name: "applyStyles",
    enabled: true,
    phase: "main",
    fn: ({state}: {state: any}) => {
        const {popper, reference} = state.elements;
        const referenceRect = reference.getBoundingClientRect();
        const popperRect = popper.getBoundingClientRect();

        // Get the scrollable editor container and the boundaries
        const container = document.querySelector(".text-editor-scrollable-container");

        if (container) {
            const containerRect = container.getBoundingClientRect();

            // Define the boundaries with 10px padding from the container
            const topBoundary = containerRect.top + 10;
            const bottomBoundary = containerRect.bottom - 10;
            const leftBoundary = containerRect.left + 10;
            const rightBoundary = containerRect.right - 10;

            // Calculate available space above, below, and to the sides of the selection
            const spaceAbove = referenceRect.top - topBoundary;
            const spaceBelow = bottomBoundary - referenceRect.bottom;
            const spaceLeft = referenceRect.left - leftBoundary;
            const spaceRight = rightBoundary - referenceRect.right;

            // Default position below the reference (selection)
            let top = referenceRect.bottom;
            let left = referenceRect.left;

            // Adjust positioning based on available space
            if (spaceBelow < popperRect.height && spaceAbove >= popperRect.height) {
                // Position above the selection if there is not enough space below
                top = referenceRect.top - popperRect.height;
            } else if (spaceBelow < popperRect.height && spaceAbove < popperRect.height) {
                // If neither above nor below has enough space, position it in the middle of the container
                top = topBoundary + (containerRect.height - popperRect.height) / 2;
            }

            // Horizontal positioning adjustments
            if (spaceRight < popperRect.width && spaceLeft >= popperRect.width) {
                // Position to the left if there's not enough space on the right
                left = referenceRect.right - popperRect.width;
            } else if (spaceRight < popperRect.width && spaceLeft < popperRect.width) {
                // Center horizontally if space on both sides is insufficient
                left = leftBoundary + (containerRect.width - popperRect.width) / 2;
            }

            // Ensure the popup stays within the boundaries with the 10px padding
            if (top + popperRect.height > bottomBoundary) {
                top = bottomBoundary - popperRect.height;
            }
            if (top < topBoundary) {
                top = topBoundary;
            }
            if (left + popperRect.width > rightBoundary) {
                left = rightBoundary - popperRect.width;
            }
            if (left < leftBoundary) {
                left = leftBoundary;
            }

            // Apply calculated styles
            Object.assign(popper.style, {
                top: `${top}px`,
                left: `${left}px`
            });

            // Update the popper's state
            state.styles.popper.top = `${top}px`;
            state.styles.popper.left = `${left}px`;
        }
    }
};

interface ColorValues {
    light: string,
    dark: string
}

interface ColorMap {
    [key: string]: ColorValues
}

export const colorMap: ColorMap = {
    orangeText: {
        light: "#D9730D",
        dark: "#C77D48"
    },
    orangeHighlight: {
        light: "#FBECDD",
        dark: "#5C3B23"
    },
    yellowText: {
        light: "#CB912F",
        dark: "#CA9849"
    },
    yellowHighlight: {
        light: "#FBF3DB",
        dark: "#564328"
    },
    greenText: {
        light: "#448361",
        dark: "#529E72"
    },
    greenHighlight: {
        light: "#EDF3EC",
        dark: "#243D30"
    },
    blueText: {
        light: "#337EA9",
        dark: "#5E87C9"
    },
    blueHighlight: {
        light: "#E7F3F8",
        dark: "#143A4E"
    },
    purpleText: {
        light: "#9065B0",
        dark: "#9D68D3"
    },
    purpleHighlight: {
        light: "#F4F0F7CC",
        dark: "#3C2D49"
    },
    pinkText: {
        light: "#C14C8A",
        dark: "#D15796"
    },
    pinkHighlight: {
        light: "#F9EEF3CC",
        dark: "#4E2C3C"
    },
    redText: {
        light: "#D44C47",
        dark: "#DF5452"
    },
    redHighlight: {
        light: "#FDEBEC",
        dark: "#522E2A"
    }
};


export function getHexColor(colorPlaceholder: string, theme: Theme) {
    return colorMap[colorPlaceholder] ? colorMap[colorPlaceholder][theme] : colorPlaceholder;
}
