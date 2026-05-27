import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';
import { SectionIntro } from '../ui/Carousel';

const AUTOPLAY_MS = 5000;

export function CampusGallery() {
  const { t } = useTranslation();
  const { galleryImages, siteInfo } = useContent();
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const thumbTrackRef = useRef(null);
  const total = galleryImages.length;

  const goTo = useCallback(
    (index) => {
      setActive((index + total) % total);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);
  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const id = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [isPaused, goNext, total]);

  useEffect(() => {
    const track = thumbTrackRef.current;
    const thumb = track?.children[active];
    if (!track || !thumb) return;
    const targetLeft = thumb.offsetLeft - track.clientWidth / 2 + thumb.clientWidth / 2;
    const maxLeft = track.scrollWidth - track.clientWidth;
    track.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxLeft)),
      behavior: 'smooth',
    });
  }, [active]);

  return (
    <RevealSection id="gallery" className="px-container-mobile py-section">
      <div className="mx-auto max-w-4xl">
        <SectionIntro
          title={t('gallery.title')}
          subtitle={t('gallery.subtitle', { name: siteInfo.shortName })}
        />

        <Reveal delay={100}>
          <div
            className="group relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            <div
              className="relative aspect-16/10 overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-low shadow-lg sm:aspect-2/1"
              role="region"
              aria-roledescription="carousel"
              aria-label={t('gallery.ariaLabel')}
            >
              {galleryImages.map((img, index) => (
                <article
                  key={img.src}
                  className={`gallery-slide absolute inset-0 transition-all duration-700 ease-out ${
                    index === active
                      ? 'gallery-slide-active z-10 opacity-100'
                      : 'z-0 opacity-0 pointer-events-none'
                  }`}
                  aria-hidden={index !== active}
                >
                  <ContentImage alt={img.alt} className="h-full w-full" src={img.src} loading={index <= 1 ? 'eager' : 'lazy'} />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/70 via-primary/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                    <div>
                      <span className="inline-block rounded-full bg-accent px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-white">
                        {img.category}
                      </span>
                      <p className="mt-2 max-w-md font-body text-sm text-white/90 sm:text-base">{img.alt}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 font-display text-label-sm text-white backdrop-blur-sm">
                      {t('common.slideOf', { current: index + 1, total })}
                    </span>
                  </div>
                </article>
              ))}

              {total > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-md transition-all hover:scale-105 hover:bg-white sm:left-4 sm:h-11 sm:w-11"
                    aria-label={t('gallery.previousPhoto')}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-md transition-all hover:scale-105 hover:bg-white sm:right-4 sm:h-11 sm:w-11"
                    aria-label={t('gallery.nextPhoto')}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </>
              ) : null}

              {isPaused && total > 1 ? (
                <span className="absolute right-4 top-4 z-20 rounded-full bg-black/40 px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-white backdrop-blur-sm">
                  {t('common.paused')}
                </span>
              ) : null}
            </div>

            {total > 1 ? (
              <>
                <div
                  ref={thumbTrackRef}
                  className="gallery-thumb-track mt-3 flex gap-2 overflow-x-auto scroll-smooth pb-1"
                  role="tablist"
                  aria-label={t('gallery.thumbnails')}
                >
                  {galleryImages.map((img, index) => (
                    <button
                      key={img.src}
                      type="button"
                      role="tab"
                      aria-selected={index === active}
                      aria-label={t('gallery.viewPhoto', { alt: img.alt })}
                      onClick={() => goTo(index)}
                      className={`gallery-thumb relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-24 ${
                        index === active
                          ? 'border-accent shadow-md ring-2 ring-accent/30 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ContentImage alt="" className="h-full w-full" src={img.src} />
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex justify-center gap-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={t('common.goToSlide', { n: index + 1, total })}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === active ? 'w-6 bg-accent' : 'w-2 bg-outline-variant/60 hover:bg-outline-variant'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </Reveal>
      </div>
    </RevealSection>
  );
}
