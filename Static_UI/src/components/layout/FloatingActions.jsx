import { siteConfig } from '../../config/site';

export function FloatingActions() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`;

  return (
    <div className="pointer-events-none fixed bottom-8 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto flex rounded-full bg-secondary p-4 text-white shadow-lg transition-all hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <span className="material-symbols-outlined">chat</span>
      </a>
    </div>
  );
}
