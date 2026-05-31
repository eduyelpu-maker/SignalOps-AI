import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import IncidentDrawer from './IncidentDrawer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function EscalationCenter() {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = incidents.filter(inc => 
      inc.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIncidents(filtered);
  }, [searchTerm, incidents]);

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/incidents`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
        setFilteredIncidents(data);
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10';
      case 'High': return 'text-amber-500 bg-amber-500/10';
      case 'Medium': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-green-500 bg-green-500/10';
    }
  };

  const handleRowClick = (incident) => {
    setSelectedIncident(incident);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div data-testid="escalation-center" className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-semibold text-slate-50 mb-2">Escalation Command Center</h1>
        <p className="text-slate-400">Real-time incident queue with intelligent prioritization</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            data-testid="incident-search"
            type="text"
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-slate-50"
          />
        </div>
        <Button 
          data-testid="filter-button"
          variant="outline" 
          className="border-slate-800 text-slate-400 hover:bg-slate-900"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <Button 
          data-testid="sort-button"
          variant="outline" 
          className="border-slate-800 text-slate-400 hover:bg-slate-900"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Sort
        </Button>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Industry</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA Risk</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident, idx) => (
                <tr 
                  key={idx}
                  data-testid={`incident-row-${idx}`}
                  onClick={() => handleRowClick(incident)}
                  className={`border-b border-slate-800 hover:bg-slate-900/50 cursor-pointer transition-colors ${
                    incident.severity === 'Critical' ? 'pulse-critical' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="text-slate-50 font-medium">{incident.customer_name}</div>
                  </td>
                  <td className="p-4 text-slate-400">{incident.industry}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-2 w-20">
                        <div 
                          className={`h-2 rounded-full ${
                            incident.sla_risk > 70 ? 'bg-red-500' : incident.sla_risk > 40 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${incident.sla_risk}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-400 text-sm">{incident.sla_risk}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-50 font-medium">{incident.customer_priority_score}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                      {incident.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(incident.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <IncidentDrawer 
        incident={selectedIncident}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default EscalationCenter;
