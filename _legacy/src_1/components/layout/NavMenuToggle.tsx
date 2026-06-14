interface NavMenuToggleProps {
  open: boolean
  onClick: () => void
}

export function NavMenuToggle({ open, onClick }: NavMenuToggleProps) {
  return (
    <button
      type="button"
      className="ios-nav-toggle"
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? 'Close navigation' : 'Open navigation'}
    >
      <span className="ios-nav-toggle-bars" aria-hidden>
        <span className={open ? 'ios-nav-toggle-bar open' : 'ios-nav-toggle-bar'} />
        <span className={open ? 'ios-nav-toggle-bar open' : 'ios-nav-toggle-bar'} />
        <span className={open ? 'ios-nav-toggle-bar open' : 'ios-nav-toggle-bar'} />
      </span>
      <span className="ios-nav-toggle-label">{open ? 'Close' : 'Menu'}</span>
    </button>
  )
}
