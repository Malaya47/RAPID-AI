import React from 'react'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
    {
        number: 1,
        title: 'Enter Your Prompt',
        description:
            'Describe the video you want to create in detail. Add information about style, tone, and pacing.',
        image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80',
        alt: 'Enter prompt',
    },
    {
        number: 2,
        title: 'Customize Your Video',
        description:
            'Edit the AI-generated narration, adjust visual elements, and fine-tune the pacing to match your vision.',
        image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80',
        alt: 'Customize video',
    },
    {
        number: 3,
        title: 'Export & Share',
        description:
            'Download your video in your preferred format or share it directly to social media platforms.',
        image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&q=80',
        alt: 'Export video',
    },
]

const HowItWorks = () => {

    const containerVariants = {
        hidden: { y: 200, opacity: 0 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.3, // Delay between children
                duration: 0.6
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            id="how-it-works" className="py-20 px-0 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    variants={itemVariants}
                    className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
                        Create stunning videos in just three simple steps
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            variants={itemVariants}
                            key={index} className='flex flex-col-reverse p-5'>
                            <div
                                className="w-80 mx-auto bg-gradient-to-br from-indigo-950 via-indigo-100 to-indigo-800 border border-neutral-800 rounded-b-xl relative"
                            >
                                <div className="absolute -top-6 left-6 bg-indigo-700/80 w-12 h-12 rounded-full flex items-center justify-center font-medium p-6">
                                    {step.number}
                                </div>
                                <h3 className="text-xl font-medium text-black mt-4 mb-3 p-6">
                                    {step.title}
                                </h3>
                                <p className="text-neutral-800 mb-4 p-6">{step.description}</p>
                            </div>
                            <img
                                src={step.image}
                                alt={step.alt}
                                className="rounded-lg w-96 h-72 mb-auto"
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button size="lg" className="bg-indigo-700 backdrop-blur-sm hover:bg-indigo-800 rounded-full">
                        Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </motion.section>
    )
}

export default HowItWorks
