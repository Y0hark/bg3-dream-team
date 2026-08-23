import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import BanniereStockage from './components/BanniereStockage.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import RetourEnHaut from './components/RetourEnHaut.jsx'
import { FournisseurProgression } from './hooks/useProgression.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Builds from './pages/Builds.jsx'
import BuildPage from './pages/BuildPage.jsx'
import Loadout from './pages/Loadout.jsx'
import Items from './pages/Items.jsx'
import Lieux from './pages/Lieux.jsx'
import Checklist from './pages/Checklist.jsx'
import NonTrouvee from './pages/NonTrouvee.jsx'

/**
 * React Router conserve la position de scroll d'une page à l'autre.
 * On remonte en haut au changement de route, sauf si l'URL vise une ancre.
 */
function RestaurerLeScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default function App() {
  // La clé de route force le remontage : chaque page rejoue son fondu d'entrée.
  const { pathname } = useLocation()

  return (
    <FournisseurProgression>
      <div className="flex min-h-screen flex-col">
        <RestaurerLeScroll />
        <BanniereStockage />
        <Navbar />
        <main key={pathname} className="entree-page flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/builds" element={<Builds />} />
            <Route path="/builds/:id" element={<BuildPage />} />
            <Route path="/loadout" element={<Loadout />} />
            <Route path="/items" element={<Items />} />
            <Route path="/lieux" element={<Lieux />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="*" element={<NonTrouvee />} />
          </Routes>
        </main>
        <Footer />
        <RetourEnHaut />
      </div>
    </FournisseurProgression>
  )
}
