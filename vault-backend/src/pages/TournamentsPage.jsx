import { useState } from 'react'
import { Link } from 'react-router-dom'

const allTournaments = [
  { id: 1, title: 'Valorant City Wars', game: 'Valorant', prize: 'PKR 10,000', slots: 32, filled: 24, city: 'Faisalabad', status: 'Open', accent: '#ff4655', tag: 'FPS', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1547890/header.jpg' },
  { id: 2, title: 'TEKKEN 8 Grand Slam', game: 'Tekken 8', prize: 'PKR 5,000', slots: 16, filled: 8, city: 'Lahore', status: 'Open', accent: '#f59e0b', tag: 'Fighting', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/header.jpg' },
  { id: 3, title: 'EA FC 25 Super Cup', game: 'EA FC 25', prize: 'PKR 15,000', slots: 32, filled: 30, city: 'Faisalabad', status: 'Filling Fast', accent: '#22c55e', tag: 'Sports', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg' },
  { id: 4, title: 'COD Warzone Invitational', game: 'Call of Duty', prize: 'PKR 20,000', slots: 64, filled: 20, city: 'Islamabad', status: 'Open', accent: '#06b6d4', tag: 'Battle Royale', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg' },
  { id: 5, title: 'Street Fighter 6 Cup', game: 'Street Fighter 6', prize: 'PKR 8,000', slots: 16, filled: 16, city: 'Karachi', status: 'Full', accent: '#ec4899', tag: 'Fighting', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1794960/header.jpg' },
  { id: 6, title: 'PUBG Mobile Elite', game: 'PUBG Mobile', prize: 'PKR 25,000', slots: 100, filled: 60, city: 'Lahore', status: 'Open', accent: '#f97316', tag: 'Battle Royale', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg' },
]

const games = ['All', 'FPS', 'Fighting', 'Sports', 'Battle Royale']
const cities = ['All Cities', 'Faisalabad', 'Lahore', 'Islamabad', 'Karachi']

function TournamentsPage() {
  const [activeGame, setActiveGame] = useState('All')
  const [activeCity, setActiveCity] = useState('All Cities')

  const filtered = allTournaments.filter(t =>
    (activeGame === 'All' || t.tag === activeGame) &&
    (activeCity === 'All Cities' || t.city === activeCity)
  )

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>● ACTIVE TOURNAMENTS</p>
        <h1 style={styles.title}>Find Your Arena</h1>
        <p style={styles.sub}>Browse and join tournaments happening across Pakistan</p>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          {games.map(g => (
            <button key={g} onClick={() => setActiveGame(g)} style={{
              ...styles.filterBtn,
              backgroundColor: activeGame === g ? '#6c63ff' : 'rgba(108,99,255,0.08)',
              color: activeGame === g ? '#fff' : '#8b8ba7',
              border: `1px solid ${activeGame === g ? '#6c63ff' : 'rgba(108,99,255,0.2)'}`,
            }}>{g}</button>
          ))}
        </div>
        <select value={activeCity} onChange={e => setActiveCity(e.target.value)} style={styles.select}>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Cards */}
      <div style={styles.grid}>
        {filtered.map(t => {
          const pct = Math.round((t.filled / t.slots) * 100)
          return (
            <div key={t.id} style={styles.card}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = t.accent + '55' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.15)' }}
            >
              <div style={styles.imgWrap}>
                <img src={t.image} alt={t.game} style={styles.img} onError={e => e.target.style.display = 'none'} />
                <div style={styles.imgOverlay} />
                <span style={{ ...styles.tag, color: t.accent, backgroundColor: t.accent + '22', border: `1px solid ${t.accent}44` }}>{t.tag}</span>
              </div>
              <div style={styles.body}>
                <p style={{ ...styles.game, color: t.accent }}>{t.game}</p>
                <h3 style={styles.cardTitle}>{t.title}</h3>
                <div style={styles.row}>
                  <span style={styles.prize}>{t.prize}</span>
                  <span style={{ ...styles.statusBadge, color: t.status === 'Full' ? '#ef4444' : t.status === 'Open' ? '#22c55e' : '#f59e0b' }}>
                    {t.status === 'Full' ? '✕ FULL' : t.status === 'Open' ? '● OPEN' : '⚡ FILLING'}
                  </span>
                </div>
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: t.accent }} />
                </div>
                <div style={styles.slotRow}>
                  <span style={styles.slotText}>{t.filled}/{t.slots} players</span>
                  <span style={styles.slotText}>📍 {t.city}</span>
                </div>
                <button disabled={t.status === 'Full'} style={{
                  ...styles.joinBtn,
                  background: t.status === 'Full' ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${t.accent}, ${t.accent}bb)`,
                  cursor: t.status === 'Full' ? 'not-allowed' : 'pointer',
                  color: t.status === 'Full' ? '#8b8ba7' : '#fff',
                }}>
                  {t.status === 'Full' ? 'Tournament Full' : 'Join Tournament →'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#060610', padding: '100px 60px 60px' },
  header: { marginBottom: '48px' },
  eyebrow: { color: '#6c63ff', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', marginBottom: '8px' },
  title: { fontFamily: 'Rajdhani, sans-serif', fontSize: '48px', fontWeight: '700', color: '#fff', letterSpacing: '1px', marginBottom: '8px' },
  sub: { color: '#8b8ba7', fontSize: '16px' },
  filters: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' },
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px' },
  select: { backgroundColor: '#0f0f1e', border: '1px solid rgba(108,99,255,0.2)', color: '#fff', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', outline: 'none', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  card: { backgroundColor: '#0f0f1e', borderRadius: '12px', border: '1px solid rgba(108,99,255,0.15)', overflow: 'hidden', transition: 'all 0.3s ease' },
  imgWrap: { position: 'relative', height: '150px' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f0f1e 10%, transparent)' },
  tag: { position: 'absolute', top: '10px', left: '10px', fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.5px' },
  body: { padding: '18px' },
  game: { fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' },
  cardTitle: { fontFamily: 'Rajdhani, sans-serif', fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '12px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  prize: { fontSize: '16px', fontWeight: '700', color: '#fff' },
  statusBadge: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' },
  progressBg: { height: '3px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '8px' },
  progressFill: { height: '100%', borderRadius: '2px' },
  slotRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '14px' },
  slotText: { fontSize: '12px', color: '#8b8ba7' },
  joinBtn: { width: '100%', border: 'none', borderRadius: '6px', padding: '11px', fontSize: '14px', fontWeight: '700', letterSpacing: '0.3px' },
}

export default TournamentsPage