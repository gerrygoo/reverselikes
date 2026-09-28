export interface PhotoData {
  url: string;
  width: number;
  height: number;
}

export interface Photo {
  alt_sizes?: PhotoData[];
  caption: string;
  original_size: PhotoData;
}

export interface Blog {
  description: string;
  name: string;
  title: string;
  updated: string;
  url: string;
  uuid: string;
}

export interface Post {
  id_string: string;
  blog: Blog;
  blog_name: string;
  type: "answer" | "photo" | "text" | "quote" | "link" | "video" | string;
  post_url: string;
  liked_timestamp: number;
  tags: string[];
  summary?: string;
  body?: string;
  photos?: Photo[];
  text?: string;
  source?: string;
  question?: string;
  answer?: string;
  asking_name?: string;
  url?: string;
  title?: string;
  description?: string;
}

export interface Likes {
  liked_posts: Post[];
  liked_count: number;
  _links?: {
    prev?: { query_params: { after: string | number } };
    next?: { query_params: { before: string | number } };
  };
}

interface Envelope {
  meta: { status: number; msg: string };
  response: Likes;
}

const API_KEY = import.meta.env.VITE_TUMBLR_API_KEY as string | undefined;

/**
 * Fetches the page of likes that come right after `after` (a Unix timestamp).
 * Tumblr returns each page newest-first; `_links.prev` points at the next,
 * newer page.
 */
export async function fetchLikes(blog: string, after: number, signal?: AbortSignal): Promise<Likes> {
  if (!API_KEY) {
    throw new Error("VITE_TUMBLR_API_KEY is not set. Copy .env.example to .env and fill it in.");
  }
  const params = new URLSearchParams({ api_key: API_KEY, after: String(after) });
  const res = await fetch(
    `https://api.tumblr.com/v2/blog/${encodeURIComponent(blog)}/likes?${params}`,
    { signal },
  );
  const body = (await res.json().catch(() => null)) as Envelope | null;
  if (!res.ok || !body) {
    throw new Error(`Tumblr API error ${res.status}: ${body?.meta?.msg ?? res.statusText}`);
  }
  return body.response;
}
