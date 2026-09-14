import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchTokenBalance(currentUser.id);
                checkUserRole(currentUser.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchTokenBalance(currentUser.id);
                checkUserRole(currentUser.id);
            } else {
                setTokens(null);
                setIsAdmin(false);
            }
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const checkUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles') 
                .select('role')
                .eq('id', userId)
                .single();
                
            if (error) throw error;
            if (data && data.role === 'admin') setIsAdmin(true);
            else setIsAdmin(false);
        } catch (err) {
            console.error("Error fetching user role:", err.message);
            setIsAdmin(false);
        }
    };

    const fetchTokenBalance = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('token_ledger')
                .select('tokens_balance')
                .eq('user_id', userId)
                .single();
                
            if (error) throw error;
            if (data) setTokens(data.tokens_balance); 
        } catch (err) {
            console.error("Error fetching tokens:", err.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsMobileMenuOpen(false);
        navigate('/'); 
    };

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
            <nav className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between">
                    
                    {/* Left: Logo */}
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                            CC
                        </div>
                        <span className="text-white font-bold tracking-widest text-sm hidden sm:block">
                            CAREER <span className="opacity-70">CATALYST</span>
                        </span>
                    </Link>

                    {/* Middle: Pill Navigation (Desktop Only) */}
                    <div className="hidden lg:flex items-center gap-8 px-8 py-3 bg-[#111118]/80 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
                        {user ? (
                            <>
                                <Link to="/features" className="text-xs text-gray-400 hover:text-white font-mono tracking-widest transition-colors">FEATURES</Link>
                                <Link to="/ai-tools" className="text-xs text-gray-400 hover:text-white font-mono tracking-widest transition-colors">DASHBOARD</Link>
                                <Link to="/pricing" className="text-xs text-gray-400 hover:text-white font-mono tracking-widest transition-colors">PRICING</Link>
                                {isAdmin && <Link to="/admin" className="text-xs text-amber-400 hover:text-amber-300 font-mono tracking-widest transition-colors">ADMIN</Link>}
                            </>
                        ) : (
                            <>
                                <Link to="/features" className="text-xs text-gray-400 hover:text-white font-mono tracking-widest transition-colors">FEATURES</Link>
                                
                                <div className="nav-dropdown">
                                    <button className="nav-dropdown-btn text-xs text-gray-400 hover:text-white font-mono tracking-widest transition-colors uppercase">
                                        Free Tools <span className="text-[10px] ml-1">▼</span>
                                    </button>
                                    <div className="nav-dropdown-content">
                                        <Link to="/bullet-rewriter" className="text-xs font-mono tracking-widest hover:text-cyan-400">BULLET REWRITER</Link>
                                        <Link to="/job-fit" className="text-xs font-mono tracking-widest hover:text-cyan-400">JOB FIT SCORE</Link>
                                        <Link to="/resignation-letter" className="text-xs font-mono tracking-widest hover:text-cyan-400">RESIGNATION</Link>
                                        <Link to="/resume-diff" className="text-xs font-mono tracking-widest hover:text-cyan-400">RESUME DIFF</Link>
                                    </div>
                                </div>

                                <Link to="/login" className="text-xs text-gray-400 hover:text-white font-mono tracking-widest transition-colors">LOGIN / SIGNUP</Link>
                            </>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold shadow-inner">
                                    <span className="text-xl">{tokens !== null && tokens <= 1 ? '🔴' : tokens !== null && tokens <= 5 ? '🟡' : '💎'}</span>
                                    <span className={tokens <= 5 ? 'text-amber-400' : 'text-cyan-400'}>{tokens !== null ? `${tokens} Tokens` : '...'}</span>
                                </div>
                                <button onClick={handleLogout} className="px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="hidden sm:inline-block px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase bg-[#1e1b4b] text-indigo-300 border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:bg-[#312e81] hover:text-white hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all">
                                FREE RESUME AUDIT
                            </Link>
                        )}
                        
                        {/* Mobile Menu Toggle */}
                        <button 
                            className="lg:hidden p-2 text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? '✖' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-20 left-4 right-4 bg-[#111118]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
                        {user ? (
                            <>
                                <Link to="/ai-tools" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-mono tracking-widest">DASHBOARD</Link>
                                <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-mono tracking-widest">PRICING</Link>
                                <button onClick={handleLogout} className="text-red-400 text-left font-mono tracking-widest">LOGOUT</button>
                            </>
                        ) : (
                            <>
                                <Link to="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white font-mono tracking-widest">FEATURES</Link>
                                
                                <div className="text-gray-500 font-mono tracking-widest mt-2 mb-1 text-xs">FREE TOOLS:</div>
                                <Link to="/bullet-rewriter" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white font-mono tracking-widest pl-4 text-sm">BULLET REWRITER</Link>
                                <Link to="/job-fit" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white font-mono tracking-widest pl-4 text-sm">JOB FIT SCORE</Link>
                                <Link to="/resignation-letter" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white font-mono tracking-widest pl-4 text-sm">RESIGNATION LETTER</Link>
                                <Link to="/resume-diff" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white font-mono tracking-widest pl-4 text-sm">RESUME DIFF</Link>
                                
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white font-mono tracking-widest mt-2">LOGIN / SIGNUP</Link>
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-indigo-400 font-mono tracking-widest mt-4">FREE RESUME AUDIT</Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;