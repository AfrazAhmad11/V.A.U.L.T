# V.A.U.L.T. - Collegiate Esports Platform

V.A.U.L.T. is a premium, cutting-edge esports tournament platform built for competitive gaming, featuring a fully integrated Dual Economy (Fiat + Premium Currency) and advanced Collegiate logic.

## 🚀 Tech Stack
*   **Backend**: ASP.NET Core 8 Web API, Entity Framework Core (SQLite), SignalR (Real-time WebSockets), Stripe.net.
*   **Frontend**: React 19 (Vite), Material UI (MUI 7), Axios, @microsoft/signalr.
*   **Design Language**: Cyberpunk Glassmorphism, Dark Theme (#060610).

## ✨ Features (Iteration 3)
1.  **University Wars (Collegiate System)**: 
    *   Tournaments can be locked exclusively to a `TargetInstitution`.
    *   **Inter-Varsity Leaderboards**: The system dynamically groups players by university and aggregates wins to rank the Top Campuses.
    *   **Campus Champions**: Winning a University War permanently grants players a `CampusChampionCount`, displaying a glowing 🏆 badge on their profile.
    *   **.edu Verification**: Automated "Verified Student" badging for emails ending in `.edu` or `.edu.pk`.
2.  **Ping-Verified Cafe Nodes**:
    *   Tournaments can be flagged as `IsVerifiedCafe`, ensuring offline LAN centers get premium visibility with golden 🛡️ badges.
3.  **Real-Time Brackets (SignalR)**:
    *   Tournament brackets update instantly across all clients globally without requiring a page refresh whenever a match score is reported.
4.  **Premium Wallet & Dual Economy**:
    *   Built-in Escrow system handling Fiat (PKR) and Premium Currency (Vault Points / VP) at a strict 5:1 ratio.
    *   Stripe Checkout integration for seamless Fiat deposits.
    *   **Presentation Mode**: A built-in mock mode gracefully bypasses Stripe if dummy keys are detected, allowing perfect presentations without internet or API keys.

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to the backend directory: `cd vault-backend`
2. Restore packages: `dotnet restore`
3. Run the development server: `dotnet run`
*The server will start on http://localhost:5223. EF Core will automatically create the `vault.db` SQLite database.*

### Frontend Setup
1. Navigate to the frontend directory: `cd vault-frontend`
2. Install dependencies: `npm install`
3. Start Vite dev server: `npm run dev`
*The client will start on http://localhost:5173.*

## 🔒 Stripe Configuration
To use real payments, add your test keys to `vault-backend/appsettings.json`:
```json
"Stripe": {
  "SecretKey": "sk_test_..."
}
```
*Note: Using `sk_test_dummykeyforpresentation1234` activates the Presentation Mock Mode, bypassing Stripe entirely for demonstration purposes.*
