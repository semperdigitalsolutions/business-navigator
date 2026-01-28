/**
 * Landing Page - Main entry point that assembles all landing sections
 */
import { useState } from 'react'
import { LandingNav } from './LandingNav'
import { HeroSection } from './HeroSection'
import { ProblemSection } from './ProblemSection'
import { SolutionSection } from './SolutionSection'
import { FeaturesSection } from './FeaturesSection'
import { PricingSection } from './PricingSection'
import { SocialProofSection } from './SocialProofSection'
import { CTASection } from './CTASection'
import { FAQSection } from './FAQSection'
import { FooterSection } from './FooterSection'
import { WaitlistForm } from './WaitlistForm'

export function LandingPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  const openWaitlist = () => setIsWaitlistOpen(true)
  const closeWaitlist = () => setIsWaitlistOpen(false)

  return (
    <>
      <LandingNav onJoinBeta={openWaitlist} />
      <main>
        <HeroSection onJoinBeta={openWaitlist} />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <PricingSection onJoinBeta={openWaitlist} />
        <SocialProofSection />
        <CTASection onJoinBeta={openWaitlist} />
        <FAQSection />
        <FooterSection />
      </main>
      <WaitlistForm isOpen={isWaitlistOpen} onClose={closeWaitlist} />
    </>
  )
}
