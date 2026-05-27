import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages } from '../../i18n/languages';

export function LanguageSelector({ className = '', fullWidth = false }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  const current = languages.find((lang) => lang.code === i18n.language) ?? languages[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const rootClass = fullWidth
    ? `relative block w-full min-w-0 ${className}`
    : `relative inline-block w-max max-w-full align-top ${className}`;

  const triggerClass = fullWidth
    ? 'flex w-full items-center justify-between gap-2 px-3 py-2.5'
    : 'inline-flex w-full min-w-[7.25rem] items-center justify-between gap-2 px-3 py-1.5';

  const menuClass = fullWidth
    ? 'left-0 right-0 w-full'
    : 'left-0 w-full min-w-full';

  return (
    <div ref={rootRef} className={rootClass.trim()}>
      <button
        type="button"
        id={`${listId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className={`${triggerClass} rounded-full border border-primary/20 bg-surface/80 font-display text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/40 sm:text-label-sm`}
      >
        <span className="truncate">{current.nativeLabel}</span>
        <span className="flex shrink-0 items-center gap-0.5 text-primary/70">
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            language
          </span>
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={`${listId}-trigger`}
          aria-label={t('language.label')}
          className={`absolute ${menuClass} top-[calc(100%+6px)] z-80 overflow-hidden rounded-xl border border-surface-container-highest bg-white py-1 shadow-[0_8px_24px_rgba(74,50,40,0.14)]`}
        >
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <li key={lang.code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => selectLanguage(lang.code)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-display text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-surface-container-low text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low/70'
                  }`}
                >
                  <span className="truncate">{lang.nativeLabel}</span>
                  {isActive ? (
                    <span className="material-symbols-outlined shrink-0 text-base text-accent" aria-hidden>
                      check
                    </span>
                  ) : (
                    <span className="w-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
