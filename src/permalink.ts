const PARAM = "t";

/** The timestamp a URL hash like `#t=1500000000` points at, if any. */
export function parseHash(hash: string): number | undefined {
  const value = new URLSearchParams(hash.replace(/^#/, "")).get(PARAM);
  const ts = value === null ? NaN : Number(value);
  return Number.isInteger(ts) && ts > 0 ? ts : undefined;
}

/** The current page's URL, pointing at `timestamp` on the timeline. */
export function linkTo(timestamp: number): string {
  const url = new URL(window.location.href);
  url.hash = `${PARAM}=${timestamp}`;
  return url.toString();
}

/** Points the address bar at `timestamp` without adding a history entry. */
export function replaceHash(timestamp: number) {
  history.replaceState(null, "", linkTo(timestamp));
}
