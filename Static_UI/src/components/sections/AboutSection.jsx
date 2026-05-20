import { about, siteInfo } from '../../data/content';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function AboutSection() {
  return (
    <RevealSection id="about" className="px-container-mobile py-section">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-6 text-center sm:mb-8">
          <h2 className="mb-3 font-display text-2xl text-primary sm:mb-4 sm:text-headline-md">
            About {siteInfo.shortName}
          </h2>
          <div className="mx-auto h-1 w-16 rounded-full bg-accent" />
        </Reveal>

        <Reveal delay={80} className="overflow-hidden rounded-2xl border border-surface-container-highest bg-white shadow-xl sm:rounded-[32px]">
          <div className="flex flex-col md:flex-row">
            <div className="flex items-center justify-center bg-surface-container-low px-6 py-8 sm:px-8 sm:py-10 md:w-[40%] md:shrink-0 md:py-12">
              <div className="relative">
                <div className="absolute -inset-3 rounded-[50%] bg-linear-to-br from-primary/15 via-accent/10 to-primary/5" />
                <Reveal
                  delay={150}
                  className="photo-reveal chairman-ellipse-frame relative h-60 w-48 overflow-hidden rounded-[50%] border-4 border-white shadow-lg sm:h-72 sm:w-56 md:h-88 md:w-68"
                >
                  <ContentImage
                    alt={`${siteInfo.shortName} campus`}
                    className="h-full w-full min-h-full min-w-full scale-[1.15] object-cover object-center"
                    src={about.image}
                    priority
                  />
                </Reveal>
              </div>
            </div>

            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 md:w-[60%] md:px-10 md:py-10 lg:px-12">
              <Reveal delay={200}>
                <p className="font-display text-xs uppercase tracking-widest text-on-tertiary-container sm:text-label-sm">
                  {about.role}
                </p>
              </Reveal>
              <Reveal delay={260}>
                <h3 className="mt-2 font-display text-xl text-primary sm:text-2xl md:text-headline-md">
                  {about.title}
                </h3>
              </Reveal>

              <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                {about.vision.map((paragraph, index) => (
                  <Reveal key={paragraph.slice(0, 40)} delay={320 + index * 80} className={index > 0 ? 'hidden md:block' : undefined}>
                    <p className="font-body text-sm leading-relaxed text-on-surface-variant sm:text-body-md">{paragraph}</p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={480} className="mt-5 hidden border-l-4 border-accent pl-4 md:block sm:mt-6">
                <p className="font-body text-base italic text-primary sm:text-body-lg">&ldquo;{about.quote}&rdquo;</p>
              </Reveal>

              <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3">
                {about.highlights.map((item, index) => (
                  <Reveal key={item} delay={540 + index * 60} className={index >= 2 ? 'hidden md:block' : undefined}>
                    <li className="flex items-start gap-2 font-body text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-accent">check_circle</span>
                      {item}
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </RevealSection>
  );
}
