import { useState, useEffect } from 'react'
import { getTournaments, joinTournament } from '../api/tournaments'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/config'
import { Chip } from '@mui/material'

const gameImages = {
  'Valorant': '/valorant.png',
  'Tekken 8': 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/header.jpg',
  'EA FC 25': 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg',
  'Call of Duty': 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg',
  'Street Fighter 6': 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/header.jpg',
  'PUBG Mobile': 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg',
  'eFootball': 'https://cdn.cloudflare.steamstatic.com/steam/apps/1665460/header.jpg',
}

const tagColors = {
  FPS: '#ff4655',
  Fighting: '#f59e0b',
  Sports: '#22c55e',
  'Battle Royale': '#06b6d4',
}

const games = ['All', 'FPS', 'Fighting', 'Sports', 'Battle Royale']
const cities = ['All Cities', 'Faisalabad', 'Lahore', 'Islamabad', 'Karachi']

/**
 * TournamentsPage Component
 * 
 * Provides a discovery hub for all esports competitions.
 * Features:
 * 1. Filter by Game (Valorant, CS2, etc.) and Location (City).
 * 2. Category tabs (Global Open vs University Exclusive).
 * 3. Real-time slot tracking and registration progress.
 * 4. Administrative controls for Organizers (Create/Edit/Delete).
 */
