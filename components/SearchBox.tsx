'use client';
// Search with suggestions as you type (an ARIA combobox). Typing never waits: the field updates on every key, the
// request goes out once typing pauses, and an older answer never replaces a newer one. The list opens without
// animation: it follows the keyboard.
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { suggest, type Suggestion } from '@/app/actions/live';
import { SearchIcon } from './icons';

const DEBOUNCE_MS = 140;

function Highlighted({ text, ranges }: { readonly text: string; readonly ranges: readonly (readonly [number, number])[] }) {
  if (ranges.length === 0) return <>{text}</>;
  const parts: ReactNode[] = [];
  let at = 0;
  for (const [start, end] of ranges) {
    if (start > at) parts.push(text.slice(at, start));
    parts.push(<mark key={start}>{text.slice(start, end)}</mark>);
    at = end;
  }
  parts.push(text.slice(at));
  return <>{parts}</>;
}

export function SearchBox({ initial, autoFocus = false }: { readonly initial: string; readonly autoFocus?: boolean }) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState(initial);
  const [items, setItems] = useState<readonly Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const latest = useRef(0);

  useEffect(() => {
    const q = value.trim();
    if (q === '' || q === initial.trim()) {
      setItems([]);
      return;
    }
    const ticket = ++latest.current;
    const timer = setTimeout(() => {
      void suggest(q).then((s) => {
        if (ticket !== latest.current) return;
        setItems(s.items);
        setActive(-1);
      });
    }, DEBOUNCE_MS);
    return () => { clearTimeout(timer); };
  }, [value, initial]);

  const go = (href: string): void => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown' && items.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp' && items.length > 0) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === 'Enter' && open && active >= 0) {
      const item = items[active];
      if (item !== undefined) {
        e.preventDefault();
        go(item.href);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const listId = `${id}-list`;
  const showList = open && items.length > 0;
  return (
    <form action="/search" role="search" className="searchbox" onSubmit={() => { setOpen(false); }}>
      <SearchIcon />
      <input
        name="q" type="search" value={value} placeholder="Search products, categories and pages" autoComplete="off" spellCheck={false}
        role="combobox" aria-expanded={showList} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${id}-${String(active)}` : undefined}
        // Focus on arrival from the header's search button.
        autoFocus={autoFocus}
        onChange={(e) => { setValue(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); }}
        onBlur={() => { setOpen(false); }}
        onKeyDown={onKeyDown}
      />
      <kbd className="searchbox__kbd">Enter</kbd>
      <ul id={listId} role="listbox" className="suggest" hidden={!showList}>
        {items.map((item, i) => (
          <li
            key={item.href} id={`${id}-${String(i)}`} role="option" aria-selected={i === active} className="suggest__item"
            // mousedown, not click: the input's blur would close the list first.
            onMouseDown={(e) => { e.preventDefault(); go(item.href); }}
            onMouseMove={() => { setActive(i); }}
          >
            <span className="suggest__kind">{item.kind}</span>
            <span className="suggest__title"><Highlighted text={item.title} ranges={item.highlight} /></span>
            <span className="suggest__meta">{item.meta}</span>
          </li>
        ))}
      </ul>
    </form>
  );
}
