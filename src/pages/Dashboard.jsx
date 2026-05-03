import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Link as LinkIcon, Sparkles, AlertCircle, CheckCircle2, Globe2, Cpu, User, BookOpen, Camera, Trophy, ShieldCheck, Microscope, Zap, Clock, Pencil } from 'lucide-react';
import { gsap } from 'gsap';

export default function Dashboard() {
  const { currentUser, userData, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard state
  const [teamData, setTeamData] = useState(null);
  const [teamMembersMeta, setTeamMembersMeta] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileLink, setFileLink] = useState('');
  const [submissionData, setSubmissionData] = useState(null);
  const tickerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [qualifiedTeams, setQualifiedTeams] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({ showLeaderboard: false, showJudges: false });
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Customization State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  
  const baseSDGs = [
    { num: "06", title: "Clean Water", desc: "Designing infrastructure for planetary water purification and scalable sanitation grids." },
    { num: "07", title: "Clean Energy", desc: "Renewable power matrices, solar fusion concepts, and zero-emission energy transition." },
    { num: "11", title: "Green Cities", desc: "Architecting sustainable megacities with vertical farming and AI transport networks." },
    { num: "13", title: "Climate Action", desc: "Carbon-capture technologies, atmospheric scrubbers, and global warming reversal tech." },
    { num: "14", title: "Life Below Water", desc: "Preserving marine biodiversity and deploying autonomous ocean-cleaning drone fleets." },
    { num: "15", title: "Life on Land", desc: "Reversing deforestation and protecting terrestrial ecosystems via synthetic biomes." }
  ];
  const SDGs = [...baseSDGs, ...baseSDGs]; // Double for seamless loop

  const timelinePhases = [
    { date: "Current - April 30", title: "Team Registration", desc: "Build your team of exactly 1-4 members. The clock is ticking to securely lock in your roster." },
    { date: "May 1 - May 15", title: "Pitch Deck Drafting", desc: "Submit a comprehensive PDF outlining exactly how your team plans to tackle the SDGs. Technical diagrams required." },
    { date: "May 16 - May 23", title: "Panel Review", desc: "Elite judges evaluate all submissions. Only the top teams advance to the finals." },
    { date: "May 24, 2026", title: "Grand Finale", desc: "Live offline presentations. Defend your eco-tech proposals in front of the master panel and forge your legacy." }
  ];

  useEffect(() => {
    if (userData?.name) setNewName(userData.name);
  }, [userData]);

  // Handle countdown timer
  useEffect(() => {
    const targetDate = new Date("May 24, 2026 00:00:00").getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (currentUser?.email?.toLowerCase().trim() === '24g54.roy@sjec.ac.in') {
      navigate('/admin');
      return;
    }

    async function fetchTeamAndAutoJoin() {
      // 1. Fetch team if they already have one
      if (!currentUser) {
        navigate('/');
        return;
      }
      
      if (userData?.teamId) {
        const tDoc = await getDoc(doc(db, 'teams', userData.teamId));
        if (tDoc.exists()) {
          const fetchedTeam = tDoc.data();
          setTeamData(fetchedTeam);
          if (fetchedTeam.submissionId) {
            const sDoc = await getDoc(doc(db, 'submissions', fetchedTeam.submissionId));
            if (sDoc.exists()) setSubmissionData(sDoc.data());
          }
          if (fetchedTeam.members && fetchedTeam.members.length > 0) {
            const mems = await Promise.all(fetchedTeam.members.map(async mId => {
              const uDoc = await getDoc(doc(db, 'users', mId));
              return uDoc.exists() ? { id: mId, ...uDoc.data() } : null;
            }));
            setTeamMembersMeta(mems.filter(m => m !== null));
          }
        } else {
          // Ghost team! The team document was deleted but the user still has the ID.
          // Self-heal by removing the ghost team ID.
          await updateDoc(doc(db, 'users', currentUser.uid), { teamId: null, role: 'member' });
          window.location.reload();
        }
      } else {
        // 2. Auto-join logic if no team
        const pendingInvite = localStorage.getItem('pendingInvite');
        if (pendingInvite && userData?.role === 'member') {
          try {
            setLoading(true);
            const tQuery = query(collection(db, 'teams'), where('inviteCode', '==', pendingInvite));
            const tDocs = await getDocs(tQuery);
            if (!tDocs.empty) {
               const teamDoc = tDocs.docs[0];
               if (teamDoc.data().members.length < 4) {
                 await updateDoc(doc(db, 'teams', teamDoc.id), {
                    members: [...teamDoc.data().members, currentUser.uid]
                 });
                 await updateDoc(doc(db, 'users', currentUser.uid), { teamId: teamDoc.id });
                 localStorage.removeItem('pendingInvite');
                 window.location.reload();
               }
            }
          } catch(e) { console.error("Auto-join failed:", e); }
        }
      }
    }
    fetchTeamAndAutoJoin();
  }, [userData, currentUser, navigate]);

  useEffect(() => {
    async function fetchLeaderboardConfig() {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'platform'));
        const settings = settingsDoc.exists() ? settingsDoc.data() : { showLeaderboard: false };
        setPlatformSettings(settings);

        if (settings.showLeaderboard) {
          const q = query(collection(db, 'teams'), where('isRound1Qualified', '==', true));
          const snap = await getDocs(q);
          setQualifiedTeams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard config", err);
      } finally {
        setLeaderboardLoading(false);
      }
    }
    fetchLeaderboardConfig();
  }, []);

  if (!currentUser || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Handle the infinite GSAP ticker inside the screen
  useEffect(() => {
    if (tickerRef.current) {
      const isMobile = window.innerWidth < 768;
      gsap.to(tickerRef.current, {
        x: "-50%",
        ease: "none",
        duration: isMobile ? 30 : 15, // Slower on phones
        repeat: -1
      });
    }
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch {
      console.error("Failed to log out");
    }
  }

  // Profile Upload Handlers
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploadLoading(true);
    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: url });
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to upload avatar");
    } finally {
      setAvatarUploadLoading(false);
    }
  }

  async function handleUpdateName() {
    if (!newName.trim()) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { name: newName });
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update name");
    }
  }

  async function handleTeamLogoUpload(e) {
    const file = e.target.files[0];
    if (!file || !teamData) return;
    try {
      const storageRef = ref(storage, `teams/${teamData.teamId}_logo`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'teams', teamData.teamId), { teamLogoUrl: url });
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to upload team logo");
    }
  }

  const UniversalHeader = () => (
    <div className="w-full absolute top-0 left-0 z-50 px-4 pt-6 pb-2 md:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto bg-slate-900/40 backdrop-blur-2xl border border-emerald-500/10 px-6 py-4 flex justify-between items-center rounded-full shadow-[0_8px_32px_rgba(16,185,129,0.05)] transition-all pointer-events-auto">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl flex items-center justify-center p-1 bg-white/5 border border-white/10 shadow-inner">
             <img src={`${import.meta.env.BASE_URL}ecotank-logo.png`} alt="EcoTank Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
           </div>
           <span className="font-black text-2xl tracking-tighter text-white hidden sm:block">EcoTank <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Hub</span></span>
         </div>

         <div className="flex items-center gap-2 md:gap-6">
           <button onClick={() => setShowRuleModal(true)} className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-emerald-400 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full transition-all border border-transparent hover:border-emerald-500/20">
              <BookOpen className="w-5 h-5" /> <span className="hidden sm:block">Rule Book</span>
           </button>
           
           <div className="w-px h-8 bg-slate-700/50 hidden sm:block mx-2"></div>
           
           <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/80 p-2 pr-5 rounded-full transition-all border border-slate-700/50 hover:border-emerald-500/50 shadow-sm group">
             <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border-2 border-emerald-500/30 group-hover:border-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               {userData.photoURL ? (
                  <img src={userData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                  <User className="w-5 h-5 text-emerald-400" />
               )}
             </div>
             <span className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors hidden sm:block truncate max-w-[120px]">{userData.name || 'User'}</span>
           </button>
         </div>
      </div>
    </div>
  );

  const GlobalModals = () => (
    <>
      {/* Rule Book Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-emerald-500/20 max-w-2xl w-full rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] p-8 relative overflow-hidden">
            <button onClick={() => setShowRuleModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-2xl transition-colors">&times;</button>
            <div className="flex items-center gap-3 mb-6">
               <BookOpen className="w-8 h-8 text-emerald-500" />
               <h2 className="text-2xl font-black text-white">Official Rule Book</h2>
            </div>
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              <p><strong>1. Team Formation:</strong> Each team must consist of exactly 1-4 members. A single registered leader creates the team code.</p>
              <p><strong>2. The Pitch Deck:</strong> Pitch decks must be submitted as a viewable Google Drive or Canva Link. Focus intensely on exactly how you are tackling the specified SDGs via technical means.</p>
              <p><strong>3. Elimination:</strong> Plagiarized models or duplicate submissions result in immediate team deletion. "Exit Event" allows a leader to nuke the team entirely before the deadline.</p>
              <p><strong>4. Selection:</strong> Only the elite advance to offline presentations. Prepare to defend your concepts aggressively.</p>
            </div>
            <button onClick={() => setShowRuleModal(false)} className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">Acknowledge Rules</button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border- emerald-500/20 max-w-md w-full rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-2xl transition-colors">&times;</button>
            <h2 className="text-3xl font-black text-white mb-8 text-center drop-shadow-lg">Manager Profile</h2>
            
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center relative group cursor-pointer">
                   {userData.photoURL ? (
                      <img src={userData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                      <User className="w-10 h-10 text-emerald-400" />
                   )}
                   <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase">Upload</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={avatarUploadLoading} />
                   </label>
                </div>
                {/* Pencil indicator */}
                <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1.5 border-2 border-slate-900 pointer-events-none shadow-lg">
                  <Pencil className="w-3.5 h-3.5 text-slate-950" />
                </div>
              </div>
              {avatarUploadLoading && <span className="text-xs text-emerald-400 animate-pulse">Uploading Image...</span>}
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 block">Display Name</label>
                <div className="flex gap-2">
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" />
                  <button onClick={handleUpdateName} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 rounded-lg">Save</button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
               <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold px-6 py-2 rounded-lg transition-colors w-full justify-center">
                 <LogOut className="w-4 h-4" /> Log Out
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Generate a random 6 character code
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  async function handleCreateTeam(e) {
    e.preventDefault();
    if (!teamName) return;
    setLoading(true);
    setError('');

    try {
      const newTeamId = `team_${Date.now()}`;
      const inviteCode = generateInviteCode();

      const teamData = {
        teamId: newTeamId,
        teamName,
        leaderId: currentUser.uid,
        members: [currentUser.uid],
        inviteCode,
        submissionId: null,
        createdAt: new Date()
      };

      // Create team
      await setDoc(doc(db, 'teams', newTeamId), teamData);
      
      // Update user with teamId and upgrade them to leader
      await updateDoc(doc(db, 'users', currentUser.uid), {
        teamId: newTeamId,
        role: 'leader'
      });

      // Force reload to get fresh userData context (or let listener pick it up)
      window.location.reload(); 
    } catch (err) {
      setError('Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinTeam(e) {
    e.preventDefault();
    if (!inviteCodeInput) return;
    setLoading(true);
    setError('');

    try {
      // Find team by invite code
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where("inviteCode", "==", inviteCodeInput));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid invite code.");
        setLoading(false);
        return;
      }

      let teamDoc = null;
      querySnapshot.forEach((doc) => {
        teamDoc = { id: doc.id, ...doc.data() };
      });

      if (teamDoc.members.length >= 4) {
        setError("Team is already full (max 4).");
        setLoading(false);
        return;
      }

      // Add user to team members
      const updatedMembers = [...teamDoc.members, currentUser.uid];
      await updateDoc(doc(db, 'teams', teamDoc.id), {
        members: updatedMembers
      });

      // Update user document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        teamId: teamDoc.id
      });

      window.location.reload();
    } catch (err) {
      setError('Failed to join team. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLinkSubmit(e) {
    if (!fileLink || !teamData) return;
    
    // Basic validation to ensure it's a URL
    if (!fileLink.startsWith('http')) {
       setError('Please enter a valid URL (starting with http:// or https://)');
       return;
    }
    
    setUploading(true);
    setError('');

    try {
      const newId = `sub_${Date.now()}`;
      await setDoc(doc(db, 'submissions', newId), {
        submissionId: newId,
        teamId: teamData.teamId,
        fileURL: fileLink,
        isSubmitted: true,
        submittedAt: new Date()
      });

      await updateDoc(doc(db, 'teams', teamData.teamId), {
        submissionId: newId
      });

      window.location.reload();
    } catch (err) {
      setError('Submission failed. ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleLeaveTeam() {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    setLoading(true);
    setError('');

    try {
      if (userData.role === 'leader') {
        const remainingMembers = teamData.members.filter(m => m !== currentUser.uid);
        if (remainingMembers.length > 0) {
          const newLeaderId = remainingMembers[0];
          await updateDoc(doc(db, 'teams', teamData.teamId), {
            leaderId: newLeaderId,
            members: remainingMembers
          });
          await updateDoc(doc(db, 'users', newLeaderId), { role: 'leader' });
          await updateDoc(doc(db, 'users', currentUser.uid), { teamId: null, role: 'member' });
        } else {
          // No members left, leader leaving kills the team
          await deleteDoc(doc(db, 'teams', teamData.teamId));
          await deleteDoc(doc(db, 'teams', userData.teamId));
          if (teamData.submissionId) {
            await deleteDoc(doc(db, 'submissions', teamData.submissionId));
          }
          await updateDoc(doc(db, 'users', currentUser.uid), { teamId: null, role: 'member' });
        }
      } else {
        const updatedMembers = teamData.members.filter(m => m !== currentUser.uid);
        await updateDoc(doc(db, 'teams', userData.teamId), {
          members: updatedMembers
        });
        await updateDoc(doc(db, 'users', currentUser.uid), { teamId: null, role: 'member' });
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Failed to leave team.');
      setLoading(false);
    }
  }

  async function handleDisbandTeam() {
    if (!window.confirm("WARNING: This will completely delete the team, all submissions, and kick out all members. Are you absolutely certain?")) return;
    setLoading(true);
    setError('');

    try {
      // Free all members
      const memberPromises = teamData.members.map(memberId => {
         return updateDoc(doc(db, 'users', memberId), { teamId: null, role: 'member' });
      });
      await Promise.all(memberPromises);

      // Delete docs
      await deleteDoc(doc(db, 'teams', userData.teamId));
      if (teamData.submissionId) {
        await deleteDoc(doc(db, 'submissions', teamData.submissionId));
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Failed to disband team.');
      setLoading(false);
    }
  }

  const renderAssignedTeamPanel = () => (
    <section className="py-20 px-6 relative z-10 w-full min-h-screen flex items-center justify-center">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex-1 w-full relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white text-center mb-2">Command Center</h1>
          <p className="text-emerald-400 mt-2 flex items-center justify-center gap-2 mb-12 font-bold tracking-widest uppercase text-sm">
            <Sparkles className="w-4 h-4" /> Welcome back, {userData.name}
          </p>

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 p-8 rounded-3xl backdrop-blur-sm shadow-xl flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-500" /> My Team Overview
              </h2>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex-1">
                 <div className="relative group w-32 h-32 shrink-0">
                    <div className="w-full h-full rounded-2xl bg-slate-800 border-2 border-emerald-500/20 overflow-hidden flex items-center justify-center shadow-lg">
                      {teamData?.teamLogoUrl ? (
                         <img src={teamData.teamLogoUrl} alt="Team Logo" className="w-full h-full object-cover" />
                      ) : (
                         <Globe2 className="w-12 h-12 text-slate-600" />
                      )}
                    </div>
                    {userData.role === 'leader' && (
                      <>
                        <label className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                           <Camera className="w-6 h-6 text-white mb-1" />
                           <span className="text-[10px] text-white font-bold uppercase">Change Logo</span>
                           <input type="file" accept="image/*" onChange={handleTeamLogoUpload} className="hidden" />
                        </label>
                        {/* Pencil indicator */}
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 border-2 border-slate-900 pointer-events-none shadow-lg z-10">
                          <Pencil className="w-3.5 h-3.5 text-slate-950" />
                        </div>
                      </>
                    )}
                 </div>
                 
                 <div className="text-center md:text-left flex-1">
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Squad Designation</p>
                   <h3 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-md">{teamData ? teamData.teamName : 'Loading...'}</h3>
                   <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-bold self-start">Active Team</span>
                 </div>
              </div>
          
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Submission Status</h3>
                {submissionData ? (
                   <div className="flex items-center gap-4 p-4 border border-emerald-500/50 rounded-xl bg-emerald-500/10 shadow-inner">
                     <CheckCircle2 className="w-8 h-8 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <div>
                       <p className="font-bold text-emerald-400 text-lg">Pitch Deck Submitted!</p>
                       <p className="text-sm text-slate-300">File attached securely. Good luck!</p>
                     </div>
                   </div>
                ) : (
                   <div className="flex items-center gap-4 p-4 border border-slate-700/50 rounded-xl bg-slate-800/30">
                     <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
                     <div>
                       <p className="font-medium text-slate-200">Pending Pitch Deck</p>
                       <p className="text-sm text-slate-400">Deadline approaches. Secure your spot!</p>
                     </div>
                   </div>
                )}
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6">{error}</div>}

              {!submissionData && (
                <div className="border-t border-slate-700/50 pt-8 mt-6">
                  <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Pitch Deck Link (Google Drive, Canva, etc.)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input 
                      type="url" 
                      placeholder="https://drive.google.com/..." 
                      value={fileLink}
                      onChange={(e) => setFileLink(e.target.value)} 
                      className="block w-full bg-slate-900 border border-slate-700 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                    />
                    <button onClick={handleLinkSubmit} disabled={uploading || !fileLink} className="flex shrink-0 items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      {uploading ? 'Validating...' : <><LinkIcon className="w-5 h-5" /> Submit Link</>}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4" /> Ensure the link sharing settings are set to 'Anyone with the link can view'.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl backdrop-blur-sm shadow-xl flex flex-col">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 drop-shadow-md">Team Matrix</h2>
              <ul className="space-y-3 mb-8">
                 <li className="p-4 bg-slate-900/50 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                    <div className="flex items-center gap-3">
                      {userData.photoURL ? (
                        <img src={userData.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-emerald-500/30" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                          {userData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-white">{userData.name}</span>
                        <span className="text-xs text-emerald-500/60">{userData.email}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-md uppercase border border-emerald-500/30">
                      YOU ({userData.role === 'leader' ? 'Leader' : 'Member'})
                    </span>
                 </li>
                 {teamMembersMeta.map(member => (
                   member.id !== currentUser.uid && (
                     <li key={member.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                       <div className="flex items-center gap-3">
                         {member.photoURL ? (
                           <img src={member.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-400">
                             {member.name.charAt(0).toUpperCase()}
                           </div>
                         )}
                         <div className="flex flex-col text-left">
                           <span className="font-bold text-slate-200">{member.name}</span>
                           <span className="text-xs text-slate-500">{member.email}</span>
                         </div>
                       </div>
                       <span className="text-xs font-black tracking-widest bg-slate-800 text-slate-300 px-3 py-1 rounded-md uppercase border border-slate-700/50">
                         {member.role === 'leader' ? 'Leader' : 'Member'}
                       </span>
                     </li>
                   )
                 ))}
              </ul>
               
              {userData.role === 'leader' && teamData?.inviteCode && (
                <div className="mt-4 border-t border-slate-700/50 pt-8">
                  <div className="mb-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Team Code</p>
                    <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl px-8 py-4 inline-block shadow-inner drop-shadow-lg">
                      <span className="font-mono text-3xl font-black text-emerald-400 tracking-[0.3em]">{teamData.inviteCode}</span>
                    </div>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Share Direct Link</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-slate-950/80 p-2 pl-4 rounded-xl border border-slate-700 shadow-inner">
                      <span className="text-xs text-emerald-400 font-mono truncate w-full pr-2 select-all">
                        {window.location.href.split('#')[0]}#/register?invite={teamData.inviteCode}
                      </span>
                      <button onClick={() => {
                          navigator.clipboard.writeText(`${window.location.href.split('#')[0]}#/register?invite=${teamData.inviteCode}`);
                          alert("Link copied to clipboard!");
                        }} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-3 rounded-lg transition-colors whitespace-nowrap">
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8 border-t border-slate-700/50">
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleLeaveTeam} 
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-600 hover:border-red-500 hover:bg-red-500/10 text-slate-300 hover:text-red-400 font-bold py-4 px-4 rounded-xl transition-all"
                  >
                    Leave Team
                  </button>
                  
                  {userData.role === 'leader' && (
                    <button 
                      onClick={handleDisbandTeam}
                      disabled={loading}
                      className="w-full bg-red-500/10 border border-red-500/50 hover:bg-red-600 hover:text-white text-red-500 font-black py-4 px-4 rounded-xl transition-all drop-shadow-md"
                    >
                      Delete Team Setup
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-x-hidden font-sans selection:bg-emerald-500/30">
      {UniversalHeader()}

      {/* SLIDE 1: Hero & SDG Ticker */}
      <section className="min-h-screen relative w-full overflow-hidden flex flex-col justify-center items-center z-10 py-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Animated Background Icons */}
        <Globe2 className="absolute top-[15%] left-[10%] w-24 h-24 text-emerald-500/5 animate-pulse" />
        <Cpu className="absolute bottom-[20%] right-[15%] w-32 h-32 text-cyan-500/5 animate-bounce" style={{ animationDuration: '6s' }} />

        {/* Hero Content */}
        <div className="flex flex-col justify-center items-center text-center px-4 md:px-6 w-full max-w-5xl mx-auto relative z-10 pt-8 sm:pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-8 shadow-lg shadow-emerald-500/10">
             <Sparkles className="w-4 h-4" /> Grand Finale: May 24, 2026
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 tracking-tighter drop-shadow-2xl">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">EcoTank Command</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed">
            The ultimate ideathon platform designed to solve ecological crises. Gather your team of engineers, review the roadmap below, and prepare your breakthrough pitch deck.
          </p>
        </div>

        {/* GSAP Moving SDG Ticker */}
        <div className="w-full relative z-20 mt-16 overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
           <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
           
           <div className="flex w-max" ref={tickerRef}>
              {SDGs.map((sdg, i) => (
                <div key={i} className="w-64 sm:w-80 min-h-[140px] mx-2 sm:mx-4 bg-slate-900/80 border border-slate-700/50 p-4 sm:p-6 rounded-2xl flex flex-col justify-center hover:border-emerald-500/50 transition-colors shadow-2xl shrink-0">
                   <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                     <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-slate-800 shrink-0">{sdg.num}</div>
                     <div className="text-xs sm:text-base font-bold text-slate-200 uppercase tracking-widest break-words leading-tight">{sdg.title}</div>
                   </div>
                   <p className="text-[10px] sm:text-sm text-slate-400 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">{sdg.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {userData.teamId ? renderAssignedTeamPanel() : (
         <section className="py-20 px-6 relative z-10 w-full min-h-screen flex items-center justify-center">
            <div className="max-w-5xl mx-auto w-full">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Assemble Your Squad</h2>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-sm font-semibold tracking-wide">
                   <AlertCircle className="w-5 h-5" /> Strictly Maximum 4 Members per Team
                </div>
              </div>
    
              {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-4 rounded-lg mb-8 mx-auto text-center w-full max-w-2xl">{error}</div>}
    
              <div className="grid md:grid-cols-2 gap-8 w-full">
                {/* Create Team Panel */}
                <div className="bg-slate-800/40 backdrop-blur-md p-10 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors rounded-3xl shadow-2xl flex flex-col">
                  <h3 className="text-3xl font-bold mb-3 text-white">Create a New Team</h3>
                  <p className="text-base text-slate-400 mb-8 leading-relaxed">Take charge as Team Leader. Generate an invite link for up to 3 friends.</p>
                  
                  <form onSubmit={handleCreateTeam} className="space-y-6 mt-auto">
                    <div>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-900/80 border border-slate-700 text-slate-100 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-lg placeholder:text-slate-600"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter Team Name"
                      />
                    </div>
                    <button disabled={loading} className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-lg py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
                      {loading ? 'Creating...' : 'Create Team'}
                    </button>
                  </form>
                </div>
    
                {/* Join Team Panel */}
                <div className="bg-slate-800/40 backdrop-blur-md p-10 border border-cyan-500/30 hover:border-cyan-500/60 transition-colors rounded-3xl shadow-2xl flex flex-col">
                  <h3 className="text-3xl font-bold mb-3 text-white">Join Existing Team</h3>
                  <p className="text-base text-slate-400 mb-8 leading-relaxed">Enter the 6-digit code provided by your Team Leader.</p>
                  
                  <form onSubmit={handleJoinTeam} className="space-y-6 mt-auto">
                    <div>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-900/80 border border-slate-700 text-slate-100 rounded-2xl px-6 py-5 font-mono tracking-[0.3em] text-center text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all uppercase placeholder:tracking-normal placeholder:text-slate-600"
                        value={inviteCodeInput}
                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                        placeholder="ENTER 6 DIGIT CODE"
                        maxLength={6}
                      />
                    </div>
                    <button disabled={loading} className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-lg py-5 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all">
                      {loading ? 'Joining...' : 'Secure Your Spot'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
         </section>
      )}

      {/* SLIDE 3: Leaderboard (Conditional) */}
      {platformSettings.showLeaderboard && (
      <section className="min-h-screen py-24 px-6 relative z-10 w-full overflow-hidden flex flex-col justify-center bg-slate-900/40">
        <div className="max-w-4xl mx-auto w-full">
           <div className="text-center mb-16">
              <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">Round 1 Finalists</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">The elite teams that successfully passed the preliminary neural scan. Prepare for the Grand Finale offline pitch.</p>
           </div>
           
           <div className="space-y-4">
             {leaderboardLoading ? (
               <div className="text-center py-10 text-emerald-500 animate-pulse font-mono tracking-widest text-sm uppercase">Accessing Neural Net...</div>
             ) : qualifiedTeams.length > 0 ? (
               qualifiedTeams.map((team, idx) => (
                 <div key={team.id} className="flex flex-col md:flex-row items-center gap-6 bg-slate-800/60 border border-emerald-500/30 p-6 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.1)] hover:border-emerald-500 transition-colors">
                    <div className="text-3xl font-black text-emerald-500 w-12 text-center">#{idx + 1}</div>
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-700/50 flex items-center justify-center overflow-hidden border border-slate-600">
                      {team.teamLogoUrl ? <img src={team.teamLogoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-slate-500" />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h3 className="text-2xl font-bold text-white mb-1">{team.teamName}</h3>
                       <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">{team.members.length} Operative(s)</p>
                    </div>
                    <div className="shrink-0 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-widest hidden md:block">
                      Selected
                    </div>
                 </div>
               ))
             ) : (
               <div className="bg-slate-900/80 border border-slate-700/50 p-12 rounded-3xl text-center">
                 <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-4 opacity-50" />
                 <h3 className="text-xl font-bold text-slate-300 mb-2">Evaluations in Progress</h3>
                 <p className="text-slate-500 text-sm max-w-md mx-auto">The judges are currently reviewing pitch decks. The finalized leaderboard will be transmitted shortly.</p>
               </div>
             )}
           </div>
        </div>
      </section>
      )}

      {/* SLIDE 3: Detailed Timeline */}
      <section className="min-h-screen py-24 px-6 relative z-10 w-full overflow-hidden flex flex-col justify-center">
         <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mb-16">
               <Cpu className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-50" />
               <h2 className="text-4xl sm:text-5xl font-black text-white mb-10 tracking-tight">Ideathon Timeline</h2>
               
               {/* Ticking Countdown Scoreboard */}
               <div className="flex justify-center gap-2 sm:gap-4 md:gap-8">
                 {[
                   { label: 'Days', value: timeLeft.days },
                   { label: 'Hours', value: timeLeft.hours },
                   { label: 'Minutes', value: timeLeft.minutes },
                   { label: 'Seconds', value: timeLeft.seconds }
                 ].map((unit, idx) => (
                   <div key={idx} className="flex flex-col items-center">
                      <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl sm:rounded-2xl w-16 h-20 sm:w-24 sm:h-28 md:w-36 md:h-40 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)] mb-4">
                         <span className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">{unit.value.toString().padStart(2, '0')}</span>
                      </div>
                      <span className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em]">{unit.label}</span>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="space-y-6">
               {timelinePhases.map((item, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row text-left gap-8 items-center bg-slate-800/40 w-full max-w-full border border-slate-700/50 rounded-3xl p-8 hover:border-emerald-500/40 transition-all shadow-xl hover:shadow-emerald-500/5">
                    <div className="w-full md:w-64 shrink-0">
                      <span className="inline-block bg-slate-900 border border-emerald-500/20 text-emerald-400 text-sm font-black px-6 py-3 uppercase tracking-widest rounded-2xl shadow-inner">{item.date}</span>
                    </div>
                    <div className="w-full overflow-hidden text-clip md:border-l border-slate-700/50 md:pl-8">
                       <h3 className="text-3xl font-bold text-white mb-3">{item.title}</h3>
                       <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>
      
      {/* Partners & Organizers Section */}
      <section className="py-20 px-6 relative z-10 w-full bg-slate-950/50">
         <div className="max-w-7xl mx-auto">
            {/* Judges (Conditionally Revealed) */}
            {platformSettings?.showJudges && (
              <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <h3 className="text-sm font-bold mb-10 text-emerald-500 uppercase tracking-[0.4em]">The Judges</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 max-w-5xl mx-auto">
                    {[
                      { name: "Dr. Elena Vance", role: "Sustainability" },
                      { name: "Prof. Marcus Thorne", role: "Renewable" },
                      { name: "Sarah Mitchell", role: "VC / Eco-Tech" },
                      { name: "James Holden", role: "Policy Advisor" },
                      { name: "Dr. Anya Kovar", role: "Enviro Scientist" }
                    ].map((judge, i) => (
                      <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col items-center hover:border-emerald-500/20 transition-all group">
                         <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6 text-slate-600 group-hover:text-emerald-500/50" />
                         </div>
                         <h4 className="text-white font-bold text-xs mb-1">{judge.name}</h4>
                         <p className="text-slate-500 text-[9px] uppercase tracking-widest">{judge.role}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Partner */}
            <div className="text-center mb-32">
               <h2 className="text-3xl font-bold mb-20 tracking-tight text-slate-300 uppercase tracking-[0.2em]">Our Partner</h2>
               <div className="inline-block bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl group hover:border-emerald-500/20 transition-all">
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
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {[
                    { name: "Sarah Jenkins", role: "Community Manager", img: "ashley.png" },
                    { name: "David Miller", role: "Technical Advisor", img: "santhsim.png" },
                    { name: "Michael Chen", role: "Marketing Head", img: "jeethan.png" }
                  ].map((org, i) => (
                    <div key={i} className="flex flex-col items-center group">
                      <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 border-slate-800 group-hover:border-emerald-500/30 transition-all mb-4 shadow-xl">
                        <img 
                          src={`${import.meta.env.BASE_URL}${org.img}`} 
                          alt={org.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
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

      {GlobalModals()}
    </div>
  );
}
