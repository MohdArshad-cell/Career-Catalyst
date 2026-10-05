import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { FaUpload, FaSave, FaCheck } from 'react-icons/fa';

export const MasterResumeManager = () => {
    const [savedResume, setSavedResume] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchSavedResume();
    }, []);

    const fetchSavedResume = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await axios.get(`${API_BASE_URL}/api/profile/resume`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setSavedResume(res.data.saved_resume_text || '');
        } catch (error) {
            console.error("Error fetching master resume:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveResume = async (textToSave?: string) => {
        setIsLoading(true);
        setStatusMessage('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setStatusMessage('You must be logged in to save.');
                return;
            }

            await axios.post(`${API_BASE_URL}/api/profile/resume`, 
                { resume_text: textToSave || savedResume }, 
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            
            setStatusMessage('Master Resume saved successfully!');
            setIsEditing(false);
            if (textToSave) setSavedResume(textToSave);
            
            setTimeout(() => setStatusMessage(''), 3000);
        } catch (error) {
            console.error("Error saving master resume:", error);
            setStatusMessage('Failed to save resume.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setStatusMessage('Extracting text from PDF...');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Use the free endpoint for PDF extraction
            const res = await axios.post(`${API_BASE_URL}/api/upload-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const extractedText = res.data.extracted_text;
            setSavedResume(extractedText);
            
            // Automatically save it
            await handleSaveResume(extractedText);
            
        } catch (err) {
            console.error("PDF upload error:", err);
            setStatusMessage('Failed to read PDF file.');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="glass-card-premium" style={{ padding: '2rem', marginBottom: '3rem', position: 'relative' }}>
            <div className="bento-glow"></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaSave style={{ color: '#10b981' }} /> Master Resume Vault
                        </h2>
                        <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>
                            Save your resume here once. It will be automatically used across all AI tools!
                        </p>
                    </div>
                    <div>
                        {!isEditing && savedResume && (
                            <button className="glass-button" onClick={() => setIsEditing(true)}>
                                Edit Master Resume
                            </button>
                        )}
                    </div>
                </div>

                {statusMessage && (
                    <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '1rem', backgroundColor: statusMessage.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: statusMessage.includes('success') ? '#10b981' : '#ef4444', border: `1px solid ${statusMessage.includes('success') ? '#10b981' : '#ef4444'}` }}>
                        {statusMessage}
                    </div>
                )}

                {(!savedResume || isEditing) ? (
                    <div>
                        <textarea
                            value={savedResume}
                            onChange={(e) => setSavedResume(e.target.value)}
                            placeholder="Paste your plain text resume or LaTeX code here..."
                            style={{ width: '100%', minHeight: '200px', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', resize: 'vertical' }}
                            disabled={isLoading}
                        />
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button 
                                className="glass-button primary-glow" 
                                onClick={() => handleSaveResume()}
                                disabled={isLoading || !savedResume.trim()}
                            >
                                {isLoading ? 'Saving...' : 'Save to Vault'}
                            </button>
                            
                            <span style={{ color: '#94a3b8' }}>OR</span>
                            
                            <input 
                                type="file" 
                                accept=".pdf" 
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <button 
                                className="glass-button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FaUpload /> {isLoading ? 'Uploading...' : 'Upload PDF Instead'}
                            </button>
                            
                            {isEditing && (
                                <button className="glass-button" onClick={() => setIsEditing(false)} style={{ marginLeft: 'auto' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FaCheck />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: '#10b981' }}>Master Resume is Active</h3>
                            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem' }}>
                                We found your saved master resume. You can now use any AI tool below without pasting your resume again. The system will automatically fetch it for you.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
