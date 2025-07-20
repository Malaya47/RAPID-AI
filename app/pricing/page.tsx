'use client'

import PricingSection from '@/components/PricingSection';
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center bg-black w-full min-h-screen">
        <PricingSection 
          className="w-full"
          title="Simple, Transparent Pricing"
          subtitle="Choose the plan that works best for your video creation needs"
        />
      </div>
      <Footer />
    </>
  )
} 