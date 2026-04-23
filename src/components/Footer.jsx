import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Youtube, MessageCircle, Star } from 'lucide-react';
import { useAppearance } from '../contexts/AppearanceContext';

export default function Footer() {
    const { settings } = useAppearance();

    return (
        <footer className="bg-[#1A1A1A] text-white pt-12 pb-24 md:pb-8 border-t border-gray-800 text-center md:text-left">
            <div className="container mx-auto px-4">

                {/* Logo & Socials */}
                <div className="mb-10 text-center">
                    <div className="flex justify-center mb-4">
                        <img src={settings?.logoUrl || '/logo.png'} alt="Starinc" className="h-16 w-auto brightness-0 invert" />
                    </div>
                    <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                        The Gold standard of beauty. Designed in Japan, made for you.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <a href="#" aria-label="Instagram" className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-[var(--color-accent)] transition-colors"><Instagram size={24} /></a>
                        <a href="#" aria-label="Facebook" className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-[var(--color-accent)] transition-colors"><Facebook size={24} /></a>
                        <a href="#" aria-label="Youtube" className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-[var(--color-accent)] transition-colors"><Youtube size={26} /></a>
                    </div>
                </div>

                {/* Info Links */}
                <div className="grid grid-cols-2 gap-8 text-sm border-t border-gray-800 pt-8">
                    <div className="text-center">
                        <h4 className="font-bold text-[var(--color-accent)] mb-4">SHOP</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#">Best Sellers</a></li>
                            <li><a href="#">New Arrivals</a></li>
                            <li><a href="#">Gift Sets</a></li>
                        </ul>
                    </div>
                    <div className="text-center">
                        <h4 className="font-bold text-[var(--color-accent)] mb-4">SUPPORT</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Shipping</a></li>
                            <li><a href="#">Returns</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs text-gray-600">
                    &copy; 2026 Starinc. All rights reserved.
                </div>

            </div>

            {/* Floating Chat Button (Mobile Optimized) */}
            <a
                href="#"
                className="fixed bottom-6 right-4 z-50 flex items-center bg-[var(--color-accent)] rounded-full shadow-lg shadow-black/20 pl-4 py-3 pr-3 active:scale-95 transition-all text-white"
            >
                <span className="mr-2 text-sm font-bold">Chat</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle size={20} fill="currentColor" />
                </div>
            </a>
        </footer>
    );
}
