import { heroImage, heroStats, siteInfo } from '../../data/content';
import { siteConfig } from '../../config/site';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function HeroSection() {
  return (
    <RevealSection
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden px-container-mobile pb-20 pt-24"
    >
      <div className="absolute inset-0 z-0">
        <ContentImage alt={`${siteInfo.shortName} campus`} className="h-full w-full" src={heroImage} priority />
        <div className="absolute inset-0 bg-linear-to-r from-primary/92 via-primary/78 to-primary/55" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,32rem)_1fr] lg:items-stretch lg:gap-x-10 lg:gap-y-10 xl:gap-x-14">
        <div className="w-full lg:min-w-0">
          <Reveal>
            <p className="mb-2 font-display text-label-sm uppercase tracking-widest text-white/80">
              {siteInfo.association}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mb-1 font-display text-display-lg-mobile leading-tight text-white md:text-display-lg">
              {siteInfo.collegeName}
            </h1>
            <p className="mb-4 font-display text-lg tracking-wide text-white/70 sm:text-label-sm">
              Davanagere, Karnataka
            </p>
          </Reveal>
          <Reveal delay={160}>
            <p className="mb-8 max-w-lg font-body text-body-lg italic text-white/90 lg:mb-8">{siteInfo.tagline}</p>
          </Reveal>
          <div className="grid max-w-xl grid-cols-2 gap-3 sm:gap-4 lg:max-w-lg">
            {heroStats.map((stat, index) => (
              <Reveal key={stat.label} delay={240 + index * 90}>
                <div className="glass-card rounded-2xl p-4 transition-transform duration-300 hover:scale-[1.02]">
                  <h3
                    className={`font-display text-display-lg-mobile leading-none ${
                      stat.accent ? 'text-accent' : 'text-white'
                    }`}
                  >
                    {stat.value}
                  </h3>
                  <p className="font-display text-label-sm text-white/70">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={200} className="flex w-full flex-col lg:w-[90%] lg:justify-self-end [&>div]:h-full">
          <div className="relative flex min-h-52 w-full flex-col justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/10 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm lg:min-h-[21.6rem]">
            <h2 className="font-display text-2xl font-bold text-white">Admissions Open</h2>
            <p className="mt-3 font-body text-body-md text-white/85">
              NEET, JEE, Integrated PUC, crash courses, and foundation programmes. Contact us to schedule a campus visit.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={siteConfig.applyFormUrl}
                className="rounded-full bg-accent px-5 py-2.5 font-display text-label-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                Apply Now
              </a>
              <a
                href="#contact"
                className="rounded-full border border-white/30 px-5 py-2.5 font-display text-label-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Contact Us
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </RevealSection>
  );
}
