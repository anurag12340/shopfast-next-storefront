// Dark, light or the system's: kept in a cookie, so the server renders the right theme and nothing flashes.
import { setTheme } from '@/app/actions/theme';
import type { Theme } from '@/lib/cookies';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';

const OPTIONS: readonly { readonly value: Theme; readonly label: string; readonly Icon: typeof SunIcon }[] = [
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'system', label: 'System', Icon: MonitorIcon },
];

export function ThemeSwitch({ theme }: { readonly theme: Theme }) {
  return (
    <form action={setTheme} className="theme-switch" aria-label="Theme">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button key={value} type="submit" name="theme" value={value} className="theme-switch__btn" aria-pressed={theme === value} title={label}>
          <Icon size={15} />
          <span className="visually-hidden">{label}</span>
        </button>
      ))}
    </form>
  );
}
