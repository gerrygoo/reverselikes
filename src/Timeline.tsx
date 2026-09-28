import { KeyboardEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { LikeRange } from "./useLikes";

const DAY = 24 * 60 * 60;
// Leave at least this many pixels between year labels.
const MIN_LABEL_GAP = 18;

const formatMonth = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString(undefined, { year: "numeric", month: "short" });

interface TimelineProps {
  range: LikeRange;
  /** Timestamp of the post at the top of the screen. */
  current: number | undefined;
  onJump: (timestamp: number) => void;
}

/** A vertical rail spanning every like, oldest at the top; click or drag to jump. */
export function Timeline({ range, current, onJump }: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<number>();
  // A ref, not state: pointer handlers must see it change within one gesture.
  const dragging = useRef(false);
  const [trackHeight, setTrackHeight] = useState(0);

  useEffect(() => {
    const track = trackRef.current!;
    const observer = new ResizeObserver(() => setTrackHeight(track.clientHeight));
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const span = range.last - range.first;
  const clamp = (ts: number) => Math.min(range.last, Math.max(range.first, Math.round(ts)));
  const toFraction = (ts: number) => (ts - range.first) / span;

  const timestampAt = (clientY: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return clamp(range.first + ((clientY - rect.top) / rect.height) * span);
  };

  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    setPreview(timestampAt(e.clientY));
  };
  const onPointerMove = (e: PointerEvent) => setPreview(timestampAt(e.clientY));
  const onPointerUp = (e: PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    onJump(timestampAt(e.clientY));
    if (e.pointerType !== "mouse") setPreview(undefined);
  };
  const onPointerLeave = () => {
    if (!dragging.current) setPreview(undefined);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const from = current ?? range.first;
    const steps: Record<string, number> = {
      ArrowUp: from - 30 * DAY,
      ArrowDown: from + 30 * DAY,
      PageUp: from - 365 * DAY,
      PageDown: from + 365 * DAY,
      Home: range.first,
      End: range.last,
    };
    if (!(e.key in steps)) return;
    e.preventDefault();
    onJump(clamp(steps[e.key]));
  };

  // A tick for every January 1st, labelled when there's room.
  const years: { year: number; fraction: number }[] = [];
  const startYear = new Date(range.first * 1000).getFullYear();
  const endYear = new Date(range.last * 1000).getFullYear();
  for (let year = startYear + 1; year <= endYear; year++) {
    years.push({ year, fraction: toFraction(new Date(year, 0, 1).getTime() / 1000) });
  }
  const labelEvery = Math.max(1, Math.ceil(MIN_LABEL_GAP / ((trackHeight / (years.length + 1)) || 1)));

  return (
    <nav
      className="timeline"
      role="slider"
      tabIndex={0}
      aria-label="Jump to date"
      aria-orientation="vertical"
      aria-valuemin={range.first}
      aria-valuemax={range.last}
      aria-valuenow={current ?? range.first}
      aria-valuetext={formatMonth(current ?? range.first)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragging.current = false;
        setPreview(undefined);
      }}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    >
      <div className="timeline-track" ref={trackRef}>
        {years.map(({ year, fraction }, i) => (
          <div key={year} className="timeline-year" style={{ top: `${fraction * 100}%` }}>
            {(years.length - 1 - i) % labelEvery === 0 && <span>{year}</span>}
          </div>
        ))}
        {current !== undefined && (
          <div className="timeline-current" style={{ top: `${toFraction(current) * 100}%` }} />
        )}
        {preview !== undefined && (
          <div className="timeline-preview" style={{ top: `${toFraction(preview) * 100}%` }}>
            <span>{formatMonth(preview)}</span>
          </div>
        )}
      </div>
    </nav>
  );
}
