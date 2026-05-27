import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { Reveal, RevealSection } from '../ui/Reveal';

export function VisionMissionSection() {
  const { t } = useTranslation();
  const { visionMission } = useContent();

  return (
    <RevealSection className="bg-surface-container-low px-container-mobile py-section">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <Reveal variant="left">
          <article className="hover-lift h-full rounded-[28px] border border-surface-container-highest bg-white p-8 shadow-sm">
            <h3 className="font-display text-headline-md text-primary">{t('common.vision')}</h3>
            <div className="accent-bar mt-3 h-1 rounded-full bg-accent" />
            <p className="mt-5 font-body text-body-md leading-relaxed text-on-surface-variant">{visionMission.vision}</p>
          </article>
        </Reveal>
        <Reveal delay={100} variant="right">
          <article className="hover-lift h-full rounded-[28px] border border-surface-container-highest bg-white p-8 shadow-sm">
            <h3 className="font-display text-headline-md text-primary">{t('common.mission')}</h3>
            <div className="accent-bar mt-3 h-1 rounded-full bg-accent" />
            <p className="mt-5 font-body text-body-md leading-relaxed text-on-surface-variant">{visionMission.mission}</p>
          </article>
        </Reveal>
      </div>
    </RevealSection>
  );
}
