import { siteConfig } from '../../config/site';
import { siteInfo } from '../../data/content';
import { scrollToSection } from '../../utils/scroll';

export function Header({ drawerOpen = false, onMenuOpen, onMenuClose }) {
  const toggleMenu = () => {
    if (drawerOpen) onMenuClose?.();
    else onMenuOpen?.();
  };

  return (
    <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/40 bg-surface/70 px-container-mobile py-4 shadow-[0_4px_30px_rgba(11,61,145,0.05)] backdrop-blur-xl">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={toggleMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low md:hidden"
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav"
        >
          <span className="material-symbols-outlined text-2xl">{drawerOpen ? 'close' : 'menu'}</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('home')}
          className="flex min-w-0 items-center gap-2 md:gap-3"
        >
          <img
            alt={`${siteInfo.shortName} logo`}
            className="h-9 w-9 shrink-0 rounded-lg object-cover md:h-11 md:w-11"
            src={siteInfo.logo}
          />
          <span className="font-display text-sm font-extrabold leading-tight tracking-tight text-primary sm:text-base md:text-[2.45rem] md:leading-[4.025rem] md:tracking-[-0.02em]">
            {siteInfo.shortName}
          </span>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="hidden items-center gap-1 rounded-full border border-primary/20 px-3 py-1.5 font-display text-label-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5 md:inline-flex lg:px-4"
        >
          <span className="material-symbols-outlined text-lg">mail</span>
          Enquire
        </a>
        <a
          href={siteConfig.applyFormUrl}
          className="rounded-full bg-accent px-3 py-1.5 font-display text-xs text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 sm:px-5 sm:py-2 sm:text-label-sm md:px-6"
        >
          Apply Now
        </a>
      </div>
    </header>
  );
}
