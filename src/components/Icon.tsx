// Ikon garis (stroke) ringan, gaya modern, pengganti emoji di seluruh aplikasi.
import type { SVGProps } from "react";

export type IconName =
  | "compass"
  | "users"
  | "chart"
  | "folder"
  | "book"
  | "edit"
  | "toolbox"
  | "dna"
  | "flask"
  | "microscope"
  | "user"
  | "clock"
  | "link"
  | "bell"
  | "search"
  | "inbox"
  | "inbox-in"
  | "paperclip"
  | "calendar"
  | "lightbulb"
  | "wave"
  | "cap"
  | "moon"
  | "sun"
  | "help"
  | "settings"
  | "menu"
  | "lock"
  | "close"
  | "check"
  | "check-circle"
  | "medal"
  | "sparkles"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "user-plus"
  | "clock-dashed"
  | "logout"
  | "grid"
  | "google";

const paths: Record<IconName, React.ReactNode> = {
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" rx="0.5" />
      <rect x="12" y="7" width="3" height="10" rx="0.5" />
      <rect x="17" y="13" width="3" height="4" rx="0.5" />
    </>
  ),
  folder: (
    <path d="M4 5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-8l-2-2H4Z" />
  ),
  book: (
    <>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5V4.5Z" />
      <path d="M4 19.5V4.5" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </>
  ),
  toolbox: (
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
  ),
  dna: (
    <>
      <path d="M4 3c0 6 16 6 16 18" />
      <path d="M20 3C20 9 4 9 4 21" />
      <path d="M6.5 7h11" />
      <path d="M6.5 17h11" />
      <path d="M9 5h6" />
      <path d="M9 19h6" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v6.5L5.5 17A2 2 0 0 0 7.3 20h9.4a2 2 0 0 0 1.8-3L14 9.5V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  microscope: (
    <>
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 0 0 0-14" />
      <path d="M9 14h2" />
      <path d="M9 2 8 4l2 1-1 2" />
      <path d="M8 6 6 8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  "clock-dashed": (
    <>
      <path d="M12 3a9 9 0 1 1-8.5 6" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10.5 20a2 2 0 0 0 3 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M5 6h14l2 6v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-6Z" />
    </>
  ),
  "inbox-in": (
    <>
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M5 6h14l2 6v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-6Z" />
      <path d="M12 2v7m0 0 2.5-2.5M12 9 9.5 6.5" />
    </>
  ),
  paperclip: (
    <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7.5-7.5" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 1 3.6 10.8c-.6.5-.9 1-.9 1.7v.5H9.3v-.5c0-.7-.3-1.2-.9-1.7A6 6 0 0 1 12 3Z" />
    </>
  ),
  wave: (
    <>
      <path d="M18 11V6.5a1.5 1.5 0 0 0-3 0V5a1.5 1.5 0 0 0-3 0 1.5 1.5 0 0 0-3 0v6" />
      <path d="M9 11V8.5a1.5 1.5 0 0 0-3 0V13a7 7 0 0 0 7 7 6 6 0 0 0 6-6c0-1.5.5-2.3 1.2-3.2A1.5 1.5 0 0 0 16.8 9" />
    </>
  ),
  cap: (
    <>
      <path d="M12 4 2 9l10 5 10-5-10-5Z" />
      <path d="M6 11v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5" />
      <path d="M12 17h.01" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 12a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1l-.4-2.5H10.2l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h3.6l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1Z" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  medal: (
    <>
      <path d="M8 3h8l-2.5 6h-3L8 3Z" />
      <circle cx="12" cy="15" r="5" />
      <path d="M12 13v4l1.5 1" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />
    </>
  ),
  "arrow-right": <path d="M4 12h16m0 0-6-6m6 6-6 6" />,
  "arrow-left": <path d="M20 12H4m0 0 6-6m-6 6 6 6" />,
  "arrow-up": <path d="M12 20V4m0 0-6 6m6-6 6 6" />,
  "arrow-down": <path d="M12 4v16m0 0 6-6m-6 6-6-6" />,
  "user-plus": (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M3 21a6 6 0 0 1 12 0" />
      <path d="M19 8v6M16 11h6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  google: null,
};

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 20, className = "", strokeWidth = 2, ...rest }: Props) {
  if (name === "google") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...rest}>
        <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.8Z" />
        <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.3-2-6.2-4.6H2.2v2.8A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.6-2.8Z" />
        <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
