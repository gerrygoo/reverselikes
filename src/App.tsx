import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLikes } from "./useLikes";
import { NavBar } from "./NavBar";
import { PostCard } from "./PostCard";

const BLOG = "gerardogaol";

export function App() {
  const { posts, total, loading, done, error, loadMore } = useLikes(BLOG);
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    setScrollMargin(listRef.current?.offsetTop ?? 0);
  }, []);

  // One extra row at the end shows loading / error / end-of-list status.
  const virtualizer = useWindowVirtualizer({
    count: posts.length + 1,
    estimateSize: () => 600,
    overscan: 4,
    scrollMargin,
    getItemKey: (i) => posts[i]?.id_string ?? "status",
  });
  const items = virtualizer.getVirtualItems();
  const lastIndex = items.at(-1)?.index ?? 0;

  // Fetch the next page once the status row scrolls into view.
  useEffect(() => {
    if (lastIndex >= posts.length && !loading && !done && !error) {
      void loadMore();
    }
  }, [lastIndex, posts.length, loading, done, error, loadMore]);

  return (
    <>
      <NavBar
        loaded={posts.length}
        total={total}
        onBackToTop={() => window.scrollTo({ top: 0 })}
      />
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
              <PostCard post={posts[row.index]} index={row.index} />
            ) : (
              <div className="status">
                {error ? (
                  <>
                    <p>Couldn't load likes: {error}</p>
                    <button onClick={() => void loadMore()}>Retry</button>
                  </>
                ) : done ? (
                  "That's all the likes."
                ) : (
                  "Loading…"
                )}
              </div>
            )}
          </div>
        ))}
      </main>
    </>
  );
}
