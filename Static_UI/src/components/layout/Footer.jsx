import { siteConfig } from '../../config/site';
import { siteInfo } from '../../data/content';

export function Footer() {
  const telLinks = siteInfo.phones.map(({ number, name }) => {
    const digits = number.replace(/\D/g, '');
    return {
      label: `${number} · ${name}`,
      href: `tel:+91${digits}`,
    };
  });

  return (
    <footer className="mt-section-gap flex w-full flex-col items-center gap-8 rounded-t-[32px] bg-primary px-container-mobile py-12 text-center text-on-primary">
      <div className="flex flex-col items-center gap-3">
        <img alt={`${siteInfo.shortName} logo`} className="h-14 w-14 rounded-lg object-cover" src={siteInfo.logo} />
        <h2 className="font-display text-display-lg-mobile font-black text-on-primary">{siteInfo.collegeName}</h2>
        <p className="font-display text-label-sm text-on-primary/70">{siteInfo.association}</p>
      </div>

      <p className="max-w-md font-body text-sm leading-relaxed text-on-primary/80">{siteInfo.address}</p>

      <div className="flex flex-wrap justify-center gap-3">
        {telLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="rounded-full border border-white/20 px-4 py-2 font-display text-label-sm text-on-primary transition-colors hover:border-accent hover:text-accent"
          >
            {label}
          </a>
        ))}
      </div>

      <a
        href={`mailto:${siteConfig.contactEmail}`}
        className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/15 px-5 py-2.5 font-display text-label-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
      >
        <span className="material-symbols-outlined text-lg">mail</span>
        {siteConfig.contactEmail}
      </a>

      <div className="mt-4 flex flex-col gap-1 font-body text-base opacity-60">
        <p>© {new Date().getFullYear()} {siteInfo.shortName}.</p>
        <p>{siteInfo.tagline}</p>
      </div>
    </footer>
  );
}
