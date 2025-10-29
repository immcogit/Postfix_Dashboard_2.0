// ============================================
// FILE: backend/server.js
// ============================================
// Path: postfix-dashboard/backend/server.js
// Action: REPLACE your ENTIRE server.js file with this

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const { GoogleGenAI, Type } = require('@google/genai');
const crypto = require('crypto');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const POSTFIX_LOG_PATH = process.env.POSTFIX_LOG_PATH || '/var/log/mail.log';
const POSTFIX_CONFIG_PATH = process.env.POSTFIX_CONFIG_PATH || '/etc/postfix/main.cf';
const LOG_DIR = path.dirname(POSTFIX_LOG_PATH);
const LOG_PREFIX = path.basename(POSTFIX_LOG_PATH);

// Auth configuration
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_EXPIRY_HOURS = parseInt(process.env.TOKEN_EXPIRY_HOURS || '24');

// Gemini AI Setup
const API_KEY = process.env.API_KEY;
let ai;
if (API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

// --- CACHING ---
let logCache = {
  logs: [],
  stats: {},
  volume: [],
  lastModified: 0,
};

// Promisify zlib.gunzip for async/await
const gunzip = promisify(zlib.gunzip);

// --- AUTH UTILITIES ---

function generateToken(email) {
  const payload = {
    email,
    iat: Date.now(),
    exp: Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
  };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
}

function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  req.user = payload;
  next();
}

// --- LOG PARSING ENGINE ---

const parseDate = (dateString) => {
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const parts = dateString.match(/(\w{3})\s+(\d+)\s+(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
        const now = new Date();
        let year = now.getFullYear();
        const month = monthMap[parts[1]];
        const day = parseInt(parts[2], 10);
        
        if (month > now.getMonth()) {
            year--;
        }

        return new Date(year, month, day, parseInt(parts[3], 10), parseInt(parts[4], 10), parseInt(parts[5], 10));
    }
    
    return null;
};

const parseLogLine = (line) => {
    const dateMatch = line.match(/^(?:(\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})|([0-9T:.\-+]+))\s+/);
    if (!dateMatch) return null;

    const rawTimestamp = dateMatch[1] || dateMatch[2];
    const timestamp = parseDate(rawTimestamp);
    if (!timestamp) return null;

    const content = line.substring(dateMatch[0].length);
    const parts = content.match(/(\S+)\s+postfix\/(\w+)\[(\d+)\]:\s+(.*)/);
    if (!parts) return null;

    const [, hostname, process, pid, message] = parts;
    const queueIdMatch = message.match(/^([A-F0-9]{10,})/);
    const queueId = queueIdMatch ? queueIdMatch[1] : null;

    return {
        timestamp,
        hostname,
        process,
        message,
        queueId,
        line
    };
};

