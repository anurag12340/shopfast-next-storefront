// Line icons on a 20px grid, 1.6px strokes, drawn with currentColor.
import type { ReactNode } from 'react';

interface IconProps {
  readonly size?: number;
}

function Svg({ size = 18, children }: IconProps & { readonly children: ReactNode }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => <Svg {...p}><circle cx="9" cy="9" r="5.5" /><path d="m13.2 13.2 3.3 3.3" /></Svg>;
export const BagIcon = (p: IconProps) => <Svg {...p}><path d="M4.5 7h11l-.8 9.2a1 1 0 0 1-1 .8H6.3a1 1 0 0 1-1-.8z" /><path d="M7.5 7V5.8a2.5 2.5 0 0 1 5 0V7" /></Svg>;
export const UserIcon = (p: IconProps) => <Svg {...p}><circle cx="10" cy="7" r="3.2" /><path d="M3.8 17a6.2 6.2 0 0 1 12.4 0" /></Svg>;
export const ArrowRight = (p: IconProps) => <Svg {...p}><path d="M4 10h12M11 5l5 5-5 5" /></Svg>;
export const ArrowLeft = (p: IconProps) => <Svg {...p}><path d="M16 10H4M9 5l-5 5 5 5" /></Svg>;
export const CheckIcon = (p: IconProps) => <Svg {...p}><path d="m4.5 10.5 3.5 3.5 7.5-8" /></Svg>;
export const BoltIcon = (p: IconProps) => <Svg {...p}><path d="M11 2.5 4.5 11h5l-1 6.5L15 9h-5z" /></Svg>;
export const ShieldIcon = (p: IconProps) => <Svg {...p}><path d="M10 2.8 4 5v4.6c0 3.6 2.6 6.4 6 7.6 3.4-1.2 6-4 6-7.6V5z" /><path d="m7.4 10 1.9 1.9 3.4-3.6" /></Svg>;
export const ChatIcon = (p: IconProps) => <Svg {...p}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 3v-3h0A1.5 1.5 0 0 1 4 11.5z" /></Svg>;
export const KeyIcon = (p: IconProps) => <Svg {...p}><circle cx="7" cy="12.5" r="3.2" /><path d="m9.3 10.2 6.2-6.2M13.5 6l2 2M11.8 7.7l1.6 1.6" /></Svg>;
export const DownloadIcon = (p: IconProps) => <Svg {...p}><path d="M10 3.5v9M6 9l4 4 4-4M4 16.5h12" /></Svg>;
export const CopyIcon = (p: IconProps) => <Svg {...p}><rect x="7" y="7" width="9" height="9" rx="1.6" /><path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-6A1.5 1.5 0 0 0 4 5.5v6A1.5 1.5 0 0 0 5.5 13H7" /></Svg>;
export const MinusIcon = (p: IconProps) => <Svg {...p}><path d="M5 10h10" /></Svg>;
export const PlusIcon = (p: IconProps) => <Svg {...p}><path d="M10 5v10M5 10h10" /></Svg>;
export const XIcon = (p: IconProps) => <Svg {...p}><path d="m5.5 5.5 9 9M14.5 5.5l-9 9" /></Svg>;
export const TagIcon = (p: IconProps) => <Svg {...p}><path d="M3.5 10.2V4.5a1 1 0 0 1 1-1h5.7l6.3 6.3a1 1 0 0 1 0 1.4l-5.7 5.7a1 1 0 0 1-1.4 0z" /><circle cx="7" cy="7" r="1.1" /></Svg>;
export const StarIcon = ({ size = 14, filled = true }: IconProps & { readonly filled?: boolean }) => (
  <svg className="icon" width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
    <path d="m10 2.6 2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.4l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
export const SunIcon = (p: IconProps) => <Svg {...p}><circle cx="10" cy="10" r="3.2" /><path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3 6 14M14 6l1.3-1.3" /></Svg>;
export const MoonIcon = (p: IconProps) => <Svg {...p}><path d="M15.5 12.3A6.5 6.5 0 0 1 7.7 4.5a6.5 6.5 0 1 0 7.8 7.8z" /></Svg>;
export const MonitorIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="4" width="14" height="10" rx="1.5" /><path d="M7.5 17h5M10 14v3" /></Svg>;
