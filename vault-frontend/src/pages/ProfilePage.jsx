import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/auth'
import api from '../api/config'

const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']

const rankColors = {
  Iron: '#6b7280', Bronze: '#b45309', Silver: '#9ca3af',
  Gold: '#d97706', Platinum: '#0891b2', Diamond: '#7c3aed',
  Ascendant: '#059669', Immortal: '#dc2626', Radiant: '#f59e0b',
}

const roleConfig = {
  Admin: { color: '#EF4444', label: 'Administrator', icon: '🛡️' },
  Organizer: { color: '#F59E0B', label: 'Tournament Organizer', icon: '👑' },
  Player: { color: '#6C63FF', label: 'Player', icon: '🎮' },
}

function ProfilePage() {
  const [form, setForm] = useState({ username: '', email: '', gameTag: '', rank: 'Gold', city: '', bio: '', institution: '', role: '' })
  const [stats, setStats] = useState({ tournamentsPlayed: 0, walletBalance: 0, vaultPoints: 0, isInstitutionVerified: false, campusChampionCount: 0 })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        const d = res.data
        setForm({
          username: d.username || '',
          email: d.email || '',
          gameTag: d.gameTag || '',
          rank: d.rank || 'Gold',
          city: d.city || '',
          bio: d.bio || '',
          institution: d.institution || '',
          role: d.role || 'Player',
        })
        setStats({
          tournamentsPlayed: d.tournamentsPlayed || 0,
          walletBalance: d.walletBalance || 0,
          vaultPoints: d.vaultPoints || 0,
          isInstitutionVerified: d.isInstitutionVerified || false,
          campusChampionCount: d.campusChampionCount || 0
        })
      } catch (err) {
        // If 401, redirect to login
        if (err.response?.status === 401) {
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [navigate])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setError('')
    try {
      await updateProfile({
        username: form.username,
        gameTag: form.gameTag,
        city: form.city,
        rank: form.rank,
        bio: form.bio,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      // Update localStorage user data
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...user, username: form.username, gameTag: form.gameTag, city: form.city, rank: form.rank }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    }
  }

  if (loading) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8b8ba7', fontSize: '16px' }}>Loading profile...</p>
      </div>
    )
  }

  return (
    <div style={styles.page} className="container">
      <div style={styles.inner} className="mobile-stack">
        {/* Left — Avatar & Stats */}
        <div style={styles.sidebar}>
          <div style={styles.avatarWrap}>
            <div style={{ ...styles.avatar, boxShadow: `0 0 0 3px ${rankColors[form.rank] || '#6c63ff'}, 0 0 30px ${rankColors[form.rank] || '#6c63ff'}44` }}>
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${form.username}`} alt="avatar" style={{width:'100%',height:'100%',borderRadius:'50%'}} />
            </div>
            <div style={{ ...styles.rankBadge, backgroundColor: rankColors[form.rank] + '22', color: rankColors[form.rank], border: `1px solid ${rankColors[form.rank]}44` }}>
              {form.rank}
            </div>
          </div>
          <h2 style={styles.profileName}>{form.username}</h2>
          <p style={styles.profileTag}>{form.gameTag}</p>
          <p style={styles.profileCity}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b8ba7" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {form.city}
          </p>

          {/* Role Badge */}
          <div style={{...styles.roleBadge, backgroundColor:(roleConfig[form.role]?.color||'#6C63FF')+'15', border:`1px solid ${(roleConfig[form.role]?.color||'#6C63FF')}44`, color:roleConfig[form.role]?.color||'#6C63FF'}}>
            <span>{roleConfig[form.role]?.icon || '🎮'}</span>
            <span style={{fontSize:'12px',fontWeight:'700',letterSpacing:'0.5px'}}>{roleConfig[form.role]?.label || form.role}</span>
          </div>

          {/* Campus Badges */}
          {(stats.isInstitutionVerified || stats.campusChampionCount > 0) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', justifyContent: 'center' }}>
              {stats.isInstitutionVerified && (
                <div style={{...styles.roleBadge, backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#22c55e', width: 'auto'}}>
                  <span>🎓</span>
                  <span style={{fontSize:'11px',fontWeight:'700',letterSpacing:'0.5px'}}>Verified Student</span>
                </div>
              )}
              {stats.campusChampionCount > 0 && (
                <div style={{...styles.roleBadge, backgroundColor: 'rgba(255, 215, 0, 0.15)', border: '1px solid rgba(255, 215, 0, 0.4)', color: '#FFD700', width: 'auto'}}>
                  <span>🏆</span>
                  <span style={{fontSize:'11px',fontWeight:'700',letterSpacing:'0.5px'}}>Campus Champion x{stats.campusChampionCount}</span>
                </div>
              )}
            </div>
          )}

          <div style={styles.statsGrid}>
            {[
              { label: 'Tournaments', val: stats.tournamentsPlayed },
              { label: 'PKR Balance', val: `PKR ${stats.walletBalance}` },
              { label: 'Vault Points', val: <div style={{display:'flex', alignItems:'center', gap:'4px'}}><img src="/vault-points.png" alt="VP" style={{width:'18px', height:'18px'}} /> {stats.vaultPoints || 0} VP</div> },
            ].map(s => (
              <div key={s.label} style={styles.statBox}>
                <span style={styles.statVal}>{s.val}</span>
                <span style={styles.statLbl}>{s.label}</span>
              </div>
            ))}
          </div>

          <button style={{ ...styles.saveBtn, background: 'linear-gradient(135deg, #22C55E, #16A34A)', marginTop: '24px', width: '100%' }} onClick={() => navigate('/wallet')}>
            Manage Wallet & Deposit
          </button>
        </div>

        {/* Right — Edit Form */}
        <div style={styles.formPanel}>
          <h3 style={styles.panelTitle}>Edit Profile</h3>

          {error && <div style={styles.errorBox}>{error}</div>}

          {[
            { name: 'username', label: 'Username' },
            { name: 'email', label: 'Email', type: 'email', disabled: true },
            { name: 'gameTag', label: 'In-Game Tag' },
            { name: 'city', label: 'City' },
          ].map(f => (
            <div key={f.name} style={styles.fieldWrap}>
              <label style={styles.label}>{f.label}</label>
              <input style={{ ...styles.input, opacity: f.disabled ? 0.5 : 1 }} name={f.name} type={f.type || 'text'} value={form[f.name]} onChange={handleChange} disabled={f.disabled} />
            </div>
          ))}

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Rank</label>
            <div style={styles.rankGrid}>
              {ranks.map(r => (
                <button key={r} onClick={() => setForm({ ...form, rank: r })} style={{
                  ...styles.rankBtn,
                  backgroundColor: form.rank === r ? rankColors[r] + '33' : 'rgba(108,99,255,0.06)',
                  color: form.rank === r ? rankColors[r] : '#8b8ba7',
                  border: `1px solid ${form.rank === r ? rankColors[r] + '66' : 'rgba(108,99,255,0.15)'}`,
                }}>{r}</button>
              ))}
            </div>
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Institution / University</label>
            <input style={styles.input} name="institution" value={form.institution} onChange={handleChange} placeholder="e.g., FAST NUCES" />
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Bio</label>
            <textarea style={{ ...styles.input, height: '90px', resize: 'none' }} name="bio" value={form.bio} onChange={handleChange} />
          </div>

          <button style={{ ...styles.saveBtn, background: saved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#6c63ff,#8b5cf6)' }} onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Changes →'}
          </button>

        </div>
      </div>
    </div>

  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#060610', padding: '100px 60px 60px' },
  inner: { display: 'flex', gap: '32px', maxWidth: '1100px', margin: '0 auto', alignItems: 'flex-start', flexWrap: 'wrap' },
  sidebar: { backgroundColor: '#0f0f1e', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '16px', padding: '36px 28px', width: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 },
  avatarWrap: { position: 'relative', marginBottom: '8px' },
  avatar: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#6c63ff22', border: '3px solid #6c63ff', overflow: 'hidden' },
  rankBadge: { position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', padding: '2px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', letterSpacing: '0.5px' },
  profileName: { fontFamily: 'Rajdhani, sans-serif', fontSize: '22px', fontWeight: '700', color: '#fff', marginTop: '12px' },
  profileTag: { color: '#8b8ba7', fontSize: '13px' },
  profileCity: { color: '#8b8ba7', fontSize: '13px', marginBottom: '8px' },
  roleBadge: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', marginTop: '4px', marginBottom: '4px', width: '100%', boxSizing: 'border-box' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginTop: '16px' },
  statBox: { backgroundColor: '#060610', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: '1px solid rgba(108,99,255,0.1)' },
  statVal: { fontFamily: 'Rajdhani, sans-serif', fontSize: '20px', fontWeight: '700', color: '#6c63ff' },
  statLbl: { fontSize: '11px', color: '#8b8ba7', letterSpacing: '0.5px' },
  formPanel: { flex: 1, minWidth: '320px', backgroundColor: '#0f0f1e', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '16px', padding: '36px' },
  panelTitle: { fontFamily: 'Rajdhani, sans-serif', fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '24px', letterSpacing: '0.5px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label: { color: '#8b8ba7', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' },
  input: { backgroundColor: '#060610', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border 0.2s' },
  rankGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  rankBtn: { padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' },
  saveBtn: { width: '100%', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px', marginTop: '8px', transition: 'background 0.3s ease' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '16px' },
}

export default ProfilePage