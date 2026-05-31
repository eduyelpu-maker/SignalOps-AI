import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Clock, Users, AlertTriangle, FileText } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function ExecutiveOverview() {
  const [metrics, setMetrics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [metricsRes, incidentsRes] = await Promise.all([
        fetch(`${API_URL}/api/metrics`, { credentials: 'include' }),
        fetch(`${API_URL}/api/incidents`, { credentials: 'include' })
      ]);
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (incidentsRes.ok) setIncidents(await incidentsRes.json());
    } catch (error) {
      console.error('Failed to fetch overview data:', error);
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
      <QuickStats incidents={incidents} />

      {/* Executive Briefing Section */}
      <BriefingSection incidents={incidents} />
    </div>
  );
}

function QuickStats({ incidents }) {
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;

  const inWindow = (windowMs) => incidents.filter(i => {
    try {
      const t = new Date(i.timestamp).getTime();
      return !isNaN(t) && (now - t) <= windowMs;
    } catch { return false; }
  }).length;

  const lastHour = inWindow(HOUR);
  const last24h = inWindow(DAY);
  const thisWeek = inWindow(WEEK);

  // SLA Compliance: % of incidents with sla_risk <= 70
  const slaCompliant = incidents.filter(i => (i.sla_risk || 0) <= 70).length;
  const slaCompliance = incidents.length > 0 ? ((slaCompliant / incidents.length) * 100).toFixed(1) : '0.0';

  // Average priority/escalation as proxy for urgency
  const avgPriority = incidents.length > 0
    ? Math.round(incidents.reduce((s, i) => s + (i.customer_priority_score || 0), 0) / incidents.length)
    : 0;
  const avgEscalation = incidents.length > 0
    ? Math.round(incidents.reduce((s, i) => s + (i.escalation_prediction || 0), 0) / incidents.length)
    : 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-md p-6">
        <h3 className="text-lg font-outfit font-medium text-slate-50 mb-4">Incident Velocity</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last Hour</span>
            <span className="text-slate-50 font-medium">{lastHour} incident{lastHour !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last 24 Hours</span>
            <span className="text-slate-50 font-medium">{last24h} incident{last24h !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">This Week</span>
            <span className="text-slate-50 font-medium">{thisWeek} incident{thisWeek !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-md p-6">
        <h3 className="text-lg font-outfit font-medium text-slate-50 mb-4">Risk Indicators</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Avg Priority Score</span>
            <span className="text-slate-50 font-medium">{avgPriority}/100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Avg Escalation Risk</span>
            <span className="text-slate-50 font-medium">{avgEscalation}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">SLA Compliance</span>
            <span className={`font-medium ${parseFloat(slaCompliance) >= 80 ? 'text-green-500' : parseFloat(slaCompliance) >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
              {slaCompliance}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefingSection({ incidents }) {
  if (!incidents || incidents.length === 0) return null;

  const fintechIncidents = incidents.filter(i => i.industry === 'Fintech').length;
  const platinumCustomers = incidents.filter(i => i.customer_tier === 'Platinum' && i.sla_risk > 70).length;
  const totalRevenue = incidents
    .filter(i => i.severity === 'Critical' || i.severity === 'High')
    .reduce((sum, i) => sum + (i.revenue_at_risk || 0), 0);
  const healthcareCritical = incidents.filter(i => i.industry === 'Healthcare' && i.severity === 'Critical').length;

  const briefings = [
    {
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      title: 'Industry Trend Alert',
      message: `Fintech incidents account for ${incidents.length > 0 ? ((fintechIncidents / incidents.length) * 100).toFixed(0) : 0}% of total escalations. Payment gateway issues are primary driver.`,
      severity: 'Medium'
    },
    {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      title: 'SLA Breach Warning',
      message: `${platinumCustomers} platinum customer${platinumCustomers !== 1 ? 's are' : ' is'} approaching SLA breach threshold. Immediate executive attention required.`,
      severity: 'Critical'
    },
    {
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-600/10',
      title: 'Revenue Impact Analysis',
      message: `Revenue exposure estimated at $${(totalRevenue / 1000000).toFixed(1)}M across high-severity incidents. Customer retention at risk.`,
      severity: 'High'
    },
    {
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      title: 'Customer Escalation Pattern',
      message: `Healthcare sector showing ${healthcareCritical} critical escalation${healthcareCritical !== 1 ? 's' : ''}. Database performance is common thread.`,
      severity: 'High'
    },
  ];

  return (
    <div data-testid="overview-briefing" className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-outfit font-medium text-slate-50">Executive Briefing</h2>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500">
          AI-Generated Insights
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {briefings.map((brief, idx) => {
          const Icon = brief.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-md p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className={`${brief.bg} p-3 rounded-md flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${brief.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-outfit font-medium text-slate-50">{brief.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      brief.severity === 'Critical' ? 'bg-red-500/10 text-red-500' :
                      brief.severity === 'High' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {brief.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{brief.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExecutiveOverview;
