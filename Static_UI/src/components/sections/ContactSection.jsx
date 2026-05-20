import { siteInfo } from '../../data/content';
import { Reveal, RevealSection } from '../ui/Reveal';

export function ContactSection() {
  return (
    <RevealSection id="contact" className="bg-primary px-container-mobile pb-section pt-8 md:pt-10">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="mb-4 font-display text-headline-md text-white">Contact &amp; Admissions</h2>
          <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-accent" />
        </Reveal>
        <Reveal delay={100}>
          <p className="font-body text-body-md text-white/85">
            For registration, admissions, and enquiries contact {siteInfo.collegeName}.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <p className="mx-auto mt-6 max-w-xl font-body text-sm leading-relaxed text-white/80">{siteInfo.address}</p>
          <p className="mt-3 font-body text-sm text-white/80">
            <a href={`mailto:${siteInfo.email}`} className="text-accent hover:underline">
              {siteInfo.email}
            </a>
          </p>
          <p className="mt-2 font-body text-sm text-white/70">{siteInfo.timing.weekdays}</p>
          <p className="font-body text-sm text-white/70">{siteInfo.timing.sunday}</p>
        </Reveal>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {siteInfo.phones.map(({ number, name }, index) => (
            <Reveal key={number} delay={260 + index * 60}>
              <a
                href={`tel:+91${number.replace(/\D/g, '')}`}
                className="inline-block rounded-full border border-white/25 bg-white/10 px-5 py-2.5 font-display text-label-sm text-white transition-colors hover:border-accent hover:bg-accent/20"
              >
                {number} · {name}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
