"use client";
import React from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { motion } from "framer-motion";
import { BrandSlider } from "./landingPage/Slider";

const Example = () => {
    const videos = [
        {
            url: '/examples/captioned0.mp4'
        }
    ]

    return (
        <section id="examples" className="py-20 px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Video Examples</h2>
                    <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
                        See what&apos;s possible with VideoGen
                    </p>
                </div>

                <motion.div
                    initial={{ y: '20%', opacity: 0 }}
                    whileInView={{ y: '0', opacity: 1 }}
                    transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1], }}
                    viewport={{ once: true }}
                    className='md:min-h-screen xl:min-h-fit md:py24 py-12'>
                    <motion.div
                        initial={{ y: '20%', opacity: 0 }}
                        whileInView={{ y: '0', opacity: 1 }}
                        transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1], }}
                        viewport={{ once: true }}
                        className="md:max-w-7xl mx-auto">
                        <BrandSlider variant="examples" />
                    </motion.div>
                </motion.div>

            </div>
        </section>

    )
}

export default Example