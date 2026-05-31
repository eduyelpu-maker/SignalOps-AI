import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function AIIntelligence() {
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
        setIncidents(data.slice(0, 10));
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

  return (
    <div data-testid="ai-intelligence" className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-semibold text-slate-50 mb-2">AI Intelligence Center</h1>
        <p className="text-slate-400">Machine learning insights and predictions</p>
      </div>

      {/* AI Insights Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.map((incident, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-md p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-600/10 p-3 rounded-md">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold tracking-[0.1em] uppercase text-blue-600 bg-blue-600/10 px-3 py-1 rounded-full">
                AI Analyzed
              </span>
            </div>

            <h3 className="text-lg font-outfit font-medium text-slate-50 mb-3">{incident.customer_name}</h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Severity Classification</span>
                  <span className={`text-sm font-medium ${
                    incident.severity === 'Critical' ? 'text-red-500' :
                    incident.severity === 'High' ? 'text-amber-500' : 'text-blue-500'
                  }`}>{incident.severity}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Sentiment Analysis</span>
                  <span className="text-sm font-medium text-slate-50">{incident.sentiment}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">SLA Prediction</span>
                  <span className="text-sm font-medium text-slate-50">{incident.sla_risk}% Risk</span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      incident.sla_risk > 70 ? 'bg-red-500' : incident.sla_risk > 40 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${incident.sla_risk}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Escalation Forecast</span>
                  <span className="text-sm font-medium text-slate-50">{incident.escalation_prediction}%</span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${incident.escalation_prediction}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-400 mb-2">AI Summary</p>
              <p className="text-sm text-slate-300 line-clamp-2">{incident.summary}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-2">Recommended Action</p>
              <p className="text-sm text-blue-400 line-clamp-2">{incident.recommended_action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIIntelligence;
