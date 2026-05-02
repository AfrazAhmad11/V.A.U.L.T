import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/config'
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'

const rankColors = {
  Iron:'#6b7280', Bronze:'#b45309', Silver:'#9ca3af', Gold:'#d97706',
  Platinum:'#0891b2', Diamond:'#7c3aed', Ascendant:'#059669', Immortal:'#dc2626', Radiant:'#f59e0b',
}

function LeaderboardPage() {
  const [players, setPlayers] = useState([])
  const [campuses, setCampuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Players')
  const [institutionFilter, setInstitutionFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    if (activeTab === 'Players') {
      const url = institutionFilter ? `/users/leaderboard?institution=${encodeURIComponent(institutionFilter)}` : '/users/leaderboard'
      api.get(url)
        .then(res => setPlayers(res.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      api.get('/users/leaderboard/campuses')
        .then(res => setCampuses(res.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [institutionFilter, activeTab])

  const getMedal = (i) => {
    if (i === 0) return { emoji: '🥇', bg: 'linear-gradient(135deg, #FFD700, #FFA500)', glow: '0 0 20px rgba(255,215,0,0.4)' }
    if (i === 1) return { emoji: '🥈', bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', glow: '0 0 20px rgba(192,192,192,0.3)' }
    if (i === 2) return { emoji: '🥉', bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', glow: '0 0 20px rgba(205,127,50,0.3)' }
    return null
  }

  return (
    <div style={s.page} className="container">
      {/* Header */}
      <div style={s.header} className="mobile-stack">
        <div style={s.hIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 8 12 8s5-4 7.5-4a2.5 2.5 0 0 1 0 5H18"/>
            <path d="M18 9v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/>
            <path d="M12 17v4"/><path d="M8 21h8"/>
          </svg>
        </div>
        <div>
          <p style={s.eyebrow}>● GLOBAL RANKINGS</p>
          <h1 style={{...s.title, fontSize: 'clamp(28px, 8vw, 36px)'}}>Leaderboard</h1>
          <p style={s.sub}>Top players and campuses ranked by tournament match wins</p>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: {xs: 0, md: 'auto'}, marginRight: {xs: 0, md: '20px'}, width: {xs: '100%', md: 'auto'}, overflowX: 'auto' }} className="mobile-scroll">
          <button 
            onClick={() => setActiveTab('Players')} 
            style={{ ...s.filterBtn, backgroundColor: activeTab === 'Players' ? '#6C63FF' : 'transparent', color: activeTab === 'Players' ? '#fff' : '#8B8BA7', border: '1px solid rgba(108,99,255,0.2)', fontSize: '14px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            👤 Players
          </button>
          <button 
            onClick={() => setActiveTab('Campuses')} 
            style={{ ...s.filterBtn, backgroundColor: activeTab === 'Campuses' ? '#6C63FF' : 'transparent', color: activeTab === 'Campuses' ? '#fff' : '#8B8BA7', border: '1px solid rgba(108,99,255,0.2)', fontSize: '14px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            🏛️ Campuses
          </button>
        </div>
 
        {/* Institution Filter MUI Dropdown */}
        {activeTab === 'Players' && (
        <FormControl sx={{ minWidth: {xs: '100%', md: 220} }} size="small">
          <InputLabel sx={{ color: '#8B8BA7' }}>Institution</InputLabel>
          <Select
            value={institutionFilter}
            label="Institution"
            onChange={(e) => setInstitutionFilter(e.target.value)}
            sx={{
              color: '#fff',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(108,99,255,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
              '.MuiSvgIcon-root ': { fill: '#8B8BA7' },
            }}
          >
            <MenuItem value=""><em>All Institutions</em></MenuItem>
            <MenuItem value="FAST NUCES">FAST NUCES</MenuItem>
            <MenuItem value="NUST">NUST</MenuItem>
            <MenuItem value="LUMS">LUMS</MenuItem>
            <MenuItem value="UET">UET</MenuItem>
            <MenuItem value="COMSATS">COMSATS</MenuItem>
          </Select>
        </FormControl>
        )}
      </div>

      {loading ? (
        <div style={s.loadWrap}><div style={s.spinner}/><p style={{color:'#8B8BA7',marginTop:'16px'}}>Loading rankings...</p></div>
      ) : players.length === 0 ? (
        <div style={s.loadWrap}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8B8BA7" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 8 12 8s5-4 7.5-4a2.5 2.5 0 0 1 0 5H18"/><path d="M18 9v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/></svg>
          <p style={{color:'#8B8BA7',marginTop:'16px',fontSize:'16px'}}>No match data yet. Play some tournaments!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {activeTab === 'Players' && players.length >= 3 && (
            <div style={s.podium} className="mobile-hide">
              {[1, 0, 2].map(idx => {
                const p = players[idx]
                if (!p) return null
                const medal = getMedal(idx)
                const isFirst = idx === 0
                return (
                  <div key={p.userId} style={{...s.podiumCard, ...(isFirst ? s.podiumFirst : {})}}>
                    <div style={{...s.podiumPos, background: medal.bg, boxShadow: medal.glow}}>
                      <span style={{fontSize: isFirst ? '24px' : '20px'}}>{medal.emoji}</span>
                    </div>
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`} alt={p.username}
                      style={{...s.podiumAvatar, width: isFirst ? '80px' : '64px', height: isFirst ? '80px' : '64px', border: `3px solid ${rankColors[p.rank] || '#6c63ff'}`}} />
                    <h3 style={{...s.podiumName, fontSize: isFirst ? '20px' : '16px'}}>{p.username}</h3>
                    <p style={s.podiumTag}>{p.gameTag}</p>
                    <div style={{...s.podiumRank, backgroundColor: (rankColors[p.rank]||'#6c63ff')+'22', color: rankColors[p.rank]||'#6c63ff', border: `1px solid ${(rankColors[p.rank]||'#6c63ff')}44`}}>{p.rank}</div>
                    <div style={s.podiumStats}>
                      <div style={s.podiumStat}><span style={s.podiumStatVal}>{p.wins}</span><span style={s.podiumStatLabel}>Wins</span></div>
                      <div style={{...s.podiumStat, borderLeft:'1px solid rgba(108,99,255,0.15)', borderRight:'1px solid rgba(108,99,255,0.15)'}}><span style={s.podiumStatVal}>{p.winRate}%</span><span style={s.podiumStatLabel}>Win Rate</span></div>
                      <div style={s.podiumStat}><span style={s.podiumStatVal}>{p.tournamentsPlayed}</span><span style={s.podiumStatLabel}>Played</span></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full Table */}
          <div style={s.tableWrap} className="mobile-scroll">
            <table style={{...s.table, minWidth: {xs: '700px', md: '100%'}}}>
              <thead>
                {activeTab === 'Players' ? (
                  <tr>
                    <th style={{...s.th, width:'60px', textAlign:'center'}}>#</th>
                    <th style={s.th}>Player</th>
                    <th style={{...s.th, textAlign:'center'}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      City
                    </th>
                    <th style={{...s.th, textAlign:'center'}}>Rank</th>
                    <th style={{...s.th, textAlign:'center'}}>W</th>
                    <th style={{...s.th, textAlign:'center'}}>L</th>
                    <th style={{...s.th, textAlign:'center'}}>Win%</th>
                    <th style={{...s.th, textAlign:'center'}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 8 12 8s5-4 7.5-4a2.5 2.5 0 0 1 0 5H18"/><path d="M18 9v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/></svg>
                      Tournaments
                    </th>
                  </tr>
                ) : (
                  <tr>
                    <th style={{...s.th, width:'60px', textAlign:'center'}}>#</th>
                    <th style={s.th}>Campus / Institution</th>
                    <th style={{...s.th, textAlign:'center'}}>Total Players</th>
                    <th style={{...s.th, textAlign:'center'}}>Campus Champions</th>
                    <th style={{...s.th, textAlign:'center'}}>Total Wins</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeTab === 'Players' ? players.map((p, i) => {
                  const medal = getMedal(i)
                  return (
                    <tr key={p.userId} style={{...s.tr, backgroundColor: i < 3 ? 'rgba(108,99,255,0.05)' : 'transparent'}}>
                      <td style={{...s.td, textAlign:'center', fontWeight:'700', fontFamily:'Rajdhani, sans-serif', fontSize:'18px', color: medal ? '#FFD700' : '#8B8BA7'}}>
                        {medal ? medal.emoji : i + 1}
                      </td>
                      <td style={s.td}>
                        <div style={s.playerCell}>
                          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`} alt={p.username} style={s.tableAvatar} />
                          <div>
                            <span style={s.playerName}>{p.username}</span>
                            <span style={s.playerTag}>{p.gameTag}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{...s.td, textAlign:'center', color:'#8B8BA7', fontSize:'13px'}}>{p.city}</td>
                      <td style={{...s.td, textAlign:'center'}}>
                        <span style={{...s.rankPill, backgroundColor:(rankColors[p.rank]||'#6c63ff')+'22', color:rankColors[p.rank]||'#6c63ff', border:`1px solid ${(rankColors[p.rank]||'#6c63ff')}33`}}>{p.rank}</span>
                      </td>
                      <td style={{...s.td, textAlign:'center', color:'#22C55E', fontWeight:'700', fontFamily:'Rajdhani, sans-serif', fontSize:'18px'}}>{p.wins}</td>
                      <td style={{...s.td, textAlign:'center', color:'#EF4444', fontWeight:'700', fontFamily:'Rajdhani, sans-serif', fontSize:'18px'}}>{p.losses}</td>
                      <td style={{...s.td, textAlign:'center'}}>
                        <span style={{...s.winRate, color: p.winRate >= 60 ? '#22C55E' : p.winRate >= 40 ? '#F59E0B' : '#EF4444'}}>{p.winRate}%</span>
                      </td>
                      <td style={{...s.td, textAlign:'center', color:'#8B8BA7', fontFamily:'Rajdhani, sans-serif', fontSize:'16px', fontWeight:'600'}}>{p.tournamentsPlayed}</td>
                    </tr>
                  )
                }) : campuses.map((c, i) => {
                  let badge = ''
                  if (i === 0) badge = '🥇'
                  else if (i === 1) badge = '🥈'
                  else if (i === 2) badge = '🥉'
                  else badge = i + 1

                  return (
                    <tr key={c.institution} style={s.tr}>
                      <td style={s.td}>
                        <span style={{...s.posBadge, backgroundColor: i<3?'rgba(255,215,0,0.15)':'rgba(108,99,255,0.08)', color: i<3?'#FFD700':'#8B8BA7', border: i<3?'1px solid rgba(255,215,0,0.3)':'1px solid rgba(108,99,255,0.1)'}}>
                          {badge}
                        </span>
                      </td>
                      <td style={{...s.td, fontWeight: '700', fontSize: '18px', color: '#fff'}}>{c.institution}</td>
                      <td style={{...s.td, textAlign:'center', color:'#8B8BA7'}}>{c.totalPlayers}</td>
                      <td style={{...s.td, textAlign:'center', color:'#FFD700', fontWeight:'bold'}}>{c.campusChampions > 0 ? `🏆 x${c.campusChampions}` : '-'}</td>
                      <td style={{...s.td, textAlign:'center', color:'#22C55E', fontWeight:'700', fontFamily:'Rajdhani, sans-serif', fontSize:'22px'}}>{c.totalWins}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', backgroundColor:'#060610', padding:'100px 60px 60px' },
  header: { display:'flex', gap:'20px', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', maxWidth:'1000px', margin:'0 auto 40px' },
  hIcon: { width:'56px',height:'56px',borderRadius:'14px',backgroundColor:'rgba(255,215,0,0.1)',border:'1px solid rgba(255,215,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 },
  eyebrow: { color:'#FFD700', fontSize:'12px', fontWeight:'700', letterSpacing:'2px', marginBottom:'4px' },
  title: { fontFamily:'Rajdhani, sans-serif', fontSize:'36px', fontWeight:'700', color:'#fff', marginBottom:'4px' },
  sub: { color:'#8B8BA7', fontSize:'14px' },
  totalBadge: { marginLeft:'auto', backgroundColor:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.3)', borderRadius:'12px', padding:'12px 20px', textAlign:'center' },
  totalNum: { display:'block', fontSize:'28px', fontWeight:'700', color:'#6C63FF', fontFamily:'Rajdhani, sans-serif' },
  totalLabel: { fontSize:'10px', color:'#8B8BA7', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase' },

  loadWrap: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'40vh' },
  spinner: { width:'40px',height:'40px',border:'3px solid rgba(108,99,255,0.2)',borderTop:'3px solid #6C63FF',borderRadius:'50%',animation:'spin 1s linear infinite' },

  // Podium
  podium: { display:'flex', justifyContent:'center', alignItems:'flex-end', gap:'20px', marginBottom:'48px', maxWidth:'800px', margin:'0 auto 48px' },
  podiumCard: { backgroundColor:'#0F0F1E', borderRadius:'16px', border:'1px solid rgba(108,99,255,0.2)', padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center', width:'220px', position:'relative' },
  podiumFirst: { transform:'translateY(-16px)', border:'1px solid rgba(255,215,0,0.3)', boxShadow:'0 0 40px rgba(255,215,0,0.08)' },
  podiumPos: { width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' },
  podiumAvatar: { borderRadius:'50%', marginBottom:'10px', backgroundColor:'#6c63ff22' },
  podiumName: { fontFamily:'Rajdhani, sans-serif', fontWeight:'700', color:'#fff', marginBottom:'2px' },
  podiumTag: { color:'#8B8BA7', fontSize:'12px', marginBottom:'8px' },
  podiumRank: { padding:'3px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', marginBottom:'14px' },
  podiumStats: { display:'flex', width:'100%', borderTop:'1px solid rgba(108,99,255,0.15)', paddingTop:'12px' },
  podiumStat: { flex:1, textAlign:'center', padding:'0 6px' },
  podiumStatVal: { display:'block', fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:'700', color:'#fff' },
  podiumStatLabel: { display:'block', fontSize:'9px', color:'#8B8BA7', fontWeight:'700', letterSpacing:'0.5px', textTransform:'uppercase' },

  // Table
  tableWrap: { maxWidth:'1000px', margin:'0 auto', backgroundColor:'#0F0F1E', borderRadius:'16px', border:'1px solid rgba(108,99,255,0.15)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'14px 16px', textAlign:'left', fontSize:'10px', color:'#8B8BA7', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid rgba(108,99,255,0.15)', backgroundColor:'#0A0A18' },
  tr: { borderBottom:'1px solid rgba(108,99,255,0.08)', transition:'background 0.15s' },
  td: { padding:'14px 16px', fontSize:'14px', color:'#fff' },
  playerCell: { display:'flex', alignItems:'center', gap:'12px' },
  tableAvatar: { width:'36px', height:'36px', borderRadius:'50%', backgroundColor:'#6c63ff22', border:'2px solid #6c63ff44' },
  playerName: { display:'block', fontFamily:'Rajdhani, sans-serif', fontSize:'15px', fontWeight:'700', color:'#fff' },
  playerTag: { display:'block', fontSize:'11px', color:'#8B8BA7' },
  rankPill: { padding:'3px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' },
  winRate: { fontFamily:'Rajdhani, sans-serif', fontSize:'16px', fontWeight:'700' },
}

export default LeaderboardPage
