import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileText, Copy, CheckCircle, ArrowRight, Download, Sparkles, Send } from 'lucide-react';
import { useToast } from '../components/Toast';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface LetterData {
  subject_line: string;
  letter_body: string;
}

const ResignationLetterPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [employeeName, setEmployeeName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [lastDate, setLastDate] = useState('');
    const [tone, setTone] = useState('professional');
    const [reason, setReason] = useState('');
    
    const [resultData, setResultData] = useState<LetterData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        showToast('Copied to clipboard!', 'success');
    };

    const handleDownload = () => {
        if (!resultData) return;
        const textToSave = `Subject: ${resultData.subject_line}\n\n${resultData.letter_body}`;
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Resignation_Letter_${companyName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerate = async () => {
        if (!employeeName.trim() || !companyName.trim() || !lastDate.trim()) {
            showToast('Please fill in your name, company name, and last working day.', 'warning');
            return;
        }

        setIsLoading(true);
        setResultData(null);

        try {
            const payload = {
                employee_name: employeeName,
                company_name: companyName,
                last_date: lastDate,
                tone: tone,
                reason: reason
            };

            const response = await axios.post(`${API_BASE_URL}/api/free/resignation-letter`, payload);
            console.log("Resignation letter response:", response.data);
            
            if (response.data && response.data.subject_line) {
                setResultData(response.data);
                showToast('Letter generated successfully!', 'success');
            } else if (typeof response.data === 'string') {
                setResultData({
                    subject_line: `Resignation - ${employeeName}`,
                    letter_body: response.data
                });
                showToast('Letter generated successfully!', 'success');
            } else {
                showToast('Received unexpected format from AI.', 'error');
            }

        } catch (err: any) {
            console.error("Letter generation error:", err);
            if (err.response?.status === 429) {
                showToast("Rate limit exceeded. Please try again later.", "warning");
            } else {
                showToast("Failed to generate letter. Ensure the backend is running.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-rose-600/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10"></div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-6">
                        <Sparkles size={16} /> Free AI Tool
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400">
                        Resignation Letter Generator
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Draft a perfect, bridge-building resignation letter in seconds.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-t-3xl"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-400 font-medium mb-2 text-sm">Your Name <span className="text-rose-500">*</span></label>
                            <input 
                                type="text" 
                                value={employeeName} 
                                onChange={e => setEmployeeName(e.target.value)} 
                                placeholder="John Doe"
                                disabled={isLoading}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 font-medium mb-2 text-sm">Company Name <span className="text-rose-500">*</span></label>
                            <input 
                                type="text" 
                                value={companyName} 
                                onChange={e => setCompanyName(e.target.value)} 
                                placeholder="Acme Corp"
                                disabled={isLoading}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-400 font-medium mb-2 text-sm">Last Working Day <span className="text-rose-500">*</span></label>
                            <input 
                                type="text" 
                                value={lastDate} 
                                onChange={e => setLastDate(e.target.value)} 
                                placeholder="e.g., October 31st, 2026"
                                disabled={isLoading}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 font-medium mb-2 text-sm">Tone</label>
                            <select 
                                value={tone}
                                onChange={e => setTone(e.target.value)}
                                disabled={isLoading}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none"
                            >
                                <option value="professional">Professional & Standard</option>
                                <option value="grateful">Grateful & Warm</option>
                                <option value="brief">Short & Brief</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-gray-400 font-medium mb-2 text-sm">Reason for Leaving (Optional)</label>
                        <input 
                            type="text" 
                            value={reason} 
                            onChange={e => setReason(e.target.value)} 
                            placeholder="e.g., Relocating, New opportunity, Going back to school"
                            disabled={isLoading}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                        />
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !employeeName || !companyName || !lastDate}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLoading ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Drafting...</>
                        ) : (
                            <><Send size={20} /> Generate Letter</>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                {resultData && (
                    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="text-2xl font-bold text-pink-400 flex items-center gap-2">
                                <FileText size={24} /> Draft Ready
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <button 
                                    onClick={() => handleCopy(resultData.letter_body)} 
                                    className="px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 transition-colors flex items-center gap-2 font-medium"
                                >
                                    {isCopied ? <CheckCircle size={18}/> : <Copy size={18}/>} 
                                    {isCopied ? 'Copied!' : 'Copy'}
                                </button>
                                <button 
                                    onClick={handleDownload} 
                                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <Download size={18}/> Save .txt
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-black/50 border border-pink-500/20 rounded-2xl p-6 mb-6">
                            <div className="mb-4 pb-4 border-b border-white/10">
                                <strong className="text-gray-400 text-sm uppercase tracking-wider">Subject:</strong>
                                <p className="text-lg text-white font-medium mt-1">{resultData.subject_line}</p>
                            </div>
                            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-[1.05rem]">
                                {resultData.letter_body}
                            </div>
                        </div>

                        {/* Upsell CTA */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-pink-900/40 to-black rounded-2xl border border-pink-500/20 text-center">
                            <h4 className="text-xl font-bold text-white mb-2">Starting a new job hunt?</h4>
                            <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
                                Make sure your resume is ready. Use our Premium AI tools to build, tailor, and optimize your resume for your next role.
                            </p>
                            <button 
                                onClick={() => navigate('/AiTools')} 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors border border-white/10"
                            >
                                View AI Toolkit <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResignationLetterPage;
