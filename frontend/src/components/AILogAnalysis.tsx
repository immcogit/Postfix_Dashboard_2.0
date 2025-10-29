// ============================================
// FILE: frontend/src/components/AILogAnalysis.tsx
// ============================================

import React, { useState, useCallback } from 'react';
import { AILogAnalysisResult } from '../types';
import { 
  SparklesIcon, 
  ExclamationTriangleIcon, 
  ShieldExclamationIcon, 
  InformationCircleIcon,
  ChartBarIcon,
  DocumentTextIcon
} from './icons/IconComponents';
import apiService, { ApiError } from '../services/apiService';

const AILogAnalysis: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AILogAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [provider, setProvider] = useState<'ollama' | 'gemini'>('ollama');
  const [ollamaUrl, setOllamaUrl] = useState('http://192.168.5.217:11434');
  const [manualInput, setManualInput] = useState('');
  const [analysisMode, setAnalysisMode] = useState<'recent' | 'manual'>('recent');
  const [logLimit, setLogLimit] = useState(50);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    let logsToAnalyze = '';

    try {
      if (analysisMode === 'recent') {
        const logSampleData = await apiService.get<any[]>('/api/logs', { limit: logLimit });
        
        if (!logSampleData || logSampleData.length === 0) {
          throw new Error("No recent logs found to analyze.");
        }
        logsToAnalyze = logSampleData.map((log: any) => log.line || log.detail).join('\n');
      } else {
        if (!manualInput.trim()) {
          throw new Error("Manual input field is empty.");
        }
        logsToAnalyze = manualInput;
      }
      
      const result = await apiService.post<AILogAnalysisResult>('/api/analyze-logs', { 
        logs: logsToAnalyze, 
        provider,
        ollamaUrl: provider === 'ollama' ? ollamaUrl : undefined,
      });
      
      // Helper function to convert items to strings
      const normalizeArray = (arr: any[]): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return item.description || item.text || item.message || JSON.stringify(item);
          }
          return String(item);
        });
      };

      // Ensure the result has all required fields
      const validatedResult: AILogAnalysisResult = {
        summary: result.summary || 'No summary provided',
        anomalies: normalizeArray(result.anomalies),
        threats: normalizeArray(result.threats),
        errors: normalizeArray(result.errors),
        statistics: result.statistics,
        recommendations: normalizeArray(result.recommendations),
      };
      
      setAnalysisResult(validatedResult);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to analyze logs. Please try again.');
      }
      console.error('AI analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [analysisMode, manualInput, provider, ollamaUrl, logLimit]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center">
            <SparklesIcon className="w-7 h-7 mr-2 text-primary"/>
            AI-Powered Log Analysis
          </h2>
          <p className="text-gray-400 mt-1">
            Get intelligent insights about anomalies, threats, errors, and recommendations from your mail logs.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-700/50 p-4 rounded-lg mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
            >
              <option value="ollama">Ollama (Local)</option>
			  <option value="gemini">Gemini API</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Gemini provides more detailed analysis
            </p>
          </div>
          {provider === 'ollama' && (
            <div>
              <label htmlFor="ollamaUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Ollama Server URL
              </label>
              <input
                type="text"
                id="ollamaUrl"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
                placeholder="e.g., http://localhost:11434"
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Analysis Mode
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center">
              <input
                type="radio"
                name="analysisMode"
                value="recent"
                checked={analysisMode === 'recent'}
                onChange={() => setAnalysisMode('recent')}
                className="form-radio text-primary bg-gray-700 border-gray-600 focus:ring-primary"
              />
              <span className="ml-2 text-gray-300">Analyze Recent Logs</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="analysisMode"
                value="manual"
                checked={analysisMode === 'manual'}
                onChange={() => setAnalysisMode('manual')}
                className="form-radio text-primary bg-gray-700 border-gray-600 focus:ring-primary"
              />
              <span className="ml-2 text-gray-300">Analyze Manual Input</span>
            </label>
          </div>
        </div>
        
        {analysisMode === 'recent' && (
          <div>
            <label htmlFor="logLimit" className="block text-sm font-medium text-gray-300 mb-2">
              Number of Logs to Analyze
            </label>
            <select
              id="logLimit"
              value={logLimit}
              onChange={(e) => setLogLimit(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
            >
              <option value={25}>25 logs</option>
              <option value={50}>50 logs (Recommended)</option>
              <option value={100}>100 logs</option>
              <option value={200}>200 logs (May take longer)</option>
            </select>
          </div>
        )}
        
        {analysisMode === 'manual' && (
          <div>
            <label htmlFor="manualInput" className="block text-sm font-medium text-gray-300 mb-2">
              Paste Logs Here
            </label>
            <textarea
              id="manualInput"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              rows={8}
              className="w-full font-mono text-sm bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
              placeholder="Paste log snippets for analysis..."
            ></textarea>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing... This may take 15-30 seconds
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Analyze Now
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-md my-4">
          <p className="font-semibold">Analysis Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-6 mt-6">
          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-400"/>
              Executive Summary
            </h3>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {analysisResult.summary}
            </div>
          </div>

          {/* Statistics */}
          {analysisResult.statistics && (
            <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-primary"/>
                Key Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-md">
                  <p className="text-sm text-gray-400">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-100 mt-1">{analysisResult.statistics.totalMessages}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-md">
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{analysisResult.statistics.successRate}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-md">
                  <p className="text-sm text-gray-400">Bounce Rate</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">{analysisResult.statistics.bounceRate}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-md">
                  <p className="text-sm text-gray-400">Deferred Rate</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">{analysisResult.statistics.deferredRate}</p>
                </div>
              </div>
              {analysisResult.statistics.peakActivityTime && (
                <div className="mt-4 text-sm text-gray-400">
                  <span className="font-semibold">Peak Activity:</span> {analysisResult.statistics.peakActivityTime}
                </div>
              )}
            </div>
          )}

          {/* Issues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700/50 p-5 rounded-lg border border-yellow-500/30">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-400"/>
                Anomalies Detected
              </h3>
              {analysisResult.anomalies && analysisResult.anomalies.length > 0 ? (
                <ul className="space-y-2">
                  {analysisResult.anomalies.map((item, index) => (
                    <li key={index} className="text-sm text-gray-300 pl-4 border-l-2 border-yellow-500/50">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No anomalies detected.</p>
              )}
            </div>
            
            <div className="bg-gray-700/50 p-5 rounded-lg border border-red-500/30">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <ShieldExclamationIcon className="w-5 h-5 mr-2 text-red-400"/>
                Security Threats
              </h3>
              {analysisResult.threats && analysisResult.threats.length > 0 ? (
                <ul className="space-y-2">
                  {analysisResult.threats.map((item, index) => (
                    <li key={index} className="text-sm text-gray-300 pl-4 border-l-2 border-red-500/50">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No threats detected.</p>
              )}
            </div>
            
            <div className="bg-gray-700/50 p-5 rounded-lg border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <InformationCircleIcon className="w-5 h-5 mr-2 text-purple-400"/>
                Configuration Errors
              </h3>
              {analysisResult.errors && analysisResult.errors.length > 0 ? (
                <ul className="space-y-2">
                  {analysisResult.errors.map((item, index) => (
                    <li key={index} className="text-sm text-gray-300 pl-4 border-l-2 border-purple-500/50">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No errors detected.</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-2 text-green-400"/>
                Recommended Actions
              </h3>
              <ul className="space-y-3">
                {analysisResult.recommendations.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {!analysisResult && !isLoading && !error && (
        <div className="text-center py-12 text-gray-500">
          <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg">Configure your AI provider and click "Analyze Now" to get started.</p>
          <p className="text-sm mt-2">The AI will provide detailed insights about your mail server logs.</p>
        </div>
      )}
    </div>
  );
};

export default AILogAnalysis;