import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { Reveal, RevealSection } from '../ui/Reveal';

export function WhyChooseUs() {
  const { t } = useTranslation();
  const { specialities } = useContent();

  return (
    <RevealSection className="overflow-hidden px-container-mobile py-section">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-headline-md text-primary">{t('whyChooseUs.title')}</h2>
          <div className="accent-bar mx-auto mt-3 h-1 rounded-full bg-accent" />
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {specialities.map((item, index) => (
            <Reveal key={item.title} delay={index * 70} variant="scale">
              <div className="hover-lift h-full rounded-[24px] border border-surface-container-highest bg-white p-6">
                <span className="material-symbols-outlined mb-4 text-3xl text-primary">{item.icon}</span>
                <h4 className="mb-2 font-display text-label-sm font-bold text-primary">{item.title}</h4>
                <p className="text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
