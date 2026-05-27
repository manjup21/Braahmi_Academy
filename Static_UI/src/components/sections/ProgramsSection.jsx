import { useTranslation } from 'react-i18next';
import { useContent } from '../../hooks/useContent';
import { Reveal, RevealSection } from '../ui/Reveal';

function ProgramCard({ program, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="hover-lift group relative h-full rounded-[32px] border border-transparent bg-white p-6 shadow-sm hover:border-primary/20">
        <div className="absolute right-6 top-6 text-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:text-primary/30">
          <span className={`material-symbols-outlined text-6xl ${program.filled ? 'material-symbols-filled' : ''}`}>
            {program.icon}
          </span>
        </div>
        <h3 className="mb-2 max-w-[85%] font-display text-lg font-bold text-primary sm:text-headline-md">{program.title}</h3>
        <p className="font-body text-body-md text-on-surface-variant">{program.description}</p>
      </div>
    </Reveal>
  );
}

export function ProgramsSection() {
  const { t } = useTranslation();
  const { programs, upcomingPrograms } = useContent();

  return (
    <RevealSection id="streams" className="bg-surface-container-low px-container-mobile pb-section pt-8 md:pt-10">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12 text-center">
          <h2 className="mb-2 font-display text-headline-md text-primary">{t('programs.title')}</h2>
          <p className="font-body text-body-md text-on-surface-variant">{t('programs.subtitle')}</p>
        </Reveal>

        <Reveal className="mb-6 text-center">
          <h3 className="font-display text-lg font-bold text-primary">{t('programs.presentTitle')}</h3>
          <div className="accent-bar mx-auto mt-2 h-1 rounded-full bg-accent" />
        </Reveal>
        <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {programs.map((program, index) => (
            <ProgramCard key={program.id} program={program} delay={100 + index * 80} />
          ))}
        </div>

        <Reveal className="mb-6 text-center">
          <h3 className="font-display text-lg font-bold text-primary">{t('programs.upcomingTitle')}</h3>
          <div className="accent-bar mx-auto mt-2 h-1 rounded-full bg-accent" />
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {upcomingPrograms.map((program, index) => (
            <ProgramCard key={program.id} program={program} delay={100 + index * 80} />
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
