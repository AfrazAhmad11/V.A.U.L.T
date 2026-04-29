async function fetchJson(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`http://localhost:5223/api${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
    }
    return res.json();
}

async function seed() {
    try {
        console.log("Seeding data...");
        // 2. Login as Player1 (Organizer)
        const resLogin = await fetchJson('/auth/login', 'POST', { email: 'p1@test.com', password: 'Password123!' });
        const token = resLogin.token;
        console.log("Logged in as Player1");

        // 3. Create Tournament
        const resTourn = await fetchJson('/tournaments', 'POST', {
            title: 'Faisalabad Masters 2026',
            gameTitle: 'Valorant',
            gameTag: 'FPS',
            entryFee: 500,
            prizePool: 5000,
            maxSlots: 8,
            startDate: new Date(Date.now() + 86400000).toISOString(),
            city: 'Faisalabad'
        }, token);
        const tId = resTourn.tournamentId;
        console.log("Created tournament", tId);

        // 4. Join all 4 players
        for (let i=1; i<=4; i++) {
            const login = await fetchJson('/auth/login', 'POST', { email: `p${i}@test.com`, password: 'Password123!' });
            try {
                await fetchJson(`/tournaments/${tId}/join`, 'POST', {}, login.token);
                console.log(`Player${i} joined tournament`);
            } catch(e) {}
        }

        // 5. Generate Bracket
        try {
            await fetchJson(`/brackets/generate/${tId}`, 'POST', {}, token);
            console.log("Bracket generated!");
        } catch(e) {
            console.log("Bracket already generated or error", e.message);
        }

        console.log("Seed complete. Tournament ID:", tId);

    } catch (err) {
        console.error("Fatal error:", err.message);
    }
}
seed();
