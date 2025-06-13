import { useState, useCallback } from "react";

export const useListAnimation = () => {
    const [movingIndex, setMovingIndex] = useState(null);
    const [moveDirection, setMoveDirection] = useState(null);
    const [pulsingButton, setPulsingButton] = useState(null);

    const startMoveAnimation = useCallback((index, direction, buttonId) => {
        // Trigger button pulse animation
        setPulsingButton(buttonId);
        setTimeout(() => setPulsingButton(null), 600);

        // Start movement animation
        setMovingIndex(index);
        setMoveDirection(direction);
    }, []);

    const endMoveAnimation = useCallback(() => {
        setMovingIndex(null);
        setMoveDirection(null);
    }, []);

    const animateMove = useCallback(
        async (index, direction, buttonId, moveOperation) => {
            startMoveAnimation(index, direction, buttonId);

            // Wait for animation to start, then perform the actual move
            setTimeout(async () => {
                await moveOperation();
                endMoveAnimation();
            }, 300);
        },
        [startMoveAnimation, endMoveAnimation]
    );

    const getItemClassName = useCallback(
        (index) => {
            if (movingIndex === index) {
                return `moving-${moveDirection}`;
            }
            if (movingIndex === index - 1 && moveDirection === "down") {
                return "swap-down";
            }
            if (movingIndex === index + 1 && moveDirection === "up") {
                return "swap-up";
            }
            return "";
        },
        [movingIndex, moveDirection]
    );

    const getButtonClassName = useCallback(
        (buttonId) => {
            return pulsingButton === buttonId ? "pulsing" : "";
        },
        [pulsingButton]
    );

    const isAnimating = useCallback(() => {
        return movingIndex !== null;
    }, [movingIndex]);

    return {
        animateMove,
        getItemClassName,
        getButtonClassName,
        isAnimating,
        movingIndex,
        moveDirection,
    };
};
