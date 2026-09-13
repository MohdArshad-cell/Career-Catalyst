import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Map, Target, BookOpen, Clock, Settings2, FileText, CheckCircle, BrainCircuit, Download, AlertTriangle, Code, Trophy, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import PdfUploadButton from '../components/PdfUploadButton';
import { useToast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import SkillRadarChart, { Competency } from '../components/SkillRadarChart';
import { saveAs } from 'file-saver';
import './ToolPages.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface Blindspot {
  risk: string;
  mitigation: string;
}

interface PortfolioProject {
  name: string;
  description: string;
  tech_stack: string[];
  business_value: string;
}

interface Milestone {
  timeframe: string;
  focus: string;
  action_items: string[];
  success_kpis: string[];
}

interface Resource {
  title: string;
  type: string;
  reason: string;
}

interface RoadmapData {
  current_assessment: string;
  blindspots: Blindspot[];
  competency_matrix: Competency[];
  portfolio_projects: PortfolioProject[];
  milestones: Milestone[];
  recommended_resources: Resource[];
}

const CareerRoadmapPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [resumeText, setResumeText] = useState('');
    const [targetGoal, setTargetGoal] = useState('');
    const [timeframe, setTimeframe] = useState('12 Months');
    const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const toggleCheck = (id: string) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const calculateProgress = () => {
        if (!roadmapData || !roadmapData.milestones) return 0;
        let total = 0;
        roadmapData.milestones.forEach(ms => {
            if (ms.action_items) total += ms.action_items.length;
        });
        if (total === 0) return 0;
        const completed = Object.values(checkedItems).filter(Boolean).length;
        return Math.round((completed / total) * 100);
    };

    const handleGenerate = async () => {
        if (!resumeText.trim() || !targetGoal.trim()) {
            showToast('Please provide both your resume and your target career goal.', 'error');
            return;
        }
        
        setIsLoading(true);
        setRoadmapData(null);

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
                resume_text: resumeText,
                target_goal: targetGoal,
                timeframe: timeframe
            };
            
            const response = await axios.post(`${API_BASE_URL}/api/ai/roadmap`, payload, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`, 
                    'Content-Type': 'application/json'
                }
            });
            
            const data = response.data?.roadmap_data;

            if (!data) {
                throw new Error("Invalid response format received from server.");
            }

            setRoadmapData(data);
            showToast('Career roadmap generated successfully!', 'success');

        } catch (err: any) {
            console.error("Error generating roadmap:", err);
            
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

            let finalErrorMessage = "Failed to generate roadmap. Ensure backend is running.";
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

    const handleDownloadMarkdown = () => {
        if (!roadmapData) return;
        
        let md = `# Career Roadmap\n\n`;
        md += `## Current Assessment vs Goal\n${roadmapData.current_assessment}\n\n`;
        
        if (roadmapData.blindspots) {
            md += `## The Reality Check (Blindspots)\n`;
            roadmapData.blindspots.forEach(bs => {
                md += `- **Risk**: ${bs.risk}\n  **Mitigation**: ${bs.mitigation}\n`;
            });
            md += `\n`;
        }

        if (roadmapData.portfolio_projects) {
            md += `## Proof of Competence (Projects)\n`;
            roadmapData.portfolio_projects.forEach(proj => {
                md += `### ${proj.name}\n- **Description**: ${proj.description}\n- **Tech Stack**: ${proj.tech_stack.join(', ')}\n- **Business Value**: ${proj.business_value}\n\n`;
            });
        }

        md += `## Competency Analysis\n`;
        roadmapData.competency_matrix?.forEach(comp => {
            md += `- **${comp.skill}**: Current (${comp.current_level}) -> Required (${comp.required_level})\n  *Gap*: ${comp.gap_analysis}\n`;
        });
        md += `\n`;

        md += `## Recommended Action Plan\n`;
        roadmapData.recommended_resources?.forEach(res => {
            md += `- **${res.title}** (${res.type})\n  ${res.reason}\n`;
        });
        md += `\n`;

        md += `## Execution Timeline\n`;
        roadmapData.milestones?.forEach(ms => {
            md += `### ${ms.timeframe}: ${ms.focus}\n`;
            md += `**Action Items:**\n`;
            ms.action_items?.forEach(act => md += `- [ ] ${act}\n`);
            if (ms.success_kpis?.length > 0) {
                md += `\n**Success KPIs:**\n`;
                ms.success_kpis.forEach(kpi => md += `- ${kpi}\n`);
            }
            md += `\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, 'Career_Roadmap.md');
        showToast('Roadmap downloaded successfully!', 'success');
    };

    return (
        <div className="page-container">
            <ParticleBackground />
            <div className="background-aurora"></div>
            <Navbar />

            <div className="tool-page-container">
                
                <div className="tool-header">
                    <div className="badge-neutral">
                        <Map size={16} /> Career Planning
                    </div>
                    <h1 className="tool-header-title">Career Roadmap AI</h1>
                    <p className="tool-header-subtitle">Map out your exact steps to promotion or pivot.</p>
                </div>

                <div className="tool-input-grid">
                    {/* Resume Panel */}
                    <div className="panel glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className="panel-title">
                                <FileText size={22} color="#67e8f9" /> Your Resume
                            </h2>
                            <PdfUploadButton onTextExtracted={(text) => setResumeText(text)} disabled={isLoading} />
                        </div>
                        <textarea
                            className="premium-textarea"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume or upload a PDF..."
                            disabled={isLoading}
                        />
                    </div>
                    
                    {/* Target Goal Panel */}
                    <div className="panel glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className="panel-title">
                                <Target size={22} color="#67e8f9" /> Target Goal
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Settings2 size={16} color="var(--text-secondary)" />
                                <select 
                                    value={timeframe} 
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    disabled={isLoading}
                                    style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                                >
                                    <option value="6 Months">6 Months</option>
                                    <option value="12 Months">12 Months</option>
                                    <option value="3 Years">3 Years</option>
                                    <option value="5 Years">5 Years</option>
                                </select>
                            </div>
                        </div>
                        <textarea
                            className="premium-textarea"
                            value={targetGoal}
                            onChange={(e) => setTargetGoal(e.target.value)}
                            placeholder="E.g., Transition from Frontend Developer to Full Stack Engineer, or getting promoted to Senior PM."
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="action-row text-center" style={{ margin: '3rem 0' }}>
                    <button 
                        className="btn-premium pulse-glow massive-btn" 
                        onClick={handleGenerate}
                        disabled={isLoading || !resumeText.trim() || !targetGoal.trim()}
                        style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '50px', background: 'linear-gradient(45deg, #22c55e, #16a34a)' }}
                    >
                        {isLoading ? 'Plotting Trajectory...' : 'Generate Roadmap 🗺️'}
                    </button>
                </div>

                {roadmapData && (
                    <div className="output-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ flexGrow: 1, marginRight: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={18} color="#eab308" /> Execution Progress
                                    </span>
                                    <span style={{ color: '#eab308', fontWeight: 'bold' }}>{calculateProgress()}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${calculateProgress()}%`, height: '100%', background: 'linear-gradient(90deg, #eab308, #f59e0b)', transition: 'width 0.4s ease-out', boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)' }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => window.print()}
                                    className="btn-outline pulse-glow"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '50px', border: '1px solid #a855f7', color: '#d8b4fe', background: 'rgba(168, 85, 247, 0.1)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                    <FileText size={18} /> Download PDF
                                </button>
                                <button 
                                    onClick={handleDownloadMarkdown}
                                    className="btn-outline pulse-glow"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '50px', border: '1px solid #3b82f6', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.1)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                    <Download size={18} /> Export Markdown
                                </button>
                            </div>
                        </div>

                        <div className="panel glass-panel" style={{ position: 'relative', marginBottom: '2rem', padding: '2rem', borderLeft: '4px solid #22c55e' }}>
                            <h3 style={{ color: '#22c55e', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Target size={24}/> Current Assessment vs Goal
                            </h3>
                            <p style={{ color: 'white', fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>
                                {roadmapData.current_assessment}
                            </p>
                        </div>

                        {roadmapData.blindspots && roadmapData.blindspots.length > 0 && (
                            <div className="panel glass-panel" style={{ position: 'relative', marginBottom: '2rem', padding: '2rem', borderLeft: '4px solid #ef4444', background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent)' }}>
                                <h3 style={{ color: '#ef4444', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AlertTriangle size={24}/> The Reality Check (Risk Analysis)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {roadmapData.blindspots.map((bs, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '0.5rem' }}>Risk: {bs.risk}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>🎯 Mitigation: {bs.mitigation}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {roadmapData.portfolio_projects && roadmapData.portfolio_projects.length > 0 && (
                            <div className="panel glass-panel" style={{ position: 'relative', marginBottom: '2rem', padding: '2rem', borderLeft: '4px solid #a855f7' }}>
                                <h3 style={{ color: '#a855f7', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Trophy size={24}/> Proof of Competence (Projects)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {roadmapData.portfolio_projects.map((proj, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                            <h4 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{proj.name}</h4>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{proj.description}</p>
                                            
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ color: '#d8b4fe', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Code size={14} /> Tech Stack
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {proj.tech_stack.map((tech, tIdx) => (
                                                        <span key={tIdx} style={{ background: 'rgba(168,85,247,0.15)', color: '#e9d5ff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ color: '#e9d5ff', fontSize: '0.9rem', fontStyle: 'italic', borderLeft: '2px solid rgba(168, 85, 247, 0.5)', paddingLeft: '0.5rem' }}>
                                                "{proj.business_value}"
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            
                            {/* Competency Matrix Chart */}
                            <div className="panel glass-panel">
                                <h3 style={{ color: '#ef4444', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <BrainCircuit size={20}/> Competency Analysis
                                </h3>
                                <SkillRadarChart data={roadmapData.competency_matrix} />
                            </div>

                            {/* Resources */}
                            <div className="panel glass-panel">
                                <h3 style={{ color: '#3b82f6', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <BookOpen size={20}/> Recommended Action Plan
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {roadmapData.recommended_resources?.map((res, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <strong style={{ color: 'white' }}>{res.title}</strong>
                                                <span style={{ fontSize: '0.8rem', background: '#1e3a8a', color: '#93c5fd', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{res.type}</span>
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{res.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Timeline */}
                        <div className="panel glass-panel">
                            <h3 style={{ color: '#22c55e', margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(34,197,94,0.2)', paddingBottom: '1rem' }}>
                                <Clock size={24}/> Execution Timeline
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {roadmapData.milestones?.map((ms, idx) => {
                                    const isComplete = ms.action_items && ms.action_items.length > 0 && ms.action_items.every((_, aIdx) => checkedItems[`${idx}-${aIdx}`]);
                                    const lineColor = isComplete ? '#22c55e' : 'rgba(255,255,255,0.1)';
                                    const dotColor = isComplete ? '#22c55e' : '#64748b';
                                    
                                    return (
                                        <div key={idx} style={{ display: 'flex', gap: '2rem' }}>
                                            <div style={{ width: '120px', flexShrink: 0, textAlign: 'right', color: isComplete ? '#22c55e' : 'white', fontWeight: 'bold', fontSize: '1.1rem', paddingTop: '0.2rem', transition: 'color 0.3s' }}>
                                                {ms.timeframe}
                                            </div>
                                            <div style={{ width: '2px', background: lineColor, position: 'relative', transition: 'background 0.3s' }}>
                                                <div style={{ position: 'absolute', top: '0.5rem', left: '-5px', width: '12px', height: '12px', borderRadius: '50%', background: dotColor, boxShadow: isComplete ? '0 0 10px #22c55e' : 'none', transition: 'all 0.3s' }}></div>
                                            </div>
                                            <div style={{ flexGrow: 1, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: `1px solid ${isComplete ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)'}`, transition: 'border 0.3s' }}>
                                            <h4 style={{ color: 'white', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>{ms.focus}</h4>
                                            
                                            <h5 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Action Items</h5>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                                {ms.action_items?.map((action, aIdx) => {
                                                    const checkId = `${idx}-${aIdx}`;
                                                    const isChecked = checkedItems[checkId];
                                                    return (
                                                        <label key={aIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', color: isChecked ? '#64748b' : 'var(--text-secondary)', textDecoration: isChecked ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={!!isChecked}
                                                                onChange={() => toggleCheck(checkId)}
                                                                style={{ marginTop: '5px', accentColor: '#22c55e', cursor: 'pointer' }}
                                                            />
                                                            <span style={{ lineHeight: '1.5' }}>{action}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {ms.success_kpis && ms.success_kpis.length > 0 && (
                                                <>
                                                    <h5 style={{ color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <CheckCircle size={14} /> Success KPIs
                                                    </h5>
                                                    <ul style={{ color: '#fef3c7', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                                        {ms.success_kpis.map((kpi, kIdx) => (
                                                            <li key={kIdx} style={{ marginBottom: '0.4rem' }}>{kpi}</li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                                })}
                            </div>
                        </div>

                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default CareerRoadmapPage;
