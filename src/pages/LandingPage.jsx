import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Leaf, Globe2, Cpu, Sparkles, ShieldCheck, Microscope, Database, Zap } from 'lucide-react';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const sectionsRef = useRef([]);
  const [platformSettings, setPlatformSettings] = React.useState({ showJudges: false });

  useEffect(() => {
    // Elegant fade-ins
    gsap.fromTo('.hero-content', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );
    
    gsap.fromTo('.hero-golem', 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out", delay: 0.2 }
    );

    gsap.to('.hero-golem img', { y: -20, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });

    sectionsRef.current.forEach((section) => {
      if (section) {
        gsap.fromTo(section, 
          { opacity: 0, y: 40 }, 
          { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 80%" } }
        );
      }
    });

    async function fetchSettings() {
      try {
        const sDoc = await getDoc(doc(db, 'settings', 'platform'));
        if (sDoc.exists()) setPlatformSettings(sDoc.data());
      } catch (e) { console.error(e); }
    }
    fetchSettings();

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="bg-slate-950 text-slate-50 overflow-hidden font-sans min-h-screen">
      {/* Subtle Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Modern Floating Header Pill */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EcoVex Logo" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-lg font-bold tracking-wide">EcoTank</span>
          </div>
          <div className="flex gap-6 items-center">
            <Link to="/rulebook" className="text-sm font-medium text-slate-300 hover:text-white transition">Rulebook</Link>
            <Link to="/login" className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 hover:from-emerald-300 hover:to-cyan-300 rounded-full px-6 py-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">Log In</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="hero-content text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold mb-6 tracking-wide text-xs uppercase shadow-[0_0_15px_rgba(16,185,129,0.15)]">
               <Sparkles className="w-4 h-4" />
               Ideathon 2026
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300">Innovate.</span>
              <span className="block text-slate-100">Sustain.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Conquer.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed font-light">
              Join the ultimate team-based ideathon. Pitch your breakthrough eco-tech solutions and forge a legacy perfectly aligned with the 17 SDGs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Link to="/login" className="flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-extrabold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] hover:opacity-90 shadow-[0_0_30px_rgba(16,185,129,0.4)] w-full sm:w-auto">
                 Log In <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>

          <div className="hero-golem relative flex justify-center items-center min-h-[400px]">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-full blur-[80px] animate-pulse pointer-events-none"></div>
             <img 
               src={`${import.meta.env.BASE_URL}mascot-main.webp`} 
               alt="Main Mascot" 
               className="w-[120%] max-w-[600px] object-contain relative z-10 mix-blend-screen" 
               style={{
                 maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0) 80%)',
                 WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0) 80%)'
               }}
               onError={(e) => e.target.style.display='none'} 
             />
          </div>
        </div>
      </section>

      {/* The 17 SDGs */}
      <section ref={el => sectionsRef.current[0] = el} className="py-24 relative">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <Globe2 className="w-16 h-16 text-cyan-400 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">The 17 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">SDGs</span></h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed mb-12">
              EcoTank challenges you to design sustainable infrastructure, renewable energy systems, and climate action technologies.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-900/40 p-6 border border-emerald-500/20 rounded-2xl hover:border-emerald-500/50 transition-colors">
                 <div className="text-emerald-400 font-black text-4xl mb-2">06</div>
                 <div className="text-sm font-medium text-slate-300 uppercase tracking-wide">Clean Water & Sanitation</div>
              </div>
              <div className="bg-slate-900/40 p-6 border border-orange-500/20 rounded-2xl hover:border-orange-500/50 transition-colors">
                 <div className="text-orange-400 font-black text-4xl mb-2">07</div>
                 <div className="text-sm font-medium text-slate-300 uppercase tracking-wide">Clean<br/>Energy</div>
              </div>
              <div className="bg-slate-900/40 p-6 border border-cyan-500/20 rounded-2xl hover:border-cyan-500/50 transition-colors">
                 <div className="text-cyan-400 font-black text-4xl mb-2">13</div>
                 <div className="text-sm font-medium text-slate-300 uppercase tracking-wide">Climate<br/>Action</div>
              </div>
              <div className="bg-slate-900/40 p-6 border border-lime-500/20 rounded-2xl hover:border-lime-500/50 transition-colors">
                 <div className="text-lime-400 font-black text-4xl mb-2">15</div>
                 <div className="text-sm font-medium text-slate-300 uppercase tracking-wide">Life on<br/>Land</div>
              </div>
            </div>
         </div>
      </section>

      {/* Guardians */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6" ref={el => sectionsRef.current[1] = el}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The Elemental Guardians</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">Meet our mascots. They represent the primal forces defending the 17 Sustainable Development Goals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Earth */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-emerald-500/50 transition-all group backdrop-blur-sm">
                 <img src={`${import.meta.env.BASE_URL}mascot-earth.webp`} alt="Earth" className="w-full h-48 object-contain mb-6 filter group-hover:-translate-y-2 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-2xl font-bold mb-3 text-emerald-400">Earth Golem</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-light">Embodying SDG 11 & 15: Sustainable Cities, structure resilience, and Life on Land conservation.</p>
            </div>
            
            {/* Fire */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-orange-500/50 transition-all group backdrop-blur-sm">
                 <img src={`${import.meta.env.BASE_URL}mascot-fire.webp`} alt="Fire" className="w-full h-48 object-contain mb-6 filter group-hover:-translate-y-2 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-2xl font-bold mb-3 text-orange-400">Fire Golem</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-light">Championing SDG 7: Access to affordable, reliable, sustainable, and modern renewable energy.</p>
            </div>

            {/* Water */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-blue-500/50 transition-all group backdrop-blur-sm">
                 <img src={`${import.meta.env.BASE_URL}mascot-water.webp`} alt="Water" className="w-full h-48 object-contain mb-6 filter group-hover:-translate-y-2 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-2xl font-bold mb-3 text-blue-400">Water Golem</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-light">Guarding SDG 6 & 14: Clean Water filtration networks and the preservation of Life Below Water.</p>
            </div>

            {/* Wind */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all group backdrop-blur-sm">
                 <img src={`${import.meta.env.BASE_URL}mascot-wind.webp`} alt="Wind" className="w-full h-48 object-contain mb-6 filter group-hover:-translate-y-2 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-2xl font-bold mb-3 text-cyan-400">Wind Golem</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-light">Advocating SDG 13: Urgent climate action, carbon atmosphere capture, and sky purification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={el => sectionsRef.current[2] = el} className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <Cpu className="w-16 h-16 text-emerald-400 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight">Timeline</h2>
            
            <div className="space-y-6">
               {[
                 { phase: "01", title: "Registration Opens", desc: "Team formation phase begins. Gather your leaders and members in the central hub." },
                 { phase: "02", title: "Draft Submissions", desc: "Submit your initial pitch deck (PDF) outlining the problem and proposed eco-tech solution." },
                 { phase: "03", title: "Grand Finale", desc: "Live offline presentations and intense Q&A sessions with the judging panel." }
               ].map((item, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row text-left gap-6 items-center bg-slate-900/50 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition-all backdrop-blur-sm">
                    <div className="text-emerald-500/20 text-5xl md:text-6xl font-black">{item.phase}</div>
                    <div className="flex-1">
                       <h3 className="text-2xl font-bold mb-2 tracking-tight">{item.title}</h3>
                       <p className="text-slate-400 font-light text-lg">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
        </div>
      </section>

      {/* Partners & Organizers */}
      <section className="py-24 relative overflow-hidden bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Judges Section (Conditionally Revealed) */}
          {platformSettings.showJudges && (
            <div className="text-center mb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <h2 className="text-3xl font-bold mb-4 tracking-tight text-emerald-400 uppercase tracking-[0.3em]">The Judges</h2>
               <p className="text-slate-400 mb-16 max-w-2xl mx-auto font-light">The panel of experts who will evaluate your breakthrough technologies on the final day.</p>
               
               <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                 {[
                   { name: "Dr. Elena Vance", role: "Sustainability Expert" },
                   { name: "Prof. Marcus Thorne", role: "Renewable Systems" },
                   { name: "Sarah Mitchell", role: "VC / Eco-Tech" },
                   { name: "James Holden", role: "Policy Advisor" },
                   { name: "Dr. Anya Kovar", role: "Environmental Sci." }
                 ].map((judge, i) => (
                   <div key={i} className="flex flex-col items-center group">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-6 group-hover:border-emerald-500/50 group-hover:bg-slate-800 transition-all duration-500 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <ShieldCheck className="w-10 h-10 text-slate-700 group-hover:text-emerald-500/50 transition-colors" />
                      </div>
                      <h4 className="text-white font-bold text-sm mb-1">{judge.name}</h4>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest">{judge.role}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Partner Singular */}
          <div className="text-center mb-32">
            <h2 className="text-3xl font-bold mb-20 tracking-tight text-slate-300 uppercase tracking-[0.2em]">Our Partner</h2>
            <div className="inline-block bg-slate-900/40 border border-white/5 p-12 rounded-3xl backdrop-blur-sm hover:border-emerald-500/30 transition-all group shadow-2xl">
              <img 
                src={`${import.meta.env.BASE_URL}sceptix.png`} 
                alt="Sceptix Logo" 
                className="w-40 sm:w-52 h-auto object-contain transition-all duration-500" 
              />
            </div>
          </div>

          {/* Organizers */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-24 tracking-tight text-slate-300 uppercase tracking-[0.2em]">Organizers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                { name: "Sarah Jenkins", role: "Community Manager", img: "ashley.png" },
                { name: "David Miller", role: "Technical Advisor", img: "santhsim.png" },
                { name: "Michael Chen", role: "Marketing Head", img: "jeethan.png" }
              ].map((org, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-slate-800 group-hover:border-emerald-500/50 transition-all duration-500 mb-6 shadow-2xl">
                    <img 
                      src={`${import.meta.env.BASE_URL}${org.img}`} 
                      alt={org.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{org.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">{org.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Architectural Footer */}
      <footer className="relative bg-slate-950 border-t border-white/5 pt-24 pb-8 overflow-hidden">
        {/* Glow behind footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 text-left">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                 <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EcoVex Logo" className="w-10 h-10 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                 <span className="text-2xl font-bold tracking-wide text-white">EcoTank</span>
              </div>
              <p className="text-slate-400 font-light leading-relaxed max-w-sm mb-8">
                The ultimate hackathon platform built for elite engineers ready to solve ecological crises. Target the 17 SDGs and build the future.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-extrabold px-8 py-4 rounded-xl hover:from-emerald-300 hover:to-cyan-300 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                Log In <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/login" className="text-slate-400 hover:text-emerald-400 transition-colors">Login to Hub</Link></li>
                <li><Link to="/register" className="text-slate-400 hover:text-emerald-400 transition-colors">Sign Up</Link></li>
                <li><Link to="/rulebook" className="text-slate-400 hover:text-emerald-400 transition-colors">Read Rulebook</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Contact</h4>
              <ul className="space-y-4">
                <li><a href="mailto:ecoclub@sjec.ac.in" className="text-slate-400 hover:text-emerald-400 transition-colors">ecoclub@sjec.ac.in</a></li>
                <li className="text-slate-400">St Joseph Engineering College</li>
                <li className="text-slate-400">Mangaluru, Karnataka</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
            <p>&copy; 2026 EcoVex Club. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
               <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</span>
               <span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>

        {/* Massive Watermark */}
        <div className="absolute bottom-[-10%] left-0 w-full overflow-hidden pointer-events-none select-none flex justify-center opacity-[0.03]">
          <h1 className="text-[15vw] font-black tracking-tighter whitespace-nowrap text-white">ECOTANK</h1>
        </div>
      </footer>
    </div>
  );
}
