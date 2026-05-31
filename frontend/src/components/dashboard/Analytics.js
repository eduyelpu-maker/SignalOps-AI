import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics`, {
        credentials: 'include'
      });
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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
    <div data-testid="analytics" className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-semibold text-slate-50 mb-2">Analytics & Insights</h1>
        <p className="text-slate-400">Data-driven operational intelligence</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-md p-6">
          <h3 className="text-lg font-outfit font-medium text-slate-50 mb-6">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.severity_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.severity_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(2, 6, 23, 0.95)', 
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Trends */}
        <div className="bg-slate-900 border border-slate-800 rounded-md p-6">
          <h3 className="text-lg font-outfit font-medium text-slate-50 mb-6">Incident Trends (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.incident_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(2, 6, 23, 0.95)', 
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke="#ef4444" name="New Incidents" strokeWidth={2} />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-md p-6 lg:col-span-2">
          <h3 className="text-lg font-outfit font-medium text-slate-50 mb-6">Industry Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.industry_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="industry" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(2, 6, 23, 0.95)', 
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
