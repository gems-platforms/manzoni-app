import React, {useRef, useState, useEffect} from "react";
import ReactDOM from "react-dom";

import {StyledTooltip} from "../styled";

interface TooltipProps {
    children: React.ReactNode,
    tooltipText: string,
    delay?: number // Delay in milliseconds before showing the tooltip
}

export const Tooltip: React.FC<TooltipProps> = ({children, tooltipText, delay = 1500}) => {
    const [isVisible, setIsVisible] = useState(false);

    const [showAbove, setShowAbove] = useState(false);

    const [position, setPosition] = useState<{top: number, left: number}>({top: 0, left: 0});

    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updatePosition = () => {
        if (containerRef.current && tooltipRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Determine whether to show the tooltip above or below the container
            const showAbove = containerRect.top > tooltipRect.height;
            setShowAbove(showAbove);

            // Calculate horizontal position to center the tooltip
            let left = containerRect.left + containerRect.width / 2 - tooltipRect.width / 2;

            // Constrain tooltip within viewport horizontally
            if (left < 10) {
                left = tooltipRect.width / 2 + 10; // Padding from the left
            } else if (left + tooltipRect.width > viewportWidth) {
                left = viewportWidth - tooltipRect.width - 10; // Padding from the right
            } else { // tooltip width does not exceed window boundaries
                left = containerRect.left + containerRect.width / 2; // center above/below the targeted item
            }

            // Set the position for the tooltip
            setPosition({
                top: showAbove
                    ? containerRect.top - tooltipRect.height
                    : containerRect.bottom,
                left: left
            });
        }
    };

    const handleMouseEnter = () => {
        showTimeoutRef.current = setTimeout(() => {
            updatePosition();
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
        }
        setIsVisible(false);
    };

    const handleClick = () => {
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible) {
            updatePosition();
        }
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isVisible]);

    return (
        <>
            <div
                ref={containerRef}
                style={{position: "relative", display: "inline-block"}}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {children}
            </div>
            {ReactDOM.createPortal(
                position && (
                    <StyledTooltip
                        ref={tooltipRef}
                        $isVisible={isVisible}
                        style={{
                            top: position.top,
                            left: position.left,
                            transform: isVisible
                                ? `translate(-50%, ${showAbove ? "-20px" : "20px"})`
                                : `translate(-50%, ${showAbove ? "-10px" : "10px"})`
                        }}
                    >
                        {tooltipText}
                    </StyledTooltip>
                ),
                document.body // Render in the body to escape overflow constraints
            )}
        </>
    );
};
