import { MotionRoot } from '@/components/motion/MotionRoot'
import {
  Navbar,
  HeroSection,
  ServicesSection,
  ValuesSection,
  StepsSection,
  MaintenanceSection,
  BrandsSection,
  GuaranteeSection,
  WorkSection,
  CoverageSection,
  ReviewsSection,
  FaqSection,
  BookSection,
  FinalCta,
  LandingFooter,
  ContactButton,
} from '@/components/landing'

// Section order follows teko.ph, with Dizon's own work, coverage and booking added
export default function LandingPage() {
  return (
    <MotionRoot>
      {/* ── Sticky header: click-to-call + Book, hides on scroll down ── */}
      <Navbar />

      <main>
        {/* 1 — Hero: cinematic carousel (cleaning / repair / installation) */}
        <HeroSection />

        {/* 2 — On-site services: interactive tiles + detail panel */}
        <ServicesSection />

        {/* 3 — We stand behind our work */}
        <ValuesSection />

        {/* 4 — How booking works: scroll-drawn timeline */}
        <StepsSection />

        {/* 5 — Maintenance (PMS) plan */}
        <MaintenanceSection />

        {/* 6 — All brands serviced: marquee */}
        <BrandsSection />

        {/* 7 — Our guarantee */}
        <GuaranteeSection />

        {/* 8 — Our work: pinned horizontal reel on desktop */}
        <WorkSection />

        {/* 9 — Coverage radar */}
        <CoverageSection />

        {/* 10 — Reviews (hidden until real reviews are added) */}
        <ReviewsSection />

        {/* 11 — FAQ */}
        <FaqSection />

        {/* 12 — Booking form */}
        <BookSection />

        {/* 13 — Final call to action */}
        <FinalCta />
      </main>

      <LandingFooter />
      <ContactButton />
    </MotionRoot>
  )
}
