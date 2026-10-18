// ─────────────────────────────────────────────────────────────────────────────
// Dizon AC — Landing Page Static Data
// All arrays use explicit TypeScript interfaces — no "as const" narrowing.
// ─────────────────────────────────────────────────────────────────────────────

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface PhoneNumber {
  network: string
  number: string
  href: string
}

export interface NavLink {
  label: string
  href: string
}

export interface HeroSlide {
  image: string
  alt: string
  caption: string
}

export type ServiceIcon = 'install' | 'clean' | 'repair' | 'relocate' | 'freon' | 'vrf'

export interface Service {
  id: string
  label: string
  /** Matching option in the booking form's service dropdown */
  formOption: string
  icon: ServiceIcon
  tagline: string
  description: string
  duration: string
  note: string
}

export type ValueIcon = 'shield' | 'star' | 'peso' | 'heart'

export interface WhyPoint {
  icon: ValueIcon
  title: string
  body: string
}

export interface Step {
  title: string
  body: string
}

export interface CoverageArea {
  city: string
  note: string
  /** Map marker position (WGS84) */
  lat: number
  lng: number
}

export interface MediaItem {
  src: string
  alt: string
}

export interface Review {
  stars: number
  text: string
  name: string
  location: string
  service: string
}

export interface Faq {
  q: string
  a: string
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterLinks {
  [section: string]: FooterLink[]
}

// ── Business ─────────────────────────────────────────────────────────────────

export const BUSINESS = {
  name: 'Dizon Aircon & Refrigeration Services',
  about:
    'Dizon Aircon & Refrigeration Services installs, cleans and repairs air conditioners for homes, offices and commercial buildings across Metro Manila. Free check-up and estimate on every job.',
  phone: { display: '0917 780 0051', href: 'tel:+639177800051' },
  sms: 'sms:+639177800051',
  email: 'dizonairconditioningservices@gmail.com',
  address: 'Bambang, Taguig City',
  mapHref: 'https://maps.google.com/?q=Bambang+Taguig',
  hours: 'Mon to Sat: 8:00 AM – 6:00 PM',
}

export const PHONE_NUMBERS: PhoneNumber[] = [
  { network: 'Globe', number: '0917 780 0051', href: 'tel:+639177800051' },
  { network: 'Globe', number: '0945 849 0554', href: 'tel:+639458490554' },
  { network: 'Smart', number: '0999 966 5008', href: 'tel:+639999665008' },
  { network: 'PLDT',  number: '(02) 851522',   href: 'tel:+6328851522'   },
]

export const NAV_LINKS: NavLink[] = [
  { label: 'Our Services', href: '#services' },
  { label: 'How It Works', href: '#how'      },
  { label: 'Maintenance',  href: '#pms'      },
  { label: 'Our Work',     href: '#work'     },
  { label: 'Coverage',     href: '#coverage' },
  { label: 'FAQ',          href: '#faq'      },
]

// ── Hero ─────────────────────────────────────────────────────────────────────

export const HERO = {
  headline: ['Aircon care,', 'done properly.'],
  sub: 'Cleaning, repair and installation for homes and businesses across Metro Manila — with a free check-up and written estimate before any work starts.',
  facts: [
    'Free check-up & estimate',
    'All brands, inverter & non-inverter',
    'Homes, condos & commercial',
  ],
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    image: '/gallery/photo_2_2026-06-13_16-16-26.jpg',
    alt: 'Dizon technician deep-cleaning a ceiling-mounted aircon',
    caption: 'Deep cleaning, ceiling-mounted unit',
  },
  {
    image: '/gallery/photo_4_2026-06-13_16-16-27.jpg',
    alt: 'Dizon technician testing an outdoor unit with a multimeter',
    caption: 'Electrical diagnosis, condo outdoor unit',
  },
  {
    image: '/gallery/photo_6_2026-06-13_16-16-27.jpg',
    alt: 'Dizon technician beside a newly installed split-type aircon',
    caption: 'New split-type installation',
  },
]

// ── Services ─────────────────────────────────────────────────────────────────

