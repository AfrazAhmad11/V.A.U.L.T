import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Check login state on every route change
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { setUser(null) }
    } else {
      setUser(null)
    }
  }, [location])

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isOrganizer = user?.role === 'Organizer' || user?.role === 'Admin'

  const navLinks = [
    { path: '/', label: 'Home', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { path: '/tournaments', label: 'Tournaments', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 8 12 8s5-4 7.5-4a2.5 2.5 0 0 1 0 5H18"/><path d="M18 9v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/></svg> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> },
    { path: '/shop', label: 'Shop', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> },
    { path: '/wallet', label: 'Wallet', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { path: '/profile', label: 'Profile', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ]

  if (isOrganizer) {
    navLinks.push(
      { path: '/disputes', label: 'Disputes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    )
  }

  return (
    <nav 
      className="navbar"
      style={{
        ...styles.nav,
        backgroundColor: scrolled || isMobileMenuOpen ? 'rgba(6,6,16,0.98)' : 'transparent',
        backdropFilter: scrolled || isMobileMenuOpen ? 'blur(20px)' : 'none',
        borderBottom: scrolled || isMobileMenuOpen ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
        boxShadow: scrolled || isMobileMenuOpen ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {/* Logo */}
      <Link to="/" style={styles.logo}>
        <span style={styles.logoIcon}>⬡</span>
        <span>V.A.U.L.T</span>
      </Link>

      {/* Mobile Toggle */}
      <button 
        className="mobile-toggle"
        style={styles.mobileToggle}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isMobileMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {/* Nav Links */}
      <div 
        className={isMobileMenuOpen ? "nav-links-mobile" : "nav-links-desktop"}
        style={isMobileMenuOpen ? styles.linksMobile : styles.links}
      >
        {navLinks.map(({ path, label, icon }) => (
          <Link 
            key={path} 
            to={path} 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...styles.link,
              color: isActive(path) ? '#6c63ff' : '#8b8ba7',
              borderBottom: !isMobileMenuOpen && isActive(path) ? '2px solid #6c63ff' : '2px solid transparent',
            }}
          >
            <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '5px' }}>{icon}</span>
            {label}
          </Link>
        ))}
        
        {/* Mobile Auth Links */}
        {isMobileMenuOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', width: '100%' }}>
            {user ? (
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={styles.loginBtn}>Sign In</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} style={styles.registerBtn}>Join Now</Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Auth Section Desktop */}
      <div className="mobile-hide" style={styles.authBtns}>
        {user ? (
          <>
            <span style={styles.userInfo}>
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} alt="avatar" style={styles.userAvatar} />
              <span style={styles.userName}>{user.username}</span>
              {isOrganizer && <span style={styles.rolePill}>{user.role === 'Admin' ? '🛡️' : '👑'}</span>}
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.loginBtn}>Sign In</Link>
            <Link to="/register" style={styles.registerBtn}>
              <span>Join Now</span>
              <span style={styles.btnGlow} />
            </Link>
          </>
        )}
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
  mobileToggle: {
    display: 'none',
    background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
    padding: '5px',
  },
  linksMobile: {
    position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(6,6,16,0.98)', padding: '40px 20px',
    display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start',
    zIndex: 999, overflowY: 'auto',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    textDecoration: 'none', color: '#fff',
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '22px', fontWeight: '700', letterSpacing: '3px',
  },
  logoIcon: { fontSize: '30px', color: '#6c63ff', fontWeight: '900' },
  links: { display: 'flex', gap: '4px', alignItems: 'center' },
  link: {
    textDecoration: 'none', fontSize: '13px', fontWeight: '500',
    padding: '4px 14px', letterSpacing: '0.5px',
    transition: 'all 0.2s ease', paddingBottom: '6px',
    display: 'inline-flex', alignItems: 'center',
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
  userInfo: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  userAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: '#6c63ff22', border: '2px solid #6c63ff',
  },
  userName: {
    color: '#fff', fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px',
  },
  rolePill: {
    fontSize: '14px',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444', padding: '7px 16px', borderRadius: '6px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
}

export default Navbar