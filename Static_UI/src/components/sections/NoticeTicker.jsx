import { notices } from '../../data/content';

export function NoticeTicker() {
  const items = [...notices, ...notices];

  return (
    <div className="overflow-hidden whitespace-nowrap bg-primary-container py-3">
      <div className="inline-flex animate-marquee items-center gap-8">
        {items.map((text, i) => (
          <span
            key={`${text}-${i}`}
            className="flex shrink-0 items-center gap-2 font-display text-label-sm text-on-primary-container"
          >
            <span className="material-symbols-outlined text-sm">campaign</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
