import { useTranslation } from 'react-i18next';
import { mapImage } from '../../data/content';
import { siteConfig } from '../../config/site';
import { useContent } from '../../hooks/useContent';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function ContactSection() {
  const { t } = useTranslation();
  const { siteInfo } = useContent();

  return (
    <RevealSection id="contact" className="overflow-hidden bg-primary">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
        <div className="flex flex-col justify-center px-container-mobile py-8 md:py-10 lg:py-12">
          <Reveal>
            <h2 className="mb-4 font-display text-headline-md text-white">{t('contact.title')}</h2>
            <div className="accent-bar mb-6 h-1 w-12 rounded-full bg-accent" />
          </Reveal>
          <Reveal delay={100}>
            <p className="font-body text-body-md text-white/85">
              {t('contact.intro', { name: siteInfo.collegeName })}
            </p>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-md font-body text-sm leading-relaxed text-white/80">{siteInfo.address}</p>
            <p className="mt-3 font-body text-sm text-white/80">
              <a href={`mailto:${siteInfo.email}`} className="text-accent hover:underline">
                {siteInfo.email}
              </a>
            </p>
            <p className="mt-2 font-body text-sm text-white/70">{siteInfo.timing.weekdays}</p>
            <p className="font-body text-sm text-white/70">{siteInfo.timing.sunday}</p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {siteInfo.phones.map(({ number, name }, index) => (
              <Reveal key={number} delay={260 + index * 60}>
                <a
                  href={`tel:+91${number.replace(/\D/g, '')}`}
                  className="inline-block rounded-full border border-white/25 bg-white/10 px-5 py-2.5 font-display text-label-sm text-white transition-all duration-300 hover:scale-[1.04] hover:border-accent hover:bg-accent/20"
                >
                  {number} · {name}
                </a>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="relative min-h-56 sm:min-h-64 lg:min-h-full">
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute inset-0 flex items-center justify-center overflow-hidden bg-surface-container-highest"
          >
            <ContentImage
              alt={t('common.mapAlt')}
              className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              src={mapImage}
            />
            <div
              className="absolute inset-0 bg-primary/25 transition-colors duration-500 group-hover:bg-primary/35"
              aria-hidden
            />
            <span className="glass-card hover-lift absolute mx-4 flex max-w-xs items-center justify-center gap-2 rounded-2xl px-5 py-3 text-center transition-transform duration-500 group-hover:scale-[1.02] sm:max-w-sm">
              <span
                className="material-symbols-outlined shrink-0 text-primary transition-transform duration-300 group-hover:scale-110"
                aria-hidden
              >
                location_on
              </span>
              <span className="font-display text-label-sm font-bold text-primary">{t('footer.openMap')}</span>
            </span>
          </a>
        </div>
      </div>
    </RevealSection>
  );
}
