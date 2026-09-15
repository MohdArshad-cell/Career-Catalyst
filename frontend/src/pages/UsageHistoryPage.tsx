import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { History, Activity, Zap, AlertCircle } from 'lucide-react';



import { useToast } from '../components/Toast';
import './ToolPages.css';

const UsageHistoryPage: React.FC = () => {
    const { showToast } = useToast();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total_tokens: 0, total_generations: 0, failed_generations: 0 });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('generation_logs')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setLogs(data);
                
                // Calculate stats
                let tokens = 0;
                let fails = 0;
                data.forEach(log => {
                    if (log.status === 'success') tokens += (log.tokens_deducted || 1);
                    if (log.status === 'failed') fails += 1;
                });
                
                setStats({
                    total_tokens: tokens,
                    total_generations: data.length,
                    failed_generations: fails
                });
            }
        } catch (err) {
            console.error("Error fetching history:", err);
            showToast("Failed to load usage history.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            
            
            

            <div className="tailor-studio-container" style={{ paddingTop: '100px', paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
                
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                        <History size={16} /> Your Activity
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                        Usage History
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Track your AI generations, token usage, and activity logs.
                    </p>
                </div>

                {!isLoading ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div className="panel glass-card text-center" style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.total_generations}</div>
                                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <Activity size={16}/> Total Actions
                                </div>
                            </div>
                            <div className="panel glass-card text-center" style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.total_tokens}</div>
                                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <Zap size={16}/> Tokens Spent
                                </div>
                            </div>
                            <div className="panel glass-card text-center" style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: stats.failed_generations > 0 ? '#ef4444' : '#10b981' }}>{stats.failed_generations}</div>
                                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <AlertCircle size={16}/> Failed Requests
                                </div>
                            </div>
                        </div>

                        <div className="panel glass-card">
                            <h2 style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', margin: 0 }}>Activity Log</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)' }}>
                                            <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Date & Time</th>
                                            <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Service</th>
                                            <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</th>
                                            <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Tokens</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem', color: '#cbd5e1' }}>{new Date(log.created_at).toLocaleString()}</td>
                                                <td style={{ padding: '1rem', color: 'white' }}>{log.action.replace('ai_', '').toUpperCase()}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ 
                                                        padding: '4px 8px', 
                                                        borderRadius: '4px', 
                                                        fontSize: '0.85rem',
                                                        background: log.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                        color: log.status === 'success' ? '#34d399' : '#fca5a5'
                                                    }}>
                                                        {log.status === 'success' ? 'Success' : 'Failed'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                                                    {log.status === 'success' ? `-${log.tokens_deducted}` : '0'}
                                                </td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                    No activity found yet. Start using the AI tools!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center" style={{ color: 'white', padding: '3rem' }}>Loading your history...</div>
                )}
            </div>
            
            
        </div>
    );
};

export default UsageHistoryPage;
