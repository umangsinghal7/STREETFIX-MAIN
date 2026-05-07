# 🛠️ StreetFix — Hyper-Local Governance Bridge

A public, map-based transparency portal where citizens pin infrastructure issues and local authorities must "close" the ticket with a photo of the fix.

## Features

- **Map-Based Reporting** — Drop pins on a Leaflet map to report potholes, broken streetlights, trash, etc.
- **Public Accountability Timeline** — Every report is public with a full history of actions taken.
- **Response Score** — Each ward gets a 0–100 score based on resolution rate and speed.
- **Auto-Escalation** — Unresolved issues after 7 days turn red and trigger automated emails to local representatives.
- **Before & After Photos** — Authorities must upload a verification photo to close a ticket.
- **Upvoting** — Citizens can upvote reports to surface priority issues.

## Tech Stack

- **Frontend:** React, React Router, Leaflet (maps), Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB with geospatial indexing
- **Notifications:** Nodemailer + node-cron for automated escalation emails

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### Installation

```bash
# Install all dependencies
npm run install-all

# Seed the database with sample data
npm run seed

# Start development (both server & client)
npm run dev
```

The API runs on `http://localhost:5000` and the React app on `http://localhost:3000`.

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@example.com | password123 |
| Authority | authority@example.com | password123 |
| Admin | admin@example.com | password123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/reports | List all reports (with filters) |
| GET | /api/reports/:id | Get report detail |
| POST | /api/reports | Create new report (auth + photo) |
| PATCH | /api/reports/:id/status | Update status (authority) |
| PATCH | /api/reports/:id/resolve | Resolve with after-photo (authority) |
| POST | /api/reports/:id/upvote | Toggle upvote |
| GET | /api/wards/leaderboard | Ward response scores |

## Escalation Logic

1. A cron job runs every hour
2. Reports open for > 7 days (configurable via `ESCALATION_DAYS`) are flagged
3. Status changes to "escalated" (turns bright red in the UI)
4. An automated email is sent to the ward representative
5. The ward's Response Score is recalculated downward

## Environment Variables

Copy `server/.env.example` to `server/.env` and configure:

```
MONGODB_URI=mongodb://localhost:27017/streetfix
JWT_SECRET=your_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
ESCALATION_DAYS=7
```

## Project Structure

```
streetfix/
├── client/              # React frontend
│   └── src/
│       ├── components/  # Navbar, MapComponent, ReportCard
│       ├── pages/       # Home, MapView, ReportDetail, CreateReport, Leaderboard, Dashboard
│       ├── context/     # AuthContext
│       └── services/    # API client
├── server/              # Express backend
│   ├── models/          # User, Report, Ward (MongoDB schemas)
│   ├── routes/          # auth, reports, wards
│   ├── services/        # emailService, escalationService (cron)
│   ├── middleware/      # auth, upload (multer)
│   └── config/          # database connection
└── README.md
```
