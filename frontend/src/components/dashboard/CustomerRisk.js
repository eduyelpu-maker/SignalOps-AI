import React, { useState, useEffect } from 'react';
import { Building, DollarSign, AlertTriangle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function CustomerRisk() {
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
        // Group by customer
        const customerMap = {};
        data.forEach(inc => {
          if (!customerMap[inc.customer_name]) {
            customerMap[inc.customer_name] = {
              name: inc.customer_name,
              tier: inc.customer_tier,
              industry: inc.industry,
              revenue_at_risk: inc.revenue_at_risk,
              priority_score: inc.customer_priority_score,
              open_incidents: inc.open_incidents,
              escalation_history: inc.escalation_history,
              incidents: []
            };
          }
          customerMap[inc.customer_name].incidents.push(inc);
        });
        setIncidents(Object.values(customerMap));
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

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum': return 'text-purple-400 bg-purple-400/10';
      case 'Gold': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div data-testid="customer-risk" className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-semibold text-slate-50 mb-2">Customer Risk Center</h1>
        <p className="text-slate-400">Enterprise customer profiles and risk assessment</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.slice(0, 12).map((customer, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-md p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-600/10 p-3 rounded-md">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(customer.tier)}`}>
                {customer.tier}
              </span>
            </div>

            <h3 className="text-xl font-outfit font-medium text-slate-50 mb-1">{customer.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{customer.industry}</p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Revenue Risk</span>
                <span className="text-sm font-medium text-red-500">
                  ${(customer.revenue_at_risk / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Priority Score</span>
                <span className="text-sm font-medium text-slate-50">{customer.priority_score}/100</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Risk Meter</span>
                  <span className="text-sm font-medium text-slate-50">{customer.priority_score}%</span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      customer.priority_score > 80 ? 'bg-red-500' : 
                      customer.priority_score > 60 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${customer.priority_score}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-between">
              <div>
                <p className="text-xs text-slate-400">Open Incidents</p>
                <p className="text-lg font-medium text-slate-50">{customer.open_incidents}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Escalation History</p>
                <p className="text-lg font-medium text-slate-50">{customer.escalation_history}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerRisk;
