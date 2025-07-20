"use client";
import React from 'react'
import Image from 'next/image'

import { motion } from 'framer-motion'

const Hero = () => {
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
        <section className="pt-32 pb-20 px-4 md:px-6 lg:px-8  mx-auto h-screen overflow-hidden">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid lg:grid-cols2 gap-12 items-center text-center">
                <div className='space-y-10 relative'>
                    <motion.h1
                        variants={itemVariants}
                        className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Transform Text into
                        <span className="bg-gradient-to-r from-indigo-300 to-purple-500 bg-clip-text text-transparent"> Engaging Videos</span>
                    </motion.h1>
                    <motion.div
                        variants={itemVariants}
                        className='relative px-5 md:max-w-7xl xl:w-full min-h-screen mx-auto z-10'>
                        {/* shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] shadow-indigo-500 */}
                        <Image
                            className='md:block hidden w-full rounded-3xl'
                            src="images/createVideo.png"
                            width={100}
                            height={100}
                            alt='Create Video'
                        />
                        <Image
                            className='md:hidden block w-full rounded-3xl object-'
                            src="images/createVideo0.png"
                            width={100}
                            height={100}
                            alt='Create Video'
                        />
                    </motion.div>
                    <motion.div
                        variants={itemVariants}
                        className='absolute inset-y-5 rounded-3xl w-full animate-tilt h-full bg-gradient-to-r from-indigo-50 to-indigo-500 blur-3xl'>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}

export default Hero