import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Copy, CheckCircle, Upload, ChevronDown, Sparkles, FileText, Target, Briefcase, User, Lightbulb, Compass, Users, Image, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';



import { useToast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import './ToolPages.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface ExperienceBullet {
  company: string;
  bullets: string[];
}

interface TrajectoryAnalysis {
  current_perception: string;
  optimized_positioning: string;
}

interface LinkedInData {
  trajectory_analysis: TrajectoryAnalysis;
  headline: string;
  about_section: string;
  experience_bullets: ExperienceBullet[];
  content_ideas: string[];
  networking_targets: string[];
  banner_prompt: string;
}

const LinkedInOptimizerPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [linkedinContent, setLinkedinContent] = useState('');
    const [tone, setTone] = useState('Professional');
    const [optimizedData, setOptimizedData] = useState<LinkedInData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [id]: false }));
        }, 2000);
        showToast('Copied to clipboard!', 'success');
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            showToast('Please upload a PDF file.', 'error');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/upload-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.extracted_text) {
                setLinkedinContent(response.data.extracted_text);
                showToast('PDF extracted successfully!', 'success');
            }
        } catch (error: any) {
            console.error('PDF upload failed:', error);
            showToast(error.response?.data?.detail || 'Failed to extract text from PDF.', 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleGenerate = async () => {
        if (!linkedinContent.trim()) {
            showToast('Please provide your current LinkedIn profile content.', 'error');
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
                linkedin_content: linkedinContent,
                tone: tone
            };
            
            const response = await axios.post(`${API_BASE_URL}/api/ai/linkedin`, payload, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`, 
                    'Content-Type': 'application/json'
                }
            });
            
            const data = response.data?.linkedin_data;

            if (!data) {
                throw new Error("Invalid response format received from server.");
            }

            setOptimizedData(data);
            showToast('LinkedIn profile optimized successfully!', 'success');

        } catch (err: any) {
            console.error("Error generating LinkedIn profile:", err);
            
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

            let finalErrorMessage = "Failed to optimize profile. Ensure backend is running.";
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
                    <div className="badge-neutral">
                        <Linkedin size={16} /> Social Optimization
                    </div>
                    <h1 className="tool-header-title">LinkedIn Optimizer</h1>
                    <p className="tool-header-subtitle">Transform your profile into a magnet for recruiters.</p>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="panel glass-panel">
                        <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
                            <h2 className="panel-title">
                                <User size={22} color="#67e8f9" /> Profile & Strategy Settings
                            </h2>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative' }}>
                                    <select 
                                        value={tone} 
                                        onChange={(e) => setTone(e.target.value)}
                                        className="premium-input"
                                        style={{ appearance: 'none', paddingRight: '2.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '0.6rem 1.2rem', fontSize: '0.9rem', cursor: 'pointer' }}
                                        disabled={isLoading}
                                    >
                                        <option value="Professional">Professional Tone</option>
                                        <option value="Conversational">Conversational Tone</option>
                                        <option value="Executive & Bold">Executive & Bold</option>
                                        <option value="Story-Driven">Story-Driven</option>
                                    </select>
                                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--accent-cyan)' }} />
                                </div>
                                <input 
                                    type="file" 
                                    accept="application/pdf" 
                                    style={{ display: 'none' }} 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                <button 
                                    className="btn-outline" 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isLoading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', transition: 'all 0.3s ease' }}
                                >
                                    <Upload size={16} />
                                    {isUploading ? 'Extracting...' : 'Upload PDF'}
                                </button>
                            </div>
                        </div>
                        
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                            Upload your LinkedIn export or paste your content manually. The AI will automatically infer your optimal career trajectory.
                        </p>
                        
                        <textarea
                            className="premium-textarea"
                            value={linkedinContent}
                            onChange={(e) => setLinkedinContent(e.target.value)}
                            placeholder="Paste your content here..."
                            disabled={isLoading}
                            style={{ minHeight: '350px', width: '100%', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div className="action-row text-center" style={{ margin: '3rem 0' }}>
                    <button 
                        className="btn-premium pulse-glow massive-btn" 
                        onClick={handleGenerate}
                        disabled={isLoading || !linkedinContent.trim()}
                        style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '50px', background: 'linear-gradient(45deg, #0077b5, #00a0dc)' }}
                    >
                        {isLoading ? 'Analyzing Profile...' : 'Optimize Profile ⚡'}
                    </button>
                </div>

                {optimizedData && (
                    <div className="output-section" style={{ maxWidth: '1000px', margin: '4rem auto 0', animation: 'fadeInUp 0.6s ease-out' }}>
                        <div className="text-center" style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <Sparkles color="#00a0dc" size={32} />
                                Your Elite Profile is Ready
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                A complete repositioning of your personal brand.
                            </p>
                        </div>

                        {/* STRATEGY DASHBOARD */}
                        <div className="panel glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', borderRadius: '16px', border: '1px solid rgba(103, 232, 249, 0.2)', background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)' }}>
                            <h3 style={{ color: '#67e8f9', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
                                <Compass size={24} /> Career Trajectory Analysis
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ color: '#fca5a5', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: 'bold' }}>Current Perception</div>
                                    <div style={{ color: '#e2e8f0', lineHeight: '1.6' }}>{optimizedData.trajectory_analysis.current_perception}</div>
                                </div>
                                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ color: '#6ee7b7', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: 'bold' }}>Optimized Positioning</div>
                                    <div style={{ color: '#e2e8f0', lineHeight: '1.6' }}>{optimizedData.trajectory_analysis.optimized_positioning}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                            {/* Networking Strategy */}
                            <div className="panel glass-card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #f59e0b', background: 'rgba(20,20,30,0.8)' }}>
                                <h4 style={{ color: 'white', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <Users size={18} color="#f59e0b"/> Target Connections
                                </h4>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#fcd34d', lineHeight: '1.6' }}>
                                    {optimizedData.networking_targets.map((target, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{target}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Creator Mode Ideas */}
                            <div className="panel glass-card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #8b5cf6', background: 'rgba(20,20,30,0.8)' }}>
                                <h4 style={{ color: 'white', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                    <MessageCircle size={18} color="#8b5cf6"/> Post Ideas (Creator Mode)
                                </h4>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#c4b5fd', lineHeight: '1.6' }}>
                                    {optimizedData.content_ideas.map((idea, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{idea}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Banner Prompt */}
                            <div className="panel glass-card" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #ec4899', background: 'rgba(20,20,30,0.8)' }}>
                                <h4 style={{ color: 'white', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', justifyContent: 'space-between' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Image size={18} color="#ec4899"/> Banner Prompt</span>
                                    <button className="btn-outline" onClick={() => handleCopy(optimizedData.banner_prompt, 'banner')} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                        {copiedStates['banner'] ? 'Copied' : 'Copy'}
                                    </button>
                                </h4>
                                <p style={{ margin: 0, color: '#fbcfe8', lineHeight: '1.5', fontSize: '0.9rem' }}>
                                    Use in DALL-E or Midjourney: <br/><br/> "{optimizedData.banner_prompt}"
                                </p>
                            </div>
                        </div>

                        {/* HEADLINE CARD */}
                        <div className="panel glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', borderLeft: '4px solid #0077b5', background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
                                    <Lightbulb size={24} color="#0077b5" /> Headline
                                </h3>
                                <button className="btn-outline" onClick={() => handleCopy(optimizedData.headline, 'headline')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: copiedStates['headline'] ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: copiedStates['headline'] ? '#10b981' : 'white', borderColor: copiedStates['headline'] ? '#10b981' : 'rgba(255,255,255,0.2)' }}>
                                    {copiedStates['headline'] ? <CheckCircle size={16}/> : <Copy size={16}/>} {copiedStates['headline'] ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.3px', lineHeight: '1.6' }}>
                                {optimizedData.headline}
                            </div>
                        </div>

                        {/* ABOUT SECTION CARD */}
                        <div className="panel glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', borderLeft: '4px solid #00a0dc', background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
                                    <FileText size={24} color="#00a0dc" /> About Section
                                </h3>
                                <button className="btn-outline" onClick={() => handleCopy(optimizedData.about_section, 'about')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: copiedStates['about'] ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: copiedStates['about'] ? '#10b981' : 'white', borderColor: copiedStates['about'] ? '#10b981' : 'rgba(255,255,255,0.2)' }}>
                                    {copiedStates['about'] ? <CheckCircle size={16}/> : <Copy size={16}/>} {copiedStates['about'] ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="markdown-content" style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                <ReactMarkdown>{optimizedData.about_section}</ReactMarkdown>
                            </div>
                        </div>

                        {/* EXPERIENCE SECTION CARD */}
                        <div className="panel glass-card" style={{ padding: '2rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-cyan)', background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)' }}>
                            <h3 style={{ color: 'white', margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
                                <Briefcase size={24} color="var(--accent-cyan)" /> Experience Section
                            </h3>
                            
                            <div className="panel glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {optimizedData.experience_bullets.map((exp, idx) => (
                                    <div key={idx} style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'rgba(255,255,255,0.2)' }}></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingLeft: '1rem' }}>
                                            <h4 style={{ color: 'white', margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{exp.company}</h4>
                                            <button className="btn-outline" onClick={() => handleCopy(exp.bullets.join('\n'), `exp-${idx}`)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: copiedStates[`exp-${idx}`] ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: copiedStates[`exp-${idx}`] ? '#10b981' : 'var(--text-secondary)', borderColor: copiedStates[`exp-${idx}`] ? '#10b981' : 'rgba(255,255,255,0.2)' }}>
                                                {copiedStates[`exp-${idx}`] ? <CheckCircle size={14}/> : <Copy size={14}/>} {copiedStates[`exp-${idx}`] ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                        <ul style={{ color: '#cbd5e1', paddingLeft: '2.5rem', margin: 0, lineHeight: '1.7', fontSize: '1rem' }}>
                                            {exp.bullets.map((bullet, bIdx) => (
                                                <li key={bIdx} style={{ marginBottom: '0.75rem' }}>{bullet}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            
        </div>
    );
};

export default LinkedInOptimizerPage;
