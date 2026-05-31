import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Brain, Users, TrendingUp, Activity, FileText, Menu, X, LogOut, Zap, Radio } from 'lucide-react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ExecutiveOverview from '../components/dashboard/ExecutiveOverview';
import EscalationCenter from '../components/dashboard/EscalationCenter';
import AIIntelligence from '../components/dashboard/AIIntelligence';
import CustomerRisk from '../components/dashboard/CustomerRisk';
import Analytics from '../components/dashboard/Analytics';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ExecutiveBriefing from '../components/dashboard/ExecutiveBriefing';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const navigation = [
  { name: 'Executive Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Escalation Center', path: '/dashboard/escalations', icon: AlertCircle },
  { name: 'AI Intelligence', path: '/dashboard/ai', icon: Brain },
  { name: 'Customer Risk', path: '/dashboard/customers', icon: Users },
  { name: 'Analytics', path: '/dashboard/analytics', icon: TrendingUp },
  { name: 'Activity Feed', path: '/dashboard/activity', icon: Activity },
  { name: 'Executive Briefing', path: '/dashboard/briefing', icon: FileText },
];

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataSource, setDataSource] = useState('demo');
  const location = useLocation();

  useEffect(() => {
    const fetchSource = async () => {
      try {
        const res = await fetch(`${API_URL}/api/data-source`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setDataSource(data.source);
        }
      } catch (err) {
        // silent
      }
    };
    fetchSource();
    const interval = setInterval(fetchSource, 60000); // Match 60s refresh
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <ProtectedRoute>
      {({ user }) => (
        <div className="min-h-screen bg-slate-950 flex">
          {/* Sidebar */}
          <aside 
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-7 h-7 text-blue-600" />
                  <span className="text-xl font-outfit font-semibold text-slate-50">SignalOps</span>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-slate-400 hover:text-slate-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = item.exact 
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path) && item.path !== '/dashboard';
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      data-testid={`nav-${item.name.toLowerCase().replace(/ /g, '-')}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={user?.picture || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e'} 
                    alt="User" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-50 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Button
                  data-testid="logout-button"
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-slate-900 border border-slate-800 rounded-md text-slate-400 hover:text-slate-50"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Main Content */}
          <main className="flex-1 lg:ml-64">
            <div className="p-6 lg:p-8">
              {/* Data Source Indicator */}
              <div className="flex justify-end mb-4">
                <div 
                  data-testid="data-source-badge"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    dataSource === 'live'
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <Radio className={`w-3 h-3 ${dataSource === 'live' ? 'animate-pulse' : ''}`} />
                  <span>{dataSource === 'live' ? 'Live Data (n8n)' : 'Demo Mode'}</span>
                </div>
              </div>

              <Routes>
                <Route path="/" element={<ExecutiveOverview />} />
                <Route path="/escalations" element={<EscalationCenter />} />
                <Route path="/ai" element={<AIIntelligence />} />
                <Route path="/customers" element={<CustomerRisk />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/activity" element={<ActivityFeed />} />
                <Route path="/briefing" element={<ExecutiveBriefing />} />
              </Routes>
            </div>
          </main>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}

export default Dashboard;
