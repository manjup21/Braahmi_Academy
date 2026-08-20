/** Non-translatable assets and structural data (images, ids, icons, phone numbers). */
const campus = '/images/campus';
const galleryBase = '/images/gallery';
const staffBase = '/images/staff';
const studentsBase = '/images/students';

export const siteAssets = {
  email: 'braahmiacademy@gmail.com',
  logo: '/logo.png',
};

export const scrollSectionIds = [
  'home',
  'about',
  'campus',
  'faculty',
  'gallery',
  'testimonials',
  'contact',
];

export const navLinkDefs = [
  { id: 'home', icon: 'home', href: '#home' },
  { id: 'about', icon: 'school', href: '#about' },
  { id: 'campus', icon: 'domain', href: '#campus' },
  { id: 'gallery', icon: 'photo_library', href: '#gallery' },
  { id: 'contact', icon: 'mail', href: '#contact' },
];

export const phoneDefs = [
  { number: '7975268494', nameKey: 'office' },
  { number: '9901320840', nameKey: 'principal' },
];

export const heroImage = `${campus}/hero-campus.jpg`;

export const heroStatDefs = [
  { value: 'NEET', labelKey: 'neet', accent: true },
  { value: 'JEE', labelKey: 'jee', accent: false },
  { value: 'PUC', labelKey: 'puc', accent: true },
  { value: 'KCET', labelKey: 'kcet', accent: false },
];

export const welcomeImage = {
  src: `${campus}/academy-building.png`,
};

export const campusFacilityDefs = [
  { id: 'classroom', image: `${campus}/facility-classroom.jpg` },
  { id: 'laboratory', image: `${campus}/facility-laboratory.jpg` },
  { id: 'library', image: `${campus}/facility-library.jpg` },
];

export const specialityDefs = [
  { id: 'faculty', icon: 'groups' },
  { id: 'batches', icon: 'person' },
  { id: 'ac', icon: 'ac_unit' },
  { id: 'motivation', icon: 'emoji_events' },
  { id: 'hostel', icon: 'night_shelter' },
  { id: 'transport', icon: 'directions_bus' },
];

export const featuredTestimonialDef = {
  id: 'kenchanagouda',
  file: 'Kenchanagouda D 2025-26 College topper 580-600.jpeg',
  image: `${studentsBase}/${encodeURIComponent('Kenchanagouda D 2025-26 College topper 580-600.jpeg')}`,
};

export const staffDefs = [
  { id: 'sreenivasa-goud', file: 'Sreenivasa goud S- Principle.jpg' },
  { id: 'k-vinay-kumar', file: 'K VINAY KUMAR-Physics.jpg' },
  { id: 'ganesh-patel', file: 'GANESH PATEL K L -Chemistry_Lecture.jpg' },
  { id: 'salla-srinivas-reddy', file: 'Salla Srinivas Reddy-Biology.jpg' },
  { id: 'mv-manohar-rao', file: 'M V MANOHAR RAO- Mathemetics Lecture.jpg' },
  { id: 'ashok-ks', file: 'Ashok K S-English_Lecture.jpg' },
  { id: 'dr-mallikarjuna-b', file: 'Dr Mallikarjuna B-Kannada_Lecture.jpg' },
];

export const testimonialDefs = [
  {
    id: 'nachikethan',
    file: 'Nachikethan 2024-25 College Topper 574-600.jpg',
    image: `${studentsBase}/${encodeURIComponent('Nachikethan 2024-25 College Topper 574-600.jpg')}`,
  },
  {
    id: 'sanjana-m-raikar',
    file: 'SANJANA M RAIKAR 2022-23 College topper 581-4600.jpg',
    image: `${studentsBase}/${encodeURIComponent('SANJANA M RAIKAR 2022-23 College topper 581-4600.jpg')}`,
  },
  {
    id: 'navya',
    file: 'Navya A-College_Topper-582-600.jpg',
    image: `${studentsBase}/${encodeURIComponent('Navya A-College_Topper-582-600.jpg')}`,
  },
];

export const galleryPhotoFiles = [
  'gallery-01-building.png',
  'gallery-02-render.jpg',
  'gallery-03-classroom.jpg',
  'gallery-04-exam-hall.jpg',
  'gallery-05-corridor.jpg',
  'gallery-07-assembly.jpg',
  'gallery-08-flag-ceremony.jpg',
  'gallery-09-independence-day.jpg',
  'gallery-10-student-formation.jpg',
  'gallery-11-welcome.jpg',
  'gallery-12-march-past.jpg',
];

export const mapImage = `${campus}/hero-campus.jpg`;
