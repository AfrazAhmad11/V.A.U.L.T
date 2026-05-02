import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Card, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress } from '@mui/material'
import api from '../api/config'

function WalletPage() {
  const [balance, setBalance] = useState({ pkr: 0, vp: 0 })
  const [transactions, setTransactions] = useState([])
  const [depositAmt, setDepositAmt] = useState('')
  const [convertAmt, setConvertAmt] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet/my-balance')
      setBalance({ pkr: res.data.balance, vp: res.data.vaultPoints })
      const txRes = await api.get('/wallet/transactions')
      setTransactions(txRes.data)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const sessionId = query.get('session_id')

    if (sessionId) {
      setVerifying(true)
      const mockAmount = query.get('mock_amount')
      api.post('/wallet/verify-session', { 
        sessionId, 
        mockAmount: mockAmount ? parseFloat(mockAmount) : null 
      })
        .then(() => {
          // Clean URL
          navigate('/wallet', { replace: true })
          fetchWallet()
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Verification failed')
          navigate('/wallet', { replace: true })
        })
        .finally(() => setVerifying(false))
    } else {
      fetchWallet()
    }
  }, [location.search, navigate])

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmt)
    if (!amt || amt <= 0) return
    try {
      const res = await api.post('/wallet/create-checkout-session', { amount: amt })
      window.location.href = res.data.url
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize deposit')
    }
  }

  const handleConvert = async () => {
    const amt = parseFloat(convertAmt)
    if (!amt || amt < 5) {
      setError('Minimum conversion is 5 PKR')
      return
    }
    try {
      await api.post('/wallet/convert', { amountPkr: amt })
      setConvertAmt('')
      setError('')
      fetchWallet()
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed')
    }
  }

  if (loading || verifying) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#060610', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#6C63FF' }} />
        <Typography color="#8B8BA7">{verifying ? 'Verifying payment securely...' : 'Loading wallet...'}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#060610', pt: 12, pb: 8, px: { xs: 2, md: 8 } }} className="container">
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Typography sx={{ color: '#FFD700', fontSize: 12, fontWeight: 700, letterSpacing: 2, mb: 1 }}>● DUAL ECONOMY</Typography>
        <Typography variant="h3" sx={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontWeight: { xs: '32px', md: '48px' }, mb: 4 }}>
          V.A.U.L.T. Wallet
        </Typography>

        {error && (
          <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', p: 2, borderRadius: 2, mb: 4 }}>
            {error}
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 6 }}>
          {/* PKR Card */}
          <Card sx={{ bgcolor: '#0F0F1E', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 4, p: { xs: 3, md: 4 }, boxShadow: '0 0 40px rgba(34, 197, 94, 0.05)' }}>
            <Typography sx={{ color: '#8B8BA7', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Fiat Balance</Typography>
            <Typography sx={{ color: '#22C55E', fontSize: { xs: 36, md: 48 }, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', mb: 4 }}>
              PKR {balance.pkr.toLocaleString()}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField 
                variant="outlined" 
                placeholder="Amount to deposit" 
                type="number"
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                sx={{ flex: 1, input: { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(34, 197, 94, 0.3)' }, '&:hover fieldset': { borderColor: '#22C55E' }, '&.Mui-focused fieldset': { borderColor: '#22C55E' } } }}
              />
              <Button onClick={handleDeposit} sx={{ bgcolor: '#22C55E', color: '#fff', '&:hover': { bgcolor: '#16A34A' }, px: 4, fontWeight: 700, py: { xs: 1.5, sm: 0 } }}>
                Deposit
              </Button>
            </Box>
          </Card>

          {/* VP Card */}
          <Card sx={{ bgcolor: '#0F0F1E', border: '1px solid rgba(108, 99, 255, 0.2)', borderRadius: 4, p: { xs: 3, md: 4 }, boxShadow: '0 0 40px rgba(108, 99, 255, 0.05)' }}>
            <Typography sx={{ color: '#8B8BA7', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Premium Currency</Typography>
            <Typography sx={{ color: '#6C63FF', fontSize: { xs: 36, md: 48 }, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src="/vault-points.png" alt="VP" style={{width:'40px', height:'40px', display:'inline-block'}} /> {balance.vp.toLocaleString()} VP
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField 
                variant="outlined" 
                placeholder="PKR to convert" 
                type="number"
                value={convertAmt}
                onChange={e => setConvertAmt(e.target.value)}
                sx={{ flex: 1, input: { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(108, 99, 255, 0.3)' }, '&:hover fieldset': { borderColor: '#6C63FF' }, '&.Mui-focused fieldset': { borderColor: '#6C63FF' } } }}
              />
              <Button onClick={handleConvert} sx={{ bgcolor: '#6C63FF', color: '#fff', '&:hover': { bgcolor: '#5B54E5' }, px: 4, fontWeight: 700, py: { xs: 1.5, sm: 0 } }}>
                Convert
              </Button>
            </Box>
          </Card>
        </Box>

        {/* Transactions */}
        <Typography variant="h5" sx={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, mb: 3 }}>
          Recent Transactions
        </Typography>
        <TableContainer component={Paper} sx={{ bgcolor: '#0F0F1E', border: '1px solid rgba(108,99,255,0.1)', overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 600, md: 'auto' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#8B8BA7', borderBottom: '1px solid rgba(108,99,255,0.1)' }}>Date</TableCell>
                <TableCell sx={{ color: '#8B8BA7', borderBottom: '1px solid rgba(108,99,255,0.1)' }}>Type</TableCell>
                <TableCell sx={{ color: '#8B8BA7', borderBottom: '1px solid rgba(108,99,255,0.1)' }}>Description</TableCell>
                <TableCell sx={{ color: '#8B8BA7', borderBottom: '1px solid rgba(108,99,255,0.1)', textAlign: 'right' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map(t => (
                <TableRow key={t.transactionId}>
                  <TableCell sx={{ color: '#fff', borderBottom: '1px solid rgba(108,99,255,0.05)' }}>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(108,99,255,0.05)' }}>
                    <Chip size="small" label={t.type} sx={{ bgcolor: t.type === 'Deposit' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(108, 99, 255, 0.15)', color: t.type === 'Deposit' ? '#22C55E' : '#6C63FF' }} />
                  </TableCell>
                  <TableCell sx={{ color: '#ccc', borderBottom: '1px solid rgba(108,99,255,0.05)' }}>{t.description}</TableCell>
                  <TableCell sx={{ color: '#fff', borderBottom: '1px solid rgba(108,99,255,0.05)', textAlign: 'right', fontWeight: 'bold' }}>{t.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: '#8B8BA7', textAlign: 'center', py: 4, borderBottom: 'none' }}>No transactions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>

  )
}

export default WalletPage
