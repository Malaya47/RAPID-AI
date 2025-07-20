'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState({})
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (!userData) {
            return
        }
        setUser(userData)
        setIsLoggedIn(true)
    }, [])


    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const navItems = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Examples', href: '#examples' }
    ];

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
        <header
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 shadow-md' : 'bg-transparent py-7'
                }`}
        >
            <motion.nav
                className="max-w-7xl mx-auto px-4 md:px-6 lg:px-4">

                <motion.div
                    variants={containerVariants}
                    className="flex items-center justify-between">
                    <motion.div
                        variants={itemVariants}
                    >
                        <Link href='/' className="flex-none text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-black rounded-lg" aria-label="Rapid AI">
                            <span className='text-white'>Rapid</span>
                            <span className='text-indigo-400'>AI</span>
                        </Link>
                    </motion.div>

                    <div className="hidden lg:flex items-center space-x-10">
                        {navItems.map((item) => (
                            <motion.div
                                key={item.label}
                                variants={itemVariants}
                            >
                                <Link
                                    href={item.href}
                                    className="text-white hover:text-indigo-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-indigo-500 after:transition-all after:duration-300 focus:outline-none focus:text-indigo-300"
                                >
                                    {item.label}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div
                            variants={itemVariants}
                            className='space-x-2'>
                            {<Link href='/login'>
                                <Button className='font-medium bg-neutral-800 text-white'>
                                    Create Video
                                </Button>
                            </Link>}
                        </motion.div>
                    </div>

                    <button
                        type="button"
                        onClick={toggleMenu}
                        className="lg:hidden p-2 text-white hover:bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </motion.div>

                <div
                    className={`lg:hidden w-full overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-80 mt-4' : 'max-h-0'
                        }`}
                    id="mobile-menu"
                    aria-hidden={!isMenuOpen}
                >
                    <div className="flex flex-col space-y-4 px-2 pt-2 pb-4 bg-neutral-900 rounded-lg mt-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-white hover:text-indigo-300 py-2 px-3 rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                onClick={closeMenu}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link href='/login'>
                            <Button
                                variant='secondary'
                                className='font-medium w-full'
                                onClick={closeMenu}
                            >
                                Create Video
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.nav>
        </header >
    );
};

export default Navbar;