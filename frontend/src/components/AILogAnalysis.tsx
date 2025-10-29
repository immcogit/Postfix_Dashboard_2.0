import React, { useState, useCallback } from 'react';
import { AILogAnalysisResult } from '../types';
import { SparklesIcon, ExclamationTriangleIcon, ShieldExclamationIcon, InformationCircleIcon } from './icons/IconComponents';
import apiService, { ApiError } from '../services/apiService';

const AILogAnalysis: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AILogAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [provider, setProvider] = useState<'ollama' | 'gemini'>('ollama');
  const [ollamaUrl, setOllamaUrl] = useState('http://192.168.5.217:11434');
  const [manualInput, setManualInput] = useState('');
  const [analysisMode, setAnalysisMode] = useState<'recent' | 'manual'>('recent');

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    let logsToAnalyze = '';

    try {
      if (analysisMode === 'recent') {
        const logSampleData = await apiService.get<any[]>('/api/logs', { limit: 50 });
        
        if (logSampleData.length === 0) {
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
      
      setAnalysisResult(result);
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
  }, [analysisMode, manualInput, provider, ollamaUrl]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center">
            <SparklesIcon className="w-7 h-7 mr-2 text-primary"/>
            AI Log Analysis
          </h2>
          <p className="text-gray-400 mt-1">
            Automatically detect anomalies, threats, and errors in your mail logs.
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
          <div className="flex gap-4">
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
              Analyzing...
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
          {error}
        </div>
      )}

      {analysisResult ? (
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-400"/>
              Summary
            </h3>
            <p className="bg-gray-700/50 p-4 rounded-md text-gray-300 whitespace-pre-wrap">
              {analysisResult.summary}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-400"/>
                Anomalies
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {analysisResult.anomalies.length > 0 
                  ? analysisResult.anomalies.map((item, index) => <li key={index}>{item}</li>) 
                  : <li>None detected.</li>
                }
              </ul>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <ShieldExclamationIcon className="w-5 h-5 mr-2 text-red-400"/>
                Threats
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {analysisResult.threats.length > 0 
                  ? analysisResult.threats.map((item, index) => <li key={index}>{item}</li>) 
                  : <li>None detected.</li>
                }
              </ul>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <InformationCircleIcon className="w-5 h-5 mr-2 text-purple-400"/>
                Common Errors
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {analysisResult.errors.length > 0 
                  ? analysisResult.errors.map((item, index) => <li key={index}>{item}</li>) 
                  : <li>None detected.</li>
                }
              </ul>
            </div>
          </div>
        </div>
      ) : !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <p>Configure your provider and click "Analyze Now" to start.</p>
        </div>
      )}
    </div>
  );
};

export default AILogAnalysis;