import Hero from '@/components/home/Hero'
import AgentsShowcase from '@/components/home/AgentsShowcase'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import PricingCalculator from '@/components/home/PricingCalculator'
import FAQ from '@/components/home/FAQ'
import ClosingCTA from '@/components/home/ClosingCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <AgentsShowcase />
      <Features />
      <HowItWorks />
      <PricingCalculator />
      <FAQ />
      <ClosingCTA />
    </>
  )
}
