// ============================================
// FILE 3: frontend/src/components/MailLogTable.tsx
// ============================================


import React, { useState, useEffect, useCallback } from 'react';
import { MailLog, MailStatus, LogFilter } from '../types';
import DataExport from './DataExport';
import Modal from './Modal';
import Pagination from './Pagination';
import apiService, { ApiError } from '../services/apiService';
import { config } from '../config';

const statusColors: { [key in MailStatus]: string } = {
  [MailStatus.Sent]: 'bg-green-500/20 text-green-400',
  [MailStatus.Bounced]: 'bg-red-500/20 text-red-400',
  [MailStatus.Deferred]: 'bg-yellow-500/20 text-yellow-400',
  [MailStatus.Rejected]: 'bg-purple-500/20 text-purple-400',
};

interface MailLogTableProps {
  showFilters?: boolean;
  initialFilter?: LogFilter;
}

const MailLogTable: React.FC<MailLogTableProps> = ({ 
  showFilters = true,
  initialFilter = {}
}) => {
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<MailLog | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pagination.defaultPageSize);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [filter, setFilter] = useState<LogFilter>({
    startDate: initialFilter.startDate || '',
    endDate: initialFilter.endDate || '',
    status: initialFilter.status || 'all',
  });

  const fetchLogs = useCallback(async (page: number, size: number, currentFilter: LogFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: size,
      };

      if (currentFilter.startDate) params.startDate = currentFilter.startDate;
      if (currentFilter.endDate) params.endDate = currentFilter.endDate;
      if (currentFilter.status && currentFilter.status !== 'all') {
        params.status = currentFilter.status;
      }
      
      // If not showing filters, just get recent logs
      if (!showFilters) {
        params.limit = 10;
        delete params.page;
      }

      const data = await apiService.get<MailLog[]>('/api/logs', params);
      
      setLogs(data);
      
      // For now, estimate total items (backend needs to return this)
      setTotalItems(data.length >= size ? size * 10 : (page - 1) * size + data.length);
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to retrieve logs. Please try again.');
      }
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, [showFilters]);

  useEffect(() => {
    fetchLogs(currentPage, pageSize, filter);
  }, [currentPage, pageSize, fetchLogs]);

  // Apply filter from initial props
  useEffect(() => {
    if (initialFilter.status || initialFilter.startDate || initialFilter.endDate) {
      setFilter(prev => ({
        ...prev,
        ...initialFilter,
      }));
      setCurrentPage(1);
      fetchLogs(1, pageSize, { ...filter, ...initialFilter });
    }
  }, [initialFilter.status, initialFilter.startDate, initialFilter.endDate]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchLogs(1, pageSize, filter);
  };

  const handleClearFilters = () => {
    const clearedFilter: LogFilter = { 
      startDate: '', 
      endDate: '', 
      status: 'all' 
    };
    setFilter(clearedFilter);
    setCurrentPage(1);
    fetchLogs(1, pageSize, clearedFilter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleRowClick = (log: MailLog) => {
    setSelectedLog(log);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <>
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6">
          {showFilters && <h2 className="text-xl font-semibold mb-4">Mail Logs</h2>}
          
          {showFilters && (
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label htmlFor="log-start-date" className="text-sm font-medium text-gray-400 mr-2">
                    From
                  </label>
                  <input
                    type="date"
                    id="log-start-date"
                    value={filter.startDate || ''}
                    onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="log-end-date" className="text-sm font-medium text-gray-400 mr-2">
                    To
                  </label>
                  <input
                    type="date"
                    id="log-end-date"
                    value={filter.endDate || ''}
                    onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="log-status" className="text-sm font-medium text-gray-400 mr-2">
                    Status
                  </label>
                  <select
                    id="log-status"
                    value={filter.status || 'all'}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
                  >
                    <option value="all">All Status</option>
                    <option value={MailStatus.Sent}>Sent</option>
                    <option value={MailStatus.Bounced}>Bounced</option>
                    <option value={MailStatus.Deferred}>Deferred</option>
                    <option value={MailStatus.Rejected}>Rejected</option>
                  </select>
                </div>
                <button
                  onClick={handleApplyFilter}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors self-end"
                >
                  Filter
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors self-end"
                >
                  Clear
                </button>
              </div>
              <DataExport data={logs} filename="mail_logs.csv" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Timestamp</th>
                  <th scope="col" className="px-6 py-3">From</th>
                  <th scope="col" className="px-6 py-3">To</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading logs...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-red-400">{error}</td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{log.from}</td>
                      <td className="px-6 py-4">{log.to}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          statusColors[log.status] || 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-sm truncate" title={log.detail}>
                        {log.detail}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No logs found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showFilters && !loading && logs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={config.pagination.pageSizeOptions}
          />
        )}
      </div>

      {selectedLog && (
        <Modal isOpen={!!selectedLog} onClose={handleCloseModal} title={`Log Details: ${selectedLog.id}`}>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-400">Timestamp</h3>
              <p>{new Date(selectedLog.timestamp).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">From</h3>
              <p className="font-mono">{selectedLog.from}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">To</h3>
              <p className="font-mono">{selectedLog.to}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">Status</h3>
              <p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  statusColors[selectedLog.status] || 'bg-gray-500/20 text-gray-400'
                }`}>
                  {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}
                </span>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">Full Detail</h3>
              <p className="bg-gray-900/50 p-3 rounded-md font-mono text-sm whitespace-pre-wrap break-all">
                {selectedLog.detail}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MailLogTable;