export const SERVICES: Service[] = [
  {
    id: 'cleaning',
    formOption: 'Cleaning / PMS',
    label: 'Cleaning / PMS',
    icon: 'clean',
    tagline: 'Back to peak performance.',
    description:
      'Professional deep cleaning and Preventive Maintenance Service (PMS). We disassemble the unit, clean all internal components, flush the evaporator coil, clear the drain line, and reassemble.',
    duration: '1–2 hrs',
    note: 'Recommended every 3–6 months',
  },
  {
    id: 'repair',
    formOption: 'Repair',
    label: 'Repair',
    icon: 'repair',
    tagline: 'Diagnosed and fixed, not guessed.',
    description:
      'Faulty PCB boards, compressor issues, fan motor failure, refrigerant leaks and electrical faults. All brands serviced.',
    duration: '1–3 hrs',
    note: 'Free check-up & estimate before any repair',
  },
  {
    id: 'installation',
    formOption: 'Installation',
    label: 'Installation',
    icon: 'install',
    tagline: 'Any unit. Any brand. Done right.',
    description:
      'Window, split, cassette, ducted and multi-split systems. Proper mounting, electrical connection and full pressure test. Inverter and non-inverter.',
    duration: '2–4 hrs',
    note: 'Free site assessment before we start',
  },
  {
    id: 'freon',
    formOption: 'Freon Charging',
    label: 'Freon Charging',
    icon: 'freon',
    tagline: 'Restore your cooling power.',
    description:
      'We recharge with the correct refrigerant (R22, R32, R410A) to manufacturer spec, and find the source of any leak before refilling.',
    duration: '30–90 min',
    note: 'Leak check included with every charge',
  },
  {
    id: 'relocation',
    formOption: 'Relocation / Pulldown',
    label: 'Relocation',
    icon: 'relocate',
    tagline: 'Moving? Your AC moves too.',
    description:
      'Safe pulldown, transport and reinstallation at your new location. We also handle permanent dismantling and removal.',
    duration: '2–5 hrs',
    note: 'Includes full reinstall check',
  },
  {
    id: 'vrf',
    formOption: 'VRF / VRV Service',
    label: 'VRF / VRV',
    icon: 'vrf',
    tagline: 'Commercial systems, expert hands.',
    description:
      'Leak detection, error code diagnosis and repairs for Daikin, Mitsubishi, LG and other VRF / VRV systems in commercial spaces.',
    duration: 'By assessment',
    note: 'Offices, malls & commercial buildings',
  },
]

// ── Values ────────────────────────────────────────────────────────────────────

export const WHY_POINTS: WhyPoint[] = [
  {
    icon: 'shield',
    title: 'Safe',
    body: 'Every job follows proper safety procedures. No shortcuts — your home and our team stay protected.',
  },
  {
    icon: 'star',
    title: 'Quality',
    body: 'We take pride in clean, precise work. Every installation and repair is done to last.',
  },
  {
    icon: 'peso',
    title: 'Affordable',
    body: 'Transparent, no-surprise quotes. Free written estimate before any work begins — always.',
  },
  {
    icon: 'heart',
    title: 'Customer-first',
    body: 'Fast response and courteous technicians. We return free if any issue persists.',
  },
]

// ── How booking works ─────────────────────────────────────────────────────────

export const STEPS: Step[] = [
  { title: 'Book',    body: 'Call, text, or fill out the form. We get back to you fast to confirm your schedule.' },
  { title: 'Inspect', body: 'Our technician checks your unit and gives you a free estimate before any work starts.' },
  { title: 'Service', body: 'We clean, repair or install, then test everything with you before we leave.' },
  { title: 'Follow-up', body: 'If the same issue comes back, we return and fix it free of charge.' },
]

// ── Brands ────────────────────────────────────────────────────────────────────

export interface Brand {
  name: string
  logo: string
  /** Logo width ÷ height, used to optically balance logo sizes */
  ratio: number
}

// Official logos in public/brands (sourced from Wikimedia Commons and brand sites).
// Condura is serviced too but left out here: no usable logo file was available.
export const BRANDS: Brand[] = [
  { name: 'Daikin',     logo: '/brands/daikin.svg',     ratio: 4.76 },
  { name: 'Carrier',    logo: '/brands/carrier.svg',    ratio: 2.52 },
  { name: 'Mitsubishi Electric', logo: '/brands/mitsubishi.svg', ratio: 3.43 },
  { name: 'Panasonic',  logo: '/brands/panasonic.svg',  ratio: 6.54 },
  { name: 'LG',         logo: '/brands/lg.svg',         ratio: 2.27 },
  { name: 'Samsung',    logo: '/brands/samsung.svg',    ratio: 6.54 },
  { name: 'Koppel',     logo: '/brands/koppel.svg',     ratio: 3.39 },
  { name: 'Kolin',      logo: '/brands/kolin.svg',      ratio: 2.85 },
  { name: 'AUX',        logo: '/brands/aux-logo.svg',        ratio: 3.81 },
  { name: 'Trane',      logo: '/brands/trane.svg',      ratio: 3.01 },
  { name: 'Hitachi',    logo: '/brands/hitachi.svg',    ratio: 6.27 },
]

// ── Maintenance (PMS) ─────────────────────────────────────────────────────────

export const PMS_POINTS: string[] = [
  'Recommended every 3–6 months for homes',
  'Full disassembly, coil flush and drain line clearing',
  'Keeps your unit cold and easier on your electric bill',
  'Catches small problems before they turn into costly repairs',
]

