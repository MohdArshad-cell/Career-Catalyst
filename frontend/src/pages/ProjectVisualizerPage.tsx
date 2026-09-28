import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Network, Sparkles, Layers, ListChecks, CheckCircle, Database, Server, Component } from 'lucide-react';
import { useToast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import mermaid from 'mermaid';
import './ToolPages.css';
import ModelSelector from '../components/ModelSelector';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface VisualizerData {
    mermaid_code: string;
    tech_stack: string[];
    step_by_step_flow: string[];
}

const MermaidChart: React.FC<{ chart: string }> = ({ chart }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        });
        
        if (mermaidRef.current && chart) {
            mermaidRef.current.innerHTML = chart;
            mermaid.contentLoaded();
        }
    }, [chart]);

    return (
        <div 
            className="mermaid" 
            ref={mermaidRef} 
            style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'auto', padding: '2rem 0' }}
        >
            {chart}
        </div>
    );
};

const ProjectVisualizerPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [projectDescription, setProjectDescription] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite-preview');
    const [optimizedData, setOptimizedData] = useState<VisualizerData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!projectDescription.trim()) {
            showToast('Please provide your project description or GitHub README content.', 'error');
            return;
        }
        
        setIsLoading(true);
        setOptimizedData(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user || !session) {
                showToast("You must be logged in to use this AI tool.", "warning");
                setIsLoading(false);
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            const payload = { 
                project_description: projectDescription,
                ai_model: selectedModel
            };
            
            const response = await axios.post(`${API_BASE_URL}/api/ai/project-visualizer`, payload, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`, 
                    'Content-Type': 'application/json'
                }
            });
            
            const data = response.data?.visualizer_data;

            if (!data || !data.mermaid_code) {
                throw new Error("Invalid response format received from server.");
            }

            setOptimizedData(data);
            showToast('Project Visualized successfully!', 'success');

        } catch (err: any) {
            console.error("Error generating visualizer:", err);
            
            if (err.response?.status === 402 || err.response?.status === 401 || err.response?.status === 403) {
                showToast("🚫 Tokens Empty or Session Expired! Redirecting to Premium upgrade...", "error");
                setIsLoading(false);
                setTimeout(() => navigate('/pricing'), 3000);
                return;
            }

            if (err.response?.status === 429) {
                showToast("Too many requests. Please wait a moment.", "warning");
                setIsLoading(false);
                return;
            }

            let finalErrorMessage = "Failed to visualize project. Ensure backend is running.";
            try {
                const detail = err.response?.data?.detail;
                if (detail) {
                    finalErrorMessage = typeof detail === "string" ? detail : JSON.stringify(detail);
                }
            } catch (e) {}

            showToast(finalErrorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="tool-page-container">
                <div className="tool-header">
                    <div className="badge-purple">
                        <Network size={16} /> Architecture Visualizer
                    </div>
                    <h1 className="tool-header-title">Codebase X-Ray</h1>
                    <p className="tool-header-subtitle">Turn any GitHub README or project description into an interactive architecture diagram instantly.</p>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="panel glass-panel">
                        <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
                            <h2 className="panel-title">
                                <Component size={22} color="#c084fc" /> Project Context
                            </h2>
                            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                        </div>
                        
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                            Paste your GitHub README, project description, or tech stack details below.
                        </p>
                        
                        <textarea
                            className="premium-textarea"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="e.g., A React frontend with a FastAPI backend, using PostgreSQL for user data and Redis for caching..."
                            disabled={isLoading}
                            style={{ minHeight: '250px', width: '100%', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div className="action-row text-center" style={{ margin: '3rem 0' }}>
                    <button 
                        className="btn-premium pulse-glow massive-btn-purple" 
                        onClick={handleGenerate}
                        disabled={isLoading || !projectDescription.trim()}
                    >
                        {isLoading ? 'Analyzing Architecture...' : 'Generate X-Ray ⚡'}
                    </button>
                </div>

                {optimizedData && (
                    <div className="output-section" style={{ maxWidth: '1200px', margin: '4rem auto 0', animation: 'fadeInUp 0.6s ease-out' }}>
                        <div className="text-center" style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <Sparkles color="#a855f7" size={32} />
                                Architecture X-Ray Complete
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                Interactive data flow and system architecture breakdown.
                            </p>
                        </div>

                        {/* DIAGRAM VIEWER */}
                        <div className="panel glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', borderRadius: '16px', borderTop: '4px solid #a855f7', background: 'rgba(15,23,42,0.9)' }}>
                            <h3 style={{ color: '#d8b4fe', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
                                <Layers size={24} /> System Architecture Diagram
                            </h3>
                            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '300px' }}>
                                <MermaidChart chart={optimizedData.mermaid_code} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                            {/* Tech Stack */}
                            <div className="panel glass-card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #0ea5e9', background: 'rgba(20,20,30,0.8)' }}>
                                <h4 style={{ color: 'white', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <Database size={18} color="#0ea5e9"/> Core Technologies Detected
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {optimizedData.tech_stack?.map((tech, idx) => (
                                        <span key={idx} style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#7dd3fc', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Step by Step Flow */}
                            <div className="panel glass-card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #10b981', background: 'rgba(20,20,30,0.8)' }}>
                                <h4 style={{ color: 'white', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <ListChecks size={18} color="#10b981"/> Execution Flow
                                </h4>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#e2e8f0', lineHeight: '1.7', fontSize: '1rem' }}>
                                    {optimizedData.step_by_step_flow?.map((step, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.75rem' }}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectVisualizerPage;
