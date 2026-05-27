import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { Carousel, SectionIntro } from '../ui/Carousel';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function FacultySection() {
  const { t } = useTranslation();
  const { faculty, siteInfo } = useContent();

  return (
    <RevealSection id="faculty" className="bg-surface-container-low px-container-mobile pb-8 pt-section md:pb-10">
      <div className="mx-auto max-w-5xl">
        <SectionIntro
          title={t('faculty.title')}
          subtitle={t('faculty.subtitle', { name: siteInfo.shortName })}
        />

        <Carousel
          ariaLabel={t('faculty.carouselLabel')}
          fillWidth
          scrollStep={1}
          slideClassName="w-[min(88vw,280px)] sm:w-[min(75vw,300px)] lg:w-[calc((100%-2.5rem)/3)]"
        >
          {faculty.map((member, index) => (
            <Reveal key={member.id} delay={index * 80}>
              <article className="hover-lift flex h-full min-h-72 flex-col overflow-hidden rounded-[28px] border border-surface-container-highest bg-white shadow-sm">
                <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-surface-container-low">
                  <ContentImage
                    alt={t('faculty.photoAlt', { name: member.name })}
                    className="h-full w-full object-cover object-top"
                    src={member.image}
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 text-center">
                  <h3 className="font-display text-lg font-bold text-primary">{member.name}</h3>
                  <p className="mt-1 font-display text-label-sm font-semibold uppercase tracking-wide text-accent">
                    {member.subject}
                  </p>
                  <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-on-surface-variant">
                    &ldquo;{member.thought}&rdquo;
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
