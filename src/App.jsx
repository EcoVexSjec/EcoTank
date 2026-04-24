import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Rulebook from './pages/Rulebook';
import AdminDashboard from './pages/AdminDashboard';
import LenisProvider from './components/LenisProvider';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <LenisProvider>
        <AuthProvider>
          <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-emerald-500/30">
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
