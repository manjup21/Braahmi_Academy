import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { FloatingActions } from './components/layout/FloatingActions';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { NoticeTicker } from './components/sections/NoticeTicker';
import { AboutSection } from './components/sections/AboutSection';
import { CampusSection } from './components/sections/CampusSection';
import { ProgramsSection } from './components/sections/ProgramsSection';
import { WhyChooseUs } from './components/sections/WhyChooseUs';
import { VisionMissionSection } from './components/sections/VisionMissionSection';
import { FacultySection } from './components/sections/FacultySection';
import { FeaturedTestimonial } from './components/sections/FeaturedTestimonial';
import { TestimonialsSection } from './components/sections/TestimonialsSection';
import { CampusGallery } from './components/sections/CampusGallery';
import { ContactSection } from './components/sections/ContactSection';
import { scrollSectionIds } from './data/content';

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const updateActiveSection = useCallback(() => {
    const offset = 120;
    let current = 'home';
    for (const id of scrollSectionIds) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = id;
      }
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, [updateActiveSection]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <>
      <Header
        drawerOpen={drawerOpen}
        onMenuOpen={() => setDrawerOpen(true)}
        onMenuClose={() => setDrawerOpen(false)}
      />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} activeSection={activeSection} />
      <FloatingActions />
      <main>
        <HeroSection />
        <NoticeTicker />
        <AboutSection />
        <CampusSection />
        <ProgramsSection />
        <WhyChooseUs />
        <VisionMissionSection />
        <FacultySection />
        <FeaturedTestimonial />
        <TestimonialsSection />
        <CampusGallery />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
