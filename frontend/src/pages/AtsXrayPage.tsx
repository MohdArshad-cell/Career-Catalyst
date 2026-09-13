import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import { useToast } from '../components/Toast';
import { Scan, FileText, AlertTriangle, CheckCircle, Upload, PenTool } from 'lucide-react';
import './ToolPages.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

interface SuggestionDetail {
    weak_point: string;
    critique: string;
    rewrite_suggestion: string;
}

interface AtsXrayData {
    overall_score: number;
    key_strengths: string[];
    red_flags: string[];
    suggestions: SuggestionDetail[];
}

const AtsXrayPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [resumeText, setResumeText] = useState('');
    const [xrayData, setXrayData] = useState<AtsXrayData | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [copyState, setCopyState] = useState<{ [key: number]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- DRAG & DROP LOGIC ---
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type === "application/json" || file.type === "text/plain")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) setResumeText(event.target.result as string);
            };
            reader.readAsText(file);
        } else if (file && file.type === "application/pdf") {
            showToast('For PDF files, please use the "Upload PDF" button.', 'info');
        } else {
            showToast('Please drop a valid .txt or .json file, or use the Upload PDF button.', 'warning');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        setIsUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/upload-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.extracted_text) {
                setResumeText(response.data.extracted_text);
                showToast('Resume extracted successfully!', 'success');
            }
        } catch (err: any) {
            console.error('PDF upload failed:', err);
            setError(err.response?.data?.detail || 'Failed to extract text from PDF.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleCopyRewrite = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopyState(prev => ({ ...prev, [idx]: '✅ Copied!' }));
        setTimeout(() => {
            setCopyState(prev => ({ ...prev, [idx]: '📋 Copy' }));
        }, 2000);
    };

    // --- MAIN API CALL ---
    const handleGenerate = async () => {
        if (!resumeText.trim()) {
            setError('Please provide your resume text or upload a PDF.');
            return;
        }

        setIsLoading(true);
        setError('');
        setXrayData(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user || !session) {
                showToast('You must be logged in to use this AI tool.', 'warning');
                setIsLoading(false);
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            const payload = { resume_text: resumeText };

            const response = await axios.post(`${API_BASE_URL}/api/ai/ats-xray`, payload, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data?.xray_data) {
                setXrayData(response.data.xray_data);
                showToast('Resume X-Ray complete!', 'success');
            } else {
                throw new Error("Invalid response format received from server.");
            }
        } catch (err: any) {
            console.error("Error running ATS X-Ray:", err);

            if (err.response?.status === 402 || err.response?.status === 401 || err.response?.status === 403) {
                showToast('🚫 Tokens Empty or Session Expired! Redirecting to Premium upgrade...', 'error');
                setIsLoading(false);
                setTimeout(() => navigate('/pricing'), 3000);
                return;
            }

            let finalErrorMessage = "Failed to run X-Ray. Please try again.";
            try {
                const detail = err.response?.data?.detail;
                if (detail) {
                    finalErrorMessage = typeof detail === "string" ? detail : JSON.stringify(detail);
                } else if (err.message) {
                    finalErrorMessage = err.message;
                }
            } catch (fallbackError) {
                finalErrorMessage = "An unknown server error occurred.";
            }

            setError(finalErrorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 50) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="page-container">
            <ParticleBackground />
            <div className="background-aurora"></div>
            <Navbar />

            <div className="tool-page-container">
                <div className="tool-header">
                    <div className="badge-neutral">
                        <Scan size={16} /> Elite AI Analyzer
                    </div>
                    <h1 className="tool-header-title">Autonomous ATS X-Ray</h1>
                    <p className="tool-header-subtitle">Paste your resume and let our AI instantly hunt down formatting red flags, weak bullets, and generic fluff.</p>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="panel glass-panel relative-panel">
                        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="panel-title">
                                <FileText size={22} color="#67e8f9" /> Your Resume (Text or PDF)
                            </h2>
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
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}
                            >
                                <Upload size={14} />
                                {isUploading ? 'Extracting...' : 'Upload PDF'}
                            </button>
                        </div>
                        <textarea
                            className={`premium-textarea drop-zone ${isDragging ? 'drag-active' : ''}`}
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            placeholder='Paste your resume text here, or click "Upload PDF" above...'
                            style={{ minHeight: '300px', width: '100%', resize: 'vertical' }}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="action-row text-center" style={{ margin: '3rem 0' }}>
                        <button 
                            className="btn-premium pulse-glow massive-btn" 
                            onClick={handleGenerate} 
                            disabled={isLoading || !resumeText.trim()}
                        >
                            {isLoading ? 'Scanning Deep Resume Structure...' : 'Activate AI X-Ray ⚡'}
                        </button>
                        {error && <div className="error-status" style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#ff4d4f' }}>{error}</div>}
                    </div>

                    {xrayData && (
                        <div className="output-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <div className="dashboard-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
                                
                                {/* SCORE CARD */}
                                <div className="metrics-panel glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Resume Health Score</h3>
                                    <div className="score-circle" style={{ 
                                        width: '150px', height: '150px', margin: '1.5rem 0', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                                        border: `6px solid ${getScoreColor(xrayData.overall_score)}`,
                                        boxShadow: `0 0 30px ${getScoreColor(xrayData.overall_score)}40`
                                    }}>
                                        <span style={{ fontSize: '3rem', fontWeight: '800', color: '#fff' }}>{xrayData.overall_score}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>Based on brevity, impact metrics, and action verbs.</p>
                                </div>

                                {/* STRENGTHS & RED FLAGS */}
                                <div className="panel glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ color: '#10b981', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                                            <CheckCircle size={20} /> Key Strengths
                                        </h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {xrayData.key_strengths.map((str, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                                    <span style={{ color: '#10b981', marginTop: '2px' }}>✦</span> {str}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: '#ef4444', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                                            <AlertTriangle size={20} /> Critical Red Flags
                                        </h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {xrayData.red_flags.map((flag, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                                    <span style={{ color: '#ef4444', marginTop: '2px' }}>🚨</span> {flag}
                                                </li>
                                            ))}
                                            {xrayData.red_flags.length === 0 && (
                                                <li style={{ color: '#10b981' }}>No critical red flags detected! Excellent work.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* REWRITE SUGGESTIONS */}
                            <div className="panel glass-panel">
                                <div className="panel-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                    <h2 className="panel-title">
                                        <PenTool size={22} color="#c084fc" /> Tactical Bullet Point Rewrites
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                        Our AI detected these weak or generic bullet points in your resume. Here is how to make them Fortune 500 ready.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {xrayData.suggestions.map((sug, idx) => (
                                        <div key={idx} className="roast-card" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h4 style={{ color: '#fca5a5', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Original Weak Bullet</h4>
                                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>"{sug.weak_point}"</p>
                                            </div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ color: '#fb923c', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>AI Critique</h4>
                                                <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem' }}>{sug.critique}</p>
                                            </div>
                                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.2rem', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <h4 style={{ color: '#10b981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Elite Rewrite</h4>
                                                    <button 
                                                        className="btn-outline" 
                                                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                                                        onClick={() => handleCopyRewrite(sug.rewrite_suggestion, idx)}
                                                    >
                                                        {copyState[idx] || '📋 Copy'}
                                                    </button>
                                                </div>
                                                <p style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: '500' }}>{sug.rewrite_suggestion}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {xrayData.suggestions.length === 0 && (
                                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                                            Your bullet points are already highly optimized and metric-driven. Great job!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default AtsXrayPage;
