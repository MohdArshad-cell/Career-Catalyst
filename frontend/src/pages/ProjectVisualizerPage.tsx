import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Network, Sparkles, Layers, MessageSquare, AlertTriangle, CloudRain, Zap, Database, TrendingUp, Check, Copy } from 'lucide-react';
import { useToast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import mermaid from 'mermaid';
import './ToolPages.css';
import ModelSelector from '../components/ModelSelector';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface VisualizerData {
    system_architecture_mermaid: string;
    sequence_diagram_mermaid: string;
    database_erd_mermaid: string;
    tech_stack: string[];
    eli5_explanation: string;
    senior_dev_explanation: string;
    architecture_roast: string;
    enterprise_upgrade_suggestions: string[];
    cloud_cost_estimate: string;
    scaling_bottleneck_100k: string;
}

const MermaidChart: React.FC<{ chart: string; id: string }> = ({ chart, id }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        });
        
        if (mermaidRef.current && chart) {
            // Need unique ID for each mermaid render instance
            mermaidRef.current.innerHTML = `<div class="mermaid" id="${id}">${chart}</div>`;
            mermaid.contentLoaded();
        }
    }, [chart, id]);

    return (
        <div ref={mermaidRef} style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'auto', padding: '1rem 0' }}></div>
    );
};

const ProjectVisualizerPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [projectDescription, setProjectDescription] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite-preview');
    const [optimizedData, setOptimizedData] = useState<VisualizerData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // State for Tabs and Toggles
    const [activeTab, setActiveTab] = useState<'system' | 'sequence' | 'erd'>('system');
    const [isSeniorMode, setIsSeniorMode] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!projectDescription.trim()) {
            showToast('Please provide your project description or GitHub README content.', 'error');
            return;
        }
        
        setIsLoading(true);
        setOptimizedData(null);
        setActiveTab('system');

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

            if (!data || !data.system_architecture_mermaid) {
                throw new Error("Invalid response format received from server.");
            }

            setOptimizedData(data);
            showToast('X-Ray scan complete! Prepare to be amazed.', 'success');

        } catch (err: any) {
            console.error("Error generating visualizer:", err);
            
            if (err.response?.status === 402 || err.response?.status === 401 || err.response?.status === 403) {
                showToast("🚫 Tokens Empty or Session Expired! Redirecting to Premium upgrade...", "error");
                setIsLoading(false);
                setTimeout(() => navigate('/pricing'), 3000);
                return;
            }
            showToast("Failed to visualize project. Ensure backend is running.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToReadme = () => {
        if (!optimizedData) return;
        
        const markdown = `## 🏗️ System Architecture
\`\`\`mermaid
${optimizedData.system_architecture_mermaid}
\`\`\`

## 🛠️ Tech Stack
${optimizedData.tech_stack.map(t => `- ${t}`).join('\n')}

## 🚀 How it Works
${optimizedData.senior_dev_explanation}
`;
        navigator.clipboard.writeText(markdown);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        showToast("Copied GitHub README snippet to clipboard!", "success");
    };

    return (
        <div className="page-container">
            <div className="tool-page-container">
                <div className="tool-header">
                    <div className="badge-purple">
                        <Network size={16} /> Codebase X-Ray
                    </div>
                    <h1 className="tool-header-title">Enterprise Architecture Visualizer</h1>
                    <p className="tool-header-subtitle">Instantly generate System flows, Sequence Diagrams, ERDs, and identify interview-level scaling bottlenecks.</p>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="panel glass-panel">
                        <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
                            <h2 className="panel-title">
                                <Database size={22} color="#c084fc" /> Project Context
                            </h2>
                            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                        </div>
                        
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                            Paste your GitHub README, code logic, or rough architecture ideas.
                        </p>
                        
                        <textarea
                            className="premium-textarea"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="e.g., A Next.js frontend with a Node.js backend. Uses MongoDB for user data. I want to add Redis caching..."
                            disabled={isLoading}
                            style={{ minHeight: '200px', width: '100%', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div className="action-row text-center" style={{ margin: '3rem 0' }}>
                    <button 
                        className="btn-premium pulse-glow massive-btn-purple" 
                        onClick={handleGenerate}
                        disabled={isLoading || !projectDescription.trim()}
                    >
                        {isLoading ? 'Scanning Codebase...' : 'Execute X-Ray Scan ⚡'}
                    </button>
                </div>

                {optimizedData && (
                    <div className="output-section" style={{ maxWidth: '1400px', margin: '4rem auto 0', animation: 'fadeInUp 0.6s ease-out' }}>
                        <div className="text-center" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <Sparkles color="#a855f7" size={32} />
                                Architecture X-Ray Complete
                            </h2>
                            <button className="btn-outline" onClick={copyToReadme} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem' }}>
                                {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />} 
                                Export to GitHub README
                            </button>
                        </div>

                        {/* DIAGRAM VIEWER TABS */}
                        <div className="panel glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', borderRadius: '16px', borderTop: '4px solid #a855f7', background: 'rgba(15,23,42,0.9)' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                <button 
                                    onClick={() => setActiveTab('system')} 
                                    style={{ background: 'transparent', border: 'none', color: activeTab === 'system' ? '#c084fc' : '#94a3b8', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Layers size={20} /> System Architecture
                                </button>
                                <button 
                                    onClick={() => setActiveTab('sequence')} 
                                    style={{ background: 'transparent', border: 'none', color: activeTab === 'sequence' ? '#c084fc' : '#94a3b8', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Zap size={20} /> Sequence Diagram (API Flow)
                                </button>
                                <button 
                                    onClick={() => setActiveTab('erd')} 
                                    style={{ background: 'transparent', border: 'none', color: activeTab === 'erd' ? '#c084fc' : '#94a3b8', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Database size={20} /> Database ERD
                                </button>
                            </div>
                            
                            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '400px' }}>
                                {activeTab === 'system' && <MermaidChart id="sys-arch" chart={optimizedData.system_architecture_mermaid} />}
                                {activeTab === 'sequence' && <MermaidChart id="seq-diag" chart={optimizedData.sequence_diagram_mermaid} />}
                                {activeTab === 'erd' && <MermaidChart id="erd-diag" chart={optimizedData.database_erd_mermaid} />}
                            </div>
                        </div>

                        {/* EXPLANATION TOGGLE */}
                        <div className="panel glass-card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #3b82f6', background: 'rgba(20,20,30,0.8)', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                                    <MessageSquare size={20} color="#3b82f6"/> Architecture Explanation
                                </h4>
                                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '30px', display: 'flex', padding: '0.2rem' }}>
                                    <button 
                                        onClick={() => setIsSeniorMode(false)}
                                        style={{ background: !isSeniorMode ? '#3b82f6' : 'transparent', color: !isSeniorMode ? 'white' : '#94a3b8', border: 'none', padding: '0.4rem 1rem', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s' }}
                                    >
                                        Explain like I'm 5 (For Recruiters)
                                    </button>
                                    <button 
                                        onClick={() => setIsSeniorMode(true)}
                                        style={{ background: isSeniorMode ? '#3b82f6' : 'transparent', color: isSeniorMode ? 'white' : '#94a3b8', border: 'none', padding: '0.4rem 1rem', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s' }}
                                    >
                                        Senior Dev (For Engineering Managers)
                                    </button>
                                </div>
                            </div>
                            <p style={{ color: '#e2e8f0', lineHeight: '1.7', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                                {isSeniorMode ? optimizedData.senior_dev_explanation : optimizedData.eli5_explanation}
                            </p>
                        </div>

                        {/* THE INTERVIEW ROAST & UPGRADES */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                            
                            <div className="panel glass-card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #ef4444', background: 'rgba(20,20,30,0.8)' }}>
                                <h4 style={{ color: 'white', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <AlertTriangle size={18} color="#ef4444"/> The Interview Roast (Weaknesses)
                                </h4>
                                <p style={{ color: '#fca5a5', lineHeight: '1.7', fontSize: '0.95rem' }}>{optimizedData.architecture_roast}</p>
                                
                                <h4 style={{ color: 'white', margin: '1.5rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <TrendingUp size={18} color="#ef4444"/> Scaling Bottleneck (100k Users)
                                </h4>
                                <p style={{ color: '#fca5a5', lineHeight: '1.7', fontSize: '0.95rem' }}>{optimizedData.scaling_bottleneck_100k}</p>
                            </div>

                            <div className="panel glass-card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #10b981', background: 'rgba(20,20,30,0.8)' }}>
                                <h4 style={{ color: 'white', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <Sparkles size={18} color="#10b981"/> Enterprise Upgrade Suggestions
                                </h4>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#e2e8f0', lineHeight: '1.7', fontSize: '0.95rem' }}>
                                    {optimizedData.enterprise_upgrade_suggestions?.map((step, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.75rem' }}>{step}</li>
                                    ))}
                                </ul>

                                <h4 style={{ color: 'white', margin: '1.5rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <CloudRain size={18} color="#10b981"/> Cloud Cost Estimator
                                </h4>
                                <p style={{ color: '#86efac', lineHeight: '1.7', fontSize: '0.95rem', fontWeight: 'bold' }}>{optimizedData.cloud_cost_estimate}</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectVisualizerPage;
