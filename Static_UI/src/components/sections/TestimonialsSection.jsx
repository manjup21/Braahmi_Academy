import { testimonials } from '../../data/content';
import { Carousel, SectionIntro } from '../ui/Carousel';
import { PersonAvatar } from '../ui/PersonAvatar';
import { Reveal, RevealSection } from '../ui/Reveal';

export function TestimonialsSection() {
  return (
    <RevealSection id="testimonials" className="bg-primary px-container-mobile pb-8 pt-8 md:pb-10 md:pt-10">
      <div className="mx-auto max-w-5xl">
        <SectionIntro
          theme="dark"
          title="More Testimonials"
          subtitle="What students and parents say about Braahmi Academy."
        />

        <Carousel
          ariaLabel="Student and parent testimonials"
          theme="dark"
          fillWidth
          scrollStep={1}
          slideClassName="w-[min(88vw,300px)] lg:w-[calc((100%-3.75rem)/3)]"
        >
          {testimonials.map((item, index) => (
            <Reveal key={item.id} delay={index * 90}>
              <article className="flex h-full min-h-72 flex-col rounded-[28px] border border-white/20 bg-white/12 p-6 text-center">
                <PersonAvatar
                  name={item.name}
                  image={item.image}
                  className="mx-auto h-24 w-24 shrink-0 rounded-full border-4 border-accent shadow-lg"
                />
                <h3 className="mt-4 font-display text-lg font-bold text-white">{item.name}</h3>
                <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-white/85">&ldquo;{item.quote}&rdquo;</p>
              </article>
            </Reveal>
          ))}
        </Carousel>
      </div>
    </RevealSection>
  );
}
