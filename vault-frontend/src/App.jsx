import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ShopPage from './pages/ShopPage'
import TournamentsPage from './pages/TournamentsPage'
import BracketPage from './pages/BracketPage'
import CreateTournamentPage from './pages/CreateTournamentPage'
import DisputesPage from './pages/DisputesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import WalletPage from './pages/WalletPage'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/create" element={<CreateTournamentPage />} />
        <Route path="/tournaments/:id/bracket" element={<BracketPage />} />
        <Route path="/disputes" element={<DisputesPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Routes>
    </Router>
  )
}

export default App