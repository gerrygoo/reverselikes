import { normalizeBlog } from "./permalink";

interface NavBarProps {
  blog: string;
  loaded: number;
  total: number | undefined;
  onBackToTop: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

export function NavBar({ blog, loaded, total, onBackToTop, onCopyLink, copied }: NavBarProps) {
  return (
    <header className="navbar">
      <span className="navbar-title">Reverse tumblr likes of</span>
      <form
        className="navbar-blog"
        onSubmit={(e) => {
          e.preventDefault();
          const input = new FormData(e.currentTarget).get("blog") as string;
          const next = normalizeBlog(input);
          if (next) window.location.hash = new URLSearchParams({ blog: next }).toString();
        }}
      >
        {/* Keyed so a blog change from a pasted link replaces what was typed. */}
        <input
          key={blog}
          name="blog"
          defaultValue={blog}
          aria-label="Blog name or URL"
          spellCheck={false}
          autoCapitalize="off"
          onFocus={(e) => e.currentTarget.select()}
        />
      </form>
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
