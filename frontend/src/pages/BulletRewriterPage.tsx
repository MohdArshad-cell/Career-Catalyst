import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit3, Copy, CheckCircle, ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '../components/Toast';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface RewriteData {
  original: string;
  rewritten: string;
  improvement_notes: string;
}

const BulletRewriterPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [bulletText, setBulletText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [resultData, setResultData] = useState<RewriteData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        showToast('Copied to clipboard!', 'success');
    };

    const handleRewrite = async () => {
        if (!bulletText.trim()) {
            showToast('Please paste a bullet point to rewrite.', 'warning');
            return;
        }

        setIsLoading(true);
        setResultData(null);

        try {
            const payload = {
                bullet_text: bulletText,
                target_role: targetRole || "General"
            };

            const response = await axios.post(`${API_BASE_URL}/api/free/rewrite-bullet`, payload);
            console.log("Bullet rewriter response:", response.data);
            
            // Check if the response contains the expected fields
            if (response.data && response.data.rewritten) {
                setResultData(response.data);
                showToast('Bullet point upgraded!', 'success');
            } else if (typeof response.data === 'string') {
                // Fallback in case the LLM returned a plain string
                setResultData({
                    original: bulletText,
                    rewritten: response.data,
                    improvement_notes: "Auto-formatted by AI."
                });
                showToast('Bullet point upgraded!', 'success');
            } else {
                showToast('Received unexpected format from AI.', 'error');
            }
        } catch (err: any) {
            console.error("Rewrite error:", err);
            if (err.response?.status === 429) {
                showToast("You've reached the limit for free rewrites. Please try again later.", "warning");
            } else {
                showToast("Failed to rewrite bullet. Ensure the backend is running.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10"></div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                        <Sparkles size={16} /> Free AI Tool
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
                        AI Bullet Rewriter
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Turn weak, generic duties into powerful, metric-driven achievements instantly using the XYZ formula.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-t-3xl"></div>
                    
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-cyan-400 font-semibold mb-3">
                            <Edit3 size={20} /> Paste a Bullet Point
                        </label>
                        <textarea
                            value={bulletText}
                            onChange={(e) => setBulletText(e.target.value)}
                            placeholder="e.g., 'Responsible for managing social media accounts and increasing followers.'"
                            disabled={isLoading}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all min-h-[120px] resize-y"
                        />
                    </div>
                    
                    <div className="mb-8">
                        <label className="block text-gray-400 font-medium mb-2 text-sm">
                            Target Role (Optional)
                        </label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g., Senior Marketing Manager"
                            disabled={isLoading}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        />
                    </div>

                    <button 
                        onClick={handleRewrite}
                        disabled={isLoading || !bulletText.trim()}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLoading ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Upgrading...</>
                        ) : (
                            <><Wand2 size={20} /> Rewrite Bullet</>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                {resultData && (
                    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                                <Sparkles size={24} /> Optimized Result
                            </h3>
                            <button 
                                onClick={() => handleCopy(resultData.rewritten)} 
                                className="px-4 py-2 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-2 font-medium"
                            >
                                {isCopied ? <CheckCircle size={18}/> : <Copy size={18}/>} 
                                {isCopied ? 'Copied!' : 'Copy Result'}
                            </button>
                        </div>
                        
                        <div className="bg-black/50 border border-purple-500/20 rounded-2xl p-6 mb-6">
                            <p className="text-lg md:text-xl text-white leading-relaxed font-medium">
                                {resultData.rewritten}
                            </p>
                        </div>
                        
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start gap-3">
                            <div className="text-yellow-400 mt-1">💡</div>
                            <div>
                                <strong className="text-white block mb-1">Why this works:</strong>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {resultData.improvement_notes}
                                </p>
                            </div>
                        </div>

                        {/* Upsell CTA */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-purple-900/40 to-black rounded-2xl border border-purple-500/20 text-center">
                            <h4 className="text-xl font-bold text-white mb-2">Want to upgrade your ENTIRE resume?</h4>
                            <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
                                Let our AI Tailor scan your full resume and rewrite it perfectly for any job description, guaranteeing a 90%+ ATS score.
                            </p>
                            <button 
                                onClick={() => navigate('/ai-tailor')} 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors border border-white/10"
                            >
                                Try Full AI Tailor <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulletRewriterPage;
