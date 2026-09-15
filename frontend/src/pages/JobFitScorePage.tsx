import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle, XCircle, ArrowRight, FileText, BarChart, Sparkles } from 'lucide-react';
import PdfUploadButton from '../components/PdfUploadButton';
import { useToast } from '../components/Toast';

const JobFitScorePage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Result State
    const [score, setScore] = useState<number | null>(null);
    const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
    const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);

    const analyzeFit = () => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            showToast('Please provide both resume and job description.', 'warning');
            return;
        }

        setIsAnalyzing(true);

        // Simulate processing time
        setTimeout(() => {
            const resumeLower = resumeText.toLowerCase();
            const jdLower = jobDescription.toLowerCase();

            // Very basic heuristic keyword extraction
            const words = jdLower.match(/\b([a-z0-9]+)\b/g) || [];
            
            // Filter out common stop words and keep words > 4 chars to approximate keywords
            const stopWords = ['this', 'that', 'with', 'from', 'your', 'have', 'more', 'will', 'about', 'which', 'their', 'other', 'what'];
            
            const potentialKeywords = Array.from(new Set(words))
                .filter(w => w.length > 4 && !stopWords.includes(w))
                .slice(0, 30); // Grab top 30 potential keywords

            const matched: string[] = [];
            const missing: string[] = [];

            potentialKeywords.forEach(kw => {
                if (resumeLower.includes(kw)) {
                    matched.push(kw);
                } else {
                    missing.push(kw);
                }
            });

            // Calculate score based on keyword match density
            const total = matched.length + missing.length;
            const calculatedScore = total > 0 ? Math.round((matched.length / total) * 100) : 0;

            setMatchedKeywords(matched.slice(0, 10)); // Show top 10
            setMissingKeywords(missing.slice(0, 10));   // Show top 10
            setScore(calculatedScore);
            
            setIsAnalyzing(false);
            showToast('Analysis complete!', 'success');

        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10"></div>

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                        <Sparkles size={16} /> Free Client-Side Tool
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                        Job Fit Score
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Instantly compare your resume against a job description. Know your match percentage before you apply.
                    </p>
                </div>

                {/* Input Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Resume Input */}
                    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-3xl"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="flex items-center gap-2 text-blue-400 font-semibold">
                                <FileText size={20} /> Your Resume
                            </h2>
                            <PdfUploadButton onTextExtracted={(text) => setResumeText(text)} />
                        </div>
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume here or upload a PDF..."
                            disabled={isAnalyzing}
                            className="w-full flex-grow bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[300px] resize-none"
                        />
                    </div>
                    
                    {/* JD Input */}
                    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-t-3xl"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="flex items-center gap-2 text-indigo-400 font-semibold">
                                <Target size={20} /> Target Job Description
                            </h2>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            disabled={isAnalyzing}
                            className="w-full flex-grow bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[300px] resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-center mb-12">
                    <button 
                        onClick={analyzeFit}
                        disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
                        className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isAnalyzing ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Analyzing Fit...</>
                        ) : (
                            <><BarChart size={24} /> Calculate Fit Score</>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                {score !== null && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Score Card */}
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center mb-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                            <h2 className="text-gray-400 font-bold tracking-[0.2em] uppercase text-sm mb-6">Your ATS Match Score</h2>
                            
                            <div className={`text-7xl md:text-8xl font-black mb-6 ${
                                score >= 75 ? 'text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 
                                score >= 50 ? 'text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 
                                'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                            }`}>
                                {score}%
                            </div>
                            
                            <p className="text-xl md:text-2xl font-medium text-white max-w-2xl mx-auto">
                                {score >= 75 ? '🔥 Strong Match! You are highly competitive for this role.' : 
                                 score >= 50 ? '⚠️ Moderate Match. You should add missing keywords before applying.' : 
                                 '❌ Weak Match. Your resume needs significant tailoring.'}
                            </p>
                        </div>

                        {/* Keyword Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white/[0.02] backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 md:p-8">
                                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-6">
                                    <XCircle size={24} /> Missing Keywords
                                </h3>
                                {missingKeywords.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {missingKeywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-sm font-medium">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">No major keywords missing!</p>
                                )}
                            </div>

                            <div className="bg-white/[0.02] backdrop-blur-xl border border-green-500/20 rounded-3xl p-6 md:p-8">
                                <h3 className="text-xl font-bold text-green-400 flex items-center gap-2 mb-6">
                                    <CheckCircle size={24} /> Matched Keywords
                                </h3>
                                {matchedKeywords.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {matchedKeywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg text-sm font-medium">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">No keywords matched.</p>
                                )}
                            </div>
                        </div>

                        {/* Upsell CTA */}
                        <div className="p-8 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-3xl border border-blue-500/30 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                <Target size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-3">Fix your score instantly with AI</h3>
                                <p className="text-blue-200 mb-8 max-w-xl mx-auto">
                                    Our Premium AI Tailor will rewrite your resume to naturally include these missing keywords and guarantee a 90%+ ATS score.
                                </p>
                                <button 
                                    onClick={() => navigate('/ai-tailor')} 
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 hover:bg-gray-100 rounded-xl font-bold transition-colors shadow-lg"
                                >
                                    Upgrade Resume Automatically <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobFitScorePage;
