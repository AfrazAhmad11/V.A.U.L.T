import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const tournaments = [
  {
    id: 1, title: 'Valorant City Wars', game: 'Valorant',
    prize: 'PKR 10,000', slots: 32, filled: 24,
    city: 'Faisalabad', status: 'Open', accent: '#ff4655', tag: 'FPS',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1547890/header.jpg',
  },
  {
    id: 2, title: 'TEKKEN 8 Grand Slam', game: 'Tekken 8',
    prize: 'PKR 5,000', slots: 16, filled: 8,
    city: 'Lahore', status: 'Open', accent: '#f59e0b', tag: 'Fighting',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/header.jpg',
  },
  {
    id: 3, title: 'EA FC 25 Super Cup', game: 'EA FC 25',
    prize: 'PKR 15,000', slots: 32, filled: 30,
    city: 'Faisalabad', status: 'Filling Fast', accent: '#22c55e', tag: 'Sports',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg',
  },
  {
    id: 4, title: 'COD Warzone Invitational', game: 'Call of Duty',
    prize: 'PKR 20,000', slots: 64, filled: 20,
    city: 'Islamabad', status: 'Open', accent: '#06b6d4', tag: 'Battle Royale',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg',
  },
]

const stats = [
  { num: '2,400+', label: 'Registered Players' },
  { num: '180+', label: 'Tournaments Hosted' },
  { num: 'PKR 8L+', label: 'Prize Money Paid' },
  { num: '12', label: 'Cities Active' },
]

function TournamentCard({ t, index }) {
  const pct = Math.round((t.filled / t.slots) * 100)
  return (
    <div style={{ ...styles.card, animationDelay: `${index * 0.1}s` }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.borderColor = t.accent + '66'
        e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.5), 0 0 20px ${t.accent}22`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(108,99,255,0.15)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      }}
    >
      <div style={styles.cardImgWrap}>
        <img src={t.image} alt={t.game} style={styles.cardImg}
          onError={e => { e.target.style.display = 'none' }} />
        <div style={{ ...styles.cardImgOverlay, background: `linear-gradient(to top, #0f0f1e 20%, transparent 100%)` }} />
        <span style={{ ...styles.cardTag, backgroundColor: t.accent + '22', color: t.accent, border: `1px solid ${t.accent}44` }}>
          {t.tag}
        </span>
        <span style={{
          ...styles.cardStatus,
          backgroundColor: t.status === 'Open' ? '#22c55e22' : '#f59e0b22',
          color: t.status === 'Open' ? '#22c55e' : '#f59e0b',
          border: `1px solid ${t.status === 'Open' ? '#22c55e44' : '#f59e0b44'}`,
        }}>
          {t.status === 'Open' ? '● OPEN' : '⚡ FILLING FAST'}
        </span>
      </div>
      <div style={styles.cardBody}>
        <p style={{ ...styles.cardGame, color: t.accent }}>{t.game}</p>
        <h3 style={styles.cardTitle}>{t.title}</h3>
        <div style={styles.cardMeta}>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>🏆 Prize Pool</span>
            <span style={styles.metaVal}>{t.prize}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>📍 City</span>
            <span style={styles.metaVal}>{t.city}</span>
          </div>
        </div>
        <div style={styles.slotsWrap}>
          <div style={styles.slotsTop}>
            <span style={styles.metaLabel}>Players Joined</span>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{t.filled}/{t.slots}</span>
          </div>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: t.accent }} />
          </div>
        </div>
        <Link to="/tournaments" style={{ ...styles.cardBtn, background: `linear-gradient(135deg, ${t.accent}, ${t.accent}bb)` }}>
          View Tournament →
        </Link>
      </div>
    </div>
  )
}

