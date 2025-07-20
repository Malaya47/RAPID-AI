import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex-none text-2xl font-semibold mb-6 block">
              <span className="text-white">Rapid</span>
              <span className="text-indigo-400">AI</span>
            </Link>
            <p className="text-neutral-400 mb-6">
              Transform your ideas into engaging videos with AI-powered video generation.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                <Linkedin size={20} />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#features" className="text-neutral-400 hover:text-indigo-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-neutral-400 hover:text-indigo-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#examples" className="text-neutral-400 hover:text-indigo-400">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-neutral-400 hover:text-indigo-400">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-400 hover:text-indigo-400">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-neutral-400 mb-4">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-neutral-800 border-neutral-700"
              />
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-neutral-400 text-sm">
              © {currentYear} RapidAI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-neutral-400 hover:text-indigo-400 text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-indigo-400 text-sm">
                Terms of Service
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-indigo-400 text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;