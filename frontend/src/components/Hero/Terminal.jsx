import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Terminal() {
    const [lines, setLines] = useState([
        "> Initializing ATS engine...",
    ]);

    useEffect(() => {
        const script = [
            "> Injecting target keywords...",
            "> Formatting to LaTeX standard...",
            "> Bypassing ATS filters...",
            "> SUCCESS: Score 99/100"
        ];

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < script.length) {
                setLines(prev => [...prev, script[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-64 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden md:block"
        >
            <div className="bg-white/5 px-3 py-2 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 ml-auto font-mono">bash - 80x24</span>
            </div>
            <div className="p-4 font-mono text-xs text-green-400 space-y-2">
                {lines.map((line, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {line}
                    </motion.div>
                ))}
                <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-3 bg-green-400 mt-2"
                />
            </div>
        </motion.div>
    );
}
