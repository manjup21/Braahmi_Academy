import { programs, upcomingPrograms } from '../../data/content';
import { Reveal, RevealSection } from '../ui/Reveal';

function ProgramCard({ program, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="group relative h-full rounded-[32px] border border-transparent bg-white p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
        <div className="absolute right-6 top-6 text-primary/10 transition-colors group-hover:text-primary/30">
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
  return (
    <RevealSection id="streams" className="bg-surface-container-low px-container-mobile pb-section pt-8 md:pt-10">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12 text-center">
          <h2 className="mb-2 font-display text-headline-md text-primary">Programs &amp; Coaching</h2>
          <p className="font-body text-body-md text-on-surface-variant">
            Present offerings and upcoming programmes at Braahmi Academy.
          </p>
        </Reveal>

        <Reveal className="mb-6 text-center">
          <h3 className="font-display text-lg font-bold text-primary">Present Events</h3>
          <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-accent" />
        </Reveal>
        <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {programs.map((program, index) => (
            <ProgramCard key={program.id} program={program} delay={100 + index * 80} />
          ))}
        </div>

        <Reveal className="mb-6 text-center">
          <h3 className="font-display text-lg font-bold text-primary">Upcoming Events</h3>
          <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-accent" />
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
