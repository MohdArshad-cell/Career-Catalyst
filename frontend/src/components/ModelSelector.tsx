import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Zap, Brain, Scale, Rocket } from 'lucide-react';
import './ModelSelector.css';

export interface ModelOption {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    cost: number;
    votes?: number;
    isTopRated?: boolean;
}

const MODELS: ModelOption[] = [
    {
        id: 'gemini-3.1-flash-lite-preview',
        name: 'Gemini 3.1 Flash-Lite Preview',
        description: 'Cutting edge performance',
        icon: <Zap size={14} color="#f59e0b" />,
        cost: 1,
        votes: 10,
        isTopRated: true,
    },
    {
        id: 'gemini-3.5-flash',
        name: 'Gemini 3.5 Flash ⭐',
        description: 'Newest & best for resume tailoring',
        icon: <Rocket size={14} color="#ec4899" />,
        cost: 1,
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Reliable & proven',
        icon: <Scale size={14} color="#f59e0b" />,
        cost: 1,
        votes: 2,
    },
    {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash-Lite',
        description: 'Ultra-fast (Stable)',
        icon: <Zap size={14} color="#ef4444" />,
        cost: 1,
        votes: 4,
    },
    {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash-Lite',
        description: 'Budget-friendly',
        icon: <Zap size={14} color="#ef4444" />,
        cost: 1,
        votes: 2,
    },
    {
        id: 'gemini-3.0-flash-preview',
        name: 'Gemini 3 Flash Preview',
        description: 'Fast & modern',
        icon: <Rocket size={14} color="#ec4899" />,
        cost: 1,
        votes: 1,
    },
    {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro Preview',
        description: 'Most powerful',
        icon: <Brain size={14} color="#d946ef" />,
        cost: 2,
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Deep reasoning',
        icon: <Brain size={14} color="#d946ef" />,
        cost: 2,
    }
];

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];
    const topRatedModel = MODELS.find(m => m.isTopRated);
    const otherModels = MODELS.filter(m => !m.isTopRated);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="model-selector-container" ref={dropdownRef}>
            <button 
                className="model-selector-button" 
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className="model-selector-button-content">
                    {activeModel.icon}
                    <span className="model-selector-name">{activeModel.name}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="model-selector-dropdown">
                    {topRatedModel && (
                        <div className="model-section">
                            <div className="model-section-title">Top Rated</div>
                            <div 
                                className={`model-option ${selectedModel === topRatedModel.id ? 'selected' : ''}`}
                                onClick={() => { onModelChange(topRatedModel.id); setIsOpen(false); }}
                            >
                                <div className="model-option-left">
                                    <div className="check-placeholder">
                                        {selectedModel === topRatedModel.id && <Check size={14} />}
                                    </div>
                                    <div className="model-option-details">
                                        <span className="model-title">{topRatedModel.name}</span>
                                        <span className="model-desc">
                                            — {topRatedModel.icon} {topRatedModel.description}
                                        </span>
                                    </div>
                                </div>
                                <div className="model-option-right">
                                    <span className="model-cost">{topRatedModel.cost} credit</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="model-section">
                        <div className="model-section-title">Gemini</div>
                        {otherModels.map(model => (
                            <div 
                                key={model.id}
                                className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
                                onClick={() => { onModelChange(model.id); setIsOpen(false); }}
                            >
                                <div className="model-option-left">
                                    <div className="check-placeholder">
                                        {selectedModel === model.id && <Check size={14} />}
                                    </div>
                                    <div className="model-option-details">
                                        <span className="model-title">{model.name}</span>
                                        <span className="model-desc">
                                            — {model.icon} {model.description}
                                        </span>
                                    </div>
                                </div>
                                <div className="model-option-right">
                                    <span className="model-cost">{model.cost} credit</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelSelector;
