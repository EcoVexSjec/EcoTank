import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Download, Users, FolderOpen, Trash2, ExternalLink, ChevronDown, ChevronUp, Trophy, Eye, EyeOff } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ users: [], teams: [], submissions: [] });
  const [loading, setLoading] = useState(true);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [platformSettings, setPlatformSettings] = useState({ showLeaderboard: false });

  useEffect(() => {
    // Basic protection: Ensure only the designated admin can use this view
    if (!currentUser || currentUser.email !== '24g54.roy@sjec.ac.in') {
      navigate('/login');
      return;
    }

    async function fetchData() {
      try {
        const fetchCollection = async (colName) => {
          const snapshot = await getDocs(collection(db, colName));
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        };

        const [users, teams, submissions] = await Promise.all([
          fetchCollection('users'),
          fetchCollection('teams'),
          fetchCollection('submissions')
        ]);

        const settingsDoc = await getDoc(doc(db, 'settings', 'platform'));
        if (settingsDoc.exists()) {
          setPlatformSettings(settingsDoc.data());
        } else {
          await setDoc(doc(db, 'settings', 'platform'), { showLeaderboard: false });
        }

        setData({ users, teams, submissions });
      } catch (err) {
        console.error("Admin fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser, navigate]);

  async function handleDeleteTeamAdmin(team) {
    if (!window.confirm(`WARNING: Are you sure you want to delete team '${team.teamName}' and kick its members?`)) return;
    try {
      const memberPromises = team.members.map(memberId => {
         return updateDoc(doc(db, 'users', memberId), { teamId: null, role: 'member' });
      });
      await Promise.all(memberPromises);
      await deleteDoc(doc(db, 'teams', team.id));
      if (team.submissionId) {
        await deleteDoc(doc(db, 'submissions', team.submissionId));
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to delete team.');
    }
  }

  async function toggleRound1Status(team) {
    try {
      const newStatus = !team.isRound1Qualified;
      await updateDoc(doc(db, 'teams', team.id), { isRound1Qualified: newStatus });
      setData(prev => ({
        ...prev,
        teams: prev.teams.map(t => t.id === team.id ? { ...t, isRound1Qualified: newStatus } : t)
      }));
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  }

  async function toggleLeaderboardVisibility() {
    try {
      const newStatus = !platformSettings.showLeaderboard;
      await setDoc(doc(db, 'settings', 'platform'), { showLeaderboard: newStatus }, { merge: true });
      setPlatformSettings({ ...platformSettings, showLeaderboard: newStatus });
    } catch (e) {
      console.error(e);
      alert('Failed to update leaderboard visibility.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-emerald-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 lg:p-16 bg-slate-950">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}ecotank-logo.png`} alt="Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            Administrative Console
          </h1>
          <p className="text-slate-400 mt-2">Managing EcoTank Platform Data</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLeaderboardVisibility} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all border ${platformSettings.showLeaderboard ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
          >
            {platformSettings.showLeaderboard ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {platformSettings.showLeaderboard ? 'Leaderboard Public' : 'Leaderboard Hidden'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            Return to Hub
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
           <Users className="w-10 h-10 text-emerald-500 opacity-50" />
           <div>
             <p className="text-slate-400 text-sm">Total Registered</p>
             <h3 className="text-3xl font-bold">{data.users.length} Users</h3>
           </div>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
           <Users className="w-10 h-10 text-cyan-500 opacity-50" />
           <div>
             <p className="text-slate-400 text-sm">Formed Teams</p>
             <h3 className="text-3xl font-bold">{data.teams.length} Teams</h3>
           </div>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
           <FolderOpen className="w-10 h-10 text-emerald-500 opacity-50" />
           <div>
             <p className="text-slate-400 text-sm">Pitch Decks Received</p>
             <h3 className="text-3xl font-bold">{data.submissions.length} Submissions</h3>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <h2 className="text-xl font-bold">Teams Database</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-300">
              <tr>
                <th className="px-6 py-4">Team Name</th>
                <th className="px-6 py-4">Leader ID</th>
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4 text-center">Pitch Deck</th>
                <th className="px-6 py-4 text-center">Round 1</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.teams.map((team, idx) => {
                const sub = data.submissions.find(s => s.submissionId === team.submissionId);
                const leaderUser = data.users.find(u => u.id === team.leaderId);
                const isExpanded = expandedTeamId === team.id;
                return (
                  <React.Fragment key={team.id}>
                    <tr className="border-b border-slate-800 hover:bg-slate-800/30 cursor-pointer" onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}>
                      <td className="px-6 py-4 font-bold text-slate-200 flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        {team.teamName}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">
                        {leaderUser ? leaderUser.name || leaderUser.email : team.leaderId.substring(0, 8) + '...'}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{team.members.length} / 4</td>
                      <td className="px-6 py-4 font-mono text-emerald-500">{team.inviteCode}</td>
                      <td className="px-6 py-4 text-center">
                        {sub ? (
                          <a href={sub.fileURL} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition px-3 py-1 bg-cyan-500/10 rounded-lg">
                            <ExternalLink className="w-4 h-4" /> View
                          </a>
                        ) : (
                          <span className="text-slate-600 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <button onClick={(e) => { e.stopPropagation(); toggleRound1Status(team); }} className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all border ${team.isRound1Qualified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20' : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:bg-slate-700'}`}>
                           {team.isRound1Qualified ? <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Qualified</span> : 'Pending'}
                         </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteTeamAdmin(team); }} className="text-red-500 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors border border-red-500/30 hover:border-red-500" title="Delete Team">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-900/50 border-b border-slate-800">
                        <td colSpan="6" className="px-6 py-4">
                           <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">Team Roster</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {team.members.map(memberId => {
                                   const memberInfo = data.users.find(u => u.id === memberId);
                                   return (
                                     <div key={memberId} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                           {memberInfo?.photoURL ? <img src={memberInfo.photoURL} alt="" className="w-full h-full object-cover" /> : <Users className="w-3 h-3 text-slate-400" />}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-semibold text-slate-200">{memberInfo ? (memberInfo.name || memberInfo.email) : 'Unknown Member'}</span>
                                          {memberId === team.leaderId && <span className="text-[10px] text-emerald-400 font-bold uppercase">Leader</span>}
                                        </div>
                                     </div>
                                   );
                                })}
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {data.teams.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No teams formed yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
