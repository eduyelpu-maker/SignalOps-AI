import React from 'react';
import { X, Clock, AlertCircle, TrendingUp, Brain } from 'lucide-react';
import { Button } from '../ui/button';

function IncidentDrawer({ incident, open, onClose }) {
  if (!open || !incident) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10';
      case 'High': return 'text-amber-500 bg-amber-500/10';
      case 'Medium': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-green-500 bg-green-500/10';
    }
  };

  const slaBarColor = incident.sla_risk > 70 ? 'bg-red-500' : incident.sla_risk > 40 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-slate-950 border-l border-slate-800 z-50 overflow-y-auto glassmorphism">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-outfit font-semibold text-slate-50 mb-2">{incident.incident_id}</h2>
              <p className="text-slate-400">{incident.customer_name} · {incident.industry}</p>
            </div>
            <Button
              data-testid="close-drawer-button"
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-50"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(incident.severity)}`}>
              {incident.severity}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500">
              {incident.status}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-500">
              {incident.customer_tier}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-md p-6 mb-6">
            <h3 className="text-lg font-outfit font-medium text-slate-50 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Original Escalation
            </h3>
            <p className="text-slate-300 leading-relaxed">{incident.summary}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-md p-6 mb-6">
            <h3 className="text-lg font-outfit font-medium text-slate-50 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI Analysis
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Sentiment Analysis</span>
                  <span className="text-sm font-medium text-slate-50">{incident.sentiment}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">SLA Risk Prediction</span>
                  <span className="text-sm font-medium text-slate-50">{incident.sla_risk}%</span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${slaBarColor}`}
                    style={{ width: `${incident.sla_risk}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Escalation Probability</span>
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
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-md p-6 mb-6">
            <h3 className="text-lg font-outfit font-medium text-slate-50 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Priority Score
            </h3>
            <div className="text-4xl font-light text-slate-50 mb-2">{incident.customer_priority_score}/100</div>
            <p className="text-sm text-slate-400">Based on customer tier, revenue, and incident history</p>
          </div>

          <div className="bg-gradient-to-r from-blue-600/10 to-slate-900 border border-blue-600/20 rounded-md p-6 mb-6">
            <h3 className="text-lg font-outfit font-medium text-slate-50 mb-3">Recommended Action</h3>
            <p className="text-slate-300 leading-relaxed">{incident.recommended_action}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-md p-6 mb-6">
            <h3 className="text-lg font-outfit font-medium text-slate-50 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <div className="w-px h-full bg-slate-800 mt-2"></div>
                </div>
                <div className="pb-4">
                  <p className="text-slate-50 font-medium mb-1">Incident Reported</p>
                  <p className="text-sm text-slate-400">{new Date(incident.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <div className="w-px h-full bg-slate-800 mt-2"></div>
                </div>
                <div className="pb-4">
                  <p className="text-slate-50 font-medium mb-1">AI Analysis Complete</p>
                  <p className="text-sm text-slate-400">2 minutes after report</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                </div>
                <div>
                  <p className="text-slate-50 font-medium mb-1">Assigned to {incident.assigned_to}</p>
                  <p className="text-sm text-slate-400">Current status: {incident.status}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button data-testid="escalate-button" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              Escalate to Executive
            </Button>
            <Button data-testid="update-button" variant="outline" className="flex-1 border-slate-800 text-slate-300 hover:bg-slate-900">
              Update Status
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default IncidentDrawer;
