import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function FeaturedTestimonial() {
  const { t } = useTranslation();
  const { featuredTestimonial } = useContent();
  const { name, image, year, marks } = featuredTestimonial;

  return (
    <RevealSection className="hidden bg-primary px-container-mobile pb-8 pt-section md:pb-10 md:pt-14">
      <div className="mx-auto max-w-5xl">
        <Reveal delay={80} variant="scale">
          <article className="hover-lift overflow-hidden rounded-2xl border border-accent/35 bg-white/12 shadow-xl sm:rounded-[28px]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex shrink-0 justify-center bg-white/5 px-6 py-8 sm:w-52 sm:px-8 md:w-56">
                <div className="relative h-40 w-32 overflow-hidden rounded-[50%] border-4 border-accent shadow-lg sm:h-44 sm:w-36">
                  <ContentImage alt={name} className="h-full w-full object-[center_18%]" src={image} priority />
                </div>
              </div>
              <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
                <p className="font-display text-label-sm uppercase tracking-widest text-accent">{t('common.testimonial')}</p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">{name}</h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90 sm:text-base">
                  {year ? (
                    <p>
                      <span className="font-display text-label-sm font-semibold text-accent">{t('testimonials.yearLabel')}:</span>{' '}
                      {year}
                    </p>
                  ) : null}
                  {marks ? (
                    <p>
                      <span className="font-display text-label-sm font-semibold text-accent">{t('testimonials.marksLabel')}:</span>{' '}
                      {marks}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </RevealSection>
  );
}
