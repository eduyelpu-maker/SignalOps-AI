import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Clock, Users } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function ExecutiveOverview() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/metrics`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Critical Incidents',
      value: metrics?.critical_incidents || 0,
      trend: metrics?.critical_trend || '+0%',
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      testId: 'kpi-critical-incidents'
    },
    {
      title: 'Active Incidents',
      value: metrics?.active_incidents || 0,
      trend: metrics?.active_trend || '+0%',
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      testId: 'kpi-active-incidents'
    },
    {
      title: 'Revenue At Risk',
      value: `$${((metrics?.revenue_at_risk || 0) / 1000000).toFixed(1)}M`,
      trend: metrics?.revenue_trend || '+0%',
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-600/10',
      testId: 'kpi-revenue-risk'
    },
    {
      title: 'SLA Breach Risk',
      value: metrics?.sla_breach_risk || 0,
      trend: metrics?.sla_trend || '+0%',
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      testId: 'kpi-sla-breach'
    },
    {
      title: 'Executive Escalations',
      value: metrics?.executive_escalations || 0,
      trend: metrics?.exec_trend || '+0%',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      testId: 'kpi-exec-escalations'
    },
  ];

  return (
    <div data-testid="executive-overview" className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-semibold text-slate-50 mb-2">Executive Overview</h1>
        <p className="text-slate-400">Real-time operational intelligence and risk metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend.startsWith('-');
          const TrendIcon = isPositive ? TrendingDown : TrendingUp;
          
          return (
            <div 
              key={idx}
              data-testid={kpi.testId}
              className="bg-slate-900 border border-slate-800 rounded-md p-6 hover-lift"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${kpi.bg} p-3 rounded-md`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="font-medium">{kpi.trend}</span>
                </div>
              </div>
              <div className="text-3xl font-light text-slate-50 mb-1 count-up">{kpi.value}</div>
              <div className="text-sm text-slate-400">{kpi.title}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-md p-6">
          <h3 className="text-lg font-outfit font-medium text-slate-50 mb-4">Incident Velocity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Last Hour</span>
              <span className="text-slate-50 font-medium">12 incidents</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Last 24 Hours</span>
              <span className="text-slate-50 font-medium">87 incidents</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">This Week</span>
              <span className="text-slate-50 font-medium">412 incidents</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-md p-6">
          <h3 className="text-lg font-outfit font-medium text-slate-50 mb-4">Response Times</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg First Response</span>
              <span className="text-slate-50 font-medium">8 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg Resolution</span>
              <span className="text-slate-50 font-medium">2.4 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">SLA Compliance</span>
              <span className="text-green-500 font-medium">94.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveOverview;
