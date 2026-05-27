import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../config/site';

export function FloatingActions() {
  const { t } = useTranslation();
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`;

  return (
    <div className="pointer-events-none fixed bottom-8 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fab-enter pointer-events-auto flex rounded-full bg-secondary p-4 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label={t('common.chatWhatsApp')}
      >
        <span className="material-symbols-outlined">chat</span>
      </a>
    </div>
  );
}