const aggregateLogs = (parsedLogs) => {
    const messages = {};

    for (const log of parsedLogs) {
        if (!log || !log.queueId) continue;

        if (!messages[log.queueId]) {
            messages[log.queueId] = {
                id: log.queueId,
                timestamp: log.timestamp,
                from: null,
                to: null,
                status: 'info',
                detail: '',
                lines: [],
            };
        }

        const msg = messages[log.queueId];
        msg.lines.push(log.line);

        const fromMatch = log.message.match(/from=<([^>]+)>/);
        if (fromMatch) msg.from = fromMatch[1] || 'N/A';

        const toMatch = log.message.match(/to=<([^>]+)>/);
        if (toMatch) msg.to = toMatch[1] || 'N/A';

        const statusMatch = log.message.match(/status=(\w+)/);
        if (statusMatch) {
            msg.status = statusMatch[1].toLowerCase();
            msg.detail = log.message;
            msg.timestamp = log.timestamp;
        }
    }

    return Object.values(messages)
        .filter(m => m.from || m.to)
        .map(m => ({
            ...m,
            from: m.from || 'N/A',
            to: m.to || 'N/A',
            detail: m.detail || m.lines[m.lines.length - 1] || 'No details available.'
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
};

const readAndParseLogs = async () => {
  console.log('Reading and parsing all log files...');
  let allLines = [];
  try {
    const files = await fs.readdir(LOG_DIR);
    const logFiles = files.filter(f => f.startsWith(LOG_PREFIX)).sort().reverse();

    for (const file of logFiles) {
      const filePath = path.join(LOG_DIR, file);
      let content;
      if (file.endsWith('.gz')) {
        const compressedData = await fs.readFile(filePath);
        content = (await gunzip(compressedData)).toString('utf8');
      } else {
        content = await fs.readFile(filePath, 'utf8');
      }
      allLines.push(...content.split('\n'));
    }

    const parsedLogs = allLines.map(parseLogLine).filter(Boolean);
    return aggregateLogs(parsedLogs);
  } catch (error) {
    console.error(`Error reading log files: ${error.message}`);
    return [];
  }
};

const getLogs = async () => {
  try {
    const stats = await fs.stat(POSTFIX_LOG_PATH);
    if (stats.mtimeMs > logCache.lastModified) {
      console.log('Log file changed, re-parsing...');
      const aggregatedLogs = await readAndParseLogs();
      
      logCache.logs = aggregatedLogs;
      logCache.lastModified = stats.mtimeMs;
    } else {
       console.log('Serving logs from cache.');
    }
  } catch (error) {
    if (error.code === 'ENOENT' && logCache.logs.length === 0) {
       console.log('Main log not found, trying to parse rotated logs...');
       logCache.logs = await readAndParseLogs();
       logCache.lastModified = Date.now();
    } else if (error.code !== 'ENOENT') {
       console.error(`Error checking log file status: ${error.message}`);
    }
  }
  return logCache.logs;
};

// --- API ENDPOINTS ---

const validateInputs = (req, res, next) => {
    if (req.path === '/api/login') {
        const { email, password } = req.body;
        if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
    }
    next();
};

app.post('/api/login', validateInputs, (req, res) => {
    const { email, password } = req.body;
    const expectedUser = process.env.DASHBOARD_USER;
    const expectedPassword = process.env.DASHBOARD_PASSWORD;

    if (email === expectedUser && password === expectedPassword) {
        const token = generateToken(email);
        res.status(200).json({ 
            message: 'Login successful',
            token: token,
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.get('/api/logs', authenticate, async (req, res) => {
    try {
        let logs = await getLogs();
        const { startDate, endDate, limit, page, status } = req.query;

        if (startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            logs = logs.filter(log => new Date(log.timestamp) <= endOfDay);
        }

        if (status && status !== 'all') {
            logs = logs.filter(log => log.status === status);
        }

        const totalItems = logs.length;

        if (page && limit) {
            const pageNum = parseInt(page, 10);
            const pageSize = parseInt(limit, 10);
            if (!isNaN(pageNum) && !isNaN(pageSize) && pageNum > 0 && pageSize > 0) {
                const startIndex = (pageNum - 1) * pageSize;
                logs = logs.slice(startIndex, startIndex + pageSize);
            }
        } else if (limit) {
            const numLimit = parseInt(limit, 10);
            if (!isNaN(numLimit) && numLimit > 0) {
               logs = logs.slice(0, numLimit);
            }
        }

        res.json(logs);
    } catch (error) {
        console.error('Error in /api/logs:', error);
        res.status(500).json({ error: 'Failed to retrieve logs.' });
    }
});

app.get('/api/stats', authenticate, async (req, res) => {
    try {
        let logs = await getLogs();
        const { startDate, endDate } = req.query;

        if (startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            logs = logs.filter(log => new Date(log.timestamp) <= endOfDay);
        }

        const stats = {
            total: logs.length,
            sent: logs.filter(l => l.status === 'sent').length,
            bounced: logs.filter(l => l.status === 'bounced').length,
            deferred: logs.filter(l => l.status === 'deferred').length,
            rejected: logs.filter(l => l.status === 'rejected').length,
        };
        res.json(stats);
    } catch (error) {
        console.error('Error in /api/stats:', error);
        res.status(500).json({ error: 'Failed to calculate stats.' });
    }
});

app.get('/api/volume-trends', authenticate, async (req, res) => {
    try {
        let logs = await getLogs();
        const { startDate, endDate } = req.query;

        if (startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            logs = logs.filter(log => new Date(log.timestamp) <= endOfDay);
        }

        const volumeByDay = {};
        logs.forEach(log => {
            const date = new Date(log.timestamp).toISOString().split('T')[0];
            if (!volumeByDay[date]) {
                volumeByDay[date] = { date, sent: 0, bounced: 0, deferred: 0 };
            }
            if (log.status === 'sent') volumeByDay[date].sent++;
            if (log.status === 'bounced') volumeByDay[date].bounced++;
            if (log.status === 'deferred') volumeByDay[date].deferred++;
        });

        const sortedVolume = Object.values(volumeByDay).sort((a,b) => new Date(a.date) - new Date(b.date));

        res.json(sortedVolume);
    } catch (error) {
        console.error('Error in /api/volume-trends:', error);
        res.status(500).json({ error: 'Failed to generate volume trends.' });
    }
});

app.get('/api/recent-activity', authenticate, async (req, res) => {
    try {
        const logs = await getLogs();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentLogs = logs.filter(log => new Date(log.timestamp) > twentyFourHoursAgo);

        const activities = [];
        recentLogs.forEach((log, index) => {
            const line = log.detail.toLowerCase();
            if (line.includes('relay access denied')) {
                activities.push({ id: `sec-${index}`, timestamp: log.timestamp, type: 'security', description: `Relay access denied for a client.` });
            } else if (line.includes('terminating on signal')) {
                activities.push({ id: `sys-${index}`, timestamp: log.timestamp, type: 'system', description: 'Postfix service was stopped or terminated.' });
            } else if (line.includes('daemon started')) {
                activities.push({ id: `sys-${index}`, timestamp: log.timestamp, type: 'system', description: 'Postfix service started.' });
            }
        });
        res.json(activities.slice(0, 5));
    } catch (error) {
        console.error('Error in /api/recent-activity:', error);
        res.status(500).json({ error: 'Failed to get recent activity.' });
    }
});

app.get('/api/allowed-networks', authenticate, async (req, res) => {
  try {
    const data = await fs.readFile(POSTFIX_CONFIG_PATH, 'utf8');
    const lines = data.split('\n');
    const mynetworksLine = lines.find(line => line.trim().startsWith('mynetworks') && !line.trim().startsWith('#'));
    if (mynetworksLine) {
      const [, value] = mynetworksLine.split('=').map(s => s.trim());
      const networks = value.split(/[\s,]+/).filter(Boolean);
      res.json(networks);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(`Error reading Postfix config: ${error.message}`);
    res.status(500).json({ error: `Could not read Postfix config file at ${POSTFIX_CONFIG_PATH}` });
  }
});

// --- UPDATE ALLOWED NETWORKS (NEW ENDPOINT) ---
app.post('/api/allowed-networks', authenticate, async (req, res) => {
  try {
    const { networks } = req.body;
    
    if (!Array.isArray(networks)) {
      return res.status(400).json({ error: 'Networks must be an array' });
    }

    // Validate each network entry
    const validNetworks = networks.filter(net => {
      const trimmed = net.trim();
      // Basic validation for IP, CIDR, or hostname
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
      const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const ipv6Regex = /^\[?[0-9a-fA-F:]+\]?(\/\d{1,3})?$/;
      return trimmed && (ipRegex.test(trimmed) || hostnameRegex.test(trimmed) || ipv6Regex.test(trimmed));
    });

    if (validNetworks.length === 0) {
      return res.status(400).json({ error: 'No valid networks provided' });
    }

    // Read the current config
    const data = await fs.readFile(POSTFIX_CONFIG_PATH, 'utf8');
    const lines = data.split('\n');
    
    // Find and replace the mynetworks line
    let found = false;
    const newLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('mynetworks') && !trimmedLine.startsWith('#')) {
        found = true;
        return `mynetworks = ${validNetworks.join(' ')}`;
      }
      return line;
    });

    // If mynetworks line doesn't exist, add it at the end
    if (!found) {
      newLines.push(`mynetworks = ${validNetworks.join(' ')}`);
    }

    // Write back to the config file
    await fs.writeFile(POSTFIX_CONFIG_PATH, newLines.join('\n'), 'utf8');

    console.log(`Updated mynetworks: ${validNetworks.join(' ')}`);

    res.json({ 
      message: 'Networks updated successfully. Please reload Postfix configuration.',
      networks: validNetworks
    });
  } catch (error) {
    console.error(`Error updating Postfix config: ${error.message}`);
    
    // Provide more specific error messages
    if (error.code === 'EACCES') {
      res.status(500).json({ 
        error: `Permission denied. The server cannot write to ${POSTFIX_CONFIG_PATH}. Please check file permissions.` 
      });
    } else if (error.code === 'ENOENT') {
      res.status(500).json({ 
        error: `Config file not found at ${POSTFIX_CONFIG_PATH}. Please check the POSTFIX_CONFIG_PATH in your .env file.` 
      });
    } else {
      res.status(500).json({ 
        error: `Could not update Postfix config file. ${error.message}` 
      });
    }
  }
});
//AI Log Analysis
app.post('/api/analyze-logs', authenticate, async (req, res) => {
    const { logs, provider, ollamaUrl } = req.body;

    if (!logs || typeof logs !== 'string') {
        return res.status(400).json({ error: 'Log data is required.' });
    }

    if (provider === 'gemini') {
        if (!ai) {
             return res.status(400).json({ error: 'Gemini API key is not configured on the server. Please set API_KEY in the .env file.' });
        }
        try {
            const prompt = `You are an expert Postfix mail server administrator and security analyst with deep knowledge of email infrastructure, SMTP protocols, and mail server security.

Analyze the following Postfix mail server logs in detail:

${logs}

Provide a comprehensive analysis in JSON format with the following structure:

{
  "summary": "A detailed 3-5 paragraph executive summary covering: overall mail server health, mail flow patterns, delivery success rates, any concerning trends, and recommendations for improvement.",
  
  "anomalies": [
    "List specific unusual patterns such as: sudden spikes in mail volume, unusual sender/recipient patterns, atypical delivery times, connection patterns from unexpected sources, deviations from normal behavior, rate limiting triggers, etc. Be specific with examples from the logs."
  ],
  
  "threats": [
    "List potential security threats including: relay access attempts, authentication failures, spam patterns, suspicious sender domains, potential brute force attacks, open relay attempts, malformed message patterns, connections from blacklisted IPs, etc. Include specific log entries as evidence."
  ],
  
  "errors": [
    "List configuration and operational errors such as: DNS lookup failures, connection timeouts, TLS/SSL certificate issues, queue management problems, disk space warnings, delivery failures, bounce patterns, temporary vs permanent failures, specific SMTP error codes encountered, etc."
  ],
  
  "statistics": {
    "totalMessages": "number of messages processed",
    "successRate": "percentage of successfully delivered messages",
    "bounceRate": "percentage of bounced messages",
    "deferredRate": "percentage of deferred messages",
    "topSenderDomains": ["list of most active sender domains"],
    "topRecipientDomains": ["list of most active recipient domains"],
    "peakActivityTime": "time period with highest activity"
  },
  
  "recommendations": [
    "Provide actionable recommendations such as: configuration changes needed, security improvements, performance optimizations, monitoring enhancements, policy adjustments, SPF/DKIM/DMARC improvements, queue management strategies, etc."
  ]
}

Focus on:
- Be specific and cite actual log entries when discussing issues
- Identify patterns across multiple log entries
- Distinguish between temporary issues and systemic problems
- Consider security implications of observed patterns
- Provide context for technical terms
- Prioritize findings by severity and impact`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
                            threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                            errors: { type: Type.ARRAY, items: { type: Type.STRING } },
                            statistics: {
                                type: Type.OBJECT,
                                properties: {
                                    totalMessages: { type: Type.STRING },
                                    successRate: { type: Type.STRING },
                                    bounceRate: { type: Type.STRING },
                                    deferredRate: { type: Type.STRING },
                                    topSenderDomains: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    topRecipientDomains: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    peakActivityTime: { type: Type.STRING }
                                }
                            },
                            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["summary", "anomalies", "threats", "errors", "statistics", "recommendations"],
                    },
                },
            });
            
            const jsonText = response.text.trim();
            const parsedResponse = JSON.parse(jsonText);
            
            // Helper to normalize arrays - convert objects to strings
            const normalizeArray = (arr) => {
                if (!Array.isArray(arr)) return [];
                return arr.map(item => {
                    if (typeof item === 'string') return item;
                    if (typeof item === 'object' && item !== null) {
                        return item.description || item.text || item.message || JSON.stringify(item);
                    }
                    return String(item);
                });
            };
            
            // Normalize the response to ensure all arrays contain only strings
            const normalizedResponse = {
                ...parsedResponse,
                anomalies: normalizeArray(parsedResponse.anomalies),
                threats: normalizeArray(parsedResponse.threats),
                errors: normalizeArray(parsedResponse.errors),
                recommendations: normalizeArray(parsedResponse.recommendations)
            };
            
            res.json(normalizedResponse);
        } catch (error) {
            console.error("Gemini API Error:", error);
            res.status(500).json({ error: `Failed to get analysis from Gemini. ${error.message || ''}` });
        }
    } else if (provider === 'ollama') {
        const urlToUse = ollamaUrl || process.env.OLLAMA_API_BASE_URL;
        if (!urlToUse) {
            return res.status(400).json({ error: 'Ollama server URL is not configured.' });
        }
        try {
            const prompt = `You are an expert Postfix mail server administrator and security analyst. Analyze these Postfix mail logs and provide a detailed JSON response.

Logs to analyze:
${logs}

Provide a comprehensive JSON analysis with this exact structure:
{
  "summary": "A detailed 3-5 paragraph executive summary covering overall mail server health, mail flow patterns, delivery rates, concerning trends, and recommendations",
  "anomalies": ["List specific unusual patterns with examples from logs"],
  "threats": ["List potential security threats with specific evidence from logs"],
  "errors": ["List configuration and operational errors with specific SMTP codes and details"],
  "statistics": {
    "totalMessages": "count",
    "successRate": "percentage",
    "bounceRate": "percentage",
    "deferredRate": "percentage",
    "topSenderDomains": ["domain list"],
    "topRecipientDomains": ["domain list"],
    "peakActivityTime": "time period"
  },
  "recommendations": ["List actionable improvements"]
}

Be specific, cite log entries, identify patterns, and prioritize by severity. Return ONLY valid JSON.`;

            const ollamaResponse = await fetch(`${urlToUse}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama3.2:latest",
                    prompt: prompt,
                    format: 'json',
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 2000  // Allow longer responses
                    }
                }),
            });

            if (!ollamaResponse.ok) {
                const errorBody = await ollamaResponse.text();
                throw new Error(`Ollama server returned an error: ${ollamaResponse.status} ${errorBody}`);
            }

            const ollamaData = await ollamaResponse.json();
            const parsedResponse = JSON.parse(ollamaData.response);
            
            // Helper to normalize arrays - convert objects to strings
            const normalizeArray = (arr) => {
                if (!Array.isArray(arr)) return [];
                return arr.map(item => {
                    if (typeof item === 'string') return item;
                    if (typeof item === 'object' && item !== null) {
                        return item.description || item.text || item.message || JSON.stringify(item);
                    }
                    return String(item);
                });
            };
            
            // Ensure all required fields exist
            const validatedResponse = {
                summary: parsedResponse.summary || 'No summary provided',
                anomalies: normalizeArray(parsedResponse.anomalies),
                threats: normalizeArray(parsedResponse.threats),
                errors: normalizeArray(parsedResponse.errors),
                statistics: parsedResponse.statistics || {
                    totalMessages: 'N/A',
                    successRate: 'N/A',
                    bounceRate: 'N/A',
                    deferredRate: 'N/A',
                    topSenderDomains: [],
                    topRecipientDomains: [],
                    peakActivityTime: 'N/A'
                },
                recommendations: normalizeArray(parsedResponse.recommendations)
            };
            
            res.json(validatedResponse);
        } catch (error) {
            console.error("Ollama Error:", error);
            res.status(500).json({ error: `Failed to get analysis from Ollama. Check if the server is running and accessible. ${error.message || ''}` });
        }
    } else {
        res.status(400).json({ error: 'Invalid AI provider specified.' });
    }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`Token expiry: ${TOKEN_EXPIRY_HOURS} hours`);
});