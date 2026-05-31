import React, { useState, useEffect } from 'react';
import { Mail, Brain, Ticket, Bell, Activity as ActivityIcon, Clock } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/api/activity`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'email': return Mail;
      case 'ai': return Brain;
      case 'ticket': return Ticket;
      case 'alert': return Bell;
      case 'dashboard': return ActivityIcon;
      default: return Clock;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'email': return 'bg-blue-600/10 text-blue-600';
      case 'ai': return 'bg-purple-600/10 text-purple-600';
      case 'ticket': return 'bg-amber-600/10 text-amber-600';
      case 'alert': return 'bg-red-600/10 text-red-600';
      case 'dashboard': return 'bg-green-600/10 text-green-600';
      default: return 'bg-slate-600/10 text-slate-600';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div data-testid="activity-feed" className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-semibold text-slate-50 mb-2">Live Activity Feed</h1>
        <p className="text-slate-400">Real-time system events and workflow automation</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-md p-6">
        <div className="space-y-4">
          {activities.map((activity, idx) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex gap-4 items-start">
                <div className={`${getColor(activity.type)} p-3 rounded-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-50 font-medium mb-1">{activity.message}</p>
                  <p className="text-sm text-slate-500">{getTimeAgo(activity.timestamp)}</p>
                </div>
                {idx === 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ActivityFeed;
