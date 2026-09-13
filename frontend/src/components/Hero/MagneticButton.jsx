import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function MagneticButton({ children, className, href }) {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.1, y: middleY * 0.1 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    const inner = (
        <motion.div
            style={{ position: 'relative', zIndex: 10 }}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );

    if (href) {
        return (
            <Link
                to={href}
                ref={ref}
                onMouseMove={handleMouse}
                onMouseLeave={reset}
                className={className}
                style={{ position: 'relative', display: 'inline-block' }}
            >
                {inner}
            </Link>
        );
    }

    return (
        <button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            className={className}
            style={{ position: 'relative', display: 'inline-block' }}
        >
            {inner}
        </button>
    );
}
