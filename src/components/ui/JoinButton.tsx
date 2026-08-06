import { useState, useEffect } from 'react';

interface JoinButtonProps {
  eventId: string;
  lang: 'de' | 'en';
}

const labels = {
  de: {
    join: 'Ich bin dabei',
    leave: 'Nicht mehr dabei',
    count: (n: number) => `${n} ${n === 1 ? 'Person nimmt teil' : 'Personen nehmen teil'}`,
  },
  en: {
    join: 'I will join',
    leave: 'Remove participation',
    count: (n: number) => `${n} ${n === 1 ? 'person joining' : 'people joining'}`,
  },
};

const apiBase = import.meta.env.BASE_URL;

export default function JoinButton({ eventId, lang }: JoinButtonProps) {
  const t = labels[lang] ?? labels.de;
  const storageKey = `rsvp_${eventId}`;
  const countKey = `rsvp_count_${eventId}`;

  const [count, setCount] = useState<number | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const wasJoined = localStorage.getItem(storageKey) === '1';
    setJoined(wasJoined);

    const localCount = parseInt(localStorage.getItem(countKey) || '0', 10);
    if (localCount > 0) setCount(localCount);

    fetch(`${apiBase}api/rsvp.php?event=${encodeURIComponent(eventId)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: { count: number }) => {
        setCount(data.count);
        localStorage.setItem(countKey, String(data.count));
      })
      .catch(() => {
        // API unavailable — show localStorage count already set above
      });
  }, [eventId, storageKey, countKey]);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    const decrement = joined;
    const newJoined = !joined;

    // Optimistic update — works even without API
    setJoined(newJoined);
    setCount(prev => {
      const next = Math.max((prev ?? 0) + (decrement ? -1 : 1), 0);
      localStorage.setItem(countKey, String(next));
      return next;
    });
    if (newJoined) {
      localStorage.setItem(storageKey, '1');
    } else {
      localStorage.removeItem(storageKey);
    }

    try {
      const r = await fetch(`${apiBase}api/rsvp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventId, decrement }),
      });
      if (r.ok) {
        const data: { count: number } = await r.json();
        setCount(data.count);
        localStorage.setItem(countKey, String(data.count));
      }
    } catch {
      // Optimistic update stays — localStorage already reflects the change
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
      <button
        onClick={handleClick}
        disabled={loading}
        className={[
          'w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors',
          joined
            ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400'
            : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white',
        ].join(' ')}
      >
        {loading ? '…' : joined ? t.leave : t.join}
      </button>
      {count !== null && count > 0 && (
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-2">
          {t.count(count)}
        </p>
      )}
    </div>
  );
}