function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [activeGame, setActiveGame] = useState('All')
  const [activeCity, setActiveCity] = useState('All Cities')
  const [activeTab, setActiveTab] = useState('Open')
  const [loading, setLoading] = useState(true)
  const [joinMsg, setJoinMsg] = useState('')
  const [editModal, setEditModal] = useState(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const params = {}
        if (activeGame !== 'All') params.tag = activeGame
        if (activeCity !== 'All Cities') params.city = activeCity
        const res = await getTournaments(params)
        setTournaments(res.data)
      } catch (err) {
        console.error('Failed to fetch tournaments', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [activeGame, activeCity])

  const handleJoin = async (id) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setJoinMsg('Please login first to join a tournament!')
      setTimeout(() => setJoinMsg(''), 3000)
      return
    }
    try {
      const res = await joinTournament(id)
      setJoinMsg(res.data.message)
      // Refresh tournaments to update slot counts
      const updated = await getTournaments(
        activeGame !== 'All' || activeCity !== 'All Cities'
          ? { tag: activeGame !== 'All' ? activeGame : undefined, city: activeCity !== 'All Cities' ? activeCity : undefined }
          : {}
      )
      setTournaments(updated.data)
    } catch (err) {
      setJoinMsg(err.response?.data?.message || 'Failed to join tournament.')
    }
    setTimeout(() => setJoinMsg(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament? All entry fees will be refunded.')) return
    try {
      await api.delete('/tournaments/' + id)
      setJoinMsg('Tournament deleted and entry fees refunded.')
      setTournaments(tournaments.filter(t => t.tournamentId !== id))
    } catch (err) {
      setJoinMsg(err.response?.data?.message || 'Failed to delete tournament.')
    }
    setTimeout(() => setJoinMsg(''), 3000)
  }

  const handleEditSave = async () => {
    try {
      await api.put('/tournaments/' + editModal.tournamentId, editModal)
      setJoinMsg('Tournament updated successfully.')
      setEditModal(null)
      const res = await getTournaments(
        activeGame !== 'All' || activeCity !== 'All Cities'
          ? { tag: activeGame !== 'All' ? activeGame : undefined, city: activeCity !== 'All Cities' ? activeCity : undefined }
          : {}
      )
      setTournaments(res.data)
    } catch (err) {
      setJoinMsg(err.response?.data?.message || 'Failed to update tournament.')
    }
    setTimeout(() => setJoinMsg(''), 3000)
  }

  return (
    <div style={styles.page} className="container">
      <div style={styles.header} className="mobile-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={styles.eyebrow}>● ACTIVE TOURNAMENTS</p>
            <h1 style={{...styles.title, fontSize: 'clamp(32px, 8vw, 48px)'}}>Find Your Arena</h1>
            <p style={styles.sub}>Browse and join tournaments happening across Pakistan</p>
          </div>
          {(user?.role === 'Organizer' || user?.role === 'Admin') && (
            <Link to="/tournaments/create" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Create Tournament
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(108,99,255,0.1)', paddingBottom: '16px', overflowX: 'auto' }} className="mobile-scroll">
        <button 
          onClick={() => setActiveTab('Open')} 
          style={{ ...styles.filterBtn, backgroundColor: activeTab === 'Open' ? '#6C63FF' : 'transparent', color: activeTab === 'Open' ? '#fff' : '#8B8BA7', border: 'none', fontSize: '16px', padding: '10px 20px', whiteSpace: 'nowrap' }}>
          🌐 Global Open
        </button>
        <button 
          onClick={() => setActiveTab('University')} 
          style={{ ...styles.filterBtn, backgroundColor: activeTab === 'University' ? '#6C63FF' : 'transparent', color: activeTab === 'University' ? '#fff' : '#8B8BA7', border: 'none', fontSize: '16px', padding: '10px 20px', whiteSpace: 'nowrap' }}>
          🎓 University Wars
        </button>
      </div>

      {/* Status Message */}
      {joinMsg && (
        <div style={styles.toast}>{joinMsg}</div>
      )}

      {/* Filters */}
      <div style={styles.filters} className="mobile-stack">
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
        <select value={activeCity} onChange={e => setActiveCity(e.target.value)} style={{...styles.select, width: {xs: '100%', sm: 'auto'}}}>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>


      {/* Loading */}
      {loading ? (
        <p style={{ color: '#8b8ba7', textAlign: 'center', padding: '60px' }}>Loading tournaments...</p>
      ) : tournaments.filter(t => activeTab === 'Open' ? !t.targetInstitution : t.targetInstitution).length === 0 ? (
        <p style={{ color: '#8b8ba7', textAlign: 'center', padding: '60px' }}>No tournaments found for this category. Check back soon!</p>
      ) : (
        /* Cards */
        <div style={styles.grid}>
          {tournaments.filter(t => activeTab === 'Open' ? !t.targetInstitution : t.targetInstitution).map(t => {
            const pct = Math.round((t.filledSlots / t.maxSlots) * 100)
            const accent = t.accentColor || tagColors[t.gameTag] || '#6c63ff'
            const image = gameImages[t.gameTitle] || ''
            const isFull = t.status === 'Full'
            return (
              <div key={t.tournamentId} style={styles.card}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = accent + '55' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.15)' }}
              >
                <div style={styles.imgWrap}>
                  {image && <img src={image} alt={t.gameTitle} style={styles.img} onError={e => e.target.style.display = 'none'} />}
                  <div style={styles.imgOverlay} />
                  <span style={{ ...styles.tag, color: accent, backgroundColor: accent + '22', border: `1px solid ${accent}44` }}>{t.gameTag}</span>
                </div>
                <div style={styles.body}>
                  <p style={{ ...styles.game, color: accent }}>{t.gameTitle}</p>
                  <h3 style={styles.cardTitle}>{t.title}</h3>
                  {t.targetInstitution && (
                    <Chip 
                      label={`🎓 Exclusive: ${t.targetInstitution}`} 
                      size="small" 
                      sx={{ backgroundColor: 'rgba(108, 99, 255, 0.15)', color: '#6C63FF', border: '1px solid rgba(108, 99, 255, 0.3)', fontWeight: 'bold', mb: 1, fontFamily: 'Rajdhani, sans-serif' }} 
                    />
                  )}
                  {t.isVerifiedCafe && (
                    <Chip 
                      label="🛡️ Ping-Verified Cafe" 
                      size="small" 
                      sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)', fontWeight: 'bold', mb: 1, fontFamily: 'Rajdhani, sans-serif' }} 
                    />
                  )}
                  <div style={styles.row}>
                    <span style={styles.prize}>PKR {t.prizePool?.toLocaleString()}</span>
                    <span style={{ ...styles.statusBadge, color: isFull ? '#ef4444' : t.status === 'Open' ? '#22c55e' : '#f59e0b' }}>
                      {isFull ? '✕ FULL' : t.status === 'Open' ? '● OPEN' : '⚡ FILLING'}
                    </span>
                  </div>
                  <div style={styles.progressBg}>
                    <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: accent }} />
                  </div>
                  <div style={styles.slotRow}>
                    <span style={styles.slotText}>{t.filledSlots}/{t.maxSlots} players</span>
                    <span style={styles.slotText}>📍 {t.city}</span>
                  </div>
                  <button disabled={isFull} onClick={() => handleJoin(t.tournamentId)} style={{
                    ...styles.joinBtn,
                    background: isFull ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                    cursor: isFull ? 'not-allowed' : 'pointer',
                    color: isFull ? '#8b8ba7' : '#fff',
                  }}>
                    {isFull ? 'Tournament Full' : 'Join Tournament →'}
                  </button>
                  <Link
                    to={`/tournaments/${t.tournamentId}/bracket`}
                    style={{ ...styles.joinBtn, background: 'transparent', border: '1px solid rgba(108,99,255,0.3)', color: '#6C63FF', marginTop: '6px', display: 'block', textAlign: 'center', textDecoration: 'none', padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}
                  >
                    View Bracket →
                  </Link>
                  {user && user.userId === t.organizerId && t.status === 'Open' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => setEditModal(t)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>⚙ Edit</button>
                      <button onClick={() => handleDelete(t.tournamentId)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>🗑 Delete</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#0f0f1e', padding: '32px', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.2)', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '24px', color: '#fff', marginBottom: '20px' }}>Edit Tournament</h3>
            
            <label style={{ display: 'block', color: '#8b8ba7', fontSize: '12px', marginBottom: '6px' }}>Title</label>
            <input value={editModal.title} onChange={e => setEditModal({...editModal, title: e.target.value})} style={{ ...styles.input, width: '100%', boxSizing: 'border-box', marginBottom: '16px', padding: '10px', borderRadius: '6px', border: '1px solid rgba(108,99,255,0.2)', background: 'rgba(255,255,255,0.03)', color: '#fff' }} />
            
            <label style={{ display: 'block', color: '#8b8ba7', fontSize: '12px', marginBottom: '6px' }}>Prize Pool (PKR)</label>
            <input type="number" value={editModal.prizePool} onChange={e => setEditModal({...editModal, prizePool: parseFloat(e.target.value) || 0})} style={{ ...styles.input, width: '100%', boxSizing: 'border-box', marginBottom: '24px', padding: '10px', borderRadius: '6px', border: '1px solid rgba(108,99,255,0.2)', background: 'rgba(255,255,255,0.03)', color: '#fff' }} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8b8ba7', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEditSave} style={{ flex: 1, padding: '10px', background: '#6c63ff', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#060610', padding: '100px 60px 60px' },
  header: { marginBottom: '48px' },
  eyebrow: { color: '#6c63ff', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', marginBottom: '8px' },
  title: { fontFamily: 'Rajdhani, sans-serif', fontSize: '48px', fontWeight: '700', color: '#fff', letterSpacing: '1px', marginBottom: '8px' },
  sub: { color: '#8b8ba7', fontSize: '16px' },
  toast: { backgroundColor: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.4)', color: '#a78bfa', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: '500', textAlign: 'center' },
  filters: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' },
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px' },
  select: { backgroundColor: '#0f0f1e', border: '1px solid rgba(108,99,255,0.2)', color: '#fff', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', outline: 'none', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  card: { backgroundColor: '#0f0f1e', borderRadius: '12px', border: '1px solid rgba(108,99,255,0.15)', overflow: 'hidden', transition: 'all 0.3s ease' },
  imgWrap: { position: 'relative', height: '150px', backgroundColor: '#111' },
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