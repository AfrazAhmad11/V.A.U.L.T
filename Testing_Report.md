# V.A.U.L.T. Software Testing & Quality Assurance Report

This report documents the functional testing and Boundary Value Analysis (BVA) performed for the V.A.U.L.T. platform to ensure system reliability and integrity.

---

## 🧪 Task 3A: Functional Testing Techniques Applied

1. **Unit Testing**: Verified individual backend methods for bracket generation, PKR-to-VP conversion ratios, and JWT token validation.
2. **Integration Testing**: Tested the seamless flow between the React Frontend and the .NET Backend, specifically ensuring SignalR WebSockets correctly push match updates.
3. **System Testing**: End-to-end testing of the "Tournament Lifecycle" (Creation -> Registration -> Bracketing -> Scoring -> Resolution).

---

## 📝 Task 3B: Detailed Test Cases (8–10)

| Test ID | Feature Name | Input Data | Expected Output | Actual Output | Status |
|---------|--------------|------------|-----------------|---------------|--------|
| TC-01 | User Registration | Valid email, username, and .edu institution | Account created; student badge awarded | Account created; student badge awarded | PASS |
| TC-02 | User Login | Valid credentials | JWT Token issued; redirect to Landing | JWT Token issued; redirect to Landing | PASS |
| TC-03 | Wallet Deposit | PKR 1,000 (Mock Stripe Mode) | Balance updated to 1,000 PKR | Balance updated to 1,000 PKR | PASS |
| TC-04 | Currency Conversion| Convert 500 PKR to VP | PKR balance -500; VP balance +500 | PKR balance -500; VP balance +500 | PASS |
| TC-05 | Tournament Creation| Valid settings (Valorant, 16 slots) | Tournament listed in public directory | Tournament listed in public directory | PASS |
| TC-06 | Bracket Generation | 8 registered players | 3-round single-elimination bracket | 3-round single-elimination bracket | PASS |
| TC-07 | Score Reporting | Win: 13, Loss: 5 | Match resolved; winner moves up | Match resolved; winner moves up | PASS |
| TC-08 | Dispute Filing | Evidence link and reason | Dispute status: 'Open' in Admin panel | Dispute status: 'Open' in Admin panel | PASS |
| TC-09 | Shop Purchase | Steam Card (5,000 VP) | VP deducted; Unique gift code shown | VP deducted; Unique gift code shown | PASS |
| TC-10 | Role Access | Player attempting to resolve dispute | Access denied (403 Forbidden) | Access denied (403 Forbidden) | PASS |

---

## 📏 Task 3C: Boundary Value Analysis (BVA)

Testing critical input fields and limits.

### 1. Tournament Registration (Max Slots)
* **Limit**: 16 Players
* **Min (1)**: System allows registration. (PASS)
* **Max (16)**: System allows registration and locks tournament. (PASS)
* **Just Below (15)**: System shows 1 slot remaining. (PASS)
* **Just Above (17)**: System returns "Tournament Full" error. (PASS)

### 2. Currency Conversion (Min Amount)
* **Limit**: PKR 5 Minimum
* **Min (5)**: Conversion successful (5 VP). (PASS)
* **Max (N/A)**: Limited by user's total PKR balance. (PASS)
* **Just Below (4)**: Error: "Minimum conversion is 5 PKR". (PASS)
* **Just Above (6)**: Conversion successful (6 VP). (PASS)

### 3. Password Strength (Min Length)
* **Limit**: 6 Characters
* **Min (6)**: Registration successful. (PASS)
* **Max (50)**: Registration successful. (PASS)
* **Just Below (5)**: Error: "Password must be at least 6 characters". (PASS)
* **Just Above (7)**: Registration successful. (PASS)

### 4. Tournament Entry Fee
* **Limit**: PKR 0 (Free Entry)
* **Min (0)**: Tournament is created as 'Free to Join'. (PASS)
* **Just Below (-1)**: Error: "Entry fee cannot be negative". (PASS)
* **Just Above (1)**: Tournament requires PKR 1 balance to join. (PASS)

---
*Report generated for V.A.U.L.T. Final Project Submission.*
