import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { SiteLogo } from '../ui/SiteLogo';

export function Footer() {
  const { t } = useTranslation();
  const { siteInfo } = useContent();

  return (
    <footer className="border-t border-white/20 bg-primary/95 px-container-mobile py-3 text-on-primary backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <SiteLogo
            alt={siteInfo.logoAlt}
            className="h-[2.925rem] w-[2.925rem] sm:h-[3.25rem] sm:w-[3.25rem]"
            src={siteInfo.logo}
          />
          <div className="min-w-0 text-left">
            <p className="truncate font-display text-sm font-extrabold leading-tight sm:text-base">
              {siteInfo.shortName}
            </p>
            <p className="hidden truncate font-display text-[11px] text-on-primary/65 sm:block">
              {siteInfo.association}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:justify-end">
          <a
            href="#contact"
            className="inline-flex items-center gap-1 font-display text-label-sm font-semibold text-accent transition-colors hover:text-white"
          >
            {t('common.contactUs')}
            <span className="material-symbols-outlined text-base" aria-hidden>
              arrow_forward
            </span>
          </a>
          <p className="font-body text-xs text-on-primary/60">
            {t('common.copyright', { year: new Date().getFullYear(), name: siteInfo.shortName })}
          </p>
        </div>
      </div>
    </footer>
  );
}