function LandingPage() {
  const [featured, setFeatured] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setFeatured(p => (p + 1) % tournaments.length), 4000)
    return () => clearInterval(t)
  }, [])

  const ft = tournaments[featured]
  const pct = Math.round((ft.filled / ft.slots) * 100)

  return (
    <div style={styles.page}>

      {/* ── HERO ── */}
      <div style={styles.hero}>
        {/* Subtle dark background */}
        <div style={styles.heroBg}>
          <div style={{ ...styles.heroBgOverlay, background: `radial-gradient(ellipse at 70% 50%, ${ft.accent}18 0%, #060610 60%)` }} />
        </div>

        <div style={styles.heroInner}>

          {/* ── LEFT: Text + Dots ── */}
          <div style={styles.heroLeft}>
            <div style={styles.heroBadge}>🇵🇰 Pakistan's #1 Esports Platform</div>
            <h1 style={styles.heroTitle}>
              YOUR LEGEND<br />
              <span style={{ ...styles.heroAccent, color: ft.accent, textShadow: `0 0 40px ${ft.accent}66` }}>
                STARTS HERE
              </span>
            </h1>
            <p style={styles.heroSub}>
              Compete in skill-verified tournaments, win real prize money via JazzCash & EasyPaisa.
              No smurfs. No fraud. Just pure competition.
            </p>
            <div style={styles.heroBtns}>
              <Link to="/register" style={{ ...styles.heroPrimaryBtn, background: `linear-gradient(135deg, ${ft.accent}, ${ft.accent}aa)`, boxShadow: `0 8px 32px ${ft.accent}44` }}>
                Enter the Arena
              </Link>
              <Link to="/tournaments" style={styles.heroSecondaryBtn}>Browse Tournaments</Link>
            </div>

            {/* Carousel Dots */}
            <div style={styles.heroDots}>
              {tournaments.map((t, i) => (
                <div key={i} onClick={() => setFeatured(i)} style={{
                  ...styles.dot,
                  backgroundColor: i === featured ? ft.accent : 'rgba(255,255,255,0.25)',
                  width: i === featured ? '28px' : '8px',
                  boxShadow: i === featured ? `0 0 8px ${ft.accent}` : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* ── RIGHT: Featured Card + Thumbnail Strip ── */}
          <div style={styles.heroRight}>

            {/* Main Featured Card */}
            <div style={{ ...styles.featuredCard, borderColor: ft.accent + '44', boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 40px ${ft.accent}18` }}>

              {/* Game Image */}
              <div style={styles.featuredImgWrap}>
                <img
                  key={ft.id}
                  src={ft.image}
                  alt={ft.game}
                  style={styles.featuredImg}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.parentElement.style.background = `linear-gradient(135deg, ${ft.accent}33, #0f0f1e)`
                  }}
                />
                <div style={styles.featuredImgOverlay} />

                {/* Top badges */}
                <div style={styles.featuredBadges}>
                  <span style={{ ...styles.featuredTagBadge, backgroundColor: ft.accent + '22', color: ft.accent, border: `1px solid ${ft.accent}55` }}>
                    {ft.tag}
                  </span>
                  <span style={styles.featuredLiveBadge}>⬡ FEATURED</span>
                </div>
              </div>

              {/* Card Info */}
              <div style={styles.featuredBody}>
                <p style={{ ...styles.featuredGameLabel, color: ft.accent }}>{ft.game}</p>
                <h3 style={styles.featuredTitle}>{ft.title}</h3>

                <div style={styles.featuredMeta}>
                  <div style={styles.featuredMetaItem}>
                    <span style={styles.featuredMetaLabel}>🏆 Prize Pool</span>
                    <span style={{ ...styles.featuredMetaVal, color: ft.accent }}>{ft.prize}</span>
                  </div>
                  <div style={styles.featuredMetaItem}>
                    <span style={styles.featuredMetaLabel}>👥 Players</span>
                    <span style={styles.featuredMetaVal}>{ft.filled}/{ft.slots}</span>
                  </div>
                  <div style={styles.featuredMetaItem}>
                    <span style={styles.featuredMetaLabel}>📍 City</span>
                    <span style={styles.featuredMetaVal}>{ft.city}</span>
                  </div>
                </div>

                {/* Progress */}
                <div style={styles.featuredProgressWrap}>
                  <div style={styles.featuredProgressBg}>
                    <div style={{ ...styles.featuredProgressFill, width: `${pct}%`, backgroundColor: ft.accent, boxShadow: `0 0 8px ${ft.accent}` }} />
                  </div>
                  <span style={styles.featuredProgressLabel}>{pct}% filled</span>
                </div>

                <Link to="/tournaments" style={{ ...styles.featuredBtn, background: `linear-gradient(135deg, ${ft.accent}, ${ft.accent}bb)`, boxShadow: `0 6px 20px ${ft.accent}44` }}>
                  Join This Tournament →
                </Link>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div style={styles.thumbStrip}>
              {tournaments.map((t, i) => (
                <div
                  key={t.id}
                  onClick={() => setFeatured(i)}
                  style={{
                    ...styles.thumb,
                    border: `2px solid ${i === featured ? t.accent : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: i === featured ? `0 0 12px ${t.accent}55` : 'none',
                    opacity: i === featured ? 1 : 0.55,
                    transform: i === featured ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  <img
                    src={t.image}
                    alt={t.game}
                    style={styles.thumbImg}
                    onError={e => e.target.style.display = 'none'}
                  />
                  <div style={styles.thumbOverlay} />
                  <span style={styles.thumbLabel}>{t.game}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={styles.statsBar}>
        {stats.map((s, i) => (
          <div key={i} style={styles.statItem}>
            <span style={styles.statNum}>{s.num}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── FEATURED TOURNAMENTS ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.sectionEyebrow}>● LIVE NOW</p>
            <h2 style={styles.sectionTitle}>Featured Tournaments</h2>
          </div>
          <Link to="/tournaments" style={styles.seeAll}>See All →</Link>
        </div>
        <div style={styles.grid}>
          {tournaments.map((t, i) => <TournamentCard key={t.id} t={t} index={i} />)}
        </div>
      </div>

      {/* ── WHY VAULT ── */}
      <div style={styles.whySection}>
        <p style={styles.sectionEyebrow}>● WHY V.A.U.L.T.</p>
        <h2 style={styles.sectionTitle}>Built for Pakistani Gamers</h2>
        <div style={styles.featureGrid}>
          {[
            { icon: '🛡️', title: 'Anti-Smurf Gate', desc: 'Real-time rank verification from game APIs. Only play against your true peers.' },
            { icon: '💸', title: 'Instant Payouts', desc: 'Win and get paid instantly via JazzCash or EasyPaisa. No delays, no excuses.' },
            { icon: '🏙️', title: 'City Wars', desc: "Compete for your city's honor. Rise on Faisalabad, Lahore & Islamabad leaderboards." },
            { icon: '⚖️', title: 'Fair Disputes', desc: 'WhatsApp-integrated dispute resolution. Upload evidence, get a fair verdict fast.' },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.15)'}
            >
              <span style={styles.featureIcon}>{f.icon}</span>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={styles.cta}>
        <div style={styles.ctaGlow} />
        <h2 style={styles.ctaTitle}>Ready to Build Your Legacy?</h2>
        <p style={styles.ctaSub}>Join thousands of Pakistani gamers competing for real prizes</p>
        <Link to="/register" style={styles.ctaBtn}>Create Free Account →</Link>
      </div>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>⬡ V.A.U.L.T.</span>
        <span style={styles.footerText}>© 2026 FAST-NU Faisalabad · Built by Afraz & Aoun</span>
      </footer>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#060610' },

  // ── Hero ──
  hero: {
    position: 'relative', minHeight: '100vh',
    display: 'flex', alignItems: 'center', overflow: 'hidden',
  },
  heroBg: { position: 'absolute', inset: 0, zIndex: 0 },
  heroBgOverlay: { position: 'absolute', inset: 0, transition: 'background 0.8s ease' },

  heroInner: {
    position: 'relative', zIndex: 1,
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', padding: '100px 80px 60px',
    gap: '60px',
  },

  // Left
  heroLeft: { flex: '0 0 auto', maxWidth: '500px' },
  heroBadge: {
    display: 'inline-block', marginBottom: '24px',
    backgroundColor: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.4)',
    color: '#a78bfa', padding: '6px 18px', borderRadius: '30px',
    fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px',
  },
  heroTitle: {
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: 'clamp(42px, 5.5vw, 80px)',
    fontWeight: '700', lineHeight: '1.0',
    color: '#fff', letterSpacing: '2px', marginBottom: '24px',
  },
  heroAccent: { transition: 'color 0.5s ease, text-shadow 0.5s ease' },
  heroSub: {
    fontSize: '16px', color: '#8b8ba7', lineHeight: '1.7',
    maxWidth: '440px', marginBottom: '36px',
  },
  heroBtns: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
  heroPrimaryBtn: {
    color: '#fff', textDecoration: 'none',
    padding: '14px 32px', borderRadius: '8px',
    fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px',
    transition: 'all 0.4s ease',
  },
  heroSecondaryBtn: {
    color: '#fff', textDecoration: 'none',
    padding: '14px 32px', borderRadius: '8px',
    fontWeight: '600', fontSize: '15px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroDots: { display: 'flex', gap: '8px', marginTop: '40px', alignItems: 'center' },
  dot: { height: '8px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.35s ease' },

  // Right — Featured Card
  heroRight: {
    flex: '1', display: 'flex', flexDirection: 'column',
    gap: '14px', maxWidth: '460px', minWidth: '340px',
  },
  featuredCard: {
    backgroundColor: '#0f0f1e',
    border: '1px solid',
    borderRadius: '16px', overflow: 'hidden',
    transition: 'all 0.5s ease',
  },
  featuredImgWrap: { position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: '#111' },
  featuredImg: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'all 0.6s ease',
  },
  featuredImgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, #0f0f1e 8%, transparent 55%)',
  },
  featuredBadges: {
    position: 'absolute', top: '14px', left: '14px', right: '14px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  featuredTagBadge: {
    fontSize: '11px', fontWeight: '700',
    padding: '4px 12px', borderRadius: '4px', letterSpacing: '0.5px',
  },
  featuredLiveBadge: {
    backgroundColor: 'rgba(108,99,255,0.85)',
    color: '#fff', fontSize: '10px', fontWeight: '700',
    padding: '4px 12px', borderRadius: '20px', letterSpacing: '1px',
  },
  featuredBody: { padding: '18px 22px 22px' },
  featuredGameLabel: {
    fontSize: '11px', fontWeight: '700',
    letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px',
  },
  featuredTitle: {
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '22px', fontWeight: '700', color: '#fff',
    marginBottom: '14px', letterSpacing: '0.5px',
  },
  featuredMeta: { display: 'flex', gap: '20px', marginBottom: '14px' },
  featuredMetaItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  featuredMetaLabel: { fontSize: '11px', color: '#8b8ba7', letterSpacing: '0.3px' },
  featuredMetaVal: { fontSize: '14px', fontWeight: '700', color: '#fff' },
  featuredProgressWrap: { marginBottom: '16px' },
  featuredProgressBg: {
    height: '4px', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '2px', marginBottom: '6px',
  },
  featuredProgressFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s ease, background-color 0.5s ease' },
  featuredProgressLabel: { fontSize: '11px', color: '#8b8ba7' },
  featuredBtn: {
    display: 'block', textAlign: 'center', textDecoration: 'none',
    color: '#fff', padding: '12px', borderRadius: '8px',
    fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px',
    transition: 'all 0.4s ease',
  },

  // Thumbnail Strip
  thumbStrip: { display: 'flex', gap: '10px' },
  thumb: {
    flex: 1, height: '62px', borderRadius: '8px',
    overflow: 'hidden', position: 'relative',
    cursor: 'pointer', transition: 'all 0.25s ease',
    backgroundColor: '#111',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)',
  },
  thumbLabel: {
    position: 'absolute', bottom: '5px', left: '7px',
    fontSize: '9px', fontWeight: '700', color: '#fff',
    letterSpacing: '0.3px', lineHeight: '1.2',
  },

  // Stats
  statsBar: {
    display: 'flex', justifyContent: 'center',
    borderTop: '1px solid rgba(108,99,255,0.15)',
    borderBottom: '1px solid rgba(108,99,255,0.15)',
    backgroundColor: '#0d0d1a',
  },
  statItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '28px 60px', gap: '4px',
    borderRight: '1px solid rgba(108,99,255,0.1)',
  },
  statNum: { fontSize: '28px', fontWeight: '800', color: '#6c63ff', fontFamily: 'Rajdhani, sans-serif' },
  statLabel: { fontSize: '12px', color: '#8b8ba7', letterSpacing: '1px', textTransform: 'uppercase' },

  // Section
  section: { padding: '80px 60px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
  sectionEyebrow: { color: '#6c63ff', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', marginBottom: '8px' },
  sectionTitle: { fontSize: '32px', fontWeight: '700', color: '#fff', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '1px' },
  seeAll: { color: '#6c63ff', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },

  // Cards
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  card: {
    backgroundColor: '#0f0f1e', borderRadius: '12px',
    border: '1px solid rgba(108,99,255,0.15)',
    overflow: 'hidden', cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  cardImgWrap: { position: 'relative', height: '160px', overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' },
  cardImgOverlay: { position: 'absolute', inset: 0 },
  cardTag: { position: 'absolute', top: '12px', left: '12px', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.5px' },
  cardStatus: { position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.5px' },
  cardBody: { padding: '20px' },
  cardGame: { fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' },
  cardTitle: { fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '14px', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.5px' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: '14px' },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  metaLabel: { fontSize: '11px', color: '#8b8ba7', letterSpacing: '0.5px' },
  metaVal: { fontSize: '14px', fontWeight: '600', color: '#fff' },
  slotsWrap: { marginBottom: '16px' },
  slotsTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  progressBg: { height: '4px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '2px' },
  progressFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s ease' },
  cardBtn: { display: 'block', textAlign: 'center', textDecoration: 'none', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px' },

  // Why
  whySection: { padding: '80px 60px', backgroundColor: '#0d0d1a' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginTop: '40px' },
  featureCard: { backgroundColor: '#0f0f1e', borderRadius: '12px', border: '1px solid rgba(108,99,255,0.15)', padding: '28px 24px', transition: 'border-color 0.3s ease' },
  featureIcon: { fontSize: '32px', marginBottom: '16px', display: 'block' },
  featureTitle: { fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '8px', fontFamily: 'Rajdhani, sans-serif' },
  featureDesc: { fontSize: '14px', color: '#8b8ba7', lineHeight: '1.6' },

  // CTA
  cta: { position: 'relative', overflow: 'hidden', textAlign: 'center', padding: '100px 40px', background: 'linear-gradient(135deg, #0f0f1e, #1a0d3d)', borderTop: '1px solid rgba(108,99,255,0.2)' },
  ctaGlow: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  ctaTitle: { fontFamily: 'Rajdhani, sans-serif', fontSize: '42px', fontWeight: '700', color: '#fff', marginBottom: '12px' },
  ctaSub: { color: '#8b8ba7', fontSize: '16px', marginBottom: '36px' },
  ctaBtn: { display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', color: '#fff', padding: '16px 44px', borderRadius: '8px', fontWeight: '700', fontSize: '16px', letterSpacing: '0.5px', boxShadow: '0 8px 32px rgba(108,99,255,0.4)' },

  // Footer
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 60px', borderTop: '1px solid rgba(108,99,255,0.1)', backgroundColor: '#060610' },
  footerLogo: { fontFamily: 'Rajdhani, sans-serif', fontSize: '18px', fontWeight: '700', color: '#6c63ff', letterSpacing: '2px' },
  footerText: { color: '#8b8ba7', fontSize: '13px' },
}

export default LandingPage