"use client";

import FeatureCard from "@/components/FeatureCard";
import TestimonialCard from "@/components/TestimonialCard";
import PricingSection from "@/components/PricingSection";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Example from "@/components/Example";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { easeInOut, motion } from "framer-motion";
import { FeatureData } from "./data";

export default function Home() {
  const containerVariants = {
    hidden: { y: 200, opacity: 0 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.3, // Delay between children
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const featureVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Delay between children
        duration: 0.1,
        ease: easeInOut,
      },
    },
  };

  const featureItemVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    transition: {
      ease: easeInOut, // apply to individual item animations too
      duration: 0.1,
    },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen text-white bg-black">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          id="features"
          className="py-20 px-4 md:px-6 lg:px-8 overflow-hidden"
        >
          <motion.div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16">
              <motion.h2
                variants={itemVariants}
                className="max-w-xl rounded-3xl mx-auto text-3xl md:text-5xl font-extrabold mb-4 bggradient-to-r from-indigo-500  to-indigo-950"
              >
                Powerful Features
              </motion.h2>

              <p className="text-xl text-neutral-300 mx-auto">
                Everything you need to create professional videos without design
                or video editing skills
              </p>
            </motion.div>

            <motion.div
              variants={featureVariants}
              initial="hidden"
              whileInView="show"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
            >
              {FeatureData.map((item, index) => {
                return (
                  <motion.div variants={featureItemVariants} key={index}>
                    <FeatureCard
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Examples Section */}
        <Example />
        {/* Testimonials Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
                Hear from content creators who have transformed their video
                production with VideoGen
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <TestimonialCard
                quote="VideoGen has completely transformed my content creation workflow. What used to take days now takes minutes, and the quality is incredible!"
                author="Sarah Johnson"
                role="Content Creator"
                company="Tech Insights"
              />
              <TestimonialCard
                quote="As a marketing team of one, VideoGen has been a game-changer. I can now produce professional videos for our campaigns without hiring a production team."
                author="Michael Chen"
                role="Marketing Manager"
                company="StartupBoost"
              />
              <TestimonialCard
                quote="The editable narration feature is brilliant. I can maintain my brand voice while saving countless hours of production time."
                author="Jessica Williams"
                role="YouTube Creator"
                company="Learn With Jess"
              />
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <PricingSection
              showModal={true}
              title="Simple, Transparent Pricing"
              subtitle="Choose the plan that works best for your video creation needs"
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
