# V.A.U.L.T — Virtual Arena for Unified Live Tournaments

<p align="center">
  <strong>⬡ A premium, competitive esports tournament management platform for Pakistan's gaming community</strong>
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

**V.A.U.L.T** is a full-stack web application designed to streamline competitive gaming tournament management across Pakistan. It enables organizers to create and manage tournaments, players to register and compete in single-elimination brackets, and admins to oversee disputes and match integrity. 

It features an integrated **Dual Economy (Fiat + Premium Currency)** and advanced **Collegiate Esports** logic to handle inter-varsity rivalries. The platform is built with a high-performance **Cyberpunk Glassmorphism** aesthetic, ensuring a premium feel across all devices.

### Key Highlights
- **Real-time Engine**: Bracket generation with rank-based seeding and **SignalR Live WebSockets**.
- **Visual Excellence**: Bespoke Cyberpunk Glassmorphism UI with custom animations and official brand assets.
- **Responsive Architecture**: Fully optimized for Mobile (390px+) and Ultra-Wide Desktop resolutions.
- **Dual Wallet System**: PKR & Vault Points (VP) integration with **Stripe API** (Mock/Live modes).
- **Collegiate Wars**: University-locked tournament logic with `.edu` verification.
- **Scale (Final Demo State)**: 5,000+ Registered Players, 500+ Tournaments Hosted, 50+ Verified Universities.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Vite | React 19, Vite 8 |
| **Styling** | Vanilla CSS + Inline Styles | Cyberpunk Glassmorphism |
| **Responsive** | Custom Media Queries | Mobile-First Stacking |
| **HTTP Client** | Axios | 1.x |
| **Routing** | React Router DOM | 7.x |
| **Real-time Engine** | SignalR | @microsoft/signalr |
| **Backend** | ASP.NET Core Web API | .NET 8.0 |
| **ORM** | Entity Framework Core | 8.0 |
| **Database** | SQLite | via EF Core |
| **Payment Gateway**| Stripe.net | 43.x |
| **Authentication** | JWT Bearer Tokens | HMAC-SHA256 |
| **Password Hashing** | BCrypt.Net | Work factor 12 |
| **API Docs** | Swagger / OpenAPI | Swashbuckle 6.x |

---

## Features

### For Players
- ✅ Account registration with game tag, city, and rank selection
- ✅ Browse and filter tournaments by game type and city
- ✅ Join open tournaments (including institution-locked Collegiate Wars)
- ✅ View live bracket progression in real-time
- ✅ Report match scores
- ✅ File disputes with evidence
- ✅ Profile management (edit username, rank, bio, university, etc.)
- ✅ Earn **Campus Champion Badges** & **Verified Student Badges**
- ✅ Deposit PKR safely using Stripe Checkout and convert to Vault Points (VP)
- ✅ Shop with VP to purchase Gift Cards

### For Organizers
- ✅ Create tournaments with custom settings (game, prize pool, entry fee, max slots)
- ✅ Host **University Wars** (lock tournaments to a `TargetInstitution`)
- ✅ Ping-Verified Cafe Flags (highlighting LAN centers with golden badges)
- ✅ Generate single-elimination brackets with automatic seeding
- ✅ View and resolve match disputes
- ✅ Manage tournament lifecycle (Open → InProgress → Completed)

### For Admins
- ✅ Full access to all organizer features
- ✅ Dispute resolution with winner override

---

## System Architecture

V.A.U.L.T follows a **Layered Architecture** pattern with Real-Time Capabilities:

