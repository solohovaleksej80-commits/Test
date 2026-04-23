import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useWalletStore } from './store/useWalletStore'
import { Welcome } from './pages/Welcome'
import { Create } from './pages/Create'
import { Import } from './pages/Import'
import { Unlock } from './pages/Unlock'
import { Home } from './pages/Home'
import { Send } from './pages/Send'
import { Receive } from './pages/Receive'
import { Swap } from './pages/Swap'
import { Nft } from './pages/Nft'
import { History } from './pages/History'
import { Discover } from './pages/Discover'
import { Settings } from './pages/Settings'
import { AssetDetail } from './pages/AssetDetail'

const PUBLIC_ROUTES = new Set(['/', '/create', '/import', '/unlock'])

function Guard({ children }: { children: React.ReactNode }) {
  const vault = useWalletStore((s) => s.vault)
  const unlocked = useWalletStore((s) => !!s.mnemonic)
  const location = useLocation()
  const nav = useNavigate()

  useEffect(() => {
    const path = location.pathname
    if (!vault && !PUBLIC_ROUTES.has(path)) {
      nav('/', { replace: true })
      return
    }
    if (vault && !unlocked && !PUBLIC_ROUTES.has(path)) {
      nav('/unlock', { replace: true })
      return
    }
    if (vault && unlocked && (path === '/' || path === '/unlock')) {
      nav('/home', { replace: true })
    }
    if (!vault && path === '/unlock') {
      nav('/', { replace: true })
    }
  }, [vault, unlocked, location.pathname, nav])

  return <>{children}</>
}

function App() {
  const hydrate = useWalletStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <Guard>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/create" element={<Create />} />
        <Route path="/import" element={<Import />} />
        <Route path="/unlock" element={<Unlock />} />

        <Route path="/home" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/nft" element={<Nft />} />
        <Route path="/history" element={<History />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/asset/:chain/:id" element={<AssetDetail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Guard>
  )
}

export default App
