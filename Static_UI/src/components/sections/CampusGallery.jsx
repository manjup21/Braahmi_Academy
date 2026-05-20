import { galleryImages, siteInfo } from '../../data/content';
import { ContentImage } from '../ui/ContentImage';
import { Reveal, RevealSection } from '../ui/Reveal';

export function CampusGallery() {
  const featured = galleryImages.find((img) => img.featured) ?? galleryImages[0];
  const rest = galleryImages.filter((img) => img.src !== featured.src);

  return (
    <RevealSection id="gallery" className="px-container-mobile py-section">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-headline-md text-primary">Our Gallery</h2>
          <p className="mt-3 font-body text-body-md text-on-surface-variant">
            A glimpse of campus life, classrooms, and events at {siteInfo.shortName}.
          </p>
        </Reveal>

        <Reveal delay={100} className="mb-3 overflow-hidden rounded-[24px]">
          <div className="relative aspect-16/10 md:aspect-21/9">
            <ContentImage
              alt={featured.alt}
              className="h-full w-full transition-transform duration-500 hover:scale-[1.03]"
              src={featured.src}
            />
            <span className="absolute bottom-4 left-4 rounded-full bg-primary/90 px-4 py-1.5 font-display text-label-sm text-white">
              {featured.category}
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {rest.map((img, index) => (
            <Reveal key={img.src} delay={180 + index * 50}>
              <div className="group relative aspect-square overflow-hidden rounded-[20px] md:aspect-4/3">
                <ContentImage
                  alt={img.alt}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  src={img.src}
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wide text-white md:opacity-100">
                  {img.category}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
