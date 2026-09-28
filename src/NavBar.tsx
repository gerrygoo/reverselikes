interface NavBarProps {
  loaded: number;
  total: number | undefined;
  onBackToTop: () => void;
}

export function NavBar({ loaded, total, onBackToTop }: NavBarProps) {
  return (
    <header className="navbar">
      <span className="navbar-title">Reverse tumblr likes browser</span>
      <span className="navbar-count">
        {total === undefined ? `${loaded} loaded` : `${loaded} of ${total} loaded`}
      </span>
      <button onClick={onBackToTop}>Back to top</button>
    </header>
  );
}
