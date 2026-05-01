import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Shield, Zap, Globe, Cpu } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing Systems...');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Status message cycling
    const statusMessages = [
      'Initializing EcoTank Systems...',
      'Establishing Secure Uplink...',
      'Synchronizing SDG Data Matrix...',
      'Decrypting Neural Pathways...',
      'Activating Bio-Metrics...',
      'System Ready.'
    ];

    let messageIndex = 0;
    const messageTimer = setInterval(() => {
      messageIndex++;
      if (messageIndex < statusMessages.length) {
        setStatus(statusMessages[messageIndex]);
      } else {
        clearInterval(messageTimer);
      }
    }, 600);

    // GSAP Animations
    gsap.to('.loading-logo', {
      scale: 1.1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    gsap.to('.rotating-ring', {
      rotate: 360,
      duration: 8,
      repeat: -1,
      ease: "none"
    });

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      
      {/* Central Content */}
      <div className="relative flex flex-col items-center">
        {/* Decorative Rings */}
        <div className="rotating-ring absolute inset-[-40px] border border-emerald-500/10 rounded-full"></div>
        <div className="rotating-ring absolute inset-[-60px] border border-cyan-500/5 rounded-full" style={{ animationDirection: 'reverse', animationDuration: '12s' }}></div>
        
        {/* Logo/Icon Container */}
        <div className="loading-logo relative w-32 h-32 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent"></div>
           <img 
             src={`${import.meta.env.BASE_URL}logo.png`} 
             alt="Logo" 
             className="w-16 h-16 object-contain relative z-10"
             onError={(e) => { e.target.style.display = 'none'; }} 
           />
           {/* Fallback if logo fails */}
           <Globe className="w-16 h-16 text-emerald-400 absolute opacity-20" />
        </div>

        {/* Progress Text */}
        <div className="mt-12 text-center">
          <div className="text-4xl font-black text-white mb-2 tracking-tighter">
            {progress}<span className="text-emerald-500">%</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold animate-pulse">
            {status}
          </div>
        </div>
      </div>

      {/* Futuristic Progress Bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-slate-900 rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Floating Tech Icons */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <Shield className="absolute top-1/4 left-1/4 w-4 h-4 text-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
         <Zap className="absolute bottom-1/3 right-1/4 w-5 h-5 text-cyan-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
         <Cpu className="absolute top-1/3 right-1/3 w-4 h-4 text-emerald-400 animate-bounce" style={{ animationDelay: '0.8s' }} />
      </div>
    </div>
  );
}
