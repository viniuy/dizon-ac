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

export interface ContactDetail {
  icon: 'phone' | 'mail' | 'pin'
  label: string
  value: string
  sub: string
  href: string
}

export interface HeroStat {
  value: string
  label: string
}

export interface Service {
  id: string
  label: string
  icon: string
  tagline: string
  description: string
  duration: string
  note: string
}

export type GalleryCategory = 'all' | 'installation' | 'cleaning' | 'repair'

export interface GalleryItem {
  src: string
  alt: string
  category: GalleryCategory
  placeholder?: boolean
}

export interface WhyPoint {
  icon: string
  title: string
  body: string
}

export interface Review {
  stars: number
  text: string
  name: string
  location: string
  initials: string
}

export interface FooterLink {
  label: string
  href: string
  accent?: boolean
}

export interface FooterLinks {
  [section: string]: FooterLink[]
}

// ── Contact & phones ─────────────────────────────────────────────────────────

export const PHONE_NUMBERS: PhoneNumber[] = [
  { network: 'Globe', number: '0917 780 0051', href: 'tel:+639177800051' },
  { network: 'Globe', number: '0945 849 0554', href: 'tel:+639458490554' },
  { network: 'Smart', number: '0999 966 5008', href: 'tel:+639999665008' },
  { network: 'PLDT',  number: '(02) 851522',   href: 'tel:+6328851522'   },
]

export const CONTACT_DETAILS: ContactDetail[] = [
  {
    icon: 'phone',
    label: 'Call or Text',
    value: '0917 780 0051',
    sub: 'Globe · Mon–Sat, 8AM–6PM',
    href: 'tel:+639177800051',
  },
  {
    icon: 'mail',
    label: 'Email Us',
    value: 'dizonairconditioningservices@gmail.com',
    sub: 'We reply within 30 minutes',
    href: 'mailto:dizonairconditioningservices@gmail.com',
  },
  {
    icon: 'pin',
    label: 'Our Location',
    value: 'Bambang, Taguig City',
    sub: 'Serving Metro Manila & nearby areas',
    href: 'https://maps.google.com/?q=Bambang+Taguig',
  },
]

// ── Hero ─────────────────────────────────────────────────────────────────────

export const HERO_STATS: HeroStat[] = [
  { value: '5,000+', label: 'Services done'    },
  { value: '98%',    label: 'Satisfaction'     },
  { value: '10+ yrs',label: 'Experience'       },
  { value: 'FREE',   label: 'Check-up & quote' },
]

// ── Services ─────────────────────────────────────────────────────────────────

export const SERVICES: Service[] = [
  {
    id: 'installation',
    label: 'Installation',
    icon: 'wrench',
    tagline: 'Any unit. Any brand. Done right.',
    description:
      'We install all types and brands of air conditioners — window type, split type, cassette, ducted, and multi-split systems. Proper mounting, electrical connection, and full pressure test included. Inverter and non-inverter.',
    duration: '2–4 hrs',
    note: 'Free site assessment before we start',
  },
  {
    id: 'cleaning',
    label: 'Cleaning / PMS',
    icon: 'sparkles',
    tagline: 'Back to peak performance.',
    description:
      'Professional deep cleaning and Preventive Maintenance Service (PMS). We disassemble the unit, clean all internal components, flush the evaporator coil, clear the drain line, and reassemble — leaving your unit running like new.',
    duration: '1–2 hrs',
    note: 'Recommended every 3–6 months',
  },
  {
    id: 'repair',
    label: 'Repair',
    icon: 'tool',
    tagline: 'Diagnosed and fixed, not guessed.',
    description:
      'Not cooling? Making noise? Tripping the breaker? Our technicians diagnose and repair all AC problems — faulty PCB boards, compressor issues, fan motor failure, refrigerant leaks, and electrical faults. All brands serviced.',
    duration: '1–3 hrs',
    note: 'Free check-up & estimate before any repair',
  },
  {
    id: 'relocation',
    label: 'Relocation / Pulldown',
    icon: 'arrows',
    tagline: 'Moving? Your AC moves too.',
    description:
      'Full AC relocation service — safe pulldown, transport, and reinstallation at your new location. We also handle permanent dismantling and removal of units. All wiring and mounting hardware re-used or replaced as needed.',
    duration: '2–5 hrs',
    note: 'Includes full reinstall check',
  },
  {
    id: 'freon',
    label: 'Freon Charging',
    icon: 'droplet',
    tagline: 'Restore your cooling power.',
    description:
      'Low refrigerant means poor cooling and higher electricity bills. We recharge your system with the correct refrigerant type (R22, R32, R410A) to manufacturer specifications, and check for the source of any leak before refilling.',
    duration: '30–90 min',
    note: 'Leak check included with every charge',
  },
  {
    id: 'vrf',
    label: 'VRF / VRV Systems',
    icon: 'grid',
    tagline: 'Commercial systems, expert hands.',
    description:
      'Specialized service for Variable Refrigerant Flow (VRF) and Variable Refrigerant Volume (VRV) systems in commercial spaces. We handle leak detection, error code diagnosis, and repairs for Daikin, Mitsubishi, LG, and other VRF brands.',
    duration: 'By assessment',
    note: 'Serving offices, malls & commercial buildings',
  },
]

