import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from './Reveal';

export function SectionIntro({ title, subtitle, theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <Reveal className="mb-8 text-center md:mb-9">
      <h2 className={`font-display text-headline-md ${isDark ? 'text-white' : 'text-primary'}`}>{title}</h2>
      <div className="accent-bar mx-auto mt-3 h-1 rounded-full bg-accent" />
      {subtitle ? (
        <p
          className={`mx-auto mt-4 max-w-2xl font-body text-body-md ${
            isDark ? 'text-white/80' : 'text-on-surface-variant'
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}

export function Carousel({
  children,
  ariaLabel,
  theme = 'light',
  slideClassName = 'w-[min(85vw,280px)]',
  fillWidth = false,
  scrollStep = 1,
}) {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const slideCount = Children.count(children);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const isDark = theme === 'dark';
  const gapPx = 20;

  const getMetrics = useCallback(() => {
    const track = trackRef.current;
    const items = track?.querySelectorAll('[data-carousel-item]');
    if (!track || !items?.length) return null;

    const slideWidth = items[0].offsetWidth + gapPx;
    const visibleCount = Math.max(1, Math.floor((track.clientWidth + gapPx) / slideWidth));
    const maxStartIndex = Math.max(0, items.length - visibleCount);
    const activeIndex = Math.min(maxStartIndex, Math.max(0, Math.round(track.scrollLeft / slideWidth)));
    const dots = maxStartIndex + 1;

    return { slideWidth, visibleCount, activeIndex, dots, maxStartIndex };
  }, []);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    const overflow = scrollWidth > clientWidth + 4;
    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);

    const metrics = getMetrics();
    if (!metrics) return;

    setDotCount(metrics.dots);
    setActiveIndex(metrics.activeIndex);
  }, [getMetrics]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();
    track.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);

    return () => {
      track.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, slideCount]);

  const scrollToIndex = (index) => {
    const track = trackRef.current;
    const items = track?.querySelectorAll('[data-carousel-item]');
    const item = items?.[index];
    if (!track || !item) return;
    track.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
  };

  const scrollByStep = (direction) => {
    const metrics = getMetrics();
    if (!metrics) return;
    const next = Math.min(
      metrics.maxStartIndex,
      Math.max(0, metrics.activeIndex + direction * scrollStep),
    );
    scrollToIndex(next);
  };

  const arrowBase =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 disabled:pointer-events-none disabled:opacity-30 hover:scale-105 active:scale-95';
  const arrowOverlay = 'absolute top-1/2 z-10 hidden -translate-y-1/2 md:flex';
  const arrowTheme = isDark
    ? 'bg-white/15 text-white shadow-lg hover:bg-white/25'
    : 'bg-white text-primary shadow-md hover:bg-surface-container-low';

  const dotActive = 'bg-accent w-6';
  const dotIdle = isDark ? 'bg-white/35 hover:bg-white/50' : 'bg-outline-variant/50 hover:bg-outline-variant';

  const trackRowClass = fillWidth
    ? 'flex w-full snap-x snap-mandatory items-stretch justify-start gap-5'
    : hasOverflow
      ? 'flex w-max max-w-full snap-x snap-mandatory items-stretch justify-start gap-5'
      : 'mx-auto flex w-max max-w-full snap-x snap-mandatory items-stretch justify-center gap-5';

  return (
    <div className="relative sm:px-10">
      {hasOverflow ? (
        <>
          <button
            type="button"
            aria-label={t('common.previousSlide')}
            disabled={!canScrollLeft}
            onClick={() => scrollByStep(-1)}
            className={`${arrowBase} ${arrowOverlay} ${arrowTheme} left-0`}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            aria-label={t('common.nextSlide')}
            disabled={!canScrollRight}
            onClick={() => scrollByStep(1)}
            className={`${arrowBase} ${arrowOverlay} ${arrowTheme} right-0`}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </>
      ) : null}

      <div
        ref={trackRef}
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        className="carousel-track overflow-x-auto scroll-smooth px-3 pb-2 pt-1"
        role="region"
      >
        <div className={trackRowClass}>
          {Children.map(children, (child, index) => (
            <div
              key={index}
              data-carousel-item
              className={`flex shrink-0 snap-start ${slideClassName}`}
              role="group"
              aria-roledescription="slide"
              aria-label={t('common.slideOf', { current: index + 1, total: slideCount })}
            >
              <div className="flex h-full w-full min-h-0 flex-col *:h-full *:w-full">{child}</div>
            </div>
          ))}
        </div>
      </div>

      {hasOverflow ? (
        <div className="mt-4 flex justify-center gap-4 md:hidden">
          <button
            type="button"
            aria-label={t('common.previousSlide')}
            disabled={!canScrollLeft}
            onClick={() => scrollByStep(-1)}
            className={`${arrowBase} ${arrowTheme}`}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            aria-label={t('common.nextSlide')}
            disabled={!canScrollRight}
            onClick={() => scrollByStep(1)}
            className={`${arrowBase} ${arrowTheme}`}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      ) : null}

      {dotCount > 1 ? (
        <div className="mt-4 flex justify-center gap-2 md:mt-5" role="tablist" aria-label={t('common.carouselPagination')}>
          {Array.from({ length: dotCount }, (_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={t('common.goToSlide', { n: index + 1, total: dotCount })}
              onClick={() => scrollToIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === index ? dotActive : `w-2 ${dotIdle}`
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
