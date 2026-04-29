import { useState } from 'react'
import { Link } from 'react-router-dom'

const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']

function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', gameTag: '', rank: 'Gold', city: '' })
  const [focused, setFocused] = useState('')
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const fields = [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'YourGamerTag' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'player@gmail.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { name: 'gameTag', label: 'In-Game Tag', type: 'text', placeholder: 'Player#1234' },
    { name: 'city', label: 'City', type: 'text', placeholder: 'Faisalabad' },
  ]

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>V.A.U.L.T.</span>
        </div>
        <h2 style={styles.title}>Join the Arena</h2>
        <p style={styles.sub}>Create your player profile and start competing</p>

        {fields.map(f => (
          <div key={f.name} style={styles.fieldWrap}>
            <label style={styles.label}>{f.label}</label>
            <input
              style={{ ...styles.input, borderColor: focused === f.name ? '#6c63ff' : 'rgba(108,99,255,0.2)', boxShadow: focused === f.name ? '0 0 0 3px rgba(108,99,255,0.15)' : 'none' }}
              type={f.type} name={f.name} value={form[f.name]}
              placeholder={f.placeholder} onChange={handleChange}
              onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')}
            />
          </div>
        ))}

        <div style={styles.fieldWrap}>
          <label style={styles.label}>Your Rank</label>
          <div style={styles.rankGrid}>
            {ranks.map(r => (
              <button key={r} onClick={() => setForm({ ...form, rank: r })} style={{
                ...styles.rankBtn,
                backgroundColor: form.rank === r ? '#6c63ff' : 'rgba(108,99,255,0.08)',
                color: form.rank === r ? '#fff' : '#8b8ba7',
                border: `1px solid ${form.rank === r ? '#6c63ff' : 'rgba(108,99,255,0.2)'}`,
              }}>{r}</button>
            ))}
          </div>
        </div>

        <button style={styles.btn} onClick={() => alert('Backend coming soon!')}>
          Create Account →
        </button>
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#060610', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px', position: 'relative' },
  glow: { position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { position: 'relative', zIndex: 1, backgroundColor: '#0f0f1e', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '16px' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  logoIcon: { fontSize: '24px', color: '#6c63ff' },
  logoText: { fontFamily: 'Rajdhani, sans-serif', fontSize: '20px', fontWeight: '700', color: '#fff', letterSpacing: '3px' },
  title: { fontFamily: 'Rajdhani, sans-serif', fontSize: '28px', fontWeight: '700', color: '#fff' },
  sub: { color: '#8b8ba7', fontSize: '14px', marginBottom: '4px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#8b8ba7', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { backgroundColor: '#060610', border: '1px solid', borderRadius: '8px', padding: '13px 16px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'all 0.2s ease' },
  rankGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  rankBtn: { padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '0.3px' },
  btn: { background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '15px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px', marginTop: '8px', boxShadow: '0 8px 24px rgba(108,99,255,0.35)' },
  footer: { color: '#8b8ba7', textAlign: 'center', fontSize: '14px' },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: '600' },
}

export default RegisterPage