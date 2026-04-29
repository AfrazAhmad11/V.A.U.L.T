import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      ...styles.nav,
      backgroundColor: scrolled ? 'rgba(6,6,16,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
    }}>
      {/* Logo */}
      <Link to="/" style={styles.logo}>
        <span style={styles.logoIcon}>⬡</span>
        <span>V.A.U.L.T</span>
      </Link>

      {/* Nav Links */}
      <div style={styles.links}>
        {[
          { path: '/', label: 'Home' },
          { path: '/tournaments', label: 'Tournaments' },
          { path: '/profile', label: 'Profile' },
        ].map(({ path, label }) => (
          <Link key={path} to={path} style={{
            ...styles.link,
            color: isActive(path) ? '#6c63ff' : '#8b8ba7',
            borderBottom: isActive(path) ? '2px solid #6c63ff' : '2px solid transparent',
          }}>{label}</Link>
        ))}
      </div>

      {/* Auth Buttons */}
      <div style={styles.authBtns}>
        <Link to="/login" style={styles.loginBtn}>Sign In</Link>
        <Link to="/register" style={styles.registerBtn}>
          <span>Join Now</span>
          <span style={styles.btnGlow} />
        </Link>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 48px', height: '64px',
    transition: 'all 0.3s ease',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    textDecoration: 'none', color: '#fff',
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '22px', fontWeight: '700', letterSpacing: '3px',
  },
  logoIcon: { fontSize: '24px', color: '#6c63ff' },
  links: { display: 'flex', gap: '8px', alignItems: 'center' },
  link: {
    textDecoration: 'none', fontSize: '14px', fontWeight: '500',
    padding: '4px 16px', letterSpacing: '0.5px',
    transition: 'all 0.2s ease', paddingBottom: '6px',
  },
  authBtns: { display: 'flex', gap: '12px', alignItems: 'center' },
  loginBtn: {
    color: '#8b8ba7', textDecoration: 'none',
    fontSize: '14px', fontWeight: '500', padding: '8px 16px',
    transition: 'color 0.2s',
  },
  registerBtn: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
    color: '#fff', textDecoration: 'none',
    fontSize: '14px', fontWeight: '600',
    padding: '9px 22px', borderRadius: '6px',
    letterSpacing: '0.5px',
  },
  btnGlow: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
  },
}

export default Navbar