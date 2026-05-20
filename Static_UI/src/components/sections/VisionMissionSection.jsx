import { visionMission } from '../../data/content';
import { Reveal, RevealSection } from '../ui/Reveal';

export function VisionMissionSection() {
  return (
    <RevealSection className="bg-surface-container-low px-container-mobile py-section">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <Reveal>
          <article className="h-full rounded-[28px] border border-surface-container-highest bg-white p-8 shadow-sm">
            <h3 className="font-display text-headline-md text-primary">Vision</h3>
            <div className="mt-3 h-1 w-12 rounded-full bg-accent" />
            <p className="mt-5 font-body text-body-md leading-relaxed text-on-surface-variant">{visionMission.vision}</p>
          </article>
        </Reveal>
        <Reveal delay={100}>
          <article className="h-full rounded-[28px] border border-surface-container-highest bg-white p-8 shadow-sm">
            <h3 className="font-display text-headline-md text-primary">Mission</h3>
            <div className="mt-3 h-1 w-12 rounded-full bg-accent" />
            <p className="mt-5 font-body text-body-md leading-relaxed text-on-surface-variant">{visionMission.mission}</p>
          </article>
        </Reveal>
      </div>
    </RevealSection>
  );
}
