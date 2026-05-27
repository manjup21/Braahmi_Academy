import { useContent } from '../../hooks/useContent';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function AboutSection() {
  const { welcomeSection } = useContent();

  return (
    <RevealSection id="about" className="bg-surface-container-low px-container-mobile py-section">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 text-center sm:mb-10">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-primary sm:text-2xl md:text-headline-md">
            {welcomeSection.heading}
          </h2>
          <p className="mt-2 font-display text-base font-bold text-primary sm:text-lg">{welcomeSection.tagline}</p>
          <div className="accent-bar mx-auto mt-4 h-1 rounded-full bg-accent" />
        </Reveal>

        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <Reveal delay={80} variant="left" className="space-y-4">
            {welcomeSection.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="font-body text-body-md leading-relaxed text-on-surface-variant">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={120} variant="right">
            <div className="hover-lift overflow-hidden rounded-2xl border border-surface-container-highest bg-white shadow-md">
              <div className="aspect-3/4 sm:aspect-4/5">
                <ContentImage
                  alt={welcomeSection.image.alt}
                  className="h-full w-full"
                  src={welcomeSection.image.src}
                  priority
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </RevealSection>
  );
}
