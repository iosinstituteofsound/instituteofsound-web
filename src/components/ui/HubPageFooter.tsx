import { Link } from 'react-router-dom'

interface HubPageFooterProps {
  backTo?: { label: string; href: string }
}

export function HubPageFooter({
  backTo = { label: 'Network', href: '/community' },
}: HubPageFooterProps) {
  return (
    <footer className="hub-page-footer">
      <Link to={backTo.href} className="hub-page-footer-back">
        ← {backTo.label}
      </Link>
      <span className="hub-page-footer-dot" aria-hidden>
        ·
      </span>
      <Link to="/scenes" className="hub-page-footer-link">
        Scenes
      </Link>
      <Link to="/events" className="hub-page-footer-link">
        Events
      </Link>
      <Link to="/collab" className="hub-page-footer-link">
        Collab
      </Link>
    </footer>
  )
}
