type IconProps = { className?: string };

const baseProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  xmlns: "http://www.w3.org/2000/svg",
};

export function GridIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

export function InboxIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path strokeLinecap="square" d="M4 13h5l1 2h4l1-2h5" />
      <path strokeLinecap="square" d="M4 13l2-7h12l2 7v6H4z" />
    </svg>
  );
}

export function ApplicationIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path strokeLinecap="square" d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path strokeLinecap="square" d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function ClassesIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path strokeLinecap="square" d="M3 10l9-5 9 5-9 5-9-5z" />
      <path strokeLinecap="square" d="M7 12v5c0 1 2 2 5 2s5-1 5-2v-5" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="square"
        d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2l-.4-2.4h-4l-.4 2.4a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.4h4l.4-2.4a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c0-.4.1-.8.1-1.2z"
      />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="3" y="5" width="18" height="14" />
      <path strokeLinecap="square" d="M3 6l9 7 9-7" />
    </svg>
  );
}

export function PendingIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="square" d="M12 7v5l3 3" />
    </svg>
  );
}

export function EventIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="4" y="5" width="16" height="16" />
      <path strokeLinecap="square" d="M8 3v4M16 3v4M4 11h16" />
    </svg>
  );
}

export function MetricsIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path strokeLinecap="square" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path strokeLinecap="square" d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="4" cy="6" r="0.5" fill="currentColor" />
      <circle cx="4" cy="12" r="0.5" fill="currentColor" />
      <circle cx="4" cy="18" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function GalleryIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="3" y="4" width="18" height="16" />
      <path strokeLinecap="square" d="M3 16l5-5 4 4 3-3 6 6" />
      <circle cx="8.5" cy="9" r="1.5" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="square" d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path strokeLinecap="square" d="M15 20a5 5 0 0 1 7-4.5" />
    </svg>
  );
}
