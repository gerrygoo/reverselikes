import { useCallback, useRef, useState } from "react";
import { fetchLikes, Post } from "./api";

// A timestamp from before Tumblr existed, so the first page is the oldest likes.
const TUMBLR_BIG_BANG = 788918400;

interface LikesState {
  posts: Post[];
  total: number | undefined;
  loading: boolean;
  done: boolean;
  error: string | undefined;
}

/** Pages through a blog's likes from oldest to newest. */
export function useLikes(blog: string) {
  const [state, setState] = useState<LikesState>({
    posts: [],
    total: undefined,
    loading: false,
    done: false,
    error: undefined,
  });
  // Refs so overlapping calls (scroll events, StrictMode) never double-fetch.
  const cursor = useRef(TUMBLR_BIG_BANG);
  const inFlight = useRef(false);
  const seen = useRef(new Set<string>());

  const loadMore = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const page = await fetchLikes(blog, cursor.current);
      const fresh = page.liked_posts.filter((p) => !seen.current.has(p.id_string));
      fresh.forEach((p) => seen.current.add(p.id_string));
      // Each page arrives newest-first; flip it so the whole list is oldest-first.
      fresh.sort((a, b) => a.liked_timestamp - b.liked_timestamp);
      const newest = Math.max(cursor.current, ...page.liked_posts.map((p) => p.liked_timestamp));
      const done = page.liked_posts.length === 0 || newest === cursor.current;
      cursor.current = newest;
      setState((s) => ({
        posts: fresh.length ? [...s.posts, ...fresh] : s.posts,
        total: page.liked_count,
        loading: false,
        done,
        error: undefined,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
    } finally {
      inFlight.current = false;
    }
  }, [blog]);

  return { ...state, loadMore };
}
