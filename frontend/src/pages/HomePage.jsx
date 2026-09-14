import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown, CheckCircle2, MessageCircle } from 'lucide-react';
import '../App.css';

import { supabase } from '../supabaseClient';
import { Hero } from '../components/Hero/Hero';

/* ─────────────── DATA ─────────────── */

const faqData = [
    {
        question: "Is my resume data private and secure?",
        answer: "Yes. We prioritize your privacy above all else. Your data is processed securely and is never shared with third parties."
    },
    {
        question: "Do I need to be a design expert to use this?",
        answer: "Not at all! Our tools and templates guide you step-by-step, making professional design accessible to everyone."
    },
    {
        question: "How is this better than a generic template?",
        answer: "Generic templates are static. Career Catalyst is dynamic. Our AI tools actively help you write more effective content tailored to the specific job you want."
    },
    {
        question: "How do tokens work?",
        answer: "Tokens are our platform currency. You get free tokens on signup, and can purchase more as needed. Each AI generation (tailoring, evaluating) costs 1 token."
    },
    {
        question: "Can I get a refund?",
        answer: "We offer a 7-day money-back guarantee on all unused token packages. If you're not satisfied, just email support."
    },
    {
        question: "What file formats do you support?",
        answer: "Currently, we support PDF and raw text uploads. Our AI outputs can be downloaded as optimized PDFs or copied to your clipboard."
    }
];

const testimonials = [
    { name: "Priya S.", role: "Software Engineer @ Google", text: "A game-changer. I went from zero replies to three interviews in a week! The ATS score helped me see exactly what was missing.", initial: "P" },
    { name: "Michael T.", role: "Marketing Manager", text: "The Bullet Rewriter turned my boring daily tasks into actual measurable achievements. Highly recommend!", initial: "M" },
    { name: "Sarah L.", role: "Recent Graduate", text: "I didn't know how to write a cover letter. The AI generated one that matched my resume perfectly. Got the job!", initial: "S" },
    { name: "David K.", role: "Product Manager @ Meta", text: "The Career Roadmap AI gave me a clear 3-month plan to transition into Product. Better than any career coach I've paid.", initial: "D" }
];

const features = [
    { icon: "🎯", title: "AI Resume Tailor", desc: "Micro-tailor your resume for any specific Job Description in under 12 seconds. Outputs a pixel-perfect ATS-friendly LaTeX PDF.", tag: "1 Token" },
    { icon: "🔥", title: "Brutal ATS Scanner", desc: "Find out exactly why you're getting rejected. Zero sugarcoating. Get a harsh score and fix weak bullets instantly.", tag: "1 Token" },
    { icon: "✉️", title: "Cover Letter Generator", desc: "Hook recruiters instantly with a hyper-personalized cover letter mapped perfectly to the job description.", tag: "1 Token" },
    { icon: "🎤", title: "Mock Interview AI", desc: "Practice with AI-generated questions tailored to your target role. Get feedback on your answers in real time.", tag: "1 Token" },
    { icon: "💼", title: "LinkedIn Optimizer", desc: "Re-write your headline, About section, and experience to rank higher in LinkedIn Recruiter search algorithms.", tag: "1 Token" },
    { icon: "🗺️", title: "Career Roadmap", desc: "Analyze your resume vs your dream job and get a week-by-week upskilling roadmap powered by AI.", tag: "1 Token" }
];

const freeTools = [
    { icon: "✨", title: "Bullet Rewriter", desc: "Turn weak resume tasks into metric-driven achievements.", path: "/bullet-rewriter" },
    { icon: "🎯", title: "Job Fit Score", desc: "Instantly score your resume against any job description.", path: "/job-fit" },
    { icon: "📝", title: "Resignation Letter", desc: "Draft professional resignation letters in any tone.", path: "/resignation-letter" },
    { icon: "🔍", title: "Resume Diff", desc: "See exactly what changed between resume versions.", path: "/resume-diff" }
];

/* ─────────────── HOMEPAGE COMPONENT ─────────────── */

