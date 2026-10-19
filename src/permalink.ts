export const DEFAULT_BLOG = "gerardogaol";

/** Where a URL hash like `#blog=staff&t=1500000000` points: a blog, and a like on its timeline. */
export interface Target {
  blog: string;
  timestamp: number | undefined;
}

export function parseHash(hash: string): Target {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const ts = Number(params.get("t") ?? NaN);
  return {
    blog: normalizeBlog(params.get("blog") ?? "") ?? DEFAULT_BLOG,
    timestamp: Number.isInteger(ts) && ts > 0 ? ts : undefined,
  };
}

/**
 * Turns whatever someone pastes (`staff`, `staff.tumblr.com`, a blog URL, a
 * `tumblr.com/staff` URL, a custom domain) into a blog identifier for the API.
 */
export function normalizeBlog(input: string): string | undefined {
  const text = input.trim();
  if (!text) return undefined;
  let url: URL;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return undefined;
  }
  const host = url.hostname.toLowerCase();
  if (host === "tumblr.com" || host === "www.tumblr.com") {
    // tumblr.com/<blog>, or the dashboard-style tumblr.com/blog/<blog>.
    const [first, second] = url.pathname.split("/").filter(Boolean);
    return (first === "blog" ? second : first) || undefined;
  }
  if (host.endsWith(".tumblr.com")) return host.slice(0, -".tumblr.com".length);
  return /^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(host) ? host : undefined;
}

/** The current page's URL, pointing at a blog and optionally a point on its timeline. */
export function linkTo(blog: string, timestamp?: number): string {
  const url = new URL(window.location.href);
  const params = new URLSearchParams({ blog });
  if (timestamp !== undefined) params.set("t", String(timestamp));
  url.hash = params.toString();
  return url.toString();
}

/** Points the address bar at `blog` and `timestamp` without adding a history entry. */
export function replaceHash(blog: string, timestamp: number) {
  history.replaceState(null, "", linkTo(blog, timestamp));
}
