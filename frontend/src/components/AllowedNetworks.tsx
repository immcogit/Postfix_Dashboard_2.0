// ============================================
// FILE: frontend/src/components/AllowedNetworks.tsx
// ============================================
// Path: postfix-dashboard/frontend/src/components/AllowedNetworks.tsx


import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon, XMarkIcon } from './icons/IconComponents';

// Add these icons inline since they might not be in IconComponents yet
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
import apiService, { ApiError } from '../services/apiService';

const AllowedNetworks: React.FC = () => {
  const [networks, setNetworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNetwork, setNewNetwork] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchNetworks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.get<string[]>('/api/allowed-networks');
      setNetworks(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch allowed networks.');
      }
      console.error('Failed to fetch networks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(identifier);
      setTimeout(() => setCopied(null), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleCopyAll = () => {
    const allNetworks = networks.join(' ');
    handleCopy(allNetworks, 'all');
  };

  const validateNetwork = (network: string): boolean => {
    const trimmed = network.trim();
    if (!trimmed) return false;
    
    // Basic validation for IP, CIDR, or hostname
    // IP: 192.168.1.1
    // CIDR: 192.168.1.0/24
    // Hostname: mail.example.com
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return ipRegex.test(trimmed) || hostnameRegex.test(trimmed);
  };

  const handleAddNetwork = () => {
    const trimmed = newNetwork.trim();
    
    if (!trimmed) {
      setError('Please enter a network address.');
      return;
    }

    if (!validateNetwork(trimmed)) {
      setError('Invalid network format. Use IP (192.168.1.1), CIDR (192.168.1.0/24), or hostname (mail.example.com)');
      return;
    }

    if (networks.includes(trimmed)) {
      setError('This network is already in the list.');
      return;
    }

    setNetworks([...networks, trimmed]);
    setNewNetwork('');
    setError(null);
  };

  const handleRemoveNetwork = (networkToRemove: string) => {
    setNetworks(networks.filter(net => net !== networkToRemove));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiService.post<{ message: string; networks: string[] }>(
        '/api/allowed-networks',
        { networks }
      );
      
      setSuccessMessage(response.message);
      setIsEditing(false);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save networks. Please try again.');
      }
      console.error('Failed to save networks:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewNetwork('');
    setError(null);
    fetchNetworks(); // Reload original data
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold">Allowed Networks (mynetworks)</h2>
          <p className="text-gray-400 mt-1">
            Trusted networks allowed to relay mail through this server.
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              {!loading && !error && networks.length > 0 && (
                <button
                  onClick={handleCopyAll}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                >
                  {copied === 'all' ? (
                    <CheckIcon className="w-5 h-5 mr-2 text-green-400" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5 mr-2" />
                  )}
                  {copied === 'all' ? 'Copied!' : 'Copy All'}
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Manage Networks
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-4 rounded-md mb-4">
          <p className="font-semibold">{successMessage}</p>
          <p className="text-sm mt-1">Run <code className="bg-gray-900/50 px-2 py-1 rounded">sudo postfix reload</code> to apply changes.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
          <label htmlFor="newNetwork" className="block text-sm font-medium text-gray-300 mb-2">
            Add New Network
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="newNetwork"
              value={newNetwork}
              onChange={(e) => setNewNetwork(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNetwork()}
              placeholder="192.168.1.0/24 or mail.example.com"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
            />
            <button
              onClick={handleAddNetwork}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Examples: 192.168.1.1, 10.0.0.0/8, 127.0.0.0/8, [::1]/128, mail.example.com
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading networks...
          </div>
        </div>
      ) : networks.length > 0 ? (
        <div className="space-y-3">
          {networks.map((network, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <span className="font-mono text-green-300 text-sm">{network}</span>
              <div className="flex gap-2">
                {!isEditing && (
                  <button 
                    onClick={() => handleCopy(network, network)}
                    className="p-2 hover:bg-gray-600 rounded transition-colors"
                    aria-label={`Copy ${network}`}
                  >
                    {copied === network ? (
                      <CheckIcon className="w-4 h-4 text-green-400"/>
                    ) : (
                      <ClipboardIcon className="w-4 h-4 text-gray-400"/>
                    )}
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveNetwork(network)}
                    className="p-2 hover:bg-red-600 rounded transition-colors"
                    aria-label={`Remove ${network}`}
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {isEditing 
            ? "No networks configured. Add your first network above."
            : "No networks found in the Postfix configuration."
          }
        </div>
      )}

      {isEditing && networks.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
          <p className="text-sm text-yellow-300">
            ⚠️ <strong>Warning:</strong> Changes to allowed networks affect mail relay permissions. 
            Make sure you understand the security implications before saving.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllowedNetworks;