import React from 'react';

export function NetworkBackground() {
    return (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <div className="w-full h-full" style={{
                backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
            }} />
        </div>
    );
}
