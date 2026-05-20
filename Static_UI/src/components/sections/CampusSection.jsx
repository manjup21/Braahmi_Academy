import { campusFacilities, siteInfo } from '../../data/content';
import { Carousel, SectionIntro } from '../ui/Carousel';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function CampusSection() {
  return (
    <RevealSection id="campus" className="bg-surface-container-low px-container-mobile pb-8 pt-section md:pb-10">
      <div className="mx-auto max-w-5xl">
        <SectionIntro
          title="Our Campus"
          subtitle={`Classrooms, laboratories, and digital library at ${siteInfo.shortName}.`}
        />

        <Carousel ariaLabel="Campus facilities" slideClassName="w-[min(85vw,300px)]">
          {campusFacilities.map((facility, index) => (
            <Reveal key={facility.id} delay={index * 100}>
              <article className="h-full overflow-hidden rounded-[28px] border border-surface-container-highest bg-white shadow-sm transition-shadow hover:shadow-md">
                <ContentImage
                  alt={facility.name}
                  className="h-44 w-full"
                  src={facility.image}
                />
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
