import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { Carousel, SectionIntro } from '../ui/Carousel';
import { PersonAvatar } from '../ui/PersonAvatar';
import { Reveal, RevealSection } from '../ui/Reveal';

export function TestimonialsSection() {
  const { t } = useTranslation();
  const { featuredTestimonial, testimonials } = useContent();
  const cards = [featuredTestimonial, ...testimonials];

  return (
    <RevealSection id="testimonials" className="bg-primary px-container-mobile pb-8 pt-8 md:pb-10 md:pt-10">
      <div className="mx-auto max-w-5xl">
        <SectionIntro
          theme="dark"
          title={t('testimonials.sectionTitle')}
          subtitle={t('testimonials.sectionSubtitle')}
        />

        {/* Desktop: 4 static cards */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {cards.map((item, index) => (
            <Reveal key={item.id} delay={index * 90}>
              <article className="hover-lift flex h-full min-h-72 flex-col rounded-[28px] border border-white/20 bg-white/12 p-6 text-center">
                <PersonAvatar
                  name={item.name}
                  image={item.image}
                  className="mx-auto h-24 w-24 shrink-0 rounded-full border-4 border-accent shadow-lg"
                />
                <h3 className="mt-4 font-display text-lg font-bold text-white">{item.name}</h3>
                <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2">
                  {item.year ? (
                    <p className="font-display text-label-sm font-semibold text-accent">
                      {t('testimonials.yearLabel')}:{' '}
                      <span className="font-body text-white/85">{item.year}</span>
                    </p>
                  ) : null}
                  {item.marks ? (
                    <p className="font-display text-label-sm font-semibold text-accent">
                      {t('testimonials.marksLabel')}:{' '}
                      <span className="font-body text-white/85">{item.marks}</span>
                    </p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Mobile: carousel (still 4 cards, but swipable) */}
        <div className="md:hidden">
          <Carousel
            ariaLabel={t('testimonials.carouselLabel')}
            theme="dark"
            fillWidth
            scrollStep={1}
            slideClassName="w-[min(88vw,320px)]"
          >
            {cards.map((item, index) => (
              <Reveal key={item.id} delay={index * 90}>
                <article className="hover-lift flex h-full min-h-72 flex-col rounded-[28px] border border-white/20 bg-white/12 p-6 text-center">
                  <PersonAvatar
                    name={item.name}
                    image={item.image}
                    className="mx-auto h-24 w-24 shrink-0 rounded-full border-4 border-accent shadow-lg"
                  />
                  <h3 className="mt-4 font-display text-lg font-bold text-white">{item.name}</h3>
                  <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2">
                    {item.year ? (
                      <p className="font-display text-label-sm font-semibold text-accent">
                        {t('testimonials.yearLabel')}:{' '}
                        <span className="font-body text-white/85">{item.year}</span>
                      </p>
                    ) : null}
                    {item.marks ? (
                      <p className="font-display text-label-sm font-semibold text-accent">
                        {t('testimonials.marksLabel')}:{' '}
                        <span className="font-body text-white/85">{item.marks}</span>
                      </p>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            ))}
          </Carousel>
        </div>
      </div>
    </RevealSection>
  );
}
