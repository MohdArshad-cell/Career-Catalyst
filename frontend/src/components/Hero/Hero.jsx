import React from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Activity, FileCheck, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { MagneticButton } from "./MagneticButton";
import { NetworkBackground } from "./NetworkBackground";
import { Terminal } from "./Terminal";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  // Mockup Parallax (moves opposite to mouse)
  const mockupX = useTransform(springX, [-1, 1], ["1%", "-1%"]);
  const mockupY = useTransform(springY, [-1, 1], ["1%", "-1%"]);
  
  // Floating badges parallax
  const badge1X = useTransform(springX, [-1, 1], ["3%", "-3%"]);
  const badge2X = useTransform(springX, [-1, 1], ["-4%", "4%"]);
  const badge3Y = useTransform(springY, [-1, 1], ["-3%", "3%"]);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize from -1 to 1
    mouseX.set((clientX / innerWidth) * 2 - 1);
    mouseY.set((clientY / innerHeight) * 2 - 1);
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden pt-32 pb-16 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center min-h-screen"
    >
      {/* HTML5 Interactive Neural Network Background */}
      <NetworkBackground />

      <div className="absolute top-0 w-full max-w-3xl h-[500px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 left-1/2 -translate-x-1/2" />

      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-left flex flex-col items-start relative z-20 pt-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Targeted for Ambitious Professionals
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6 md:mb-8 leading-[1.1]">
            Turn Ghosted Applications into <br className="hidden md:block" />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-[length:200%_auto] ${shouldReduceMotion ? '' : 'animate-[shimmer_3s_linear_infinite]'} drop-shadow-[0_0_40px_rgba(45,212,191,0.4)]`}>
              Career Catalyst.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-400 mb-8 md:mb-12 max-w-lg leading-relaxed font-light">
            We re-engineer your digital footprint so recruiters find you, not the other way around. Tailored for the global job market.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-8 w-full max-w-md">
            <MagneticButton href="/pricing" className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600/20 text-indigo-300 hover:text-white font-mono uppercase tracking-widest text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] w-full sm:w-auto z-20 group overflow-hidden">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[300%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(99,102,241,1)_360deg)] ${shouldReduceMotion ? '' : 'animate-[spin_2s_linear_infinite]'} z-0`} />
              <div className="absolute inset-[2px] bg-[#1e1b4b] group-hover:bg-[#312e81] rounded-[14px] z-0 transition-colors" />
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full ${shouldReduceMotion ? '' : 'group-hover:animate-[shimmer_1.5s_infinite]'} z-10 rounded-[14px]`} />
              <span className="relative z-20 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </MagneticButton>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-mono uppercase tracking-widest text-sm rounded-2xl transition-all border border-white/10 hover:border-white/20 hover:-translate-y-1 w-full sm:w-auto">
              View Packages
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-12">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center shadow-lg relative z-[${4-i}]`}>
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-zinc-400">
              Trusted by <span className="text-white font-bold">100+</span> professionals
            </div>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-10 text-sm font-mono tracking-wider text-zinc-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400 drop-shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
              <span>100% ATS Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400 drop-shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
              <span>48-Hour Turnaround</span>
            </div>
          </div>
        </motion.div>

        {/* Futuristic Glowing Mockup with Floating Badges */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
          style={{
            perspective: "2000px",
            ...(shouldReduceMotion ? {} : { x: mockupX, y: mockupY })
          }}
          className="relative w-full max-w-xl mx-auto mt-16 lg:mt-0"
        >
          {/* Floating Badge 1: ATS Score */}
          <motion.div 
            style={shouldReduceMotion ? {} : { x: badge1X }}
            animate={shouldReduceMotion ? {} : { y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-12 z-30 hidden md:flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider mb-1">ATS Match</div>
              <div className="text-emerald-400 font-bold text-xl leading-none">99/100</div>
            </div>
          </motion.div>

          {/* Floating Badge 2: Recruiter Index */}
          <motion.div 
            style={shouldReduceMotion ? {} : { x: badge2X }}
            animate={shouldReduceMotion ? {} : { y: [15, -15, 15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-16 -right-12 z-30 hidden md:flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider mb-1">Visibility</div>
              <div className="text-indigo-400 font-bold text-xl leading-none">+420%</div>
            </div>
          </motion.div>

          {/* Floating Badge 3: Target Match */}
          <motion.div 
            style={shouldReduceMotion ? {} : { y: badge3Y }}
            animate={shouldReduceMotion ? {} : { y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-10 left-8 z-30 hidden lg:flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
              <Target className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider mb-1">Keywords Optimized</div>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-1.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Live Typing Terminal */}
          <Terminal />

          {/* 3D Orbiting Tech Logos */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[120%] md:h-[120%] lg:w-[150%] lg:h-[150%] pointer-events-none z-0 scale-75 md:scale-100 opacity-60">
            <div className={`w-full h-full ${shouldReduceMotion ? '' : 'animate-[spin_40s_linear_infinite]'} rounded-full border border-white/5 relative`}>
               {/* META - Top */}
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-10" style={shouldReduceMotion ? {} : { animation: "spin 40s linear infinite reverse" }}>
                 <div className="w-full h-full flex items-center justify-center font-bold tracking-widest text-sm bg-zinc-950/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl text-blue-500">META</div>
               </div>
               {/* GOOGLE - Right */}
               <div className="absolute top-1/2 -right-14 -translate-y-1/2 w-28 h-10" style={shouldReduceMotion ? {} : { animation: "spin 40s linear infinite reverse" }}>
                 <div className="w-full h-full flex items-center justify-center font-bold tracking-widest text-sm bg-zinc-950/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl text-red-400">GOOGLE</div>
               </div>
               {/* STRIPE - Bottom */}
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-10" style={shouldReduceMotion ? {} : { animation: "spin 40s linear infinite reverse" }}>
                 <div className="w-full h-full flex items-center justify-center font-bold tracking-widest text-sm bg-zinc-950/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl text-indigo-400">STRIPE</div>
               </div>
               {/* NETFLIX - Left */}
               <div className="absolute top-1/2 -left-14 -translate-y-1/2 w-28 h-10" style={shouldReduceMotion ? {} : { animation: "spin 40s linear infinite reverse" }}>
                 <div className="w-full h-full flex items-center justify-center font-bold tracking-widest text-sm bg-zinc-950/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl text-red-600">NETFLIX</div>
               </div>
            </div>
          </div>

          <motion.div 
            whileHover={shouldReduceMotion ? {} : { rotateX: 2, rotateY: -2 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.15)] bg-black/50 backdrop-blur-xl z-20"
            style={{ transformOrigin: "center center" }}
          >
            {/* Animated Scanning Line */}
            <motion.div 
              animate={shouldReduceMotion ? { top: "50%" } : { top: ["-10%", "110%"] }}
              transition={shouldReduceMotion ? {} : { duration: 3, repeat: Infinity, ease: "linear" }}
              className={`absolute left-0 w-full h-[2px] bg-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.8)] z-20 pointer-events-none ${shouldReduceMotion ? 'hidden' : ''}`}
            />
            
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            <img
              src="/hero-mockup.png"
              alt="Resume Transformation from Word to LaTeX"
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
