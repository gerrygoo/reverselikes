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

export type PageQuery = { after: number } | { before: number } | Record<string, never>;

/**
 * Fetches one page of likes: the 20 right after or right before a Unix
 * timestamp, or the 20 newest with an empty query. Tumblr returns every page
 * newest-first.
 */
export async function fetchLikes(blog: string, query: PageQuery): Promise<Likes> {
  if (!API_KEY) {
    throw new Error("VITE_TUMBLR_API_KEY is not set. Copy .env.example to .env and fill it in.");
  }
  const params = new URLSearchParams({ api_key: API_KEY });
  for (const [key, value] of Object.entries(query)) params.set(key, String(value));
  const res = await fetch(`https://api.tumblr.com/v2/blog/${encodeURIComponent(blog)}/likes?${params}`);
  const body = (await res.json().catch(() => null)) as Envelope | null;
  if (!res.ok || !body) {
    throw new Error(`Tumblr API error ${res.status}: ${body?.meta?.msg ?? res.statusText}`);
  }
  return body.response;
}
