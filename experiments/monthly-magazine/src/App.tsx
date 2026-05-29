import { Navigate, Route, Routes } from 'react-router-dom'
import { CatalogPage } from './pages/CatalogPage'
import { IssuePage } from './pages/IssuePage'

export function App() {
  return (
    <div className="mm-demo">
      <header className="mm-demo__banner">
        <span className="mm-demo__pill">Isolated demo</span>
        <span>Not linked to reviews, features, or main IOS routes</span>
      </header>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/issue/:slug" element={<IssuePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
