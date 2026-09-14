import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Share2, Copy, CheckCircle, Gift, Users } from 'lucide-react';



import { useToast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import './ToolPages.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const ReferralPage: React.FC = () => {
    const { showToast } = useToast();
    const [stats, setStats] = useState<any>(null);
    const [referralCode, setReferralCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await axios.get(`${API_BASE_URL}/api/referral/stats`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            
            setReferralCode(response.data.referral_code);
            setStats(response.data.stats);
        } catch (err) {
            console.error("Error fetching referral stats:", err);
            showToast("Failed to load referral data.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        const url = `${window.location.origin}/signup?ref=${referralCode}`;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        showToast("Referral link copied!", "success");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleRedeem = async () => {
        if (!redeemCode.trim()) {
            showToast("Please enter a code to redeem.", "warning");
            return;
        }
        setIsRedeeming(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await axios.post(`${API_BASE_URL}/api/referral/redeem`, { code: redeemCode.trim() }, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            
            showToast("Code redeemed successfully! +5 Tokens", "success");
            setRedeemCode('');
            fetchReferralData(); // Refresh to show updated tokens if needed (though tokens are tracked globally)
            
            // Reload page to update navbar tokens
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            console.error("Redeem error:", err);
            showToast(err.response?.data?.detail || "Failed to redeem code.", "error");
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden flex justify-center">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-4xl relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-mono tracking-widest mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <Gift size={16} /> EARN FREE TOKENS
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Refer a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Friend</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
                        Give 5 tokens, get 5 tokens. Invite your network to Career Catalyst and earn free AI generations for every successful signup.
                    </p>
                </div>

                {!isLoading && stats ? (
                    <div className="space-y-8">
                        {/* Link Section */}
                        <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Your Unique Referral Link</h2>
                            
                            <div className="flex flex-col md:flex-row items-center bg-black/40 rounded-2xl p-2 mb-6 border border-white/5 relative z-10">
                                <div className="flex-grow text-left text-cyan-400 font-mono text-sm md:text-base overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3">
                                    {window.location.origin}/signup?ref={referralCode}
                                </div>
                                <button 
                                    onClick={handleCopy} 
                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wider hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:-translate-y-0.5"
                                >
                                    {isCopied ? <CheckCircle size={18}/> : <Copy size={18}/>}
                                    {isCopied ? 'COPIED!' : 'COPY LINK'}
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm relative z-10">Share this link. When someone signs up, you both get 5 tokens instantly.</p>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl hover:border-blue-500/30 transition-colors">
                                <div className="text-5xl font-bold text-blue-500 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{stats.completed}</div>
                                <div className="text-gray-400 flex items-center justify-center gap-2 font-mono tracking-widest text-sm">
                                    <Users size={16} className="text-blue-500"/> FRIENDS JOINED
                                </div>
                            </div>
                            <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl hover:border-emerald-500/30 transition-colors">
                                <div className="text-5xl font-bold text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{stats.tokens_earned}</div>
                                <div className="text-gray-400 flex items-center justify-center gap-2 font-mono tracking-widest text-sm">
                                    <Gift size={16} className="text-emerald-400"/> TOKENS EARNED
                                </div>
                            </div>
                        </div>

                        {/* Redeem Section */}
                        <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2">Have a referral code?</h3>
                            <p className="text-gray-400 mb-8 font-light">Enter a friend's code below to claim your 5 free tokens.</p>
                            
                            <div className="flex flex-col md:flex-row gap-4">
                                <input 
                                    type="text" 
                                    value={redeemCode} 
                                    onChange={(e) => setRedeemCode(e.target.value)}
                                    placeholder="Enter Code (e.g. ABC123XX)"
                                    disabled={isRedeeming}
                                    className="flex-grow bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                                />
                                <button 
                                    onClick={handleRedeem}
                                    disabled={isRedeeming || !redeemCode.trim()}
                                    className="md:w-48 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-wider hover:bg-white/10 hover:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRedeeming ? 'REDEEMING...' : 'REDEEM'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 font-mono tracking-widest py-20 flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        LOADING DATA...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferralPage;
