import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Leaf, Globe2, Cpu, Sparkles, ShieldCheck, Microscope, Database, Zap, Trophy, Medal } from 'lucide-react';
import { db } from '../firebase/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const sectionsRef = useRef([]);
  const [platformSettings, setPlatformSettings] = React.useState({ showJudges: false });
  const [judges, setJudges] = React.useState([]);
  const [revealPartner, setRevealPartner] = React.useState(null);

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

        const jSnapshot = await getDocs(collection(db, 'judges'));
        setJudges(jSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) { console.error(e); }
    }
    fetchSettings();

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const timelinePhases = [
    { phase: "01", date: "Current - May 12", title: "Team Registration", desc: "Build your team of exactly 1-4 members. The clock is ticking to securely lock in your roster." },
    { phase: "02", date: "May 12 - May 20", title: "PPT Submission", desc: "Submit your comprehensive pitch deck outlining your breakthrough ideas and technical diagrams." },
    { phase: "03", date: "May 24 - May 25", title: "Phase 1 Selection", desc: "Shortlisted teams will be announced. Only the most innovative solutions advance to the next stage." },
    { phase: "04", date: "May 26 - June 1", title: "Solution Designing", desc: "Finalists refine their prototypes and prepare for the big stage. Time to build your legacy." },
    { phase: "05", date: "June 2, 2026", title: "Grand Finale", desc: "Final offline presentation and Q&A. Pitch your legacy and defend your vision before the master panel." }
  ];

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
            <a href="https://drive.google.com/file/d/1pBjXIHc-5ULU4DivjXUr058erMp_covp/view?usp=drivesdk" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-300 hover:text-white transition">Rulebook</a>
            <Link to="/login" className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 hover:from-emerald-300 hover:to-cyan-300 rounded-full px-6 py-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">Log In</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="hero-content text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold mb-6 tracking-wide text-xs uppercase shadow-[0_0_15px_rgba(16,185,129,0.15)]">
               <Sparkles className="w-4 h-4" />
               PITCH ARENA 2026
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300">PITCH</span>
              <span className="block text-slate-100">IMPACT</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">INSPIRE</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed font-light">
               A dynamic Shark Tank-style ideathon designed to foster innovation in sustainability and green engineering.
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
               src={`${import.meta.env.BASE_URL}mascot.png`} 
               alt="Main Mascot" 
               className="w-[120%] max-w-[600px] object-contain relative z-10 rounded-3xl shadow-2xl" 
               onError={(e) => e.target.style.display='none'} 
             />
          </div>
        </div>
      </section>

      {/* Guardians */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6" ref={el => sectionsRef.current[0] = el}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The Elementals</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">Each element reflects a critical environmental challenge shaping the future of Earth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Earth */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-emerald-500/50 transition-all group backdrop-blur-sm">
                 <img src={`${import.meta.env.BASE_URL}mascot-earth.png`} alt="Earth" className="w-full h-48 object-contain mb-6 filter group-hover:-translate-y-2 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-2xl font-bold mb-3 text-emerald-400">Earth Golem</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-light">Deforestation, soil pollution, and loss of green cover are damaging ecosystems and threatening biodiversity across the planet.</p>
            </div>
            
            {/* Fire */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-orange-500/50 transition-all group backdrop-blur-sm">
                 <img src={`${import.meta.env.BASE_URL}mascot-fire.png`} alt="Fire" className="w-full h-48 object-contain mb-6 filter group-hover:-translate-y-2 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-2xl font-bold mb-3 text-orange-400">Fire Golem</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-light">Rising temperatures, extreme heatwaves, and carbon emissions are accelerating global warming and climate change.</p>
            </div>

            {/* Water */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-blue-500/50 transition-all group backdrop-blur-sm">
                 <img src={`${import.meta.env.BASE_URL}mascot_water.png`} alt="Water" className="w-full h-48 object-contain mb-6 filter group-hover:-translate-y-2 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-2xl font-bold mb-3 text-blue-400">Water Golem</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-light">Melting glaciers and shrinking polar ice caps are raising sea levels and disturbing Earth’s climate balance.</p>
            </div>

            {/* Wind */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all group backdrop-blur-sm">
                 <img src={`${import.meta.env.BASE_URL}mascot-wind.png`} alt="Wind" className="w-full h-48 object-contain mb-6 filter group-hover:-translate-y-2 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-2xl font-bold mb-3 text-cyan-400">Wind Golem</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-light">Air pollution and harmful emissions are reducing air quality, affecting human health, and harming the environment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={el => sectionsRef.current[1] = el} className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <Cpu className="w-16 h-16 text-emerald-400 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight">Timeline</h2>
            
            <div className="space-y-6">
                {timelinePhases.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row text-left gap-6 items-center bg-slate-900/50 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition-all backdrop-blur-sm">
                     <div className="flex flex-col items-center justify-center min-w-[80px]">
                        <div className="text-emerald-500/20 text-5xl md:text-6xl font-black leading-none">{item.phase}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.date}</div>
                     </div>
                     <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 tracking-tight text-white">{item.title}</h3>
                        <p className="text-slate-400 font-light text-lg">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
        </div>
      </section>
 
      {/* Prize Pool Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">Win Amazing Prizes</h2>
            <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto uppercase tracking-widest text-sm">Total Prize Pool of ₹14,000</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto">
            {/* 2nd Place */}
            <div className="order-2 md:order-1 group">
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-xl transition-all duration-500 group-hover:border-slate-400/50 group-hover:-translate-y-2 flex flex-col items-center text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform">
                  <Medal className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Runner Up</h3>
                <div className="text-4xl font-black text-white mb-2">₹4,000</div>
                <div className="h-1 w-12 bg-slate-400 rounded-full opacity-30"></div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="order-1 md:order-2 group">
              <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-2 border-yellow-500/30 rounded-[40px] p-12 backdrop-blur-xl transition-all duration-500 group-hover:border-yellow-500/60 group-hover:-translate-y-4 flex flex-col items-center text-center shadow-[0_0_50px_rgba(234,179,8,0.15)] relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 font-black px-6 py-2 rounded-full text-sm uppercase tracking-widest shadow-lg">Winner</div>
                <div className="w-24 h-24 rounded-3xl bg-yellow-500/10 flex items-center justify-center mb-8 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                  <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                </div>
                <h3 className="text-yellow-500 font-bold uppercase tracking-widest text-sm mb-2">Grand Prize</h3>
                <div className="text-6xl font-black text-white mb-4">₹8,000</div>
                <div className="h-1.5 w-20 bg-yellow-500 rounded-full opacity-40"></div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 group">
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-xl transition-all duration-500 group-hover:border-orange-700/50 group-hover:-translate-y-2 flex flex-col items-center text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform">
                  <Medal className="w-8 h-8 text-orange-700" />
                </div>
                <h3 className="text-orange-700 font-bold uppercase tracking-widest text-sm mb-2">Second Runner Up</h3>
                <div className="text-4xl font-black text-white mb-2">₹2,000</div>
                <div className="h-1 w-12 bg-orange-700 rounded-full opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Organizers */}
      <section className="py-24 relative overflow-hidden bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 relative z-10">

          {/* Partner */}
          <div className="text-center mb-32">
             <h2 className="text-3xl font-bold mb-16 tracking-tight text-slate-300 uppercase tracking-[0.2em]">Our Partners</h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-4xl mx-auto px-6">
                {[
                  { name: "NexCon", logo: null, color: "text-blue-500 shadow-blue-500/50", info: null },
                  { name: "AgentBlazer Club", logo: "Agent_blaser.png", color: "text-purple-500 shadow-purple-500/50", info: "A student-driven tech club fostering innovation in AI, prompt engineering, LLMs, and the Salesforce ecosystem through hands-on learning." },
                  { name: "NSS SJEC Unit", logo: "nss-logo.png", color: "text-blue-500 shadow-blue-500/50", info: "Empowering students to serve society through community outreach, social awareness, and impactful welfare initiatives." }
                ].map((partner, i) => {
                  const partnerIdx = i + 1;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div 
                        onClick={() => partner.info && setRevealPartner(revealPartner === partnerIdx ? null : partnerIdx)}
                        className={`relative group transition-all ${partner.info ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                         {/* Logo Container */}
                         <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full flex items-center justify-center bg-slate-900/40 backdrop-blur-sm border-2 border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
                            {partner.logo ? (
                              <img 
                                 src={`${import.meta.env.BASE_URL}${partner.logo}`} 
                                 alt={partner.name} 
                                 className={`w-20 sm:w-28 h-auto object-contain transition-all duration-500 ${revealPartner === partnerIdx ? 'blur-md scale-95 opacity-20' : 'group-hover:blur-md group-hover:scale-95 group-hover:opacity-20'}`} 
                              />
                            ) : (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                 <span className="text-3xl sm:text-4xl font-black text-emerald-500/30">{partner.name[0]}</span>
                              </div>
                            )}
                            
                            {/* Detail Reveal Overlay */}
                            {partner.info && (
                              <div className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-500 ${revealPartner === partnerIdx ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0'}`}>
                                 <p className={`${partner.color} text-[10px] sm:text-xs font-bold leading-relaxed text-center`}>
                                    {partner.info}
                                 </p>
                              </div>
                            )}
                         </div>
  
                         {/* Always Visible Name */}
                         <div className="mt-6 text-center">
                            <h3 className={`${partner.color} font-black text-base sm:text-xl tracking-tighter`}>{partner.name}</h3>
                         </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Organizers */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-24 tracking-tight text-slate-300 uppercase tracking-[0.2em]">Organizers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                  { name: "Melroy Almeida", role: "President", img: "president.png" },
                  { name: "Roy Prince Veigas", role: "Tech Lead", img: "tech-lead.jpeg" },
                  { name: "Keerthana Nair", role: "Treasurer", img: "treasurer.jpeg" }
              ].map((org, i) => (
                <div key={i} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden transition-all duration-500 mb-6 shadow-2xl">
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

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 text-left">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                 <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EcoVex Logo" className="w-10 h-10 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                 <span className="text-2xl font-bold tracking-wide text-white">EcoTank</span>
              </div>
              <p className="text-slate-400 font-light leading-relaxed max-w-sm mb-8">
               The ultimate pitch arena for innovative engineers to solve ecological crises and build solutions aligned with the 17 SDGs.
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
                <li><a href="https://drive.google.com/file/d/1pBjXIHc-5ULU4DivjXUr058erMp_covp/view?usp=drivesdk" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">Read Rulebook</a></li>
                <li><a href="https://docs.google.com/presentation/d/1Wh8C3TYFL1y_SgYyk3CHI2xZA6JdQt0i5KeQnmIoRhs/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">PPT Template</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Contact</h4>
              <ul className="space-y-4">
                <li><a href="mailto:ecoclub@sjec.ac.in" className="text-slate-400 hover:text-emerald-400 transition-colors">ecoclub@sjec.ac.in</a></li>
                <li><a href="https://www.instagram.com/ecovex.sjec/" className="text-slate-400 hover:text-emerald-400 transition-colors">ecovex.sjec</a></li>
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