```
┌──────────────────────────────────────────────────┐
│             FRONTEND (React + Vite)              │
│       Pages → Components → API Layer (Axios)     │
└─────────┬───────────────────────────────▲────────┘
          │ HTTP / REST (JSON)            │ WebSockets (SignalR)
          │ Authorization: Bearer <JWT>   │ MatchUpdated Events
┌─────────▼───────────────────────────────┴────────┐
│           BACKEND (ASP.NET Core Web API)         │
│ Controllers ↔ Hubs ↔ Services ↔ DbContext ↔ Stripe│
└─────────────────────────┬────────────────────────┘
                          │ Entity Framework Core
┌─────────────────────────▼────────────────────────┐
│                  DATABASE (SQLite)               │
│                   vault.db (file)                │
└──────────────────────────────────────────────────┘
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
git clone https://github.com/AfrazAhmad11/V.A.U.L.T.git
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

## Stripe Presentation Mode

To use real payments, add your Stripe test keys to `vault-backend/appsettings.json`. 

If the key is set to `"sk_test_dummykeyforpresentation1234"`, the backend safely activates **Presentation Mock Mode**. This bypasses Stripe entirely and immediately redirects back with a successful deposit simulation, allowing for flawless live university presentations without needing a developer account or internet access.

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
| GET | `/api/users/leaderboard/campuses` | Inter-Varsity ranking | Public |

### Tournaments & Brackets
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tournaments` | List all (filter: ?tag, ?city) | Public |
| POST | `/api/tournaments` | Create tournament | Organizer |
| POST | `/api/tournaments/{id}/join` | Join a tournament | JWT |
| POST | `/api/brackets/generate/{id}` | Generate bracket | Organizer |
| GET | `/api/brackets/{id}` | Get bracket with matches | Public |

### Matches & Disputes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/matches/{id}/report` | Report match score | JWT |
| POST | `/api/disputes` | File a dispute | JWT |
| PUT | `/api/disputes/{id}/resolve` | Resolve dispute | Organizer |

### Wallet
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/wallet/my-balance` | Get Fiat & VP balances | JWT |
| POST | `/api/wallet/create-checkout-session` | Initialize Stripe Deposit | JWT |
| POST | `/api/wallet/verify-session` | Credit session deposit | JWT |
| POST | `/api/wallet/convert` | Convert PKR to VP | JWT |

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
│   │   ├── DisputeController.cs
│   │   └── WalletController.cs   # Dual Economy & Stripe logic
│   ├── Hubs/
│   │   └── TournamentHub.cs      # SignalR WebSockets Hub
│   ├── Models/                   # Entity models
│   │   ├── User.cs
│   │   ├── Tournament.cs
│   │   ├── TournamentRegistration.cs
│   │   ├── Bracket.cs
│   │   ├── Match.cs
│   │   ├── Dispute.cs
│   │   ├── Wallet.cs
│   │   └── Transaction.cs
│   ├── Services/                 # Business logic
│   ├── Data/
│   │   └── AppDbContext.cs       # EF Core database context
│   ├── Program.cs                # App entry point & config
│   ├── appsettings.json          # Configuration (DB, JWT, Stripe)
│   └── vault.db                  # SQLite database file
│
└── vault-frontend/               # React + Vite SPA
    ├── src/
    │   ├── api/                  # Axios API layer
    │   │   └── config.js         # Base URL + JWT interceptor
    │   ├── components/
    │   │   └── Navbar.jsx        # Navigation bar
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx & RegisterPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── TournamentsPage.jsx
    │   │   ├── CreateTournamentPage.jsx
    │   │   ├── BracketPage.jsx   # Live Bracket (SignalR Client)
    │   │   ├── DisputesPage.jsx
    │   │   ├── LeaderboardPage.jsx
    │   │   ├── ShopPage.jsx
    │   │   └── WalletPage.jsx    # Premium Dual Economy UI
    │   ├── App.jsx               # Routes
    │   └── main.jsx              # Entry point
    └── package.json
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Player** | Register, login, join tournaments, view brackets, report scores, file disputes, manage profile, deposit wallet |
| **Organizer** | All Player permissions + create tournaments, generate brackets, view & resolve disputes |
| **Admin** | All Organizer permissions + full system access |

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
