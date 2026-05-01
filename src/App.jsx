import React, { useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LenisProvider from './components/LenisProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';

// Lazy-load all pages so each is its own code-split chunk
const LandingPage    = lazy(() => import('./pages/LandingPage'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const Rulebook       = lazy(() => import('./pages/Rulebook'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Minimal inline fallback shown while a lazy chunk downloads
function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-emerald-500/60 uppercase tracking-widest">Loading module…</p>
      </div>
    </div>
  );
}

function App() {
  const [isVisualLoading, setIsVisualLoading] = useState(true);

  return (
    <Router>
      <LenisProvider>
        <AuthProvider>
          <AuthConsumer>
            {({ loading: authLoading }) => {
              const showLoading = isVisualLoading || authLoading;
              return (
                <>
                  {showLoading && <LoadingScreen onComplete={() => setIsVisualLoading(false)} />}
                  <div className={`min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-emerald-500/30 transition-opacity duration-1000 ${showLoading ? 'opacity-0' : 'opacity-100'}`}>
                    <Suspense fallback={<PageFallback />}>
                      <Routes>
                        <Route path="/"          element={<LandingPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/login"     element={<Login />} />
                        <Route path="/register"  element={<Register />} />
                        <Route path="/rulebook"  element={<Rulebook />} />
                        <Route path="/admin"     element={<AdminDashboard />} />
                      </Routes>
                    </Suspense>
                  </div>
                </>
              );
            }}
          </AuthConsumer>
        </AuthProvider>
      </LenisProvider>
    </Router>
  );
}

// Helper to consume auth state inside the App tree
function AuthConsumer({ children }) {
  const auth = useAuth();
  return children(auth);
}

export default App;
