interface NavBarProps {
  loaded: number;
  total: number | undefined;
  onBackToTop: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

export function NavBar({ loaded, total, onBackToTop, onCopyLink, copied }: NavBarProps) {
  return (
    <header className="navbar">
      <span className="navbar-title">Reverse tumblr likes browser</span>
      <span className="navbar-count">
        {total === undefined ? `${loaded} loaded` : `${loaded} of ${total} loaded`}
      </span>
      <button onClick={onCopyLink} disabled={copied} title="Copy a link to where you are on the timeline">
        {copied ? "Copied!" : "Copy link"}
      </button>
      <button onClick={onBackToTop}>Back to top</button>
    </header>
  );
}
