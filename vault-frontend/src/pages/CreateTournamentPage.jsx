import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/config'
import { Switch, FormControlLabel } from '@mui/material'

const gameOptions = [
  { title: 'Valorant', tag: 'FPS', color: '#ff4655', img: '/valorant.png' },
  { title: 'Tekken 8', tag: 'Fighting', color: '#f59e0b', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/header.jpg' },
  { title: 'EA FC 25', tag: 'Sports', color: '#22c55e', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg' },
  { title: 'Call of Duty', tag: 'FPS', color: '#ff4655', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg' },
  { title: 'Street Fighter 6', tag: 'Fighting', color: '#f59e0b', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/header.jpg' },
  { title: 'PUBG Mobile', tag: 'Battle Royale', color: '#06b6d4', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg' },
  { title: 'eFootball', tag: 'Sports', color: '#3b82f6', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1665460/header.jpg' },
]
const cities = ['Faisalabad','Lahore','Islamabad','Karachi','Multan','Peshawar','Rawalpindi']
const slotOptions = [4, 8, 16, 32, 64]

function CreateTournamentPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title:'', gameTitle:'', gameTag:'', accentColor:'', 
    prizePool:'', entryFee:'', maxSlots:16, city:'Faisalabad', rules:'', isVerifiedCafe: false,
    isUniversityWar: false, targetInstitution: ''
  })
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const selectGame = g => setForm({ ...form, gameTitle:g.title, gameTag:g.tag, accentColor:g.color })

  const handleSubmit = async () => {
    setError('')
    if (!form.title||!form.gameTitle||!form.city||!form.prizePool) { setError('Please fill in all required fields.'); return }
    setLoading(true)
    try {
      await api.post('/tournaments', { ...form, prizePool:parseFloat(form.prizePool), entryFee:parseFloat(form.entryFee||0), maxSlots:parseInt(form.maxSlots) })
      navigate('/tournaments')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament.')
    } finally { setLoading(false) }
  }

  if (user.role !== 'Organizer' && user.role !== 'Admin') {
    return (
      <div style={s.page}>
        <div style={s.denied}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <h2 style={s.title}>Access Restricted</h2>
          <p style={s.sub}>Only Organizers and Admins can create tournaments.</p>
          <p style={s.sub}>Your role: <span style={{color:'#6C63FF',fontWeight:'700'}}>{user.role||'Player'}</span></p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}><div style={s.container}>
      <div style={s.header}>
        <div style={s.hIcon}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 8 12 8s5-4 7.5-4a2.5 2.5 0 0 1 0 5H18"/><path d="M18 9v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 17v4"/><path d="M8 21h8"/></svg></div>
        <div>
          <p style={s.eyebrow}>● CREATE TOURNAMENT</p>
          <h1 style={s.title}>Launch a New Arena</h1>
          <p style={s.sub}>Set up your tournament and invite players to compete</p>
        </div>
      </div>

      <div style={s.progress}>
        {['Game & Details','Settings','Review & Launch'].map((label,i) => (
          <div key={i} style={s.stepItem}>
            <div style={{...s.stepCircle, backgroundColor:step>i+1?'#22C55E':step===i+1?'#6C63FF':'transparent', borderColor:step>i+1?'#22C55E':step===i+1?'#6C63FF':'rgba(108,99,255,0.3)', color:step>=i+1?'#fff':'#8B8BA7'}}>{step>i+1?'✓':i+1}</div>
            <span style={{color:step===i+1?'#fff':'#8B8BA7',fontSize:'12px',fontWeight:'600'}}>{label}</span>
          </div>
        ))}
      </div>

      {error && <div style={s.err}>{error}</div>}

      {step===1 && <div style={s.card}>
        <h3 style={s.secTitle}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4"/><circle cx="15" cy="11" r="1"/><circle cx="18" cy="13" r="1"/></svg> Select Game</h3>
        <div style={s.gameGrid}>
          {gameOptions.map(g => (
            <div key={g.title} onClick={()=>selectGame(g)} style={{...s.gameCard, borderColor:form.gameTitle===g.title?g.color:'rgba(108,99,255,0.15)', backgroundColor:form.gameTitle===g.title?g.color+'15':'#0A0A18', boxShadow:form.gameTitle===g.title?`0 0 20px ${g.color}22`:'none'}}>
              <img src={g.img} alt={g.title} style={{width:'100%',height:'60px',objectFit:'cover',borderRadius:'6px',marginBottom:'4px'}} />
              <span style={{color:form.gameTitle===g.title?'#fff':'#8B8BA7',fontSize:'13px',fontWeight:'700'}}>{g.title}</span>
              <span style={{color:g.color,fontSize:'10px',fontWeight:'700',letterSpacing:'1px'}}>{g.tag}</span>
            </div>
          ))}
        </div>
        <div style={s.fieldGroup}>
          <div style={s.fw}><label style={s.label}>Tournament Title *</label><input style={s.input} name="title" value={form.title} onChange={handleChange} placeholder="e.g., Faisalabad Masters 2026"/></div>
          <div style={s.fw}><label style={s.label}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>City *</label>
            <select style={s.select} name="city" value={form.city} onChange={handleChange}><option value="">Select City</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select>
          </div>
        </div>
        <button style={s.nextBtn} onClick={()=>{if(!form.gameTitle){setError('Select a game');return}if(!form.title){setError('Enter title');return}if(!form.city){setError('Select city');return}setError('');setStep(2)}}>Continue →</button>
      </div>}

      {step===2 && <div style={s.card}>
        <h3 style={s.secTitle}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4"/></svg> Tournament Settings</h3>
        <div style={s.fieldGroup}>
          <div style={s.fw}><label style={s.label}>🏆 Prize Pool (PKR) *</label><input style={s.input} name="prizePool" type="number" min="0" value={form.prizePool} onChange={handleChange} placeholder="e.g., 10000"/></div>
          <div style={s.fw}><label style={s.label}>💳 Entry Fee (PKR)</label><input style={s.input} name="entryFee" type="number" min="0" value={form.entryFee} onChange={handleChange} placeholder="0 for free"/></div>
        </div>
        <div style={s.fw}><label style={s.label}>👥 Max Players</label>
          <div style={s.slotGrid}>{slotOptions.map(sl=><button key={sl} onClick={()=>setForm({...form,maxSlots:sl})} style={{...s.slotBtn, backgroundColor:form.maxSlots===sl?'#6C63FF':'rgba(108,99,255,0.08)', color:form.maxSlots===sl?'#fff':'#8B8BA7', border:`1px solid ${form.maxSlots===sl?'#6C63FF':'rgba(108,99,255,0.2)'}`}}>{sl} Players</button>)}</div>
        </div>
        <div style={{...s.fw, marginTop: '8px', padding: '16px', backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.2)'}}>
          <FormControlLabel 
            control={<Switch checked={form.isVerifiedCafe} onChange={e => setForm({...form, isVerifiedCafe: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#FFD700' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#FFD700' } }} />} 
            label={<span style={{...s.label, color: '#FFD700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'}}>🛡️ Ping-Verified Cafe Node</span>} 
          />
        </div>
        <div style={{...s.fw, marginTop: '8px', padding: '16px', backgroundColor: 'rgba(108,99,255,0.05)', borderRadius: '8px', border: '1px solid rgba(108,99,255,0.2)'}}>
          <FormControlLabel 
            control={<Switch checked={form.isUniversityWar} onChange={e => setForm({...form, isUniversityWar: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C63FF' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C63FF' } }} />} 
            label={<span style={{...s.label, color: '#6C63FF', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'}}>🎓 University War (Exclusive)</span>} 
          />
          {form.isUniversityWar && (
            <div style={{ marginTop: '12px' }}>
              <label style={s.label}>Target Institution / Campus</label>
              <input style={s.input} name="targetInstitution" value={form.targetInstitution} onChange={handleChange} placeholder="e.g., FAST NUCES" />
            </div>
          )}
        </div>
        <div style={s.fw}><label style={s.label}>📋 Rules</label><textarea style={{...s.input,height:'100px',resize:'none'}} name="rules" value={form.rules} onChange={handleChange} placeholder="Tournament rules and format..."/></div>
        <div style={s.btnRow}><button style={s.backBtn} onClick={()=>setStep(1)}>← Back</button><button style={s.nextBtn} onClick={()=>{if(!form.prizePool){setError('Enter prize pool');return}setError('');setStep(3)}}>Continue →</button></div>
      </div>}

      {step===3 && <div style={s.card}>
        <h3 style={s.secTitle}>✅ Review & Launch</h3>
        <div style={s.reviewCard}>
          <div style={s.reviewHeader}>
            <img src={gameOptions.find(g=>g.title===form.gameTitle)?.img} alt={form.gameTitle} style={{width:'64px',height:'40px',objectFit:'cover',borderRadius:'6px'}} />
            <div>
              <h3 style={{...s.title,fontSize:'22px'}}>
                {form.title} {form.isVerifiedCafe && <span style={{fontSize: '14px', marginLeft: '8px'}}>🛡️</span>}
              </h3>
              <p style={{color:form.accentColor,fontSize:'12px',fontWeight:'700',letterSpacing:'1px'}}>{form.gameTitle} · {form.gameTag}</p>
            </div>
          </div>
          <div style={s.reviewGrid}>
            {[['🏆 Prize Pool',`PKR ${parseFloat(form.prizePool||0).toLocaleString()}`],['💳 Entry Fee',`PKR ${parseFloat(form.entryFee||0).toLocaleString()}`],['👥 Players',`${form.maxSlots} Slots`],['📍 City',form.city]].map(([l,v])=>(
              <div key={l} style={s.reviewItem}><span style={s.reviewLabel}>{l}</span><span style={s.reviewValue}>{v}</span></div>
            ))}
          </div>
          {form.isUniversityWar && <div style={{padding:'18px', backgroundColor:'rgba(108,99,255,0.1)', borderTop:'1px solid rgba(108,99,255,0.15)'}}><span style={s.reviewLabel}>🎓 Target Institution</span><p style={{color:'#6C63FF',fontSize:'16px',fontWeight:'700',fontFamily:'Rajdhani, sans-serif',marginTop:'4px'}}>{form.targetInstitution}</p></div>}
          {form.rules&&<div style={s.rulesBox}><span style={s.reviewLabel}>📋 Rules</span><p style={{color:'#ccc',fontSize:'13px',marginTop:'6px',lineHeight:'1.5'}}>{form.rules}</p></div>}
        </div>
        <div style={s.btnRow}><button style={s.backBtn} onClick={()=>setStep(2)}>← Back</button><button style={{...s.nextBtn,background:'linear-gradient(135deg,#22C55E,#16A34A)'}} onClick={handleSubmit} disabled={loading}>{loading?'Creating...':'🚀 Launch Tournament'}</button></div>
      </div>}
    </div></div>
  )
}

const s = {
  page:{minHeight:'100vh',backgroundColor:'#060610',padding:'100px 40px 60px'},
  container:{maxWidth:'720px',margin:'0 auto'},
  header:{display:'flex',gap:'20px',alignItems:'center',marginBottom:'36px'},
  hIcon:{width:'56px',height:'56px',borderRadius:'14px',backgroundColor:'rgba(108,99,255,0.15)',border:'1px solid rgba(108,99,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  eyebrow:{color:'#6C63FF',fontSize:'12px',fontWeight:'700',letterSpacing:'2px',marginBottom:'4px'},
  title:{fontFamily:'Rajdhani, sans-serif',fontSize:'36px',fontWeight:'700',color:'#fff',marginBottom:'4px'},
  sub:{color:'#8B8BA7',fontSize:'14px'},
  progress:{display:'flex',justifyContent:'center',gap:'40px',marginBottom:'36px',padding:'20px',backgroundColor:'#0A0A18',borderRadius:'12px',border:'1px solid rgba(108,99,255,0.1)'},
  stepItem:{display:'flex',alignItems:'center',gap:'10px'},
  stepCircle:{width:'30px',height:'30px',borderRadius:'50%',border:'2px solid',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',fontFamily:'Rajdhani, sans-serif'},
  err:{backgroundColor:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#EF4444',padding:'12px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:'500',marginBottom:'20px'},
  card:{backgroundColor:'#0F0F1E',borderRadius:'16px',border:'1px solid rgba(108,99,255,0.2)',padding:'32px'},
  secTitle:{fontFamily:'Rajdhani, sans-serif',fontSize:'20px',fontWeight:'700',color:'#fff',display:'flex',alignItems:'center',gap:'10px',marginBottom:'24px'},
  gameGrid:{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'12px',marginBottom:'28px'},
  gameCard:{display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',padding:'18px 12px',borderRadius:'12px',border:'1px solid',cursor:'pointer',transition:'all 0.2s ease'},
  fieldGroup:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'},
  fw:{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'16px'},
  label:{color:'#8B8BA7',fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase'},
  input:{backgroundColor:'#060610',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'8px',padding:'13px 16px',color:'#fff',fontSize:'14px',outline:'none',width:'100%',boxSizing:'border-box'},
  select:{backgroundColor:'#060610',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'8px',padding:'13px 16px',color:'#fff',fontSize:'14px',outline:'none',cursor:'pointer',width:'100%',boxSizing:'border-box'},
  slotGrid:{display:'flex',gap:'8px',flexWrap:'wrap'},
  slotBtn:{padding:'8px 18px',borderRadius:'6px',fontSize:'13px',fontWeight:'600',cursor:'pointer',transition:'all 0.15s'},
  btnRow:{display:'flex',gap:'12px',marginTop:'24px'},
  backBtn:{flex:1,backgroundColor:'transparent',color:'#8B8BA7',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'14px',fontSize:'15px',fontWeight:'600',cursor:'pointer'},
  nextBtn:{flex:2,background:'linear-gradient(135deg,#6C63FF,#8B5CF6)',color:'#fff',border:'none',borderRadius:'8px',padding:'14px',fontSize:'15px',fontWeight:'700',cursor:'pointer',letterSpacing:'0.5px',boxShadow:'0 8px 24px rgba(108,99,255,0.35)'},
  reviewCard:{backgroundColor:'#0A0A18',borderRadius:'12px',border:'1px solid rgba(108,99,255,0.15)',overflow:'hidden'},
  reviewHeader:{display:'flex',alignItems:'center',gap:'16px',padding:'24px',borderBottom:'1px solid rgba(108,99,255,0.1)'},
  reviewGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px',backgroundColor:'rgba(108,99,255,0.1)'},
  reviewItem:{padding:'18px',backgroundColor:'#0A0A18'},
  reviewLabel:{display:'block',fontSize:'10px',color:'#8B8BA7',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase'},
  reviewValue:{display:'block',fontSize:'16px',color:'#fff',fontWeight:'700',fontFamily:'Rajdhani, sans-serif',marginTop:'2px'},
  rulesBox:{padding:'18px',borderTop:'1px solid rgba(108,99,255,0.1)'},
  denied:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',gap:'12px'},
}

export default CreateTournamentPage
