import { useState } from 'react'

const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']

const rankColors = {
  Iron: '#6b7280', Bronze: '#b45309', Silver: '#9ca3af',
  Gold: '#d97706', Platinum: '#0891b2', Diamond: '#7c3aed',
  Ascendant: '#059669', Immortal: '#dc2626', Radiant: '#f59e0b',
}

function ProfilePage() {
  const [form, setForm] = useState({ username: 'ProPlayer123', email: 'player@gmail.com', gameTag: 'ProPlayer#1234', rank: 'Gold', city: 'Faisalabad', bio: 'Competitive Valorant player from FAST-NU. Top 500 Faisalabad.' })
  const [saved, setSaved] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        {/* Left — Avatar & Stats */}
        <div style={styles.sidebar}>
          <div style={styles.avatarWrap}>
            <div style={{ ...styles.avatar, boxShadow: `0 0 0 3px ${rankColors[form.rank] || '#6c63ff'}, 0 0 30px ${rankColors[form.rank] || '#6c63ff'}44` }}>
              {form.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ ...styles.rankBadge, backgroundColor: rankColors[form.rank] + '22', color: rankColors[form.rank], border: `1px solid ${rankColors[form.rank]}44` }}>
              {form.rank}
            </div>
          </div>
          <h2 style={styles.profileName}>{form.username}</h2>
          <p style={styles.profileTag}>{form.gameTag}</p>
          <p style={styles.profileCity}>📍 {form.city}</p>

          <div style={styles.statsGrid}>
            {[
              { label: 'Tournaments', val: '12' },
              { label: 'Wins', val: '3' },
              { label: 'Win Rate', val: '25%' },
              { label: 'Earnings', val: 'PKR 4.5K' },
            ].map(s => (
              <div key={s.label} style={styles.statBox}>
                <span style={styles.statVal}>{s.val}</span>
                <span style={styles.statLbl}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Edit Form */}
        <div style={styles.formPanel}>
          <h3 style={styles.panelTitle}>Edit Profile</h3>

          {[
            { name: 'username', label: 'Username' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'gameTag', label: 'In-Game Tag' },
            { name: 'city', label: 'City' },
          ].map(f => (
            <div key={f.name} style={styles.fieldWrap}>
              <label style={styles.label}>{f.label}</label>
              <input style={styles.input} name={f.name} type={f.type || 'text'} value={form[f.name]} onChange={handleChange} />
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
  avatar: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '800', color: '#fff', fontFamily: 'Rajdhani, sans-serif' },
  rankBadge: { position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', padding: '2px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', letterSpacing: '0.5px' },
  profileName: { fontFamily: 'Rajdhani, sans-serif', fontSize: '22px', fontWeight: '700', color: '#fff', marginTop: '12px' },
  profileTag: { color: '#8b8ba7', fontSize: '13px' },
  profileCity: { color: '#8b8ba7', fontSize: '13px', marginBottom: '8px' },
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
}

export default ProfilePage