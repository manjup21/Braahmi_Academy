import { siteConfig } from '../../config/site';
import { mapImage, siteInfo } from '../../data/content';
import { ContentImage } from '../ui/ContentImage';

export function MapSection() {
  return (
    <section className="relative h-80 w-full">
      <a
        href={siteConfig.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center overflow-hidden bg-surface-container-highest"
      >
        <ContentImage alt="Campus location map" className="h-full w-full opacity-60" src={mapImage} />
        <div className="absolute inset-0 bg-primary/25" aria-hidden />
        <span className="glass-card absolute mx-4 flex max-w-md flex-col items-center gap-2 rounded-2xl px-6 py-4 text-center sm:flex-row sm:text-left">
          <span className="material-symbols-outlined shrink-0 text-primary">location_on</span>
          <span className="font-display text-label-sm font-bold leading-snug text-primary">{siteInfo.address}</span>
        </span>
      </a>
    </section>
  );
}
