import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { EdgeState, useLikes } from "./useLikes";
import { NavBar } from "./NavBar";
import { PostCard } from "./PostCard";
import { Timeline } from "./Timeline";
import { linkTo, parseHash, replaceHash, Target } from "./permalink";

// Height of the fixed nav bar plus the gap below it; keep in sync with styles.css.
const TOP_INSET = 48;

function EdgeStatus({ edge, endText, onRetry }: { edge: EdgeState; endText: string; onRetry: () => void }) {
  if (edge.error) {
    return (
      <>
        <span>Couldn't load likes: {edge.error}</span> <button onClick={onRetry}>Retry</button>
      </>
    );
  }
  return <>{edge.done ? endText : "Loading…"}</>;
}

/** The blog in the address bar. Switching blogs remounts the browser, so none of the old blog's state leaks. */
export function App() {
  const [target, setTarget] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onHashChange = () => setTarget(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return <Browser key={target.blog} target={target} />;
}

function Browser({ target }: { target: Target }) {
  const { blog } = target;
  // Only the first timestamp is the start of the list; later ones are jumps.
  const [initial] = useState(target.timestamp);
  const { posts, total, range, edges, load, jumpTo } = useLikes(blog, initial);
  const { forward, backward } = edges;
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  // Offsetting by the nav bar makes the virtualizer's viewport start at the
  // bar's bottom edge, so "the row at the top" is the first one visible under it.
  useLayoutEffect(() => {
    setScrollMargin((listRef.current?.offsetTop ?? 0) - TOP_INSET);
  }, []);

  // One row per post, plus a last row for the status of the forward end.
  // Status rows never sit at the top of a list that's about to grow, since the
  // row at the top is the one kept in place: the backward end's status floats
  // over the list, and an empty list has no rows at all.
  const virtualizer = useWindowVirtualizer({
    count: posts.length > 0 ? posts.length + 1 : 0,
    estimateSize: () => 600,
    overscan: 4,
    scrollMargin,
    // When the list changes at either end, keep the row at the top of the
    // screen in place, so posts added above don't push the view around.
    anchorTo: "end",
    getItemKey: (i) => posts[i]?.id_string ?? "bottom",
  });
  // Rows above the top edge that change size (measured for the first time, or
  // a dead image hidden) shift everything below. Always scroll to compensate,
  // including while scrolling up, which the default skips.
  virtualizer.shouldAdjustScrollPositionOnItemSizeChange = (item, _delta, instance) =>
    item.start < (instance.scrollOffset ?? 0);
  const items = virtualizer.getVirtualItems();
  const firstIndex = items[0]?.index ?? 0;
  const lastIndex = items.at(-1)?.index ?? 0;

  // The post at the top of the screen, for the timeline marker.
  const viewTop = virtualizer.scrollOffset ?? 0;
  const topRow = items.find((r) => r.index < posts.length && r.end > viewTop);
  const topPost = topRow ? posts[topRow.index] : undefined;

  // Load the next page at whichever end is on screen. Earlier pages wait for
  // at least one post: after a jump, the jump target must arrive first so it
  // is the post that stays put while earlier ones are added above it.
  useEffect(() => {
    if (lastIndex >= posts.length && !forward.loading && !forward.done && !forward.error) {
      void load("forward");
    }
  }, [lastIndex, posts.length, forward, load]);
  useEffect(() => {
    if (firstIndex === 0 && posts.length > 0 && !backward.loading && !backward.done && !backward.error) {
      void load("backward");
    }
  }, [firstIndex, posts.length, backward, load]);

  const onJump = (timestamp: number) => {
    jumpTo(timestamp);
    window.scrollTo({ top: 0 });
  };

  // Keep the address bar pointing at the post on screen, so it can be copied
  // from there too. Debounced: it changes constantly while scrolling.
  const topStamp = topPost?.liked_timestamp;
  useEffect(() => {
    if (topStamp === undefined) return;
    const id = setTimeout(() => replaceHash(blog, topStamp), 300);
    return () => clearTimeout(id);
  }, [topStamp]);

  // Pasting a link or editing the hash by hand while the page is open. The
  // replaceHash above doesn't fire hashchange, so this only sees outside changes.
  const handled = useRef(target);
  useEffect(() => {
    if (handled.current === target) return;
    handled.current = target;
    if (target.timestamp !== undefined) onJump(target.timestamp);
  });

  const [copied, setCopied] = useState(false);
  const onCopyLink = () => {
    const link = topStamp === undefined ? window.location.href : linkTo(blog, topStamp);
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => window.prompt("Copy this link:", link));
  };

  return (
    <>
      <NavBar
        blog={blog}
        loaded={posts.length}
        total={total}
        onBackToTop={() => (backward.done ? window.scrollTo({ top: 0 }) : onJump(0))}
        onCopyLink={onCopyLink}
        copied={copied}
      />
      {(backward.loading || backward.error) && (
        <div className="edge-pill">
          <EdgeStatus edge={backward} endText="" onRetry={() => void load("backward")} />
        </div>
      )}
      <main ref={listRef} className="list" style={{ height: virtualizer.getTotalSize() }}>
        {items.map((row) => (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className="row"
            style={{ transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)` }}
          >
            {row.index < posts.length ? (
              <PostCard post={posts[row.index]} />
            ) : (
              <div className="status">
                <EdgeStatus edge={forward} endText="That's all the likes." onRetry={() => void load("forward")} />
              </div>
            )}
          </div>
        ))}
      </main>
      {posts.length === 0 && (
        <div className="status">
          <EdgeStatus edge={forward} endText="No likes here." onRetry={() => void load("forward")} />
        </div>
      )}
      {range && <Timeline range={range} current={topPost?.liked_timestamp} onJump={onJump} />}
    </>
  );
}
