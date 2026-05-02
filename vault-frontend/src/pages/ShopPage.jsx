import { useState, useEffect } from 'react'
import api from '../api/config'

const shopItems = [
  { id: 1, name: 'Steam Gift Card ($10)', cost: 5000, img: '/steam.png', tag: 'Gaming', color: '#1A9FFF' },
  { id: 2, name: 'Xbox Game Pass (1 Month)', cost: 7500, img: '/xbox.png', tag: 'Subscription', color: '#107C10' },
  { id: 3, name: 'Amazon Gift Card ($20)', cost: 10000, img: '/amazon.png', tag: 'Shopping', color: '#FF9900' },
]

function ShopPage() {
  const [vp, setVp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [successCode, setSuccessCode] = useState(null)

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/my-balance')
      setVp(res.data.vaultPoints)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (item) => {
    if (vp < item.cost) {
      alert(`Not enough Vault Points! You need ${item.cost - vp} more VP.`)
      return
    }

    if (!window.confirm(`Buy ${item.name} for ${item.cost} VP?`)) return

    setPurchasing(item.id)
    try {
      const res = await api.post('/wallet/purchase', { itemName: item.name, costVp: item.cost })
      setVp(res.data.newVaultPoints)
      
      // Mock generating a gift card code
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const code = Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const formattedCode = `${code.slice(0,4)}-${code.slice(4,8)}-${code.slice(8,12)}`
      
      setSuccessCode({ item: item.name, code: formattedCode })
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed')
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) return <div style={styles.centered}><p style={{color:'#8B8BA7'}}>Loading Shop...</p></div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>● REWARDS STORE</p>
        <h1 style={styles.title}>V.A.U.L.T. Shop</h1>
        <p style={styles.sub}>Spend your hard-earned Vault Points on premium rewards.</p>
      </div>

      <div style={styles.balanceCard}>
        <div>
          <p style={styles.balanceLabel}>Your Vault Points</p>
          <p style={styles.balanceAmount}>
            <img src="/vault-points.png" alt="VP" style={{width:'32px', height:'32px', verticalAlign:'middle', marginRight:'8px'}} />
            {vp.toLocaleString()} VP
          </p>
        </div>
        <a href="/profile" style={styles.convertBtn}>+ Get More VP</a>
      </div>

      {successCode && (
        <div style={styles.successBox}>
          <h3 style={{color:'#22C55E', margin:'0 0 10px'}}>🎉 Purchase Successful!</h3>
          <p style={{color:'#fff', margin:'0 0 16px'}}>Here is your code for <strong>{successCode.item}</strong>:</p>
          <div style={styles.codeBox}>{successCode.code}</div>
          <button onClick={() => setSuccessCode(null)} style={styles.closeBtn}>Close</button>
        </div>
      )}

      <div style={styles.grid}>
        {shopItems.map(item => (
          <div key={item.id} style={styles.card}>
            <div style={{...styles.imgWrap, backgroundColor: item.color + '22'}}>
              <span style={{...styles.tag, color: item.color, border: `1px solid ${item.color}44`}}>{item.tag}</span>
              <img src={item.img} alt={item.name} style={styles.img} />
            </div>
            <div style={styles.body}>
              <h3 style={styles.cardTitle}>{item.name}</h3>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'16px'}}>
                <span style={styles.cost}>
                  <img src="/vault-points.png" alt="VP" style={{width:'20px', height:'20px', verticalAlign:'middle', marginRight:'4px'}} />
                  {item.cost.toLocaleString()} VP
                </span>
                <button 
                  onClick={() => handlePurchase(item)} 
                  disabled={purchasing === item.id || vp < item.cost}
                  style={{...styles.buyBtn, opacity: vp < item.cost ? 0.5 : 1}}
                >
                  {purchasing === item.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#060610', padding: '100px 60px 60px' },
  header: { marginBottom: '40px' },
  eyebrow: { color: '#FFD700', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', marginBottom: '8px' },
  title: { fontFamily: 'Rajdhani, sans-serif', fontSize: '48px', fontWeight: '700', color: '#fff', letterSpacing: '1px', marginBottom: '8px' },
  sub: { color: '#8b8ba7', fontSize: '16px' },
  centered: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#060610' },
  
  balanceCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F0F1E', padding: '24px 32px', borderRadius: '16px', border: '1px solid rgba(255,215,0,0.3)', marginBottom: '40px', background: 'linear-gradient(135deg, rgba(255,215,0,0.05), transparent)' },
  balanceLabel: { color: '#FFD700', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' },
  balanceAmount: { fontFamily: 'Rajdhani, sans-serif', fontSize: '36px', fontWeight: '700', color: '#FFD700', margin: 0 },
  convertBtn: { backgroundColor: 'transparent', border: '1px solid #FFD700', color: '#FFD700', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', transition: 'all 0.2s' },

  successBox: { backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', padding: '24px', borderRadius: '12px', marginBottom: '40px', textAlign: 'center' },
  codeBox: { backgroundColor: '#000', color: '#FFD700', fontFamily: 'monospace', fontSize: '24px', padding: '16px', borderRadius: '8px', letterSpacing: '4px', marginBottom: '16px', border: '1px dashed #FFD700' },
  closeBtn: { background: 'transparent', color: '#8B8BA7', border: 'none', textDecoration: 'underline', cursor: 'pointer' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' },
  card: { backgroundColor: '#0F0F1E', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.15)', overflow: 'hidden' },
  imgWrap: { position: 'relative', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  img: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  tag: { position: 'absolute', top: '16px', left: '16px', fontSize: '10px', fontWeight: '700', padding: '4px 12px', borderRadius: '6px', letterSpacing: '0.5px', backgroundColor: 'rgba(0,0,0,0.5)' },
  body: { padding: '24px' },
  cardTitle: { fontFamily: 'Rajdhani, sans-serif', fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 },
  cost: { color: '#FFD700', fontWeight: '700', fontSize: '18px' },
  buyBtn: { background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }
}

export default ShopPage
