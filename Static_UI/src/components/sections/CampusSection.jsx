import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { Carousel, SectionIntro } from '../ui/Carousel';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function CampusSection() {
  const { t } = useTranslation();
  const { campusFacilities, siteInfo } = useContent();

  return (
    <RevealSection id="campus" className="bg-surface-container-low px-container-mobile pb-8 pt-section md:pb-10">
      <div className="mx-auto max-w-5xl">
        <SectionIntro
          title={t('campus.title')}
          subtitle={t('campus.subtitle', { name: siteInfo.shortName })}
        />

        <Carousel ariaLabel={t('campus.carouselLabel')} slideClassName="w-[min(85vw,300px)]">
          {campusFacilities.map((facility, index) => (
            <Reveal key={facility.id} delay={index * 100}>
              <article className="hover-lift h-full overflow-hidden rounded-[28px] border border-surface-container-highest bg-white shadow-sm">
                <ContentImage alt={facility.name} className="h-44 w-full" src={facility.image} />
                <div className="p-6 text-center">
                  <h3 className="font-display text-lg font-bold text-primary">{facility.name}</h3>
                  <p className="mt-1 font-display text-label-sm uppercase tracking-widest text-accent">
                    {facility.role}
                  </p>
                  <p className="mt-4 font-body text-sm leading-relaxed text-on-surface-variant">
                    {facility.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </Carousel>
      </div>
    </RevealSection>
  );
}
