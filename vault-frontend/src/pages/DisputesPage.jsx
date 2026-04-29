import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/config'

function DisputesPage() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolveModal, setResolveModal] = useState(null)
  const [resolution, setResolution] = useState('')
  const [winnerId, setWinnerId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => { fetchDisputes() }, [])

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/disputes')
      setDisputes(res.data)
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) navigate('/login')
    } finally { setLoading(false) }
  }

  const handleResolve = async () => {
    if (!resolution || !winnerId) { setToast('Please fill in resolution and winner ID'); return }
    setSubmitting(true)
    try {
      await api.put(`/disputes/${resolveModal.disputeId}/resolve`, { resolution, winnerId: parseInt(winnerId) })
      setToast('✅ Dispute resolved successfully!')
      setResolveModal(null); setResolution(''); setWinnerId('')
      fetchDisputes()
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to resolve dispute')
    } finally { setSubmitting(false); setTimeout(() => setToast(''), 3000) }
  }

  const getStatusStyle = (status) => {
    const map = { Open:'#F59E0B', Reviewing:'#6C63FF', Resolved:'#22C55E', Dismissed:'#8B8BA7' }
    return map[status] || '#8B8BA7'
  }

  if (user.role !== 'Organizer' && user.role !== 'Admin') {
    return (
      <div style={s.page}><div style={s.denied}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <h2 style={s.dTitle}>Organizer Access Only</h2>
        <p style={s.sub}>Dispute management is restricted to Organizers and Admins.</p>
      </div></div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.hIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div>
          <p style={s.eyebrow}>● DISPUTE CENTER</p>
          <h1 style={s.title}>Manage Disputes</h1>
          <p style={s.sub}>Review, investigate, and resolve match disputes</p>
        </div>
        <div style={s.statBadge}>
          <span style={s.statNum}>{disputes.filter(d=>d.status==='Open').length}</span>
          <span style={s.statLabel}>Open</span>
        </div>
      </div>

      {toast && <div style={s.toast}>{toast}</div>}

      {loading ? <p style={{color:'#8B8BA7',textAlign:'center',padding:'60px'}}>Loading disputes...</p> :
       disputes.length === 0 ? (
        <div style={s.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <h3 style={{color:'#fff',fontFamily:'Rajdhani, sans-serif',fontSize:'22px',marginTop:'16px'}}>All Clear!</h3>
          <p style={{color:'#8B8BA7',fontSize:'14px'}}>No disputes have been filed.</p>
        </div>
      ) : (
        <div style={s.list}>
          {disputes.map(d => {
            const c = getStatusStyle(d.status)
            return (
              <div key={d.disputeId} style={s.card}>
                <div style={s.cardTop}>
                  <div style={s.cardLeft}>
                    <div style={{...s.icon, backgroundColor:c+'22', border:`1px solid ${c}44`}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div>
                      <p style={s.cardTitle}>Dispute #{d.disputeId} — Match #{d.matchId}</p>
                      <p style={s.cardSub}>Filed by <span style={{color:'#6C63FF',fontWeight:'600'}}>{d.filedByUsername}</span> · {new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span style={{...s.statusBadge, color:c, backgroundColor:c+'22', border:`1px solid ${c}44`}}>{d.status}</span>
                </div>
                <div style={s.reasonBox}>
                  <p style={s.reasonLabel}>📋 Reason</p>
                  <p style={s.reasonText}>{d.reason}</p>
                </div>
                {d.evidenceUrl && <div style={s.evidenceBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <a href={d.evidenceUrl} target="_blank" rel="noreferrer" style={s.evidenceLink}>{d.evidenceUrl}</a>
                </div>}
                {d.resolution && <div style={s.resolutionBox}>
                  <p style={s.reasonLabel}>✅ Resolution</p>
                  <p style={s.reasonText}>{d.resolution}</p>
                </div>}
                {d.status === 'Open' && (
                  <button style={s.resolveBtn} onClick={()=>setResolveModal(d)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Resolve Dispute
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {resolveModal && (
        <div style={s.overlay}><div style={s.modal}>
          <h3 style={s.mTitle}>⚖️ Resolve Dispute #{resolveModal.disputeId}</h3>
          <p style={s.mSub}>Match #{resolveModal.matchId} — Filed by {resolveModal.filedByUsername}</p>
          <div style={s.mField}><label style={s.mLabel}>Winner User ID</label><input style={s.mInput} type="number" value={winnerId} onChange={e=>setWinnerId(e.target.value)} placeholder="Enter the winner's User ID"/></div>
          <div style={s.mField}><label style={s.mLabel}>Resolution Details</label><textarea style={{...s.mInput,height:'90px',resize:'none'}} value={resolution} onChange={e=>setResolution(e.target.value)} placeholder="Explain the resolution decision..."/></div>
          <div style={s.mBtns}>
            <button style={s.mCancel} onClick={()=>{setResolveModal(null);setResolution('');setWinnerId('')}}>Cancel</button>
            <button style={s.mSubmit} onClick={handleResolve} disabled={submitting}>{submitting?'Resolving...':'Resolve & Advance Winner'}</button>
          </div>
        </div></div>
      )}
    </div>
  )
}

const s = {
  page:{minHeight:'100vh',backgroundColor:'#060610',padding:'100px 60px 60px'},
  header:{display:'flex',gap:'20px',alignItems:'center',marginBottom:'36px',flexWrap:'wrap'},
  hIcon:{width:'56px',height:'56px',borderRadius:'14px',backgroundColor:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  eyebrow:{color:'#EF4444',fontSize:'12px',fontWeight:'700',letterSpacing:'2px',marginBottom:'4px'},
  title:{fontFamily:'Rajdhani, sans-serif',fontSize:'36px',fontWeight:'700',color:'#fff',marginBottom:'4px'},
  sub:{color:'#8B8BA7',fontSize:'14px'},
  statBadge:{marginLeft:'auto',backgroundColor:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'12px',padding:'12px 20px',textAlign:'center'},
  statNum:{display:'block',fontSize:'28px',fontWeight:'700',color:'#EF4444',fontFamily:'Rajdhani, sans-serif'},
  statLabel:{fontSize:'10px',color:'#8B8BA7',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase'},
  toast:{backgroundColor:'rgba(108,99,255,0.15)',border:'1px solid rgba(108,99,255,0.4)',color:'#A78BFA',padding:'12px 20px',borderRadius:'8px',marginBottom:'24px',fontSize:'14px',fontWeight:'500',textAlign:'center'},
  list:{display:'flex',flexDirection:'column',gap:'16px',maxWidth:'800px'},
  card:{backgroundColor:'#0F0F1E',borderRadius:'12px',border:'1px solid rgba(108,99,255,0.15)',padding:'24px'},
  cardTop:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'12px'},
  cardLeft:{display:'flex',alignItems:'center',gap:'14px'},
  icon:{width:'40px',height:'40px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'},
  cardTitle:{fontFamily:'Rajdhani, sans-serif',fontSize:'16px',fontWeight:'700',color:'#fff'},
  cardSub:{fontSize:'12px',color:'#8B8BA7',marginTop:'2px'},
  statusBadge:{fontSize:'11px',fontWeight:'700',padding:'4px 14px',borderRadius:'20px',letterSpacing:'0.5px'},
  reasonBox:{backgroundColor:'#0A0A18',borderRadius:'8px',padding:'14px',marginBottom:'12px'},
  reasonLabel:{fontSize:'10px',color:'#8B8BA7',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'},
  reasonText:{color:'#ccc',fontSize:'13px',lineHeight:'1.5'},
  evidenceBox:{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px',backgroundColor:'rgba(108,99,255,0.08)',borderRadius:'6px',marginBottom:'12px'},
  evidenceLink:{color:'#6C63FF',fontSize:'13px',textDecoration:'none',wordBreak:'break-all'},
  resolutionBox:{backgroundColor:'rgba(34,197,94,0.08)',borderRadius:'8px',padding:'14px',marginBottom:'12px',border:'1px solid rgba(34,197,94,0.2)'},
  resolveBtn:{display:'flex',alignItems:'center',gap:'8px',justifyContent:'center',width:'100%',background:'linear-gradient(135deg,#6C63FF,#8B5CF6)',color:'#fff',border:'none',borderRadius:'8px',padding:'12px',fontSize:'14px',fontWeight:'700',cursor:'pointer'},
  empty:{display:'flex',flexDirection:'column',alignItems:'center',padding:'80px 20px'},
  denied:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',gap:'12px'},
  dTitle:{fontFamily:'Rajdhani, sans-serif',fontSize:'28px',fontWeight:'700',color:'#fff'},
  overlay:{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000},
  modal:{backgroundColor:'#0F0F1E',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'16px',padding:'36px',width:'100%',maxWidth:'500px'},
  mTitle:{fontFamily:'Rajdhani, sans-serif',fontSize:'24px',fontWeight:'700',color:'#fff',marginBottom:'6px'},
  mSub:{color:'#8B8BA7',fontSize:'14px',marginBottom:'24px'},
  mField:{marginBottom:'16px'},
  mLabel:{display:'block',color:'#8B8BA7',fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'},
  mInput:{width:'100%',boxSizing:'border-box',backgroundColor:'#060610',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'8px',padding:'13px 16px',color:'#fff',fontSize:'14px',outline:'none'},
  mBtns:{display:'flex',gap:'12px',marginTop:'20px'},
  mCancel:{flex:1,backgroundColor:'transparent',color:'#8B8BA7',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'12px',fontSize:'14px',fontWeight:'600',cursor:'pointer'},
  mSubmit:{flex:2,background:'linear-gradient(135deg,#6C63FF,#8B5CF6)',color:'#fff',border:'none',borderRadius:'8px',padding:'12px',fontSize:'14px',fontWeight:'700',cursor:'pointer'},
}

export default DisputesPage
