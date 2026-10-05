import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { FaUpload, FaSave, FaCheck, FaTrash, FaEdit, FaPlus, FaFileAlt } from 'react-icons/fa';
import './ToolPages.css';
import { useToast } from '../components/Toast';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface SavedResume {
    id: string;
    resume_name: string;
    resume_text: string;
    created_at?: string;
}

const ResumeVaultPage: React.FC = () => {
    const { showToast } = useToast();
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [currentName, setCurrentName] = useState('');
    const [currentText, setCurrentText] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await axios.get(`${API_BASE_URL}/api/profile/resume`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setResumes(res.data.resumes || []);
        } catch (error) {
            console.error("Error fetching resumes:", error);
            showToast("Failed to fetch your saved resumes.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveResume = async () => {
        if (!currentName.trim() || !currentText.trim()) {
            showToast("Please provide both a name and resume text.", "warning");
            return;
        }

        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showToast("You must be logged in to save.", "error");
                return;
            }

            const payload = { 
                resume_name: currentName, 
                resume_text: currentText 
            } as any;
            if (currentId) payload.id = currentId;

            await axios.post(`${API_BASE_URL}/api/profile/resume`, payload, 
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            
            showToast("Resume saved successfully!", "success");
            setIsEditing(false);
            resetEditor();
            fetchResumes();
        } catch (error) {
            console.error("Error saving resume:", error);
            showToast("Failed to save resume.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteResume = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this resume?")) return;
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await axios.delete(`${API_BASE_URL}/api/profile/resume/${id}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            
            showToast("Resume deleted.", "success");
            fetchResumes();
        } catch (error) {
            console.error("Error deleting resume:", error);
            showToast("Failed to delete resume.", "error");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        showToast("Extracting text from PDF...", "info");
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/upload-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setCurrentText(res.data.extracted_text);
            if (!currentName) {
                setCurrentName(file.name.replace('.pdf', ''));
            }
            showToast("PDF extracted successfully! Review and save.", "success");
        } catch (err) {
            console.error("PDF upload error:", err);
            showToast("Failed to read PDF file.", "error");
        } finally {
            setIsSaving(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const startNewResume = () => {
        resetEditor();
        setIsEditing(true);
    };

    const editResume = (resume: SavedResume) => {
        setCurrentId(resume.id);
        setCurrentName(resume.resume_name);
        setCurrentText(resume.resume_text);
        setIsEditing(true);
    };

    const resetEditor = () => {
        setCurrentId(null);
        setCurrentName('');
        setCurrentText('');
    };

    return (
        <div className="page-container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
            <div className="container content-wrapper">
                
                <div className="tool-header text-center" style={{ marginBottom: '3rem' }}>
                    <div className="badge-neutral" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
                        <FaFileAlt style={{ marginRight: '8px' }} /> Resume Vault
                    </div>
                    <h1 className="hero-title animated-gradient-text" style={{ fontSize: '3rem' }}>Manage Your Resumes</h1>
                    <p className="hero-subtitle">Save multiple versions of your resume tailored for different roles. Use them instantly across all AI tools.</p>
                </div>

                {!isEditing ? (
                    <div className="resume-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Add New Button Card */}
                        <div 
                            className="glass-card-premium hover-glow" 
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', cursor: 'pointer', minHeight: '250px', border: '2px dashed rgba(255,255,255,0.2)' }}
                            onClick={startNewResume}
                        >
                            <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a855f7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>
                                <FaPlus />
                            </div>
                            <h3 style={{ margin: 0 }}>Add New Resume</h3>
                        </div>

                        {/* List Resumes */}
                        {isLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading your vault...</div>
                        ) : (
                            resumes.map(resume => (
                                <div key={resume.id} className="glass-card-premium" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', minHeight: '250px', position: 'relative' }}>
                                    <div className="bento-glow"></div>
                                    <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                            <FaFileAlt color="#67e8f9" size={24} />
                                            <h3 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resume.resume_name}</h3>
                                        </div>
                                        
                                        <div style={{ flexGrow: 1, color: '#94a3b8', fontSize: '0.9rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', marginBottom: '1.5rem' }}>
                                            {resume.resume_text}
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                            <button className="glass-button" style={{ flexGrow: 1, padding: '0.5rem', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => editResume(resume)}>
                                                <FaEdit /> Edit
                                            </button>
                                            <button className="glass-button" style={{ padding: '0.5rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleDeleteResume(resume.id)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="glass-card-premium" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                            <FaSave color="#10b981" /> {currentId ? 'Edit Resume' : 'Add New Resume'}
                        </h2>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Resume Profile Name</label>
                            <input 
                                type="text" 
                                className="premium-select"
                                style={{ width: '100%', padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white' }}
                                placeholder="e.g., Senior Frontend Engineer"
                                value={currentName}
                                onChange={(e) => setCurrentName(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ color: '#94a3b8' }}>Resume Content (Text or LaTeX)</label>
                                
                                <div>
                                    <input 
                                        type="file" 
                                        accept=".pdf" 
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                    <button 
                                        className="btn-outline"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSaving}
                                    >
                                        <FaUpload /> {isSaving ? 'Extracting...' : 'Upload PDF'}
                                    </button>
                                </div>
                            </div>
                            <textarea
                                className="premium-textarea"
                                style={{ minHeight: '300px', resize: 'vertical' }}
                                placeholder="Paste your resume content here..."
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                disabled={isSaving}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="glass-button" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                Cancel
                            </button>
                            <button className="btn-premium pulse-glow" onClick={handleSaveResume} disabled={isSaving || !currentName || !currentText}>
                                {isSaving ? 'Saving...' : 'Save to Vault'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeVaultPage;
