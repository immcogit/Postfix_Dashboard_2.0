# 📧 Postfix Mail Relay Dashboard

A modern, full-stack web application for monitoring and managing Postfix mail server logs with AI-powered analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

The Postfix Mail Relay Dashboard is a comprehensive monitoring solution that provides real-time insights into your Postfix mail server operations. It features an intuitive web interface, advanced log analysis, AI-powered anomaly detection, and comprehensive mail flow statistics.

### Key Highlights

- **Real-time Monitoring**: Track mail delivery, bounces, and deferrals in real-time
- **AI-Powered Analysis**: Leverage Gemini or Ollama AI to detect anomalies, threats, and errors
- **Interactive Dashboard**: Visualize mail volume trends with interactive charts
- **Network Management**: Add, remove, and manage allowed relay networks directly from the UI
- **Advanced Filtering**: Filter logs by date range, status, and search criteria
- **Export Capabilities**: Export log data to CSV for external analysis
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## ✨ Features

### Dashboard
- 📊 **Real-time Statistics**: Total mails, delivered, bounced, and deferred counts
- 📈 **Volume Trends Chart**: Visualize mail flow patterns over time
- 🔔 **Recent Critical Activity**: Monitor security events and system alerts
- 🎯 **Quick Filters**: Easily switch between Today, Last 7 Days, Last 30 Days views
- 🖱️ **Interactive Stats Cards**: Click on any stat card to drill down into specific logs

### Mail Logs
- 📝 **Detailed Log Table**: View all mail transactions with timestamps, sender, recipient, status
- 🔍 **Advanced Filtering**: Filter by date range, delivery status (sent/bounced/deferred/rejected)
- 📄 **Pagination**: Efficient browsing with configurable page sizes (25, 50, 100, 200)
- 💾 **Export to CSV**: Download filtered logs for external analysis
- 🔎 **Log Details Modal**: Click any log entry to view full details

### AI Log Analysis
- 🤖 **AI-Powered Insights**: Get intelligent analysis using Gemini API or local Ollama
- 📊 **Comprehensive Reports**: 
  - Executive summary with actionable insights
  - Key statistics (success rate, bounce rate, etc.)
  - Anomaly detection with specific examples
  - Security threat identification
  - Configuration error analysis
  - Actionable recommendations
- 🎚️ **Configurable Analysis**: Choose number of logs to analyze (25-200)
- ✍️ **Manual Analysis**: Paste specific log snippets for targeted analysis

### Network Management
- 🌐 **Visual Network List**: See all allowed relay networks at a glance
- ➕ **Add Networks**: Add new IPs, CIDR ranges, or hostnames with validation
- 🗑️ **Remove Networks**: Easily remove networks with one click
- 📋 **Copy Functionality**: Copy individual networks or all networks at once
- ✅ **Input Validation**: Automatic validation of IP addresses, CIDR notation, and hostnames
- ⚠️ **Safety Warnings**: Clear warnings about security implications

### Security Features
- 🔐 **JWT Authentication**: Secure token-based authentication
- ⏱️ **Session Management**: Configurable token expiry (default 24 hours)
- 🛡️ **Protected Routes**: All API endpoints require authentication
- 🔒 **Environment Variables**: Sensitive data stored in .env files

## 🏗️ Architecture

```
postfix-dashboard/
├── backend/                 # Node.js/Express backend
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Backend configuration
│
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MailLogTable.tsx
│   │   │   ├── AILogAnalysis.tsx
│   │   │   ├── AllowedNetworks.tsx
│   │   │   └── ...
│   │   ├── services/      # API service layer
│   │   │   ├── apiService.ts
│   │   │   └── authService.ts
│   │   ├── context/       # React context
│   │   │   └── AuthContext.tsx
│   │   ├── types.ts       # TypeScript types
│   │   └── config/        # Configuration
│   ├── package.json       # Frontend dependencies
│   └── .env              # Frontend configuration
│
└── README.md             # This file
```

### Technology Stack

**Backend:**
- Node.js 18+
- Express.js 4.19
- Google Generative AI (Gemini)
- CORS, dotenv

**Frontend:**
- React 18.2
- TypeScript 5.2
- Vite 7.1
- Recharts 2.12
- Tailwind CSS 3.x

## 📸 Screenshots

### Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)

### AI Log Analysis
![AI Analysis](docs/screenshots/ai-analysis.png)

### Mail Logs
![Mail Logs](docs/screenshots/mail-logs.png)

### Network Management
![Networks](docs/screenshots/networks.png)

## 🔧 Prerequisites

