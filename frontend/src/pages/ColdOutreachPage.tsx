import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Copy, CheckCircle, FileText, Target, MessageSquare, Settings2, Sparkles, Send, Calendar, Coffee, Twitter, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import PdfUploadButton from '../components/PdfUploadButton';
import { useToast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import './ToolPages.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface SubjectLine {
  style: string;
  text: string;
}

interface OutreachData {
  deliverability_score: number;
  spam_analysis: string;
  value_props: string[];
  subject_lines: SubjectLine[];
  cold_email: string;
  linkedin_connection_note: string;
  follow_up_email: string;
  coffee_chat_script: string;
  twitter_dm: string;
}

const ColdOutreachPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [tone, setTone] = useState('Professional');
    const [outreachData, setOutreachData] = useState<OutreachData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [id]: false }));
        }, 2000);
        showToast('Copied to clipboard!', 'success');
    };

    const handleGenerate = async () => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            showToast('Please provide both your resume and the target company/JD.', 'error');
            return;
        }
        
        setIsLoading(true);
        setOutreachData(null);

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
                job_description: jobDescription,
                tone: tone
            };
            
            const response = await axios.post(`${API_BASE_URL}/api/ai/outreach`, payload, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`, 
                    'Content-Type': 'application/json'
                }
            });
            
            const data = response.data?.outreach_data;

            if (!data) {
                throw new Error("Invalid response format received from server.");
            }

            setOutreachData(data);
            showToast('Outreach templates generated successfully!', 'success');

        } catch (err: any) {
            console.error("Error generating outreach:", err);
            
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

            let finalErrorMessage = "Failed to generate outreach. Ensure backend is running.";
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
            <ParticleBackground />
            <div className="background-aurora"></div>
            <Navbar />

            <div className="tool-page-container">
                
                <div className="tool-header">
                    <div className="badge-neutral">
                        <Sparkles size={16} /> Networking
                    </div>
                    <h1 className="tool-header-title">Cold Outreach AI</h1>
                    <p className="tool-header-subtitle">Generate highly-converting LinkedIn notes and cold emails to get referrals.</p>
                </div>

                <div className="tool-input-grid">
                    <div className="panel glass-panel">

                        <div className="panel-header">
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
                            style={{ minHeight: '400px' }}
                        />
                    </div>
                    <div className="panel glass-panel">

                        <div className="panel-header">
                            <h2 className="panel-title">
                                <Target size={22} color="#67e8f9" /> Target Role
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Settings2 size={16} color="var(--text-secondary)" />
                                <select 
                                    className="premium-select"
                                    value={tone} 
                                    onChange={(e) => setTone(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="Professional">Professional</option>
                                    <option value="Enthusiastic & Bold">Enthusiastic & Bold</option>
                                    <option value="Story-Driven">Story-Driven</option>
                                    <option value="Direct & Concise">Direct & Concise</option>
                                </select>
                            </div>
                        </div>
                        <textarea
                            className="premium-textarea"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the target JD or just the company name and role you are applying to..."
                            disabled={isLoading}
                            style={{ minHeight: '400px' }}
                        />
                    </div>
                </div>

                <div className="action-row">
                    <button 
                        className="btn-premium pulse-glow massive-btn-orange" 
                        onClick={handleGenerate}
                        disabled={isLoading || !resumeText.trim() || !jobDescription.trim()}
                    >
                        {isLoading ? 'Crafting Outreach...' : 'Generate Messages 🚀'}
                    </button>
                </div>

                {outreachData && (
                    <div className="output-section" style={{ marginTop: '3rem', animation: 'fadeInUp 0.6s ease-out', maxWidth: '100%', margin: '0 auto' }}>
                        <div className="panel output-panel glass-panel" style={{ padding: '3rem' }}>
                            <h3 style={{ margin: '0 0 2.5rem 0', color: '#ea580c', borderBottom: '1px solid rgba(234, 88, 12, 0.2)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.6rem' }}>
                                <Sparkles size={26} /> Networking Templates
                            </h3>

                            {/* Score & Hooks Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                {/* Deliverability Score */}
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <h4 style={{ color: '#10b981', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShieldCheck size={18} /> Deliverability Score
                                    </h4>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '1rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
                                        {outreachData.deliverability_score}
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                                        {outreachData.spam_analysis}
                                    </p>
                                </div>

                                {/* Value Props / Hooks */}
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                                    <h4 style={{ color: '#eab308', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Target size={18} /> "The Hook" (Value Props)
                                    </h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Use these highly-targeted bullet points in interviews or custom messages:</p>
                                    <ul style={{ color: '#fef08a', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.6' }}>
                                        {outreachData.value_props.map((prop, idx) => (
                                            <li key={idx} style={{ marginBottom: '0.5rem' }}>{prop}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* LinkedIn Note Panel */}
                            <div style={{ marginBottom: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', borderLeft: '4px solid #0a66c2', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                        <MessageSquare size={18} color="#0a66c2"/> LinkedIn Connection Note
                                    </h4>
                                    <button className="btn-outline" onClick={() => handleCopy(outreachData.linkedin_connection_note, 'linkedin')} style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}>
                                        {copiedStates['linkedin'] ? <CheckCircle size={14} color="#10b981"/> : <Copy size={14}/>} {copiedStates['linkedin'] ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div style={{ padding: '1.5rem', color: '#e2e8f0', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                    {outreachData.linkedin_connection_note}
                                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'gray', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: outreachData.linkedin_connection_note.length <= 300 ? '#10b981' : '#ef4444' }}></div>
                                        {outreachData.linkedin_connection_note.length} / 300 characters
                                    </div>
                                </div>
                            </div>

                            {/* Cold Email Panel */}
                            <div style={{ marginBottom: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', borderLeft: '4px solid #f97316', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                        <Send size={18} color="#f97316"/> Cold Email
                                    </h4>
                                    <button className="btn-outline" onClick={() => handleCopy(`Subject: ${outreachData.subject_lines[selectedSubjectIndex].text}\n\n${outreachData.cold_email}`, 'cold_email')} style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}>
                                        {copiedStates['cold_email'] ? <CheckCircle size={14} color="#10b981"/> : <Copy size={14}/>} {copiedStates['cold_email'] ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                
                                <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Select Subject Line (A/B Test)</div>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                        {outreachData.subject_lines.map((subj, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setSelectedSubjectIndex(idx)}
                                                style={{ 
                                                    padding: '0.6rem 1rem', 
                                                    borderRadius: '8px', 
                                                    border: `1px solid ${selectedSubjectIndex === idx ? '#f97316' : 'rgba(255,255,255,0.1)'}`, 
                                                    background: selectedSubjectIndex === idx ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                                                    color: selectedSubjectIndex === idx ? 'white' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.75rem', color: selectedSubjectIndex === idx ? '#fdba74' : 'gray', marginBottom: '4px' }}>{subj.style}</div>
                                                <div style={{ fontSize: '0.95rem' }}>{subj.text}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                                    <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.05rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                                        {outreachData.cold_email}
                                    </div>
                                </div>
                            </div>

                            {/* Grid for Coffee Chat & Twitter */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                {/* Coffee Chat */}
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', borderLeft: '4px solid #14b8a6', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                            <Coffee size={18} color="#14b8a6"/> Coffee Chat Invite
                                        </h4>
                                        <button className="btn-outline" onClick={() => handleCopy(outreachData.coffee_chat_script, 'coffee')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px' }}>
                                            {copiedStates['coffee'] ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div style={{ padding: '1.5rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                        {outreachData.coffee_chat_script}
                                    </div>
                                </div>

                                {/* Twitter DM */}
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', borderLeft: '4px solid #38bdf8', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                            <Twitter size={18} color="#38bdf8"/> Twitter / X DM
                                        </h4>
                                        <button className="btn-outline" onClick={() => handleCopy(outreachData.twitter_dm, 'twitter')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px' }}>
                                            {copiedStates['twitter'] ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div style={{ padding: '1.5rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                        {outreachData.twitter_dm}
                                    </div>
                                </div>
                            </div>

                            {/* Follow Up Panel */}
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', borderLeft: '4px solid #8b5cf6', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                        <Calendar size={18} color="#8b5cf6"/> Follow-Up Email (Wait 1 week)
                                    </h4>
                                    <button className="btn-outline" onClick={() => handleCopy(outreachData.follow_up_email, 'follow_up')} style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}>
                                        {copiedStates['follow_up'] ? <CheckCircle size={14} color="#10b981"/> : <Copy size={14}/>} {copiedStates['follow_up'] ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.05rem' }}>
                                        {outreachData.follow_up_email}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default ColdOutreachPage;
