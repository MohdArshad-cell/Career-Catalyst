import React, { MouseEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';



import { useToast } from '../components/Toast';
import './FeaturesPage.css';

interface FeatureStat {
    label: string;
    value: string;
}

interface Feature {
    id: string;
    title: string;
    icon: string;
    description: string;
    status: 'live' | 'upcoming';
    badge: string;
    route: string;
    buttonText: string;
    accent: string;
    tags: string[];
    stats: FeatureStat[];
}

const featuresList: Feature[] = [
    {
        id: 'builder',
        title: 'Create From Scratch',
        icon: '📝',
        description: 'A step-by-step builder to craft a new, professional resume from the ground up.',
        status: 'live',
        badge: 'Live Now',
        route: '/ResumeFromScratchPage',
        buttonText: 'Start Building ➔',
        accent: '#06b6d4', // Cyan matching your screenshot's CTA text
        tags: ['Step-by-Step', 'Auto-Format', 'LaTeX Export'],
        stats: [{ label: 'Templates', value: 'ATS Pro' }, { label: 'Cost', value: 'Free' }]
    },
    {
        id: 'tailor',
        title: 'AI Resume Tailor',
        icon: '🎯',
        description: 'Micro-tailor your resume for any specific Job Description in 10 seconds. Output is a pixel-perfect, ATS-friendly LaTeX PDF.',
        status: 'live',
        badge: 'Live Now',
        route: '/ai-tools',
        buttonText: 'Launch Engine 🚀',
        accent: '#00e5ff', // Neon Cyan
        tags: ['Gemini 3.1', 'LaTeX Core', 'ATS Bypass'],
        stats: [{ label: 'Speed', value: '< 12s' }, { label: 'Cost', value: '1 Token' }]
    },
    {
        id: 'evaluator',
        title: 'Brutal ATS Scanner',
        icon: '🔥',
        description: 'Find out exactly why you are getting rejected. Zero sugarcoating. Get a brutal score and fix weak bullets instantly.',
        status: 'live',
        badge: 'Live Now',
        route: '/ats-evaluator',
        buttonText: 'Scan Resume 🔍',
        accent: '#ef4444', // Neon Red
        tags: ['Harsh Feedback', 'Score System', 'Auto-Rewrite'],
        stats: [{ label: 'Accuracy', value: '99%' }, { label: 'Cost', value: '1 Token' }]
    },
    {
        id: 'xray',
        title: 'Autonomous ATS X-Ray',
        icon: '👁️',
        description: 'Paste your resume and let our AI instantly hunt down formatting red flags, weak bullets, and generic fluff. No JD required.',
        status: 'live',            
        badge: 'Elite AI',          
        route: '/ats-xray',         
        buttonText: 'Scan Deep Structure 🚀',
        accent: '#10b981', 
        tags: ['Health Score', 'Red Flags', 'Auto-Rewrite'],
        stats: [{ label: 'Depth', value: 'Deep Scan' }, { label: 'Cost', value: 'Free' }]
    },
    {
        id: 'cover-letter',
        title: 'Pitch-Perfect Cover Letter',
        icon: '✉️',
        description: 'Hook recruiters instantly. Generate a highly targeted, hyper-personalized cover letter mapped perfectly to the JD.',
        status: 'live',
        badge: 'Live Now',
        route: '/cover-letter',
        buttonText: 'Draft Letter ✍️',
        accent: '#8b5cf6', // Vivid Purple
        tags: ['Context Aware', 'Hyper-Targeted'],
        stats: [{ label: 'Words', value: '~300' }, { label: 'Cost', value: '1 Token' }]
    },
    {
        id: 'mock-interview',
        title: 'AI Mock Interview',
        icon: '🎙️',
        description: 'Practice with an AI hiring manager. Generate rigorous, JD-specific technical and behavioral questions with ideal answers.',
        status: 'live',
        badge: 'Live Now',
        route: '/mock-interview',
        buttonText: 'Start Interview 🎤',
        accent: '#a855f7', // Purple to match the mic icon on the actual page
        tags: ['Behavioral', 'Technical', 'STAR Method'],
        stats: [{ label: 'Questions', value: '10' }, { label: 'Cost', value: '1 Token' }]
    },
    {
        id: 'linkedin',
        title: 'LinkedIn Optimizer',
        icon: '💼',
        description: 'Re-write your headline, About section, and experience to rank higher in LinkedIn Recruiter search algorithms.',
        status: 'live',
        badge: 'Live Now',
        route: '/linkedin-optimizer',
        buttonText: 'Optimize Profile ⚡',
        accent: '#0077b5', // LinkedIn Blue
        tags: ['Search Ranking', 'X-Y-Z Bullets', 'Creator Mode'],
        stats: [{ label: 'Impact', value: 'High' }, { label: 'Cost', value: '1 Token' }]
    },
    {
        id: 'roadmap',
        title: 'Career Roadmap',
        icon: '🗺️',
        description: 'Analyze your resume vs your dream job and get a week-by-week upskilling roadmap powered by AI.',
        status: 'live',
        badge: 'Live Now',
        route: '/career-roadmap',
        buttonText: 'Generate Roadmap 🧭',
        accent: '#f59e0b', // Amber
        tags: ['Upskilling', 'Milestones', 'Resource Links'],
        stats: [{ label: 'Timeline', value: '12 Weeks' }, { label: 'Cost', value: '1 Token' }]
    },
    {
        id: 'networking',
        title: 'Cold Outreach AI',
        icon: '🤝',
        description: 'Stop waiting for recruiters. Generate highly personalized LinkedIn connection requests and cold emails that guarantee replies.',
        status: 'live',
        badge: 'Live Now',
        route: '/cold-outreach',
        buttonText: 'Draft Outreach 📨',
        accent: '#ec4899', // Pink
        tags: ['Hook Generation', 'Follow-ups', 'Direct DM'],
        stats: [{ label: 'Reply Rate', value: '+40%' }, { label: 'Cost', value: '1 Token' }]
    },
    {
        id: 'referrals',
        title: 'Referral Generator',
        icon: '🔗',
        description: 'Craft the perfect message to ask for referrals from alumni and employees at top companies.',
        status: 'live',
        badge: 'Live Now',
        route: '/referrals',
        buttonText: 'Get Referrals 🎯',
        accent: '#14b8a6', // Teal
        tags: ['Alumni Network', 'High Conversion'],
        stats: [{ label: 'Success', value: 'High' }, { label: 'Cost', value: '1 Token' }]
    }
];

const FeaturesPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleWaitlistClick = (featureName: string) => {
        showToast(`VIP Access granted for ${featureName}. We'll notify you! 🎉`, 'success');
    };

    // OP LEVEL: 3D Magnetic Tilt Logic
    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        
        // Spotlight calculation
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 3D Tilt calculation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8; // Max tilt 8 deg
        const rotateY = ((x - centerX) / centerX) * 8;

        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
        target.style.setProperty('--rotate-x', `${rotateX}deg`);
        target.style.setProperty('--rotate-y', `${rotateY}deg`);
    }, []);

    const handleMouseLeave = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        target.style.setProperty('--rotate-x', `0deg`);
        target.style.setProperty('--rotate-y', `0deg`);
    }, []);

    return (
        <div className="page-container features-page">
            
            
            

            <main className="features-main-container">
                {/* Hero Section */}
                <header className="features-hero animate-fade-up">
                    <div className="glass-badge pulse-glow" style={{ borderColor: 'rgba(0, 229, 255, 0.5)', color: '#00e5ff', background: 'rgba(0, 229, 255, 0.1)' }}>
                        <span className="live-indicator"></span> 10 Core Modules Online
                    </div>
                    <h1 className="hero-title">
                        The Ultimate <span className="text-gradient">Arsenal.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Stop guessing. Start dominating. Deploy our suite of AI tools to bypass ruthless ATS algorithms, write killer cover letters, and crush your interviews.
                    </p>
                </header>

                {/* Interactive Bento Grid */}
                <div className="op-bento-grid">
                    {featuresList.map((feature, index) => (
                        <div 
                            key={feature.id} 
                            className={`op-feature-card ${feature.status === 'upcoming' ? 'card-locked' : ''}`}
                            style={{ '--card-accent': feature.accent, animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="spotlight-overlay"></div>
                            <div className="card-glass-panel">
                                
                                <div className="card-top-row">
                                    <div className="icon-wrapper" style={{ background: `${feature.accent}15`, border: `1px solid ${feature.accent}40`, color: feature.accent, textShadow: `0 0 20px ${feature.accent}` }}>
                                        {feature.icon}
                                    </div>
                                    <div className={`op-status-badge ${feature.status === 'live' ? 'live' : 'upcoming'}`} style={feature.status === 'live' ? {background: `${feature.accent}20`, color: feature.accent, border: `1px solid ${feature.accent}50`} : {}}>
                                        {feature.badge}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <h3 className="op-card-title">{feature.title}</h3>
                                    <p className="op-card-desc">{feature.description}</p>
                                    
                                    <div className="op-tags-row">
                                        {feature.tags.map((tag, i) => (
                                            <span key={i} className="op-tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="card-footer-divider"></div>
                                
                                <div className="card-bottom-row">
                                    <div className="op-stats">
                                        {feature.stats.map((stat, i) => (
                                            <div key={i} className="stat-block">
                                                <span className="stat-label">{stat.label}</span>
                                                <span className="stat-value" style={{ color: stat.label === 'Cost' && stat.value === 'Free' ? '#10b981' : 'var(--text-primary)' }}>{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        className={`op-action-btn ${feature.status === 'live' ? 'primary' : 'secondary'}`}
                                        onClick={() => feature.status === 'live' ? navigate(feature.route) : handleWaitlistClick(feature.title)}
                                        style={feature.status === 'live' ? { background: `linear-gradient(135deg, ${feature.accent}, #000)`, boxShadow: `0 4px 15px ${feature.accent}40` } : {}}
                                    >
                                        {feature.buttonText}
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </main>

            
        </div>
    );
};

export default FeaturesPage;
