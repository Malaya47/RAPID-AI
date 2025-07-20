import React from 'react'
import { Card, CardContent } from './ui/card';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => {
    return (
        <>
            <Card className="bg-black border-none relative h-full">
                <motion.div
                    className='absolute top/2 rounded-3xl w-full h-full animate-tilt bg-gradient-to-r from-indigo-300 to-indigo-900 blur -z-10'>
                </motion.div>
                <CardContent className="p-6 relative">
                    <div className="rounded-full bg-indigo-500/20 w-12 h-12 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
                    <p className="text-neutral-400">{description}</p>
                </CardContent>
            </Card>
        </>
    );
};


export default FeatureCard;