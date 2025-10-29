// ============================================
// FILE: frontend/src/components/Dashboard.tsx
// ============================================
// Path: postfix-dashboard/frontend/src/components/Dashboard.tsx
// Action: REPLACE your ENTIRE Dashboard.tsx file with this

import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MailLogTable from './MailLogTable';
import AILogAnalysis from './AILogAnalysis';
import MailVolumeChart from './MailVolumeChart';
import RecentActivity from './RecentActivity';
import AllowedNetworks from './AllowedNetworks';
import StatCard from './StatCard';
import { ChartBarIcon, DocumentTextIcon, ShieldCheckIcon, SparklesIcon } from './icons/IconComponents';
import { MailVolumeData, MailStats, MailStatus } from '../types';
import apiService, { ApiError } from '../services/apiService';

interface DashboardProps {
  onLogout: () => void;
}

type View = 'dashboard' | 'logs' | 'analysis' | 'networks';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [stats, setStats] = useState<MailStats>({ 
    total: 0, 
    sent: 0, 
    bounced: 0, 
    deferred: 0, 
    rejected: 0 
  });
  const [volumeData, setVolumeData] = useState<MailVolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [filter, setFilter] = useState<{ startDate: string; endDate: string }>({ 
    startDate: today, 
    endDate: today 
  });

  // State for navigating to logs with filters
  const [logFilter, setLogFilter] = useState<{ 
    status?: MailStatus | 'all'; 
    startDate?: string; 
    endDate?: string 
  }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (new Date(filter.endDate) < new Date(filter.startDate)) {
        throw new Error("End date cannot be before the start date.");
      }

      const query = {
        startDate: filter.startDate,
        endDate: filter.endDate,
      };

      const [statsData, volumeData] = await Promise.all([
        apiService.get<MailStats>('/api/stats', query),
        apiService.get<MailVolumeData[]>('/api/volume-trends', query),
      ]);

      setStats(statsData);
      setVolumeData(volumeData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch dashboard data. Please check your connection.');
      }
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchData();
    }
  }, [activeView, fetchData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyFilter = () => {
    fetchData();
  };

  // Handle stat card clicks
  const handleStatCardClick = useCallback((status: MailStatus | 'all') => {
    setLogFilter({
      status,
      startDate: filter.startDate,
      endDate: filter.endDate,
    });
    setActiveView('logs');
  }, [filter.startDate, filter.endDate]);

  const renderView = () => {
    switch (activeView) {
      case 'logs':
        return <MailLogTable initialFilter={logFilter} />;
      case 'analysis':
        return <AILogAnalysis />;
      case 'networks':
        return <AllowedNetworks />;
      case 'dashboard':
      default:
        return (
          <>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex items-center gap-4 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-200">Date Range:</h3>
              <div>
                <label htmlFor="startDate" className="text-sm font-medium text-gray-400 mr-2">
                  From
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={filter.startDate}
                  onChange={handleFilterChange}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="text-sm font-medium text-gray-400 mr-2">
                  To
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={filter.endDate}
                  onChange={handleFilterChange}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
                />
              </div>
              <button
                onClick={handleApplyFilter}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                Apply
              </button>
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-400">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading dashboard data...
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <StatCard
                    title="Total Mails"
                    value={stats.total.toLocaleString()}
                    icon={<DocumentTextIcon className="w-8 h-8 text-primary" />}
                    change="in period"
                    onClick={() => handleStatCardClick('all')}
                    isClickable={true}
                  />
                  <StatCard
                    title="Delivered"
                    value={stats.sent.toLocaleString()}
                    icon={<ShieldCheckIcon className="w-8 h-8 text-success" />}
                    change="successful"
                    status="success"
                    onClick={() => handleStatCardClick(MailStatus.Sent)}
                    isClickable={true}
                  />
                  <StatCard
                    title="Bounced"
                    value={stats.bounced.toLocaleString()}
                    icon={<ShieldCheckIcon className="w-8 h-8 text-danger" />}
                    change="failed"
                    status="danger"
                    onClick={() => handleStatCardClick(MailStatus.Bounced)}
                    isClickable={true}
                  />
                  <StatCard
                    title="Deferred"
                    value={stats.deferred.toLocaleString()}
                    icon={<ShieldCheckIcon className="w-8 h-8 text-warning" />}
                    change="retrying"
                    status="warning"
                    onClick={() => handleStatCardClick(MailStatus.Deferred)}
                    isClickable={true}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <ChartBarIcon className="w-6 h-6 mr-2 text-primary" />
                      Mail Volume Trends
                    </h2>
                    <MailVolumeChart data={volumeData} />
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <SparklesIcon className="w-6 h-6 mr-2 text-primary" />
                      Recent Critical Activity
                    </h2>
                    <RecentActivity />
                  </div>
                </div>

                <div className="mt-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <DocumentTextIcon className="w-6 h-6 mr-2 text-primary" />
                    Most Recent Mails
                  </h2>
                  <MailLogTable showFilters={false} />
                </div>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;