// ── Guarantee ─────────────────────────────────────────────────────────────────

export const GUARANTEE: string[] = [
  'Free check-up and written estimate before any work',
  'Experienced technicians for homes and commercial sites',
  'Clean, tidy work with proper safety practices',
  'We come back free if the same issue persists',
]

// ── Our work (public/gallery) ─────────────────────────────────────────────────

export const GALLERY_PHOTOS: MediaItem[] = [
  { src: '/gallery/photo_7_2026-06-13_16-16-27.jpg', alt: 'Servicing a Trane chiller at a commercial site' },
  { src: '/gallery/photo_3_2026-06-13_16-16-26.jpg', alt: 'Working on a Mitsubishi inverter outdoor unit' },
  { src: '/gallery/photo_5_2026-06-13_16-16-27.jpg', alt: 'Checking refrigerant pressure on a Carrier unit' },
  { src: '/gallery/photo_2_2026-06-13_16-16-26.jpg', alt: 'Deep-cleaning a ceiling-mounted unit' },
]

export const GALLERY_VIDEOS: MediaItem[] = [
  { src: '/gallery/IMG_1634.MP4', alt: 'AC cleaning video' },
  { src: '/gallery/IMG_1636.MP4', alt: 'AC repair video'   },
]

// ── Coverage ──────────────────────────────────────────────────────────────────

export const COVERAGE: CoverageArea[] = [
  { city: 'Taguig City', note: 'Home base',    lat: 14.5267, lng: 121.0713 }, // Bambang
  { city: 'Pateros',     note: 'Metro Manila', lat: 14.5446, lng: 121.0687 },
  { city: 'Makati',      note: 'Metro Manila', lat: 14.5547, lng: 121.0244 },
  { city: 'Mandaluyong', note: 'Metro Manila', lat: 14.5794, lng: 121.0359 },
  { city: 'Pasig',       note: 'Metro Manila', lat: 14.5764, lng: 121.0851 },
  { city: 'Parañaque',   note: 'Metro Manila', lat: 14.4793, lng: 121.0198 },
  { city: 'Muntinlupa',  note: 'Metro Manila', lat: 14.4081, lng: 121.0415 },
]

// ── Reviews ───────────────────────────────────────────────────────────────────

// Left empty on purpose: the reviews previously here could not be verified
// (no matching Google / Facebook listing found). Add real customer reviews —
// with their permission — and the Reviews section will render automatically.
export const REVIEWS: Review[] = []

// ── FAQ ───────────────────────────────────────────────────────────────────────

export const FAQS: Faq[] = [
  {
    q: 'Gaano kadalas dapat linisin ang aircon?',
    a: 'For most homes, every 3 to 6 months. If the unit runs all day, or you have pets or live near a busy road, go with every 3 months. Regular cleaning keeps it cold, lowers your bill, and prevents bigger repairs.',
  },
  {
    q: 'Do you service inverter units?',
    a: 'Yes. We install and service both inverter and non-inverter units — window, split, cassette, ducted and multi-split — from all major brands.',
  },
  {
    q: 'Is the check-up really free?',
    a: 'Yes. We check your unit and give you a written estimate before any work begins. You decide if you want to push through.',
  },
  {
    q: 'May warranty po ba?',
    a: 'If the same issue comes back after our service, we return and fix it free of charge. Ask us about the coverage for your specific job.',
  },
  {
    q: 'Do you handle commercial and VRF / VRV systems?',
    a: 'Yes. We service offices, malls and commercial buildings, including VRF / VRV systems and chillers.',
  },
  {
    q: 'What areas do you cover?',
    a: 'We are based in Bambang, Taguig and serve Metro Manila and nearby areas. Call us if you are not sure we cover your location.',
  },
]

// ── Booking form options ──────────────────────────────────────────────────────

export const SERVICE_OPTIONS: string[] = [
  'Cleaning / PMS',
  'Repair',
  'Installation',
  'Freon Charging',
  'Relocation / Pulldown',
  'VRF / VRV Service',
  'Free Check-up & Quote',
]

// ── Footer links ──────────────────────────────────────────────────────────────

export const FOOTER_LINKS: FooterLinks = {
  Services: [
    { label: 'Aircon cleaning', href: '#services' },
    { label: 'Aircon repair',   href: '#services' },
    { label: 'Installation',    href: '#services' },
    { label: 'Freon charging',  href: '#services' },
  ],
  Company: [
    { label: 'How it works',  href: '#how'      },
    { label: 'Our work',      href: '#work'     },
    { label: 'Coverage area', href: '#coverage' },
    { label: 'Staff login',   href: '/login'    },
  ],
  'Get help': [
    { label: 'Book a service', href: '#book' },
    { label: 'FAQ',            href: '#faq'  },
  ],
}
