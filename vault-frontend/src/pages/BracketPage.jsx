import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTournaments } from '../api/tournaments'
import api from '../api/config'
import confetti from 'canvas-confetti'
import * as signalR from '@microsoft/signalr'

function BracketPage() {
    const { id } = useParams()
    const [bracket, setBracket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [reportModal, setReportModal] = useState(null)
    const [disputeModal, setDisputeModal] = useState(null)
    const [disputeForm, setDisputeForm] = useState({ reason: '', evidenceUrl: '' })
    const [scores, setScores] = useState({ player1Score: 0, player2Score: 0 })
    const [submitting, setSubmitting] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [generating, setGenerating] = useState(false)
    const [champion, setChampion] = useState(null)

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        fetchBracket()

        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5223/tournamentHub')
            .withAutomaticReconnect()
            .build()

        connection.start()
            .then(() => {
                console.log('Connected to Tournament Hub')
                connection.invoke("JoinTournamentGroup", id.toString())
            })
            .catch(err => console.error('SignalR Connection Error: ', err))

        connection.on("MatchUpdated", (matchId, winnerId) => {
            console.log(`Match ${matchId} updated! Refreshing bracket...`)
            fetchBracket()
        })

        return () => {
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.invoke("LeaveTournamentGroup", id.toString())
            }
            connection.stop()
        }
    }, [id])

    const fetchBracket = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/brackets/${id}`)
            setBracket(res.data)
        } catch (err) {
            setError('Bracket not found. Tournament may not have started yet.')
        } finally {
            setLoading(false)
        }
    }

    const handleReportScore = async () => {
        if (scores.player1Score === scores.player2Score) {
            alert('Scores cannot be equal — there must be a winner!')
            return
        }
        try {
            setSubmitting(true)
            await api.post(`/matches/${reportModal.matchId}/report`, {
                player1Score: parseInt(scores.player1Score),
                player2Score: parseInt(scores.player2Score)
            })

            // Check if this was the final match (no nextMatchId)
            const isFinal = !reportModal.nextMatchId
            const winnerName = parseInt(scores.player1Score) > parseInt(scores.player2Score)
                ? reportModal.player1 : reportModal.player2

            if (isFinal) {
                // 🎊 Champion confetti explosion!
                const duration = 4000
                const end = Date.now() + duration
                const colors = ['#6C63FF', '#8B5CF6', '#FFD700', '#22C55E', '#FF4655']
                const frame = () => {
                    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors })
                    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors })
                    if (Date.now() < end) requestAnimationFrame(frame)
                }
                frame()
                confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors })
                setChampion(winnerName)
                setTimeout(() => setChampion(null), 8000)
            }

            setSuccessMsg(isFinal ? `🏆 ${winnerName} is the CHAMPION!` : 'Score reported! Bracket updated.')
            setReportModal(null)
            setScores({ player1Score: 0, player2Score: 0 })
            setTimeout(() => setSuccessMsg(''), 5000)
            fetchBracket()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to report score')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDispute = async () => {
        if (!disputeForm.reason) { alert('Please describe the dispute reason'); return }
        try {
            setSubmitting(true)
            await api.post('/disputes', { matchId: disputeModal.matchId, reason: disputeForm.reason, evidenceUrl: disputeForm.evidenceUrl || '' })
            setSuccessMsg('Dispute filed! Match has been frozen pending review.')
            setDisputeModal(null)
            setDisputeForm({ reason: '', evidenceUrl: '' })
            setTimeout(() => setSuccessMsg(''), 3000)
            fetchBracket()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to file dispute')
        } finally { setSubmitting(false) }
    }

    const handleGenerateBracket = async () => {
        setGenerating(true)
        try {
            await api.post(`/brackets/generate/${id}`)
            setSuccessMsg('Bracket generated successfully!')
            setTimeout(() => setSuccessMsg(''), 3000)
            fetchBracket()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate bracket')
        } finally { setGenerating(false) }
    }

    const isOrganizer = user?.role === 'Organizer' || user?.role === 'Admin'

    // Group matches by round
    const getRounds = () => {
        if (!bracket?.matches) return []
        const rounds = {}
        bracket.matches.forEach(m => {
            if (!rounds[m.round]) rounds[m.round] = []
            rounds[m.round].push(m)
        })
        return Object.entries(rounds).sort((a, b) => a[0] - b[0])
    }

    const getRoundName = (round, totalRounds) => {
        const diff = totalRounds - parseInt(round)
        if (diff === 0) return '🏆 Grand Final'
        if (diff === 1) return '🥊 Semi Finals'
        if (diff === 2) return '⚔️ Quarter Finals'
        return `Round ${round}`
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#22C55E'
            case 'Disputed': return '#EF4444'
            case 'InProgress': return '#F59E0B'
            default: return '#8B8BA7'
        }
    }

    if (loading) return (
        <div style={styles.centered}>
            <div style={styles.spinner} />
            <p style={{ color: '#8B8BA7', marginTop: '16px' }}>Loading bracket...</p>
        </div>
    )

    if (error) return (
        <div style={styles.centered}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="1.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <p style={{ color: '#8B8BA7', fontSize: '18px', marginTop: '12px' }}>{error}</p>
            {isOrganizer && (
                <button onClick={handleGenerateBracket} disabled={generating} style={{...styles.genBtn, marginTop: '20px'}}>
                    {generating ? 'Generating...' : '⚡ Generate Bracket Now'}
                </button>
            )}
            <Link to="/tournaments" style={styles.backBtn}>← Back to Tournaments</Link>
        </div>
    )

    const rounds = getRounds()

    return (
        <div style={styles.page} className="container">

            {/* Header */}
            <div style={styles.header} className="mobile-stack">
                <Link to="/tournaments" style={styles.backLink}>← Back to Tournaments</Link>
                <div>
                    <p style={styles.eyebrow}>● LIVE BRACKET</p>
                    <h1 style={{...styles.title, fontSize: 'clamp(28px, 8vw, 42px)'}}>Tournament Bracket</h1>
                    <p style={styles.sub}>
                        {bracket.totalRounds} Rounds · {bracket.matches?.length} Matches Total
                    </p>
                </div>
                <div style={styles.legend}>
                    {[['Pending', '#8B8BA7'], ['Completed', '#22C55E'], ['Disputed', '#EF4444']].map(([label, color]) => (
                        <div key={label} style={styles.legendItem}>
                            <div style={{ ...styles.legendDot, backgroundColor: color }} />
                            <span style={{ color: '#8B8BA7', fontSize: '12px' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>


            {/* Success Message */}
            {successMsg && (
                <div style={champion ? styles.championBanner : styles.successBanner}>{successMsg}</div>
            )}

            {/* Champion Announcement */}
            {champion && (
                <div style={styles.championCard}>
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${champion}`} alt="champion" style={{width:'64px',height:'64px',borderRadius:'50%',border:'3px solid #FFD700',backgroundColor:'#FFD70022'}} />
                    <div>
                        <p style={{color:'#FFD700',fontSize:'12px',fontWeight:'700',letterSpacing:'2px',marginBottom:'4px'}}>🏆 TOURNAMENT CHAMPION</p>
                        <h2 style={{fontFamily:'Rajdhani, sans-serif',fontSize:'28px',fontWeight:'700',color:'#fff',margin:0}}>{champion}</h2>
                    </div>
                </div>
            )}

            {/* Bracket Tree */}
            <div style={styles.bracketContainer} className="mobile-scroll">
                {rounds.map(([round, matches]) => (
                    <div key={round} style={styles.roundColumn}>

                        {/* Round Title */}
                        <div style={styles.roundTitle}>
                            {getRoundName(round, bracket.totalRounds)}
                        </div>

                        {/* Matches */}
                        <div style={styles.matchesCol}>
                            {matches.map(match => (
                                <div key={match.matchId} style={{
                                    ...styles.matchCard,
                                    borderColor: match.status === 'Disputed'
                                        ? '#EF444444'
                                        : match.status === 'Completed'
                                            ? '#22C55E44'
                                            : 'rgba(108,99,255,0.2)'
                                }}>
                                    {/* Status Badge */}
                                    <div style={styles.matchHeader}>
                                        <span style={styles.matchNum}>Match {match.matchNumber}</span>
                                        <span style={{
                                            ...styles.statusBadge,
                                            color: getStatusColor(match.status),
                                            backgroundColor: getStatusColor(match.status) + '22'
                                        }}>
                                            {match.status === 'Completed' ? '✓' : match.status === 'Disputed' ? '⚠' : '○'} {match.status}
                                        </span>
                                    </div>

                                    {/* Player 1 */}
                                    <div style={{
                                        ...styles.playerRow,
                                        backgroundColor: match.winnerName === match.player1Name && match.winnerName
                                            ? 'rgba(34,197,94,0.1)' : 'transparent',
                                        borderLeft: match.winnerName === match.player1Name && match.winnerName
                                            ? '3px solid #22C55E' : '3px solid transparent'
                                    }}>
                                        <span style={{
                                            ...styles.playerName,
                                            color: match.player1Name === 'TBD' ? '#8B8BA7' : '#fff',
                                            fontWeight: match.winnerName === match.player1Name ? '700' : '400'
                                        }}>
                                            {match.winnerName === match.player1Name && match.winnerName ? '🏆 ' : ''}
                                            {match.player1Name}
                                        </span>
                                        {match.player1Score !== null && match.player1Score !== undefined && (
                                            <span style={styles.score}>{match.player1Score}</span>
                                        )}
                                    </div>

                                    {/* VS Divider */}
                                    <div style={styles.vsDivider}>
                                        <div style={styles.vsLine} />
                                        <span style={styles.vsText}>VS</span>
                                        <div style={styles.vsLine} />
                                    </div>

                                    {/* Player 2 */}
                                    <div style={{
                                        ...styles.playerRow,
                                        backgroundColor: match.winnerName === match.player2Name && match.winnerName
                                            ? 'rgba(34,197,94,0.1)' : 'transparent',
                                        borderLeft: match.winnerName === match.player2Name && match.winnerName
                                            ? '3px solid #22C55E' : '3px solid transparent'
                                    }}>
                                        <span style={{
                                            ...styles.playerName,
                                            color: match.player2Name === 'TBD' ? '#8B8BA7' : '#fff',
                                            fontWeight: match.winnerName === match.player2Name ? '700' : '400'
                                        }}>
                                            {match.winnerName === match.player2Name && match.winnerName ? '🏆 ' : ''}
                                            {match.player2Name}
                                        </span>
                                        {match.player2Score !== null && match.player2Score !== undefined && (
                                            <span style={styles.score}>{match.player2Score}</span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {(match.status === 'Pending' || match.status === 'InProgress') &&
                                        match.player1Name !== 'TBD' &&
                                        match.player2Name !== 'TBD' && (
                                            <div style={styles.actions}>
                                                <button
                                                    style={styles.reportBtn}
                                                    onClick={() => setReportModal({
                                                        matchId: match.matchId,
                                                        player1: match.player1Name,
                                                        player2: match.player2Name,
                                                        nextMatchId: match.nextMatchId
                                                    })}
                                                >
                                                    📊 Report Score
                                                </button>
                                                <button
                                                    style={styles.disputeBtn}
                                                    onClick={() => setDisputeModal({ matchId: match.matchId, player1: match.player1Name, player2: match.player2Name })}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Dispute
                                                </button>
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Score Modal */}
            {reportModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>📊 Report Match Score</h3>
                        <p style={styles.modalSub}>Enter the final scores for this match</p>

                        <div style={styles.scoreRow}>
                            <div style={styles.scoreField}>
                                <label style={styles.scoreLabel}>{reportModal.player1}</label>
                                <input
                                    type="number" min="0"
                                    value={scores.player1Score}
                                    onChange={e => setScores({ ...scores, player1Score: e.target.value })}
                                    style={styles.scoreInput}
                                />
                            </div>
                            <div style={{ color: '#8B8BA7', fontSize: '20px', fontWeight: 'bold', paddingTop: '20px' }}>VS</div>
                            <div style={styles.scoreField}>
                                <label style={styles.scoreLabel}>{reportModal.player2}</label>
                                <input
                                    type="number" min="0"
                                    value={scores.player2Score}
                                    onChange={e => setScores({ ...scores, player2Score: e.target.value })}
                                    style={styles.scoreInput}
                                />
                            </div>
                        </div>

                        <div style={styles.modalBtns}>
                            <button
                                style={styles.cancelBtn}
                                onClick={() => { setReportModal(null); setScores({ player1Score: 0, player2Score: 0 }) }}
                            >Cancel</button>
                            <button
                                style={styles.submitBtn}
                                onClick={handleReportScore}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Score →'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispute Modal */}
            {disputeModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{...styles.modalTitle, display:'flex', alignItems:'center', gap:'8px'}}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            File a Dispute
                        </h3>
                        <p style={styles.modalSub}>{disputeModal.player1} vs {disputeModal.player2} — Match #{disputeModal.matchId}</p>
                        <div style={{marginBottom:'16px'}}>
                            <label style={{display:'block',color:'#8B8BA7',fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>📋 Reason for Dispute *</label>
                            <textarea style={{...styles.scoreInput,fontSize:'14px',height:'90px',resize:'none',textAlign:'left',padding:'12px 16px',boxSizing:'border-box'}} value={disputeForm.reason} onChange={e=>setDisputeForm({...disputeForm,reason:e.target.value})} placeholder="Describe what happened..."/>
                        </div>
                        <div style={{marginBottom:'20px'}}>
                            <label style={{display:'block',color:'#8B8BA7',fontSize:'11px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                Evidence URL (optional)
                            </label>
                            <input style={{...styles.scoreInput,fontSize:'14px',textAlign:'left',padding:'12px 16px',boxSizing:'border-box'}} value={disputeForm.evidenceUrl} onChange={e=>setDisputeForm({...disputeForm,evidenceUrl:e.target.value})} placeholder="https://screenshot-link.com/evidence"/>
                        </div>
                        <div style={styles.modalBtns}>
                            <button style={styles.cancelBtn} onClick={()=>{setDisputeModal(null);setDisputeForm({reason:'',evidenceUrl:''})}}>Cancel</button>
                            <button style={{...styles.submitBtn,background:'linear-gradient(135deg,#EF4444,#DC2626)'}} onClick={handleDispute} disabled={submitting}>{submitting?'Filing...':'⚠ Submit Dispute'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#060610', padding: '100px 40px 60px' },
  centered: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060610' },
  spinner: { width: '40px', height: '40px', border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  genBtn: { background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 28px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px', boxShadow: '0 8px 24px rgba(108,99,255,0.35)' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' },
  backLink: { color: '#6C63FF', textDecoration: 'none', fontSize: '14px', fontWeight: '600', marginTop: '8px' },
  eyebrow: { color: '#6C63FF', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', marginBottom: '6px' },
  title: { fontFamily: 'Rajdhani, sans-serif', fontSize: '42px', fontWeight: '700', color: '#fff', marginBottom: '6px' },
  sub: { color: '#8B8BA7', fontSize: '15px' },
  legend: { display: 'flex', gap: '20px', alignItems: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%' },

  successBanner: { backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontWeight: '600', textAlign: 'center' },
  championBanner: { background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.15))', border: '1px solid rgba(255,215,0,0.5)', color: '#FFD700', padding: '16px 20px', borderRadius: '12px', marginBottom: '12px', fontWeight: '700', textAlign: 'center', fontSize: '18px', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '1px', boxShadow: '0 0 30px rgba(255,215,0,0.1)' },
  championCard: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#0F0F1E', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '16px', padding: '24px 28px', marginBottom: '24px', boxShadow: '0 0 40px rgba(255,215,0,0.08)' },

  bracketContainer: { display: 'flex', gap: '32px', overflowX: 'auto', paddingBottom: '20px', alignItems: 'flex-start' },

  roundColumn: { display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '240px' },
  roundTitle: {
    fontFamily: 'Rajdhani, sans-serif', fontSize: '16px', fontWeight: '700',
    color: '#6C63FF', textAlign: 'center', padding: '8px 16px',
    backgroundColor: 'rgba(108,99,255,0.1)', borderRadius: '8px',
    border: '1px solid rgba(108,99,255,0.2)', letterSpacing: '0.5px'
  },
  matchesCol: { display: 'flex', flexDirection: 'column', gap: '16px' },

  matchCard: {
    backgroundColor: '#0F0F1E', borderRadius: '12px',
    border: '1px solid', padding: '16px',
    transition: 'all 0.2s ease',
  },
  matchHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  matchNum: { fontSize: '11px', color: '#8B8BA7', fontWeight: '600', letterSpacing: '0.5px' },
  statusBadge: { fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' },

  playerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', marginBottom: '2px', transition: 'all 0.2s' },
  playerName: { fontSize: '14px', fontFamily: 'Rajdhani, sans-serif' },
  score: { fontSize: '18px', fontWeight: '700', color: '#6C63FF', fontFamily: 'Rajdhani, sans-serif' },

  vsDivider: { display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' },
  vsLine: { flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' },
  vsText: { fontSize: '10px', color: '#8B8BA7', fontWeight: '700', letterSpacing: '1px' },

  actions: { display: 'flex', gap: '8px', marginTop: '12px' },
  reportBtn: {
    flex: 1, backgroundColor: '#6C63FF', color: '#fff', border: 'none',
    borderRadius: '6px', padding: '8px', fontSize: '12px',
    fontWeight: '700', cursor: 'pointer'
  },
  disputeBtn: {
    flex: 1, backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444',
    border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px',
    padding: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
  },

  backBtn: { display: 'inline-block', marginTop: '20px', color: '#6C63FF', textDecoration: 'none', fontWeight: '600' },

  // Modal
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    backgroundColor: '#0F0F1E', border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '460px'
  },
  modalTitle: { fontFamily: 'Rajdhani, sans-serif', fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '6px' },
  modalSub: { color: '#8B8BA7', fontSize: '14px', marginBottom: '28px' },
  scoreRow: { display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' },
  scoreField: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  scoreLabel: { color: '#fff', fontSize: '14px', fontWeight: '600', textAlign: 'center', fontFamily: 'Rajdhani, sans-serif' },
  scoreInput: {
    backgroundColor: '#060610', border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: '8px', padding: '12px', color: '#fff',
    fontSize: '24px', fontWeight: '700', textAlign: 'center',
    outline: 'none', width: '100%', fontFamily: 'Rajdhani, sans-serif'
  },
  modalBtns: { display: 'flex', gap: '12px' },
  cancelBtn: {
    flex: 1, backgroundColor: 'transparent', color: '#8B8BA7',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  submitBtn: {
    flex: 2, background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
    color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
  },
}

export default BracketPage