// ── Gallery ───────────────────────────────────────────────────────────────────
// Drop real photos into public/gallery/ then set placeholder: false below.

export const GALLERY_ITEMS: GalleryItem[] = [
  { src: '/gallery/installation-1.jpg', alt: 'Split-type AC installation', category: 'installation', placeholder: true },
  { src: '/gallery/cleaning-1.jpg',     alt: 'Deep AC cleaning service',   category: 'cleaning',     placeholder: true },
  { src: '/gallery/repair-1.jpg',       alt: 'AC repair on site',          category: 'repair',       placeholder: true },
  { src: '/gallery/installation-2.jpg', alt: 'Multi-split system install', category: 'installation', placeholder: true },
  { src: '/gallery/cleaning-2.jpg',     alt: 'PMS coil cleaning',          category: 'cleaning',     placeholder: true },
  { src: '/gallery/job-site-1.jpg',     alt: 'Commercial AC servicing',    category: 'repair',       placeholder: true },
]

// ── Why Choose ────────────────────────────────────────────────────────────────

export const WHY_POINTS: WhyPoint[] = [
  {
    icon: 'shield',
    title: 'Safe Work Practices',
    body: 'Every job follows proper safety procedures. No shortcuts — your home and our team stay protected.',
  },
  {
    icon: 'star',
    title: 'Quality Workmanship',
    body: 'We take pride in clean, precise work. Every installation and repair is done to last.',
  },
  {
    icon: 'peso',
    title: 'Affordable Pricing',
    body: 'Transparent, no-surprise quotes. Free written estimate before any work begins — always.',
  },
  {
    icon: 'heart',
    title: 'Excellent Customer Service',
    body: 'Fast response, courteous technicians, and a satisfaction guarantee. We return free if any issue persists.',
  },
]

// ── Reviews ───────────────────────────────────────────────────────────────────

export const REVIEWS: Review[] = [
  {
    stars: 5,
    text: 'Fast response, professional team. My AC was fully repaired in under 2 hours and the technician was very courteous. Will definitely call again.',
    name: 'Maria Reyes',
    location: 'Bambang, Taguig',
    initials: 'MR',
  },
  {
    stars: 5,
    text: 'They installed 5 units in our office and handled everything perfectly. Clean work, on time, and the pricing was very fair. Highly recommended!',
    name: 'Jose Lim',
    location: 'Makati City',
    initials: 'JL',
  },
  {
    stars: 5,
    text: "My unit wasn't cooling properly for months. After their cleaning service it's like brand new — and my electricity bill dropped significantly!",
    name: 'Ana Cruz',
    location: 'Pateros, Metro Manila',
    initials: 'AC',
  },
]

// ── Service form options ──────────────────────────────────────────────────────

export const SERVICE_OPTIONS: string[] = [
  'Installation',
  'Cleaning / PMS',
  'Repair',
  'Relocation / Pulldown',
  'Freon Charging',
  'VRF / VRV Service',
  'Free Check-up & Quote',
]

// ── Footer links ──────────────────────────────────────────────────────────────

export const FOOTER_LINKS: FooterLinks = {
  Services: [
    { label: 'Installation',        href: '#services' },
    { label: 'Cleaning / PMS',      href: '#services' },
    { label: 'Repair',              href: '#services' },
    { label: 'Relocation',          href: '#services' },
    { label: 'Free Quote',          href: '#contact'  },
  ],
  Company: [
    { label: 'Why Choose Us',       href: '#why'      },
    { label: 'Our Work',            href: '#gallery'  },
    { label: 'Customer Reviews',    href: '#reviews'  },
    { label: 'Coverage Area',       href: '#map'      },
    { label: 'Contact Us',          href: '#contact'  },
  ],
  Support: [
    { label: 'Book a Service',      href: '#contact'             },
    { label: 'Call: 0917 780 0051', href: 'tel:+639177800051'    },
    { label: 'Call: 0999 966 5008', href: 'tel:+639999665008'    },
    { label: 'Staff Login →',       href: '/login', accent: true },
  ],
}
