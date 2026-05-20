const unsplash = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`;

export const siteInfo = {
  collegeName: 'Braahmi Academy',
  shortName: 'Braahmi Academy',
  association: 'Braahmi Educational And Charitable Trust (R.)',
  tagline: 'Treading the untrodden..',
  address:
    'Opp BIET Gate Bus Stop, 2nd Main, Sri Swami Vivekanada Badavane, Biet Road-Biet, Davangere, 577005, Karnataka',
  email: 'braahmiacademy@gmail.com',
  phones: [
    { number: '9901320840', name: 'Primary' },
    { number: '7975268494', name: 'Office' },
    { number: '9964868537', name: 'Admissions' },
    { number: '08192222566', name: 'Landline' },
  ],
  timing: {
    weekdays: 'Mon - Sat : 08:00 AM - 08:00 PM',
    sunday: 'Sun : 08:00 AM - 04:00 PM',
  },
  logo: unsplash('photo-1562774053-701939374585', 128, 128),
};

export const navLinks = [
  { id: 'home', label: 'Home', icon: 'home', href: '#home' },
  { id: 'about', label: 'About', icon: 'school', href: '#about' },
  { id: 'campus', label: 'Campus', icon: 'domain', href: '#campus' },
  { id: 'streams', label: 'Programs', icon: 'account_tree', href: '#streams' },
  { id: 'gallery', label: 'Gallery', icon: 'photo_library', href: '#gallery' },
  { id: 'contact', label: 'Contact', icon: 'mail', href: '#contact' },
];

export const scrollSectionIds = [
  'home',
  'about',
  'campus',
  'streams',
  'gallery',
  'testimonials',
  'contact',
];

export const heroImage = unsplash('photo-1562774053-701939374585', 1600, 900);

export const heroStats = [
  { value: 'NEET', label: 'Long-term Coaching', accent: true },
  { value: 'JEE', label: 'IIT Preparation', accent: false },
  { value: 'PUC', label: 'Integrated Science', accent: true },
  { value: '50', label: 'Students per Batch', accent: false },
];

export const notices = [
  'Integrated PU with NEET/JEE coaching now open for admissions.',
  'Exclusive crash courses for 10th, I PUC & II PUC PCMB board exams.',
  'NEET long-term coaching with AC classrooms and hostel facilities.',
  'Special English coaching for 2nd PU Arts & Commerce students.',
  'JEE/NEET foundation classes from 6th standard — enroll early.',
];

export const about = {
  name: siteInfo.association,
  title: 'Welcome to Braahmi Academy',
  role: 'Managed by Braahmi Educational And Charitable Trust (R.)',
  image: heroImage,
  vision: [
    'Braahmi Academy specializes in encouraging quality education and holistic growth of students — discipline, morality, patriotism, talents, and all-round development.',
    'Students are mentored to succeed academically and beyond: curricular, co-curricular, science & technology, culture, tradition, and pro-academic activities at district, state, and national levels.',
    'Operating from Davanagere, Karnataka with well-qualified faculty, AC classrooms, hostel for boys & girls, and transport facility.',
  ],
  quote: siteInfo.tagline,
  highlights: [
    'Well qualified and experienced faculty',
    '50 students per batch — individual attention',
    'Well equipped AC classrooms',
    'Hostel with homely atmosphere',
    'Transport facility available',
  ],
};

export const campusFacilities = [
  {
    id: 'classroom',
    name: 'Classroom',
    role: 'AC Classrooms',
    description: 'Spacious, clean and well maintained classrooms with air conditioning for focused learning.',
    image: unsplash('photo-1580582932707-520aed937b7d', 600, 450),
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    role: 'Science Labs',
    description: 'Physics, Chemistry and Biology labs equipped with necessary instruments for hands-on learning.',
    image: unsplash('photo-1532094347934-43c454177544', 600, 450),
  },
  {
    id: 'library',
    name: 'Digital Library',
    role: 'Study Resources',
    description: 'Open Wi‑Fi and standard materials for competitive exams and self-paced preparation.',
    image: unsplash('photo-1521587760476-6c12a4b040da', 600, 450),
  },
];

export const programs = [
  {
    id: 'integrated-pu',
    title: 'Integrated PU with NEET/JEE',
    description: 'Pre-University science programme combined with dedicated NEET and JEE preparation.',
    icon: 'biotech',
    filled: true,
  },
  {
    id: 'crash-course',
    title: 'Exclusive Crash Courses',
    description: 'Intensive coaching for 10th Std, I PUC, and II PUC PCMB board examinations.',
    icon: 'bolt',
    filled: false,
  },
  {
    id: 'neet-long',
    title: 'NEET Long-term Coaching',
    description: 'Structured long-term NEET programme with weekly tests, analysis, and mentorship.',
    icon: 'menu_book',
    filled: true,
  },
  {
    id: 'english-coaching',
    title: 'English & Skill Training',
    description: 'Special English classes for 2nd PU Arts & Commerce and handwriting skill training.',
    icon: 'edit_note',
    filled: false,
  },
];

export const upcomingPrograms = [
  {
    id: 'foundation',
    title: 'JEE/NEET Foundation (6th Std+)',
    description: 'Early foundation classes building strong concepts from middle school onwards.',
    icon: 'school',
    filled: true,
  },
  {
    id: 'nata-kvpy',
    title: 'NATA / KVPY / NTSE / NMMS',
    description: 'Coaching for architecture entrance, KVPY, NTSE, NMMS, and Navodaya/Morarji exams.',
    icon: 'architecture',
    filled: false,
  },
  {
    id: 'govt-exams',
    title: 'KPSC & Government Exams',
    description: 'SDA, FDA, PSI, Banking, RRB, KAS & IAS preparation with expert guidance.',
    icon: 'gavel',
    filled: true,
  },
  {
    id: 'skills',
    title: 'Skill Development Training',
    description: 'Value-added skill development programmes for holistic career readiness.',
    icon: 'psychology',
    filled: false,
  },
];

export const specialities = [
  {
    icon: 'groups',
    title: 'Experienced Faculty',
    description: 'Well qualified and experienced faculty for all subjects.',
  },
  {
    icon: 'person',
    title: 'Small Batches',
    description: '50 students per batch with 100% attention and individual concentration.',
  },
  {
    icon: 'ac_unit',
    title: 'AC Classrooms',
    description: 'Well equipped air-conditioned classrooms for comfortable learning.',
  },
  {
    icon: 'emoji_events',
    title: 'Motivational Sessions',
    description: 'Result-oriented classes and motivational sessions by achievers.',
  },
  {
    icon: 'night_shelter',
    title: 'Hostel Facility',
    description: 'Hostel for boys and girls with a homely atmosphere.',
  },
  {
    icon: 'directions_bus',
    title: 'Transport',
    description: 'Safe and reliable transport facility for day scholars.',
  },
];

export const visionMission = {
  vision:
    'To be an Ideal institution for quality education; simultaneously developing human value, our tradition, culture and holistic development for students.',
  mission:
    'To be second parents in the campus and first parents in academics for our students and prepare them to reach their goals by providing comprehensive learning experience.',
};

export const featuredTestimonial = {
  id: 'sneha',
  name: 'Sneha A N',
  quote: 'For the prefix in my name, the sole responsibility is them. Thank you so very much.',
  image: unsplash('photo-1523240795612-9a054b0db644', 400, 500),
};

export const testimonials = [
  {
    id: 'rahul',
    name: 'Rahul K',
    quote:
      'Braahmi Academy gave me the discipline and guidance I needed for NEET. The faculty truly cares about every student.',
    image: unsplash('photo-1507003211169-0a1dd7228f2d', 400, 500),
  },
  {
    id: 'priya',
    name: 'Priya M',
    quote:
      'Excellent campus facilities and mentorship. My daughter has grown confident in academics and co-curricular activities.',
    image: unsplash('photo-1494790108377-be9c29b29330', 400, 500),
  },
  {
    id: 'arjun',
    name: 'Arjun S',
    quote:
      'Integrated PUC with JEE coaching helped me stay focused. The weekly tests and analysis made a real difference.',
    image: unsplash('photo-1500648767791-00dcc994a43e', 400, 500),
  },
];

export const galleryImages = [
  {
    src: unsplash('photo-1523050854058-8df90110c9f1', 1200, 700),
    alt: 'Students at Braahmi Academy',
    category: 'Campus',
    featured: true,
  },
  {
    src: unsplash('photo-1503676260728-1c00da280a02', 600, 600),
    alt: 'Classroom learning',
    category: 'Classroom',
  },
  {
    src: unsplash('photo-1427504494785-3a9ca7044f18', 600, 600),
    alt: 'Graduation celebration',
    category: 'Events',
  },
  {
    src: unsplash('photo-1541339907198-e08756dedf3d', 600, 600),
    alt: 'Campus building',
    category: 'Campus',
  },
  {
    src: unsplash('photo-1517486808906-6ca8b3f0484a', 600, 600),
    alt: 'Group study',
    category: 'Students',
  },
  {
    src: unsplash('photo-1524178232363-1fb2b075b655', 600, 600),
    alt: 'Lecture session',
    category: 'Academics',
  },
  {
    src: unsplash('photo-1571260899304-425eee4c894a', 600, 600),
    alt: 'Library resources',
    category: 'Library',
  },
];

export const mapImage = unsplash('photo-1524661135-423995f22d0b', 1600, 600);
