import { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [focused, setFocused] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = () => alert('Backend not connected yet — coming in next step!')

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>V.A.U.L.T.</span>
        </div>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.sub}>Sign in to your player account</p>

        {['email', 'password'].map(field => (
          <div key={field} style={styles.fieldWrap}>
            <label style={styles.label}>{field === 'email' ? 'Email Address' : 'Password'}</label>
            <input
              style={{ ...styles.input, borderColor: focused === field ? '#6c63ff' : 'rgba(108,99,255,0.2)', boxShadow: focused === field ? '0 0 0 3px rgba(108,99,255,0.15)' : 'none' }}
              type={field} name={field} value={form[field]}
              onChange={handleChange}
              onFocus={() => setFocused(field)}
              onBlur={() => setFocused('')}
              placeholder={field === 'email' ? 'player@gmail.com' : '••••••••'}
            />
          </div>
        ))}

        <button style={styles.btn} onClick={handleSubmit}>Sign In →</button>
        <p style={styles.footer}>
          New to V.A.U.L.T.? <Link to="/register" style={styles.link}>Create Account</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#060610', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glow: { position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { position: 'relative', zIndex: 1, backgroundColor: '#0f0f1e', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  logoIcon: { fontSize: '24px', color: '#6c63ff' },
  logoText: { fontFamily: 'Rajdhani, sans-serif', fontSize: '20px', fontWeight: '700', color: '#fff', letterSpacing: '3px' },
  title: { fontFamily: 'Rajdhani, sans-serif', fontSize: '28px', fontWeight: '700', color: '#fff' },
  sub: { color: '#8b8ba7', fontSize: '14px', marginBottom: '8px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#8b8ba7', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { backgroundColor: '#060610', border: '1px solid', borderRadius: '8px', padding: '13px 16px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'all 0.2s ease' },
  btn: { background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '15px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px', marginTop: '8px', boxShadow: '0 8px 24px rgba(108,99,255,0.35)' },
  footer: { color: '#8b8ba7', textAlign: 'center', fontSize: '14px' },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: '600' },
}

export default LoginPage