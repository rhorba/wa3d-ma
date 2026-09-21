import type { Status } from "@/lib/catalogue/schema";

// UI §2: one ink-coloured SVG family; status is carried by shape plus the text label next to it,
// never by colour. Marks that point in the reading direction mirror in RTL.
const DIRECTIONAL: ReadonlySet<Status> = new Set(["in_progress", "partial"]);

function Shape({ status }: { status: Status }) {
  switch (status) {
    case "not_started":
      return (
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeDasharray="3 2.3"
        />
      );
    case "in_progress":
      return (
        <>
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M8.5 6.5 12 10l-3.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case "achieved":
      return <circle cx="10" cy="10" r="8.9" fill="currentColor" />;
    case "partial":
      return (
        <>
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path d="M10 2a8 8 0 0 0 0 16z" fill="currentColor" />
        </>
      );
    case "not_achieved":
      return (
        <>
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path d="M5.5 10h9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </>
      );
    case "abandoned":
      return (
        <>
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M4.6 15.4 15.4 4.6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      );
  }
}

/** Decorative: always rendered next to the status label, so it is hidden from assistive tech. */
export function StatusMark({ status, size = 18 }: { status: Status; size?: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      data-status={status}
      className={`shrink-0 text-ink ${DIRECTIONAL.has(status) ? "mirror" : ""}`}
    >
      <Shape status={status} />
    </svg>
  );
}