const HomePage = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
    const [user, setUser] = useState(null);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    // Testimonial auto-rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auth check
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const launchTools = () => {
        navigate(user ? '/ai-tools' : '/login');
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const SectionHeader = ({ eyebrow, title, subtitle }) => (
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono uppercase tracking-widest mb-6"
            >
                <Sparkles className="w-3 h-3" />
                {eyebrow}
            </motion.div>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight"
            >
                {title}
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed"
            >
                {subtitle}
            </motion.p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030303] text-white overflow-hidden flex flex-col selection:bg-indigo-500/30">
                                    
            {/* ────────── 1. HERO ────────── */}
            <Hero />

            {/* ────────── 2. ELITE MARQUEE ────────── */}
            <section className="border-y border-white/5 py-6 bg-white/[0.01] backdrop-blur-sm relative z-20">
                <div className="flex items-center">
                    <div className="hidden md:flex gap-4 items-center pl-8 pr-4 text-xs font-mono text-zinc-500 tracking-[0.2em] whitespace-nowrap">
                        ENGINEERS PLACED AT <span className="ml-4 text-zinc-700">|</span>
                    </div>
                    <div className="flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                        <motion.div 
                            className="flex gap-12 md:gap-20 items-center w-max text-xl md:text-2xl font-bold text-zinc-600 tracking-wider"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        >
                            {/* Duplicate logos to create seamless infinite loop */}
                            {['Google', 'Meta', 'Stripe', 'Netflix', 'Amazon', 'ByteDance', 'Databricks', 'Google', 'Meta', 'Stripe', 'Netflix', 'Amazon', 'ByteDance', 'Databricks'].map((logo, i) => (
                                <span key={i} className="hover:text-zinc-400 transition-colors cursor-default">{logo}</span>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ────────── 3. FEATURES SHOWCASE ────────── */}
            <section className="py-24 md:py-32 relative z-20">
                <SectionHeader 
                    eyebrow="Premium AI Toolkit" 
                    title="Everything You Need to Land the Job"
                    subtitle="A complete suite of AI-powered tools, each designed for a specific step in your job search."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative group rounded-3xl p-8 bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 transition-all duration-500 overflow-hidden cursor-pointer ${i === 0 ? 'md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-black' : ''}`}
                            onClick={launchTools}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="text-4xl mb-6 transform group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500">{f.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">{f.desc}</p>
                                <div className="inline-flex items-center self-start px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium">
                                    {f.tag}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ────────── 4. BEFORE VS AFTER ────────── */}
            <section className="py-24 relative z-20 bg-black/40 border-y border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
                
                <SectionHeader 
                    eyebrow="The Proof" 
                    title="Why You're Getting Ghosted"
                    subtitle="See how our AI transforms a generic resume into an interview magnet."
                />

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6 relative">
                    {/* VS Badge */}
                    <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900 border border-white/10 items-center justify-center font-bold text-sm z-30 shadow-2xl">
                        VS
                    </div>

                    {/* Before */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 md:p-10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 px-5 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-bl-xl tracking-widest uppercase border-b border-l border-red-500/20">
                            Before (Weak)
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" /> 
                            Generic Output
                        </h3>
                        <div className="space-y-3 text-zinc-400 italic text-[15px] leading-relaxed pb-8 border-b border-red-500/10 mb-8">
                            <p>• Managed social media accounts for the company.</p>
                            <p>• Worked on a team to build a new feature.</p>
                            <p>• Handled customer complaints and issues.</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-red-400 font-medium">ATS Score</span>
                                <span className="text-red-400 font-bold">32% - Rejected</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-red-500/10 overflow-hidden border border-red-500/20">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: "32%" }} className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* After */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 md:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.05)]"
                    >
                        <div className="absolute top-0 right-0 px-5 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-bl-xl tracking-widest uppercase border-b border-l border-emerald-500/30 backdrop-blur-md">
                            After (AI Tailored)
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> 
                            XYZ Framework
                        </h3>
                        <div className="space-y-4 text-zinc-200 text-[15px] leading-relaxed pb-8 border-b border-emerald-500/20 mb-8">
                            <p>• Spearheaded a <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">social media strategy</span> that increased engagement by 140% across 3 platforms.</p>
                            <p>• Architected a highly scalable microservice using <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">React & Node</span>, reducing load times by 2.1s.</p>
                            <p>• Resolved 50+ tier-3 <span className="text-emerald-400 font-bold">customer issues</span> weekly with a 98% CSAT score.</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-emerald-400 font-medium">ATS Score</span>
                                <span className="text-emerald-400 font-bold">95% - Interview!</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-emerald-500/10 overflow-hidden border border-emerald-500/20">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    whileInView={{ width: "95%" }} 
                                    transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }} 
                                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" 
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ────────── 5. HOW IT WORKS ────────── */}
            <section className="py-24 md:py-32 relative z-20">
                <SectionHeader 
                    eyebrow="Simple 3-Step Process" 
                    title="How It Works"
                    subtitle="Go from application to interview in under 60 seconds."
                />
                
                <div className="max-w-5xl mx-auto px-6 relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />
                    
                    <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative z-10">
                        {[
                            { step: "1", icon: "📄", title: "Upload Resume", desc: "Paste your existing resume text or upload a PDF — our parser handles the rest." },
                            { step: "2", icon: "📋", title: "Add Job Description", desc: "Drop in the JD you're targeting. Our AI analyzes every keyword and requirement." },
                            { step: "3", icon: "🚀", title: "Get Tailored PDF", desc: "Download a pixel-perfect, ATS-optimized LaTeX resume in under 12 seconds." }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="flex flex-col items-center text-center relative group"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-xl relative overflow-hidden group-hover:border-cyan-500/50 transition-colors">
                                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10">{item.icon}</span>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 text-black text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ────────── 6. WHO IS THIS FOR ────────── */}
            <section className="py-24 relative z-20 bg-zinc-950/50">
                <SectionHeader 
                    eyebrow="Built For You" 
                    title="Who Is This For?"
                    subtitle="Whether you're just starting out or leveling up, we've got you covered."
                />

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
                    {[
                        { icon: "🎓", title: "Students & Grads", desc: "Land your first internship or entry-level role with a resume that actually gets past the ATS.", color: "from-blue-500/20 to-blue-900/20", border: "border-blue-500/20" },
                        { icon: "🔄", title: "Career Changers", desc: "Reframe your existing experience to match a completely new industry or role with AI assistance.", color: "from-purple-500/20 to-purple-900/20", border: "border-purple-500/20" },
                        { icon: "🏆", title: "Senior Professionals", desc: "Optimize your resume for leadership and executive roles at top-tier companies.", color: "from-amber-500/20 to-amber-900/20", border: "border-amber-500/20" }
                    ].map((persona, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className={`rounded-3xl p-8 bg-gradient-to-b ${persona.color} border ${persona.border} backdrop-blur-sm text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 shadow-2xl`}
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-inner">
                                {persona.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{persona.title}</h3>
                            <p className="text-zinc-300 text-sm leading-relaxed">{persona.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ────────── 7. TESTIMONIALS ────────── */}
            <section className="py-24 md:py-32 relative z-20">
                <SectionHeader 
                    eyebrow="Real Results" 
                    title="What Our Users Say"
                    subtitle="Hear from real job seekers who landed interviews using Career Catalyst."
                />

                <div className="max-w-4xl mx-auto px-6">
                    <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 overflow-hidden min-h-[400px] flex flex-col justify-center shadow-2xl backdrop-blur-sm">
                        <div className="absolute top-8 left-8 text-6xl text-white/5 font-serif">"</div>
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={currentTestimonial}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="relative z-10 text-center"
                            >
                                <p className="text-xl md:text-2xl text-zinc-300 font-light italic leading-relaxed mb-8">
                                    "{testimonials[currentTestimonial].text}"
                                </p>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {testimonials[currentTestimonial].initial}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{testimonials[currentTestimonial].name}</div>
                                        <div className="text-sm text-indigo-400">{testimonials[currentTestimonial].role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentTestimonial(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentTestimonial ? 'bg-indigo-500 w-6' : 'bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ────────── 8. FREE TOOLS ────────── */}
            <section className="py-24 relative z-20 bg-black/50 border-t border-white/5">
                <SectionHeader 
                    eyebrow="No Signup Required" 
                    title="Start with Free Tools"
                    subtitle="Try these powerful tools right now — no account or payment needed."
                />

                <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto px-6">
                    {freeTools.map((tool, i) => (
                        <Link to={tool.path} key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group h-full rounded-2xl p-6 bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden relative cursor-pointer flex flex-col"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <div className="text-3xl mb-4 relative z-10 transform group-hover:scale-110 transition-transform origin-left">{tool.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2 relative z-10 group-hover:text-cyan-300 transition-colors">{tool.title}</h3>
                                <p className="text-zinc-500 text-sm mb-6 relative z-10 flex-grow">{tool.desc}</p>
                                <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] uppercase tracking-widest font-bold relative z-10 border border-cyan-500/20">
                                    Free Forever
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ────────── 9. FAQ ────────── */}
            <section className="py-24 md:py-32 relative z-20">
                <SectionHeader 
                    eyebrow="Got Questions?" 
                    title="Frequently Asked Questions"
                    subtitle="Everything you need to know about Career Catalyst."
                />

                <div className="max-w-3xl mx-auto px-6 space-y-4">
                    {faqData.map((item, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${openFaq === index ? 'bg-white/[0.05] border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                        >
                            <button 
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-bold text-white pr-4">{item.question}</span>
                                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 shrink-0 ${openFaq === index ? 'rotate-180 text-white' : ''}`} />
                            </button>
                            <div 
                                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ────────── 10. ELITE WHATSAPP CTA ────────── */}
            <section className="py-32 relative z-20 border-t border-white/5 bg-gradient-to-b from-transparent to-indigo-950/20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        Ready to transform your applications?
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
                    >
                        Join <span className="text-white font-bold">100+ engineers</span> who stopped getting ghosted and landed their dream roles.
                    </motion.p>
                    
                    <motion.a 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        href="https://wa.me/917887096421" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        <MessageCircle className="w-6 h-6 text-emerald-500" />
                        <div className="text-left">
                            <div className="text-sm text-zinc-600 font-medium">Chat on WhatsApp</div>
                            <div className="text-lg">+91 7887096421</div>
                        </div>
                    </motion.a>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="mt-16"
                    >
                        <div className="text-xs font-mono tracking-widest text-zinc-600 uppercase mb-6">Trusted Payment Partners</div>
                        <div className="flex justify-center items-center gap-8 md:gap-12 text-zinc-500 font-bold text-xl opacity-50">
                            <span>Stripe</span>
                            <span>PayPal</span>
                            <span>Razorpay</span>
                        </div>
                    </motion.div>
                </div>
            </section>

                    </div>
    );
};

export default HomePage;
