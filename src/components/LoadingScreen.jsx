import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield, Zap, Globe, Cpu, Terminal, Code, Binary } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing Systems...');
  const [hexCodes, setHexCodes] = useState([]);
  const screenRef = useRef(null);

  useEffect(() => {
    // Generate random hex codes for the "Neural Stream"
    const codes = Array.from({ length: 20 }, () => 
      Math.random().toString(16).substring(2, 8).toUpperCase()
    );
    setHexCodes(codes);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1200);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    const statusMessages = [
      'BOOTING ECO-KERNEL v4.2.0...',
      'OVERCLOCKING NEURAL CORES...',
      'ESTABLISHING QUANTUM UPLINK...',
      'INJECTING SDG PAYLOADS...',
      'BYPASSING BIO-SECURITY...',
      'SYSTEMS OPTIMIZED.'
    ];

    let messageIndex = 0;
    const messageTimer = setInterval(() => {
      messageIndex++;
      if (messageIndex < statusMessages.length) {
        setStatus(statusMessages[messageIndex]);
      } else {
        clearInterval(messageTimer);
      }
    }, 500);

    // High-energy animations
    gsap.to('.scan-line', {
      top: '100%',
      duration: 2.5,
      repeat: -1,
      ease: "power1.inOut"
    });

    gsap.to('.hex-code', {
      y: -100,
      opacity: 0,
      duration: 'random(2, 4)',
      repeat: -1,
      stagger: 0.1,
      ease: "none"
    });

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, [onComplete]);

  return (
    <div ref={screenRef} className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-10">
         <div className="scan-line absolute top-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent z-50"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
      </div>

      {/* Hex Data Stream */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 flex justify-around items-end">
         {hexCodes.map((code, i) => (
           <div key={i} className="hex-code text-[10px] text-emerald-500/40 font-bold" style={{ left: `${i * 5}%` }}>
             {code}
           </div>
         ))}
      </div>

      {/* Radial Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>

      {/* Central Tech Core */}
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="absolute inset-[-60px] border-[2px] border-emerald-500/10 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-[-80px] border border-cyan-500/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        
        {/* Logo Shield */}
        <div className="relative group">
           <div className="absolute inset-[-10px] bg-emerald-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="w-32 h-32 bg-slate-900 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.1)] relative overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-cyan-500/10"></div>
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`} 
                alt="Logo" 
                className="w-16 h-16 object-contain relative z-10 brightness-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              <Binary className="w-20 h-20 text-emerald-500 absolute opacity-5 animate-pulse" />
           </div>
        </div>

        {/* Progress Terminal */}
        <div className="mt-16 w-80">
          <div className="flex justify-between items-end mb-2">
            <div className="text-[10px] text-emerald-500/60 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
              <Terminal className="w-3 h-3" /> System Status
            </div>
            <div className="text-2xl font-black text-white tracking-tighter">
              {progress}<span className="text-emerald-500 text-sm ml-1">%</span>
            </div>
          </div>
          
          {/* Detailed Progress Bar */}
          <div className="h-[4px] w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] relative"
              style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
            >
               <div className="absolute top-0 right-0 h-full w-[20px] bg-white opacity-40 blur-sm"></div>
            </div>
          </div>

          {/* Glitch Status Message */}
          <div className="mt-4 text-center">
            <div className="text-[9px] uppercase tracking-[0.5em] text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
              {status}
            </div>
          </div>
        </div>
      </div>

      {/* Peripheral Data */}
      <div className="absolute bottom-10 left-10 text-[8px] text-slate-700 uppercase tracking-widest leading-relaxed hidden md:block">
         [ AUTH_LEVEL: OVERRIDE ]<br/>
         [ ENCRYPTION: AES-256 ]<br/>
         [ TARGET: SJEC_RESOURCES ]
      </div>

      <div className="absolute bottom-10 right-10 flex gap-4 opacity-30">
         <div className="w-8 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/2 animate-[shimmer_2s_infinite]"></div>
         </div>
         <div className="w-8 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-3/4 animate-[shimmer_3s_infinite]"></div>
         </div>
      </div>
    </div>
  );
}
