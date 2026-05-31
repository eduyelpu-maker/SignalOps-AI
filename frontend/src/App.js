import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './pages/Dashboard';
import './App.css';

function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id synchronously
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="dark">
      <Router>
        <AppRouter />
      </Router>
    </div>
  );
}

export default App;
