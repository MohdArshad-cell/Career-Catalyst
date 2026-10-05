import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SplitSquareHorizontal, CheckCircle, ArrowRight, FileText, Search, Sparkles } from 'lucide-react';
import { useToast } from '../components/Toast';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import PdfUploadButton from '../components/PdfUploadButton';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const ResumeDiffPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [originalText, setOriginalText] = useState('');
    const [newText, setNewText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [savedResumes, setSavedResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');

    // --- AUTO-LOAD MASTER RESUMES ---
    React.useEffect(() => {
        const fetchMasterResumes = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const res = await axios.get(`${API_BASE_URL}/api/profile/resume`, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                if (res.data.resumes && res.data.resumes.length > 0) {
                    setSavedResumes(res.data.resumes);
                    // Select the first one by default
                    setSelectedResumeId(res.data.resumes[0].id);
                    setOriginalText(res.data.resumes[0].resume_text);
                }
            } catch (err) {
                console.error("Failed to load master resumes", err);
            }
        };
        fetchMasterResumes();
    }, []);

    const handleResumeSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedResumeId(id);
        if (id) {
            const selected = savedResumes.find(r => r.id === id);
            if (selected) setOriginalText(selected.resume_text);
        } else {
            setOriginalText(''); // 'custom' option selected
        }
    };
    
    interface DiffLine {
        type: 'added' | 'removed' | 'unchanged';
        text: string;
    }
    
    const [diffResult, setDiffResult] = useState<DiffLine[] | null>(null);
    const [stats, setStats] = useState({ added: 0, removed: 0 });

    const analyzeDiff = () => {
        if (!originalText.trim() || !newText.trim()) {
            showToast('Please provide both original and new resume text.', 'warning');
            return;
        }

        setIsAnalyzing(true);

        setTimeout(() => {
            // Simple line-by-line diff algorithm
            const origLines = originalText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const newLines = newText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            const result: DiffLine[] = [];
            let addedCount = 0;
            let removedCount = 0;

            const origSet = new Set(origLines);
            const newSet = new Set(newLines);

            // Find removed
            origLines.forEach(line => {
                if (!newSet.has(line)) {
                    result.push({ type: 'removed', text: line });
                    removedCount++;
                } else {
                    result.push({ type: 'unchanged', text: line });
                }
            });

            // Find added
            newLines.forEach(line => {
                if (!origSet.has(line)) {
                    result.push({ type: 'added', text: line });
                    addedCount++;
                }
            });

            setDiffResult(result);
            setStats({ added: addedCount, removed: removedCount });
            
            setIsAnalyzing(false);
            showToast('Comparison complete!', 'success');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-transparent text-white pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-600/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10"></div>

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                        <Sparkles size={16} /> Free Client-Side Tool
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                        Resume Diff Checker
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Compare your original resume against a tailored version to see exactly what changed line-by-line.
                    </p>
                </div>

                {/* Input Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Original Resume Input */}
                    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-gray-400 rounded-t-3xl"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="flex items-center gap-2 text-gray-300 font-semibold">
                                <FileText size={20} /> Original Resume
                            </h2>
                            {!selectedResumeId && (
                                <PdfUploadButton onTextExtracted={(text) => setOriginalText(text)} disabled={isAnalyzing} />
                            )}
                        </div>
                        
                        {savedResumes.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-2">Select from Vault:</label>
                                <select 
                                    value={selectedResumeId}
                                    onChange={handleResumeSelection}
                                    disabled={isAnalyzing}
                                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    {savedResumes.map(r => (
                                        <option key={r.id} value={r.id}>{r.resume_name}</option>
                                    ))}
                                    <option value="">-- Upload / Paste Custom Resume --</option>
                                </select>
                            </div>
                        )}

                        {selectedResumeId ? (
                            <div className="flex-grow flex flex-col items-center justify-center p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center min-h-[300px]">
                                <div className="text-4xl mb-4">✅</div>
                                <h3 className="text-emerald-400 font-semibold mb-2">Using Saved Resume</h3>
                                <p className="text-gray-400 text-sm">This resume will be compared automatically.</p>
                            </div>
                        ) : (
                            <textarea
                                value={originalText}
                                onChange={(e) => setOriginalText(e.target.value)}
                                placeholder="Paste your original resume text..."
                                disabled={isAnalyzing}
                                className="w-full flex-grow bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[300px] resize-none"
                            />
                        )}
                    </div>
                    
                    {/* New Resume Input */}
                    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-3xl"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="flex items-center gap-2 text-emerald-400 font-semibold">
                                <FileText size={20} /> New / Tailored Resume
                            </h2>
                        </div>
                        <textarea
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Paste the new resume text..."
                            disabled={isAnalyzing}
                            className="w-full flex-grow bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all min-h-[300px] resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-center mb-12">
                    <button 
                        onClick={analyzeDiff}
                        disabled={isAnalyzing || !originalText.trim() || !newText.trim()}
                        className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isAnalyzing ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Comparing...</>
                        ) : (
                            <><Search size={24} /> Compare Resumes</>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                {diffResult && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Stats Panel */}
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-wrap justify-around items-center mb-8 relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-3xl"></div>
                            <div className="text-center px-4 py-2">
                                <div className="text-4xl md:text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] mb-1">{stats.added}</div>
                                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">Lines Added</div>
                            </div>
                            <div className="hidden md:block w-px h-16 bg-white/10"></div>
                            <div className="text-center px-4 py-2">
                                <div className="text-4xl md:text-5xl font-black text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)] mb-1">{stats.removed}</div>
                                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">Lines Removed</div>
                            </div>
                            <div className="hidden md:block w-px h-16 bg-white/10"></div>
                            <div className="text-center px-4 py-2">
                                <div className="text-4xl md:text-5xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)] mb-1">{diffResult.length - stats.added - stats.removed}</div>
                                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">Lines Unchanged</div>
                            </div>
                        </div>

                        {/* Diff Viewer */}
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                <SplitSquareHorizontal size={24} className="text-teal-400" /> Diff Viewer
                            </h3>
                            
                            <div className="bg-[#0f1115] border border-white/5 rounded-2xl p-4 md:p-6 max-h-[600px] overflow-y-auto font-mono text-sm leading-relaxed shadow-inner">
                                {diffResult.map((line, idx) => {
                                    if (line.type === 'added') {
                                        return (
                                            <div key={idx} className="bg-emerald-500/10 text-emerald-300 px-3 py-1.5 my-1 rounded-md flex">
                                                <span className="select-none opacity-50 w-6">+</span>
                                                <span className="flex-1 whitespace-pre-wrap break-words">{line.text}</span>
                                            </div>
                                        );
                                    } else if (line.type === 'removed') {
                                        return (
                                            <div key={idx} className="bg-rose-500/10 text-rose-300 px-3 py-1.5 my-1 rounded-md flex">
                                                <span className="select-none opacity-50 w-6">-</span>
                                                <span className="flex-1 whitespace-pre-wrap break-words line-through opacity-80">{line.text}</span>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={idx} className="text-gray-400 px-3 py-1 my-0.5 flex hover:bg-white/5 rounded-md transition-colors">
                                                <span className="select-none opacity-50 w-6">&nbsp;</span>
                                                <span className="flex-1 whitespace-pre-wrap break-words">{line.text}</span>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>

                        {/* Upsell CTA */}
                        <div className="p-8 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-3xl border border-emerald-500/30 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                <SplitSquareHorizontal size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-3">Tired of manual tailoring?</h3>
                                <p className="text-emerald-200 mb-8 max-w-xl mx-auto">
                                    Let our Premium AI Tailor rewrite your entire resume specifically for any job description in less than 30 seconds.
                                </p>
                                <button 
                                    onClick={() => navigate('/ai-tailor')} 
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-900 hover:bg-gray-100 rounded-xl font-bold transition-colors shadow-lg"
                                >
                                    Use AI Tailor <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeDiffPage;