Before installation, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Postfix** mail server installed and running
- **Access to Postfix logs** (typically `/var/log/mail.log`)
- **(Optional)** Gemini API key for AI analysis ([Get API Key](https://makersuite.google.com/app/apikey))
- **(Optional)** Ollama installed for local AI analysis ([Install Ollama](https://ollama.ai/))

### System Requirements

- **OS**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+, RHEL 8+)
- **RAM**: Minimum 2GB, Recommended 4GB
- **Disk**: 500MB free space
- **Network**: Internet connection (for Gemini AI) or local network (for Ollama)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/postfix-dashboard.git
cd postfix-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
# backend/.env

# Server Configuration
PORT=3001

# Authentication
DASHBOARD_USER=admin@example.com
DASHBOARD_PASSWORD=YourSecurePassword123!
TOKEN_SECRET=your-random-secret-key-here-min-32-chars
TOKEN_EXPIRY_HOURS=24

# Postfix Configuration
POSTFIX_LOG_PATH=/var/log/mail.log
POSTFIX_CONFIG_PATH=/etc/postfix/main.cf

# AI Configuration (Optional)
API_KEY=your-gemini-api-key-here
OLLAMA_API_BASE_URL=http://localhost:11434
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```bash
# frontend/.env

# API Configuration
VITE_API_BASE_URL=
VITE_API_TIMEOUT=30000

# Authentication
VITE_TOKEN_EXPIRY_HOURS=24

# Application
VITE_APP_NAME=Postfix Dashboard
VITE_APP_VERSION=2.0.0
```

**Note:** Leave `VITE_API_BASE_URL` empty for development (uses Vite proxy).

### 4. File Permissions

Ensure the backend has permission to read Postfix logs:

```bash
# Option 1: Add user to postfix group
sudo usermod -a -G postfix $USER
sudo chmod 640 /var/log/mail.log
sudo chown root:postfix /var/log/mail.log

# Option 2: For testing, use a copy
sudo cp /var/log/mail.log /tmp/mail.log
sudo chmod 644 /tmp/mail.log
# Then set POSTFIX_LOG_PATH=/tmp/mail.log in backend/.env
```

For network management, grant write access to `main.cf`:

```bash
# Option 1: Production
sudo chmod 664 /etc/postfix/main.cf
sudo chown root:postfix /etc/postfix/main.cf

# Option 2: Testing
sudo cp /etc/postfix/main.cf /tmp/main.cf
sudo chmod 666 /tmp/main.cf
# Then set POSTFIX_CONFIG_PATH=/tmp/main.cf in backend/.env
```

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | `3001` | No |
| `DASHBOARD_USER` | Login email | - | Yes |
| `DASHBOARD_PASSWORD` | Login password | - | Yes |
| `TOKEN_SECRET` | JWT secret key | Random | No |
| `TOKEN_EXPIRY_HOURS` | Token validity | `24` | No |
| `POSTFIX_LOG_PATH` | Path to mail.log | `/var/log/mail.log` | Yes |
| `POSTFIX_CONFIG_PATH` | Path to main.cf | `/etc/postfix/main.cf` | Yes |
| `API_KEY` | Gemini API key | - | No |
| `OLLAMA_API_BASE_URL` | Ollama server URL | `http://localhost:11434` | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend URL (empty for dev) | `` | No |
| `VITE_API_TIMEOUT` | Request timeout (ms) | `30000` | No |
| `VITE_TOKEN_EXPIRY_HOURS` | Token expiry | `24` | No |
| `VITE_APP_NAME` | Application name | `Postfix Dashboard` | No |
| `VITE_APP_VERSION` | App version | `2.0.0` | No |

## 🚀 Development

### Start Backend Server

```bash
cd backend
npm start
```

The backend will start on `http://localhost:3001`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

Login with the credentials you set in `backend/.env`:
- Email: `admin@example.com`
- Password: `YourSecurePassword123!`

## 🌐 Deployment

### Production Build

#### 1. Build Frontend

```bash
cd frontend
npm run build
```

This creates optimized files in `frontend/dist/`

#### 2. Configure Production Environment

Update `frontend/.env`:
```bash
VITE_API_BASE_URL=http://your-server-ip:3001
```

Update `backend/.env` with production credentials.

#### 3. Serve Frontend

**Option A: Using Nginx**

```nginx
# /etc/nginx/sites-available/postfix-dashboard

server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/postfix-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Option B: Using PM2 (Node.js apps)**

Serve frontend and backend together:

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name postfix-backend

# Serve frontend
cd ../frontend
pm2 serve dist 3000 --name postfix-frontend --spa

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker (Optional)

Create `Dockerfile` in the root:

```dockerfile
# Backend
FROM node:18-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ ./

# Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production
FROM node:18-alpine
WORKDIR /app
COPY --from=backend /app/backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t postfix-dashboard .
docker run -p 3001:3001 -v /var/log:/var/log postfix-dashboard
```

### SSL/HTTPS Setup

For production, use Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📚 API Documentation

### Authentication

All API endpoints (except `/api/login`) require authentication via JWT token.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### POST `/api/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/api/logs`
Retrieve mail logs with optional filters.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `status` (optional): `sent`, `bounced`, `deferred`, `rejected`, or `all`
- `limit` (optional): Number of logs to return
- `page` (optional): Page number for pagination

**Response:**
```json
[
  {
    "id": "ABC123456789",
    "timestamp": "2024-01-15T10:30:00Z",
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "status": "sent",
    "detail": "status=sent (250 OK)"
  }
]
```

#### GET `/api/stats`
Get aggregated mail statistics.

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response:**
```json
{
  "total": 1000,
  "sent": 850,
  "bounced": 50,
  "deferred": 75,
  "rejected": 25
}
```

#### GET `/api/volume-trends`
Get mail volume trends over time.

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "sent": 100,
    "bounced": 5,
    "deferred": 10
  }
]
```

#### GET `/api/allowed-networks`
Get list of allowed relay networks.

**Response:**
```json
["127.0.0.0/8", "192.168.1.0/24", "[::1]/128"]
```

#### POST `/api/allowed-networks`
Update allowed relay networks.

**Request:**
```json
{
  "networks": ["127.0.0.0/8", "192.168.1.0/24", "10.0.0.0/8"]
}
```

**Response:**
```json
{
  "message": "Networks updated successfully. Please reload Postfix configuration.",
  "networks": ["127.0.0.0/8", "192.168.1.0/24", "10.0.0.0/8"]
}
```

#### POST `/api/analyze-logs`
Analyze logs using AI.

**Request:**
```json
{
  "logs": "log content here...",
  "provider": "gemini",
  "ollamaUrl": "http://localhost:11434"
}
```

**Response:**
```json
{
  "summary": "Detailed analysis summary...",
  "anomalies": ["Anomaly 1", "Anomaly 2"],
  "threats": ["Threat 1"],
  "errors": ["Error 1", "Error 2"],
  "statistics": {
    "totalMessages": "100",
    "successRate": "85%",
    "bounceRate": "5%",
    "deferredRate": "10%"
  },
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
```

## 🔍 Troubleshooting

### Backend won't start

**Problem:** `EACCES: permission denied, open '/var/log/mail.log'`

**Solution:**
```bash
sudo usermod -a -G postfix $USER
# Log out and back in
sudo chmod 640 /var/log/mail.log
```

### Frontend can't connect to backend

**Problem:** `ERR_CONNECTION_REFUSED`

**Solution:**
1. Ensure backend is running: `cd backend && npm start`
2. Check `VITE_API_BASE_URL` is empty in `frontend/.env`
3. Verify Vite proxy in `frontend/vite.config.ts`

### No logs appear in dashboard

**Problem:** Dashboard shows 0 logs

**Solutions:**
1. Check log file exists: `ls -la /var/log/mail.log`
2. Verify log path in `backend/.env`
3. Check backend console for parsing errors
4. Adjust date filter to include log dates

### AI Analysis fails

**Problem:** AI analysis returns error

**Solutions:**

For Gemini:
1. Verify `API_KEY` in `backend/.env`
2. Check API quota at [Google AI Studio](https://makersuite.google.com/)
3. Ensure internet connectivity

For Ollama:
1. Check Ollama is running: `ollama list`
2. Verify `OLLAMA_API_BASE_URL` is correct
3. Ensure llama3.2 model is installed: `ollama pull llama3.2`

### Network management fails

**Problem:** Cannot save network changes

**Solution:**
```bash
# Grant write permission
sudo chmod 664 /etc/postfix/main.cf
sudo chown root:postfix /etc/postfix/main.cf
sudo usermod -a -G postfix $USER
```

### Build errors

**Problem:** `npm run build` fails

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Keep commits atomic and meaningful

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Postfix](http://www.postfix.org/) - The mail transfer agent
- [React](https://reactjs.org/) - Frontend framework
- [Recharts](https://recharts.org/) - Charting library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI analysis
- [Ollama](https://ollama.ai/) - Local AI models

## 📞 Support

For issues and questions:
- Open an issue on [GitHub Issues](https://github.com/yourusername/postfix-dashboard/issues)
- Check [Documentation](https://github.com/yourusername/postfix-dashboard/wiki)
- Email: support@example.com

## 🗺️ Roadmap

- [ ] Email notifications for critical events
- [ ] Multi-server support
- [ ] Advanced search with regex
- [ ] Custom dashboards
- [ ] Real-time log streaming (WebSocket)
- [ ] LDAP/Active Directory authentication
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Scheduled reports

---

**Made with ❤️ for the mail server community**
