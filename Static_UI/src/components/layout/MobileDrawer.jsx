import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../config/site';
import { useContent } from '../../hooks/useContent';
import { LanguageSelector } from '../ui/LanguageSelector';
import { SiteLogo } from '../ui/SiteLogo';

export function MobileDrawer({ open, onClose, activeSection }) {
  const { t } = useTranslation();
  const { navLinks, siteInfo } = useContent();

  return (
    <>
      <button
        type="button"
        aria-label={t('common.closeMenu')}
        onClick={onClose}
        className={`fixed inset-0 z-55 bg-primary/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        tabIndex={open ? 0 : -1}
      />

      <aside
        id="mobile-nav"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-60 flex w-[min(100%,18.5rem)] max-w-[85vw] flex-col border-r border-surface-container-highest bg-surface shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-surface-container-highest px-4 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <SiteLogo
              alt={siteInfo.logoAlt}
              className="h-[3.25rem] w-[3.25rem]"
              src={siteInfo.logo}
            />
            <span className="truncate font-display text-base font-extrabold text-primary">
              {siteInfo.shortName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-primary transition-colors hover:bg-surface-container"
            aria-label={t('common.closeMenu')}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="relative z-10 shrink-0 border-b border-surface-container-highest px-4 py-3 md:hidden">
          <p className="mb-2 px-1 font-display text-label-sm font-semibold text-on-surface-variant">
            {t('language.label')}
          </p>
          <LanguageSelector fullWidth />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t('common.mainNav')}>
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-body text-base transition-colors ${
                      isActive
                        ? 'bg-primary font-semibold text-white shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[22px] ${
                        isActive ? 'text-white' : 'text-primary'
                      }`}
                    >
                      {link.icon}
                    </span>
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 flex-col gap-2 border-t border-surface-container-highest px-3 py-4">
          <a
            href={siteConfig.staffPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3.5 font-body text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent/90"
          >
            <span className="material-symbols-outlined text-[22px] text-white">login</span>
            {t('common.staffPortal')}
          </a>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl border border-primary/15 bg-surface-container-low px-4 py-3.5 font-body text-base font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            <span className="material-symbols-outlined text-[22px] text-primary">mail</span>
            {t('common.contactAdmissions')}
          </a>
        </div>
      </aside>
    </>
  );
}
