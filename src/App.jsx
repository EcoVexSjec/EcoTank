import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Rulebook from './pages/Rulebook';
import AdminDashboard from './pages/AdminDashboard';
import LenisProvider from './components/LenisProvider';
import { AuthProvider } from './contexts/AuthContext';

import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <LenisProvider>
        <AuthProvider>
          {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
          <div className={`min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-emerald-500/30 transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/rulebook" element={<Rulebook />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </AuthProvider>
      </LenisProvider>
    </Router>
  );
}

export default App;
