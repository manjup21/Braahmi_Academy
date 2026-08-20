import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../config/site';
import { useContent } from '../../hooks/useContent';
import { scrollToSection } from '../../utils/scroll';
import { LanguageSelector } from '../ui/LanguageSelector';
import { SiteLogo } from '../ui/SiteLogo';

export function Header({ drawerOpen = false, onMenuOpen, onMenuClose }) {
  const { t } = useTranslation();
  const { siteInfo } = useContent();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => {
    if (drawerOpen) onMenuClose?.();
    else onMenuOpen?.();
  };

  return (
    <header
      className={`site-header fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/40 bg-surface/70 px-container-mobile py-4 shadow-[0_4px_30px_rgba(74,50,40,0.08)] backdrop-blur-xl ${scrolled ? 'is-scrolled' : ''}`}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={toggleMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low md:hidden"
          aria-label={drawerOpen ? t('common.closeMenu') : t('common.openMenu')}
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
          <SiteLogo
            alt={siteInfo.logoAlt}
            className="header-logo h-[3.25rem] w-[3.25rem] transition-all duration-300 md:h-[3.9rem] md:w-[3.9rem]"
            src={siteInfo.logo}
          />
          <span className="header-title font-display text-sm font-extrabold leading-tight tracking-tight text-primary transition-all duration-300 sm:text-base md:text-[2.45rem] md:leading-[4.025rem] md:tracking-[-0.02em]">
            {siteInfo.shortName}
          </span>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <LanguageSelector className="shrink-0" />
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="hidden items-center gap-1 rounded-full border border-primary/20 px-3 py-1.5 font-display text-label-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5 md:inline-flex lg:px-4"
        >
          <span className="material-symbols-outlined text-lg">mail</span>
          {t('common.enquire')}
        </a>
        <a
          href={siteConfig.applyFormUrl}
          className="rounded-full bg-accent px-3 py-1.5 font-display text-xs text-white shadow-[0_0_20px_rgba(193,120,23,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(193,120,23,0.45)] active:scale-95 sm:px-5 sm:py-2 sm:text-label-sm md:px-6"
        >
          {t('common.applyNow')}
        </a>
      </div>
    </header>
  );
}
