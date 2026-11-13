import { useRef } from "react";

/**
 * Adds a restrained cursor-follow effect to one interactive element.
 * The effect is mouse-only, capped at four pixels, and disabled for
 * users who prefer reduced motion.
 */
const Magnetic = ({ as: Component = "button", strength = 0.1, children, className = "", ...props }) => {
    const elementRef = useRef(null);

    const handlePointerMove = (event) => {
        const element = elementRef.current;
        if (!element || event.pointerType !== "mouse") return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

        const bounds = element.getBoundingClientRect();
        const offsetX = (event.clientX - (bounds.left + bounds.width / 2)) * strength;
        const offsetY = (event.clientY - (bounds.top + bounds.height / 2)) * strength;
        const x = Math.max(-4, Math.min(4, offsetX));
        const y = Math.max(-4, Math.min(4, offsetY));

        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const handlePointerLeave = () => {
        if (elementRef.current) elementRef.current.style.transform = "";
    };

    return (
        <Component
            {...props}
            ref={elementRef}
            className={className}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            {children}
        </Component>
    );
};

export default Magnetic;
