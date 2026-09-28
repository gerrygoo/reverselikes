import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLikes, Post } from "./api";

// A timestamp from before Tumblr existed, so paging after it starts at the oldest like.
const TUMBLR_BIG_BANG = 788918400;

export type Direction = "forward" | "backward";

export interface EdgeState {
  loading: boolean;
  done: boolean;
  error: string | undefined;
}

/** Timestamps of the oldest and newest like, for the timeline. */
export interface LikeRange {
  first: number;
  last: number;
}

const stampsOf = (page: Post[]) => page.map((p) => p.liked_timestamp);

const idle = (done: boolean): EdgeState => ({ loading: false, done, error: undefined });

/**
 * Holds a contiguous, oldest-first window of a blog's likes that can grow at
 * either end, and can be re-centered on any point in time with `jumpTo`.
 */
export function useLikes(blog: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState<number>();
  const [first, setFirst] = useState<number>();
  const [last, setLast] = useState<number>();
  const [edges, setEdges] = useState({ forward: idle(false), backward: idle(true) });

  // Bumped on every jump; responses from an older generation are dropped.
  const generation = useRef(0);
  const inFlight = useRef({ forward: false, backward: false });
  const seen = useRef(new Set<string>());
  // Oldest and newest timestamps loaded so far: the cursors for the next pages.
  const cursors = useRef({ oldest: TUMBLR_BIG_BANG, newest: TUMBLR_BIG_BANG });

  const setEdge = (dir: Direction, edge: Partial<EdgeState>) =>
    setEdges((e) => ({ ...e, [dir]: { ...e[dir], ...edge } }));

  /** Drops already-seen posts and orders a page oldest-first. */
  const accept = (page: Post[]) => {
    const fresh = page.filter((p) => !seen.current.has(p.id_string));
    fresh.forEach((p) => seen.current.add(p.id_string));
    // Pages arrive newest-first; flip them so the list is oldest-first.
    return fresh.sort((a, b) => a.liked_timestamp - b.liked_timestamp);
  };
  const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

  /** Loads one more page at either end of the window. */
  const load = useCallback(
    async (dir: Direction) => {
      if (inFlight.current[dir]) return;
      inFlight.current[dir] = true;
      const gen = generation.current;
      setEdge(dir, { loading: true, error: undefined });
      try {
        const cur = cursors.current;
        const page = await fetchLikes(
          blog,
          dir === "forward" ? { after: cur.newest } : { before: cur.oldest },
        );
        if (gen !== generation.current) return;

        const stamps = stampsOf(page.liked_posts);
        const fresh = accept(page.liked_posts);
        let done = stamps.length === 0;
        if (dir === "forward") {
          if (cur.newest === TUMBLR_BIG_BANG && stamps.length) setFirst(Math.min(...stamps));
          const newest = Math.max(cur.newest, ...stamps);
          done ||= newest === cur.newest;
          cur.newest = newest;
          if (fresh.length) setPosts((ps) => [...ps, ...fresh]);
        } else {
          const oldest = Math.min(cur.oldest, ...stamps);
          done ||= oldest === cur.oldest;
          cur.oldest = oldest;
          if (fresh.length) setPosts((ps) => [...fresh, ...ps]);
        }
        setTotal(page.liked_count);
        setEdge(dir, { loading: false, done });
      } catch (e) {
        if (gen !== generation.current) return;
        setEdge(dir, { loading: false, error: errorText(e) });
      } finally {
        if (gen === generation.current) inFlight.current[dir] = false;
      }
    },
    [blog],
  );

  /**
   * Empties the window and restarts it at `timestamp`: the next forward page
   * starts with the first like at or after it, and backward pages go earlier.
   */
  const jumpTo = useCallback(
    (timestamp: number) => {
      generation.current++;
      inFlight.current = { forward: false, backward: false };
      seen.current = new Set();
      const atStart = first === undefined || timestamp <= first;
      // `after` is exclusive, so start one second early to include `timestamp` itself.
      cursors.current = atStart
        ? { oldest: TUMBLR_BIG_BANG, newest: TUMBLR_BIG_BANG }
        : { oldest: timestamp, newest: timestamp - 1 };
      setPosts([]);
      setEdges({ forward: idle(false), backward: idle(atStart) });
    },
    [first],
  );

  // The newest like marks the end of the timeline.
  useEffect(() => {
    fetchLikes(blog, {})
      .then((page) => {
        const stamps = stampsOf(page.liked_posts);
        if (stamps.length) setLast(Math.max(...stamps));
      })
      .catch(() => {
        // Without it the timeline just stays hidden; the list still works.
      });
  }, [blog]);

  const range: LikeRange | undefined =
    first !== undefined && last !== undefined && last > first ? { first, last } : undefined;

  return { posts, total, range, edges, load, jumpTo };
}
