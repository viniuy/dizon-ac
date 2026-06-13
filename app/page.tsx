import {
  Navbar,
  HeroSection,
  ServicesSection,
  BeforeAfterSection,
  GallerySection,
  WhyChooseSection,
  MapSection,
  ReviewsSection,
  ContactSection,
  LandingFooter,
} from '@/components/landing'

export default function LandingPage() {
  return (
    <>
      {/* ── Fixed navigation ───────────────────────────── */}
      <Navbar />

      <main>
        {/* 1 — Hero: headline, phone numbers, stats */}
        <HeroSection />

        {/* 2 — Services: interactive selector panel */}
        <ServicesSection />

        {/* 3 — Before & After: drag slider comparison */}
        <BeforeAfterSection />

        {/* 4 — Gallery: photo showcase */}
        <GallerySection />

        {/* 5 — Why Choose: 2-col layout */}
        <WhyChooseSection />

        {/* 6 — Map: Mapbox, Bambang Taguig */}
        <MapSection />

        {/* 7 — Reviews: customer testimonials */}
        <ReviewsSection />

        {/* 8 — Contact: phones + booking form */}
        <ContactSection />
      </main>

      <LandingFooter />
    </>
  )
}
