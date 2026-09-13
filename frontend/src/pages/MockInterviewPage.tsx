import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mic, ChevronDown, ChevronUp, Target, FileText, Settings, Activity, Brain } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import { supabase } from '../supabaseClient';
import './ToolPages.css';  // Utilizing the premium Tailor CSS

interface InterviewAnalysis {
  core_objective: string;
  top_hard_skills: string[];
  top_soft_skills: string[];
}

interface InterviewQuestion {
  category: string;
  question: string;
  answer: string;
  follow_up: string;
}

interface InterviewData {
  analysis: InterviewAnalysis;
  questions: InterviewQuestion[];
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const MockInterviewPage: React.FC = () => {
    const navigate = useNavigate();

    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [interviewRound, setInterviewRound] = useState('Technical Deep Dive');
    
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [visibleAnswers, setVisibleAnswers] = useState<{ [key: number]: boolean }>({});

    const toggleAnswer = (index: number) => {
        setVisibleAnswers(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleGenerate = async () => {
        if (!jobDescription.trim()) {
            setError('Please provide a job description first.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setInterviewData(null);
        setVisibleAnswers({}); 

        try {
            // 🛑 TOLL PLAZA CHECK: Verify Supabase Session
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user || !session) {
                setError("You must be logged in to use this AI tool.");
                setIsLoading(false);
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            // ✅ API CALL WITH HEADERS (SECURITY GATEKEEPER)
            // Hitting the correct secured endpoint: /api/ai/interview
            const payload = { 
                job_description: jobDescription,
                resume_text: resumeText,
                interview_round: interviewRound
            };
            const response = await axios.post(`${API_BASE_URL}/api/ai/interview`, payload, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`, 
                    'Content-Type': 'application/json'
                }
            });
            
            // Extract the generated data from the backend's dictionary wrapper
            const interviewResponse = response.data?.interview_data;

            if (!interviewResponse || !interviewResponse.analysis || !Array.isArray(interviewResponse.questions)) {
                throw new Error("Invalid response format received from server.");
            }

            setInterviewData(interviewResponse);

        } catch (err: any) {
            console.error("Error generating interview:", err);
            
            // ✅ HANDLE EMPTY TOKENS OR EXPIRED SESSIONS (401/402/403)
            if (err.response?.status === 402 || err.response?.status === 401 || err.response?.status === 403) {
                setError("🚫 Tokens Empty or Session Expired! Redirecting to Premium upgrade...");
                setIsLoading(false);
                setTimeout(() => navigate('/pricing'), 3000);
                return;
            }

            let finalErrorMessage = "Failed to generate interview questions. Ensure backend is running.";
            
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

            setError(String(finalErrorMessage));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <ParticleBackground />
            <div className="background-aurora"></div>
            <Navbar />

            <div className="tool-page-container">
                
                <div className="tool-header">
                    <div className="badge-neutral">
                        <Mic size={16} /> Interview Prep
                    </div>
                    <h1 className="tool-header-title">AI Mock Interview</h1>
                    <p className="tool-header-subtitle">Paste a Job Description. Our AI HR Manager will grill you with targeted questions.</p>
                </div>

                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Settings Row */}
                    <div className="panel glass-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">
                                <Settings size={22} color="#67e8f9" /> Interview Settings
                            </h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Interview Round Type</label>
                                <div style={{ position: 'relative' }}>
                                    <select 
                                        value={interviewRound} 
                                        onChange={(e) => setInterviewRound(e.target.value)}
                                        className="premium-input"
                                        style={{ appearance: 'none', paddingRight: '2.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '0.8rem 1.2rem', fontSize: '1rem', cursor: 'pointer', width: '100%' }}
                                        disabled={isLoading}
                                    >
                                        <option value="HR Phone Screen">HR Phone Screen</option>
                                        <option value="Technical Deep Dive">Technical Deep Dive</option>
                                        <option value="Behavioral / Culture Fit (STAR Method)">Behavioral / Culture Fit (STAR Method)</option>
                                        <option value="Executive / Leadership">Executive / Leadership</option>
                                    </select>
                                    <ChevronDown size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--accent-cyan)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Resume Input */}
                        <div className="panel glass-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">
                                    <FileText size={22} color="#67e8f9" /> Your Resume (Optional)
                                </h2>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                                For personalized questions mapping your experience to the JD.
                            </p>
                            <textarea
                                className="premium-textarea"
                                placeholder="Paste your resume content here..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                disabled={isLoading}
                                style={{ minHeight: '300px', width: '100%', resize: 'vertical' }} 
                            />
                        </div>

                        {/* JD Input */}
                        <div className="panel glass-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">
                                    <Target size={22} color="#67e8f9" /> Target Job Description
                                </h2>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                                The specific role you are applying for.
                            </p>
                            <textarea
                                className="premium-textarea"
                                placeholder="Paste the full job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                disabled={isLoading}
                                style={{ minHeight: '300px', width: '100%', resize: 'vertical' }} 
                            />
                        </div>
                    </div>
                </div>

                <div className="action-row text-center" style={{ margin: '3rem 0' }}>
                    <button 
                        className="btn-premium pulse-glow massive-btn" 
                        onClick={handleGenerate}
                        disabled={isLoading || !jobDescription.trim()}
                        style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '50px' }}
                    >
                        {isLoading ? 'Analyzing Requirements...' : 'Start Interview 🚀'}
                    </button>
                    {error && <div className="error-status" style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#ff4d4f' }}>{error}</div>}
                </div>

                {/* Output Section */}
                {(isLoading || interviewData) && (
                    <div className="output-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {isLoading ? (
                            <div className="loading-state glass-panel text-center" style={{ padding: '4rem' }}>
                                <div className="spinner-premium"></div>
                                <h3 className="step-text" style={{ color: 'var(--accent-cyan)', margin: '1.5rem 0' }}>
                                    🧠 HR AI is reviewing the JD and drafting questions...
                                </h3>
                            </div>
                        ) : interviewData ? (
                            <>
                                {/* PRE-INTERVIEW ANALYSIS DASHBOARD */}
                                <div className="panel glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.2)', background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)' }}>
                                    <h3 style={{ color: '#c084fc', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
                                        <Brain size={24} /> Pre-Interview Analysis
                                    </h3>
                                    
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: '4px solid #38bdf8' }}>
                                        <div style={{ color: '#7dd3fc', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: 'bold' }}>Core Objective</div>
                                        <div style={{ color: '#e2e8f0', lineHeight: '1.6', fontSize: '1.1rem' }}>{interviewData.analysis.core_objective}</div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                                            <div style={{ color: '#6ee7b7', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 'bold' }}>Top Hard Skills Focus</div>
                                            <ul style={{ color: '#e2e8f0', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                                {interviewData.analysis.top_hard_skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
                                            </ul>
                                        </div>
                                        <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                                            <div style={{ color: '#fcd34d', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 'bold' }}>Top Soft Skills Focus</div>
                                            <ul style={{ color: '#e2e8f0', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                                {interviewData.analysis.top_soft_skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="panel output-panel glass-panel">
                                    <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                                        <Mic size={28} style={{ color: 'var(--accent-cyan)' }} />
                                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Interview Session Active</h3>
                                    </div>
                                    
                                    <div className="questions-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {interviewData.questions.map((item, index) => (
                                            <div key={index} className="question-item glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <h4 style={{ color: 'var(--accent-cyan)', margin: 0, fontSize: '1.2rem' }}>Question {index + 1}</h4>
                                                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', color: '#cbd5e1' }}>{item.category}</span>
                                                </div>
                                                
                                                <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.6', fontWeight: 500 }}>
                                                    {item.question}
                                                </p>

                                                {/* Follow Up */}
                                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', padding: '1rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
                                                    <strong style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.9rem' }}><Activity size={16}/> Curveball Follow-up:</strong>
                                                    <span style={{ color: '#f87171' }}>{item.follow_up}</span>
                                                </div>
                                                
                                                <button 
                                                    className="btn-outline" 
                                                    onClick={() => toggleAnswer(index)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.75rem 1.5rem', fontSize: '0.95rem', background: visibleAnswers[index] ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                                                >
                                                    {visibleAnswers[index] ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                                    {visibleAnswers[index] ? 'Hide Framework' : 'Show Ideal Response Framework'}
                                                </button>

                                                {visibleAnswers[index] && (
                                                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px' }}>
                                                        <strong style={{ color: '#7dd3fc', display: 'block', marginBottom: '0.75rem', fontSize: '1.1rem' }}>💡 How to Answer:</strong>
                                                        <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1rem' }}>
                                                            {item.answer}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
            
            <div style={{ width: '100%', marginTop: 'auto' }}>
                <Footer />
            </div>
        </div>
    );
};

export default MockInterviewPage;
