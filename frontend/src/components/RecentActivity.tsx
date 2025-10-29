// ============================================
// FILE: frontend/src/components/RecentActivity.tsx
// ============================================
// Path: postfix-dashboard/frontend/src/components/RecentActivity.tsx
// Action: REPLACE your existing RecentActivity.tsx completely

import React, { useState, useEffect } from 'react';
import { RecentActivity as RecentActivityType } from '../types';
import { ShieldCheckIcon, Cog6ToothIcon, ComputerDesktopIcon } from './icons/IconComponents';
import apiService, { ApiError } from '../services/apiService';

const iconMap: { [key: string]: React.ReactNode } = {
  security: <ShieldCheckIcon className="w-5 h-5 text-red-400" />,
  config: <Cog6ToothIcon className="w-5 h-5 text-blue-400" />,
  system: <ComputerDesktopIcon className="w-5 h-5 text-green-400" />,
};

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const data = await apiService.get<RecentActivityType[]>('/api/recent-activity');
        setActivities(data);
      } catch (error) {
        if (error instanceof ApiError) {
          console.error("Failed to fetch recent activity:", error.message);
        } else {
          console.error("Failed to fetch recent activity:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading activity...
        </div>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center text-gray-500 pt-4">
        No recent critical activity found in the last 24 hours.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <div className="flex-shrink-0 mt-1 mr-3 bg-gray-700 p-2 rounded-full">
            {iconMap[activity.type]}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">{activity.description}</p>
            <p className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;