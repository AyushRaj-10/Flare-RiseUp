import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Lock, ArrowRight, Cpu } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  // Inject the Spline Viewer script when the component mounts
  useEffect(() => {
    const scriptUrl = 'https://unpkg.com/@splinetool/viewer@1.12.6/build/spline-viewer.js';
    
    // Check if script is already added to avoid duplicates
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = scriptUrl;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      
      {/* 1. 3D BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <spline-viewer 
          url="https://prod.spline.design/f08UclQLADcCJ7Au/scene.splinecode"
          style={{ width: '100%', height: '100%' }} // Ensure it fills the screen
        ></spline-viewer>
      </div>

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0 pointer-events-none"></div>

      {/* 2. NAVBAR */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
           <div className="h-10 w-10 bg-cyber-green/20 rounded-lg border border-cyber-green flex items-center justify-center text-cyber-green backdrop-blur-md">
             <ShieldCheck />
           </div>
           <span className="text-2xl font-bold tracking-tighter">NOCAP<span className="text-cyber-green">SENTINAL</span></span>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/login')}
          className="px-6 py-2 border border-white/20 bg-white/5 backdrop-blur-md rounded-full text-sm font-mono hover:bg-white hover:text-black transition-all"
        >
          LOGIN / ACCESS VAULT
        </motion.button>
      </nav>

      {/* 3. HERO CONTENT */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-20 max-w-5xl pointer-events-none">
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-auto"
        >
          {/* ✅ FUNKY TAGLINE */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-green/30 bg-cyber-green/10 text-cyber-green text-xs font-mono mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            CYBER SHIELD ACTIVE | V1.0 STABLE
          </div>

          <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-6">
            SECURE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-cyber-blue">ASSETS <br />PERIOD.</span>
          </h1>

          {/* ✅ GEN Z DESCRIPTION */}
          <p className="text-lg text-gray-300 max-w-xl mb-10 font-mono leading-relaxed">
            Level up your docs. We're the secure vault mixing <span className="text-white font-bold">AI Forensics</span> and <span className="text-white font-bold">Web3 proof</span> so you know what's real. No cap.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* ✅ PUNCHY BUTTON */}
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-cyber-green text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(0,255,157,0.4)] transition-all flex items-center gap-2 group"
            >
              LET'S GO
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border border-white/30 rounded-lg hover:bg-white/10 backdrop-blur-md transition-all text-white">
              View Documentation
            </button>
          </div>
        </motion.div>

      </div>
      
      {/* 4. FOOTER STATS */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-0 w-full p-6 border-t border-white/10 bg-black/40 backdrop-blur-md z-20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400"
      >
         <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-blue/20 rounded text-cyber-blue"><Lock size={16}/></div>
            <div>
              <p className="text-white font-bold">LOCK IT DOWN 🔒</p>
              <p>Top-Notch data protection</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-green/20 rounded text-cyber-green"><Cpu size={16}/></div>
            <div>
              <p className="text-white font-bold">AI VIBE CHECK 🧠</p>
              <p>Automated fraud detection model</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded text-purple-400"><Zap size={16}/></div>
            <div>
              <p className="text-white font-bold">ON-CHAIN RECEIPTS 🔗</p>
              <p>Immutable ledger verification</p>
            </div>
         </div>
      </motion.div>

    </div>
  );
}