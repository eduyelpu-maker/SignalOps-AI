import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, DollarSign, Users } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function ExecutiveBriefing() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/incidents`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const fintechIncidents = incidents.filter(i => i.industry === 'Fintech').length;
  const platinumCustomers = incidents.filter(i => i.customer_tier === 'Platinum' && i.sla_risk > 70).length;
  const totalRevenue = incidents.filter(i => i.severity === 'Critical' || i.severity === 'High')
    .reduce((sum, i) => sum + i.revenue_at_risk, 0);

  const briefings = [
    {
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      title: 'Industry Trend Alert',
      message: `Fintech incidents increased ${((fintechIncidents / incidents.length) * 100).toFixed(0)}% this week. Payment gateway issues are primary driver.`,
      severity: 'Medium'
    },
    {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      title: 'SLA Breach Warning',
      message: `${platinumCustomers} platinum customers are approaching SLA breach threshold. Immediate executive attention required.`,
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
      message: 'Healthcare sector showing 35% increase in critical escalations. Database performance is common thread.',
      severity: 'High'
    },
    {
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      title: 'Response Time Improvement',
      message: 'Average first response time decreased by 18% this week. AI-powered routing showing positive impact.',
      severity: 'Positive'
    },
    {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      title: 'Capacity Planning Alert',
      message: 'Support team capacity at 87%. Consider staffing increase to maintain SLA compliance during peak hours.',
      severity: 'Medium'
    },
  ];

  return (
    <div data-testid="executive-briefing" className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-semibold text-slate-50 mb-2">Executive Briefing</h1>
        <p className="text-slate-400">Strategic insights and operational intelligence for leadership</p>
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
                    <h3 className="text-lg font-outfit font-medium text-slate-50">{brief.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      brief.severity === 'Critical' ? 'bg-red-500/10 text-red-500' :
                      brief.severity === 'High' ? 'bg-amber-500/10 text-amber-500' :
                      brief.severity === 'Positive' ? 'bg-green-500/10 text-green-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {brief.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{brief.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600/10 to-slate-900 border border-blue-600/20 rounded-md p-6">
        <h3 className="text-xl font-outfit font-semibold text-slate-50 mb-4">Recommended Executive Actions</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
            <p className="text-slate-300">Schedule emergency capacity planning meeting with engineering leadership</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
            <p className="text-slate-300">Review platinum customer escalation protocols with support directors</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
            <p className="text-slate-300">Approve additional infrastructure scaling to prevent SLA breaches</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ExecutiveBriefing;
