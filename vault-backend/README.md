# V.A.U.L.T — Virtual Arena for Unified Live Tournaments

<p align="center">
  <strong>⬡ A competitive esports tournament management platform for Pakistan's gaming community</strong>
</p>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Team Members](#team-members)

---

## About the Project

**V.A.U.L.T** is a full-stack web application designed to streamline competitive gaming tournament management across Pakistan. It enables organizers to create and manage tournaments, players to register and compete in single-elimination brackets, and admins to oversee disputes and match integrity.

### Key Highlights
- Real-time bracket generation with rank-based seeding
- Role-based access control (Player / Organizer / Admin)
- Match score reporting with automatic winner advancement
- Dispute filing and resolution system
- In-app wallet system (PKR currency)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Vite | React 19, Vite 8 |
| **UI Library** | Material UI (MUI) | 7.x |
| **HTTP Client** | Axios | 1.x |
| **Routing** | React Router DOM | 7.x |
| **Backend** | ASP.NET Core Web API | .NET 8.0 |
| **ORM** | Entity Framework Core | 8.0 |
| **Database** | SQLite | via EF Core |
| **Authentication** | JWT Bearer Tokens | HMAC-SHA256 |
| **Password Hashing** | BCrypt.Net | Work factor 12 |
| **API Docs** | Swagger / OpenAPI | Swashbuckle 6.x |

---

## Features

### For Players
- ✅ Account registration with game tag, city, and rank selection
- ✅ Browse and filter tournaments by game type and city
- ✅ Join open tournaments
- ✅ View live bracket progression
- ✅ Report match scores
- ✅ File disputes with evidence
- ✅ Profile management (edit username, rank, bio, etc.)

### For Organizers
- ✅ Create tournaments with custom settings (game, prize pool, entry fee, max slots)
- ✅ Generate single-elimination brackets with automatic seeding
- ✅ View and resolve match disputes
- ✅ Manage tournament lifecycle (Open → InProgress → Completed)

### For Admins
- ✅ Full access to all organizer features
- ✅ Dispute resolution with winner override

---

## System Architecture

V.A.U.L.T follows a **Layered Architecture** pattern:

```
┌──────────────────────────────────────────────┐
│           FRONTEND (React + Vite)            │
│     Pages → Components → API Layer (Axios)   │
└──────────────────┬───────────────────────────┘
                   │ HTTP / REST (JSON)
                   │ Authorization: Bearer <JWT>
┌──────────────────▼───────────────────────────┐
│         BACKEND (ASP.NET Core Web API)       │
│  Controllers → Services → DbContext → Models │
└──────────────────┬───────────────────────────┘
                   │ Entity Framework Core
┌──────────────────▼───────────────────────────┐
│            DATABASE (SQLite)                 │
│             vault.db (file)                  │
└──────────────────────────────────────────────┘
```

---

## Prerequisites

Ensure the following are installed on your system:

| Software | Version | Download |
|----------|---------|----------|
| **.NET SDK** | 8.0+ | https://dotnet.microsoft.com/download |
| **Node.js** | 18+ | https://nodejs.org |
| **npm** | 9+ | Comes with Node.js |
| **Git** | Latest | https://git-scm.com |

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/V.A.U.L.T.git
cd V.A.U.L.T
```

### 2. Backend Setup

```bash
cd vault-backend

# Restore NuGet packages
dotnet restore

# Apply database migrations (creates vault.db)
dotnet ef database update
```

### 3. Frontend Setup

```bash
cd vault-frontend

# Install npm dependencies
npm install
```

---

## Running the Application

You need **two separate terminals** running simultaneously:

### Terminal 1 — Backend (Port 5223)

```bash
cd vault-backend
dotnet run
```

Wait for: `Now listening on: http://localhost:5223`

### Terminal 2 — Frontend (Port 5173)

```bash
cd vault-frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### Access Points

| Service | URL |
|---------|-----|
| **Frontend App** | http://localhost:5173 |
| **Backend API** | http://localhost:5223/api |
| **Swagger Docs** | http://localhost:5223/swagger |

> **Note:** If you get a PowerShell execution policy error, run:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login & get JWT | Public |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get current user profile | JWT |
| PUT | `/api/users/profile` | Update profile | JWT |

### Tournaments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tournaments` | List all (filter: ?tag, ?city) | Public |
| GET | `/api/tournaments/{id}` | Get single tournament | Public |
| POST | `/api/tournaments` | Create tournament | Organizer |
| POST | `/api/tournaments/{id}/join` | Join a tournament | JWT |

### Brackets
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/brackets/generate/{id}` | Generate bracket | Organizer |
| GET | `/api/brackets/{id}` | Get bracket with matches | Public |

### Matches
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/matches/{id}` | Get match details | JWT |
| POST | `/api/matches/{id}/report` | Report match score | JWT |

### Disputes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/disputes` | File a dispute | JWT |
| GET | `/api/disputes` | List all disputes | Organizer |
| PUT | `/api/disputes/{id}/resolve` | Resolve dispute | Organizer |

---

## Project Structure

```
V.A.U.L.T/
├── vault-backend/                # ASP.NET Core Web API
│   ├── Controllers/              # API endpoints
│   │   ├── AuthController.cs
│   │   ├── UsersController.cs
│   │   ├── TournamentsController.cs
│   │   ├── BracketController.cs
│   │   ├── MatchController.cs
│   │   └── DisputeController.cs
│   ├── Models/                   # Entity models
│   │   ├── User.cs
│   │   ├── Tournament.cs
│   │   ├── TournamentRegistration.cs
│   │   ├── Bracket.cs
│   │   ├── Match.cs
│   │   ├── Dispute.cs
│   │   ├── Wallet.cs
│   │   └── Transaction.cs
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Services/                 # Business logic
│   │   ├── JwtService.cs
│   │   └── BracketService.cs
│   ├── Data/
│   │   └── AppDbContext.cs       # EF Core database context
│   ├── Migrations/               # Database migrations
│   ├── Program.cs                # App entry point & config
│   ├── appsettings.json          # Configuration
│   └── vault.db                  # SQLite database file
│
└── vault-frontend/               # React + Vite SPA
    ├── src/
    │   ├── api/                  # Axios API layer
    │   │   ├── config.js         # Base URL + JWT interceptor
    │   │   ├── auth.js
    │   │   └── tournaments.js
    │   ├── components/
    │   │   └── Navbar.jsx        # Navigation bar
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── TournamentsPage.jsx
    │   │   ├── CreateTournamentPage.jsx
    │   │   ├── BracketPage.jsx
    │   │   └── DisputesPage.jsx
    │   ├── App.jsx               # Routes
    │   └── main.jsx              # Entry point
    ├── package.json
    └── vite.config.js
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Player** | Register, login, join tournaments, view brackets, report scores, file disputes, manage profile |
| **Organizer** | All Player permissions + create tournaments, generate brackets, view & resolve disputes |
| **Admin** | All Organizer permissions + full system access |

---

## Database Schema

### Entity Relationship Summary

- **User** (1) → (N) **Tournament** (as Organizer)
- **User** (N) ↔ (N) **Tournament** (via TournamentRegistration)
- **User** (1) → (1) **Wallet**
- **Wallet** (1) → (N) **Transaction**
- **Tournament** (1) → (1) **Bracket**
- **Bracket** (1) → (N) **Match**
- **Match** (1) → (N) **Dispute**
- **Match** → self-referencing (NextMatchId for bracket progression)

---

## Team Members

| Member | Role | Contributions |
|--------|------|--------------|
| Afraz Ahmad | Full Stack Developer | Frontend Design, Backend API, Database Schema, Authentication, Bracket Algorithm, Dispute System, Documentation |
| Aoun Raza | Full Stack Developer | Frontend UI/UX, React Pages, Testing, Project Report |

---

## License

This project was developed as a university coursework assignment for Software Engineering.

---

<p align="center">
  <strong>⬡ V.A.U.L.T — Built for Pakistan's Competitive Gaming Community</strong>
</p>
