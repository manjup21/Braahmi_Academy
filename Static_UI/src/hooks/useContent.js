import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  campusFacilityDefs,
  featuredTestimonialDef,
  galleryPhotoFiles,
  heroStatDefs,
  navLinkDefs,
  phoneDefs,
  programDefs,
  siteAssets,
  specialityDefs,
  staffDefs,
  testimonialDefs,
  upcomingProgramDefs,
  welcomeImage,
} from '../data/content';

const galleryBase = '/images/gallery';
const staffBase = '/images/staff';

function parseStudentFile(file) {
  if (!file) return { name: '', year: '', marks: '' };

  const base = file.replace(/\.[^.]+$/, '');
  const normalized = base.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

  // Supports both "2025-26" and "2023-2024" style ranges.
  const yearRe = /(\d{4}-\d{4}|\d{4}-\d{2})/;
  const yearMatch = yearRe.exec(normalized);
  const year = yearMatch ? yearMatch[1] : '';

  const marksRe = /(\d+)\s*-\s*(\d+)\s*$/;
  const marksMatch = marksRe.exec(normalized);
  const marks = (() => {
    if (!marksMatch) return '';
    const scored = Number(marksMatch[1]);
    let total = Number(marksMatch[2]);
    // Guard against obvious filename typos like "4600" instead of "600".
    if (Number.isFinite(total) && total > 1000) total = 600;
    if (!Number.isFinite(scored) || !Number.isFinite(total) || total <= 0) return '';
    return `${scored}/${total}`;
  })();

  let nameEndIndex;
  if (yearMatch) nameEndIndex = yearMatch.index;
  else if (marksMatch) nameEndIndex = marksMatch.index;

  let namePart = nameEndIndex !== undefined ? normalized.slice(0, nameEndIndex).trim() : normalized;

  // Remove common words from filenames.
  namePart = namePart
    .replace(/College\s*topper?/gi, '')
    .replace(/\bTopper\b/gi, '')
    .replace(/-+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Fallback if parsing was too aggressive.
  if (!namePart) namePart = normalized;

  return { name: namePart, year, marks };
}

export function useContent() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    const siteInfo = {
      collegeName: t('site.collegeName'),
      shortName: t('site.shortName'),
      association: `${t('site.association')} ${t('site.associationReg')}`,
      associationReg: t('site.associationReg'),
      tagline: t('site.tagline'),
      address: t('site.address'),
      email: siteAssets.email,
      logo: siteAssets.logo,
      logoAlt: t('site.logoAlt'),
      phones: phoneDefs.map(({ number, nameKey }) => ({
        number,
        name: t(`phones.${nameKey}`),
      })),
      timing: {
        weekdays: t('site.timingWeekdays'),
        sunday: t('site.timingSunday'),
      },
    };

    const galleryItems = t('gallery.items', { returnObjects: true });
    const galleryImages = galleryPhotoFiles.map((file, index) => {
      const meta = galleryItems[index] ?? {};
      const categoryKey = meta.category ?? 'campus';
      return {
        src: `${galleryBase}/${file}`,
        alt: meta.alt ?? '',
        category: t(`gallery.categories.${categoryKey}`),
        featured: index === 0,
      };
    });

    return {
      siteInfo,
      navLinks: navLinkDefs.map((link) => ({
        ...link,
        label: t(`nav.${link.id}`),
      })),
      notices: t('notices', { returnObjects: true }),
      heroStats: heroStatDefs.map((stat) => ({
        ...stat,
        label: t(`hero.stats.${stat.labelKey}`),
      })),
      welcomeSection: {
        heading: t('about.heading'),
        tagline: siteInfo.tagline,
        paragraphs: t('about.paragraphs', { returnObjects: true }),
        image: {
          ...welcomeImage,
          alt: t('about.imageAlt'),
        },
      },
      campusFacilities: campusFacilityDefs.map((facility) => ({
        ...facility,
        name: t(`campus.facilities.${facility.id}.name`),
        role: t(`campus.facilities.${facility.id}.role`),
        description: t(`campus.facilities.${facility.id}.description`),
      })),
      programs: programDefs.map((program) => ({
        ...program,
        title: t(`programs.items.${program.id}.title`),
        description: t(`programs.items.${program.id}.description`),
      })),
      upcomingPrograms: upcomingProgramDefs.map((program) => ({
        ...program,
        title: t(`programs.items.${program.id}.title`),
        description: t(`programs.items.${program.id}.description`),
      })),
      specialities: specialityDefs.map((item) => ({
        icon: item.icon,
        title: t(`whyChooseUs.items.${item.id}.title`),
        description: t(`whyChooseUs.items.${item.id}.description`),
      })),
      visionMission: {
        vision: t('visionMission.vision'),
        mission: t('visionMission.mission'),
      },
      featuredTestimonial: {
        ...featuredTestimonialDef,
        ...parseStudentFile(featuredTestimonialDef.file),
      },
      faculty: staffDefs.map((member) => ({
        ...member,
        image: `${staffBase}/${encodeURIComponent(member.file)}`,
        name: t(`faculty.items.${member.id}.name`),
        subject: t(`faculty.items.${member.id}.subject`),
        thought: t(`faculty.items.${member.id}.thought`),
      })),
      testimonials: testimonialDefs.map((item) => {
        const parsed = parseStudentFile(item.file);
        // Navya file currently doesn't include the year range in its filename.
        // Use an explicit override so the UI shows the correct academic year.
        const year = item.id === 'navya' ? '2023-2024' : parsed.year;

        return {
          ...item,
          ...parsed,
          year,
        };
      }),
      galleryImages,
    };
  }, [t, lang]);
}
