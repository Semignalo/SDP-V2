import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppearance } from '../contexts/AppearanceContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { settings } = useAppearance();
    const { openCart, getCartCount } = useCart();

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-16 sm:h-20">
                <div className="container mx-auto px-4 h-full">
                    <div className="flex items-center justify-between h-full">

                        {/* Left: Mobile Menu & Search (Mobile Focused) */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
                                aria-label="Menu"
                            >
                                <Menu size={24} strokeWidth={1.5} className="text-gray-900" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
                                <Search size={22} strokeWidth={1.5} className="text-gray-900" />
                            </button>
                        </div>

                        {/* Center: Logo */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Link to="/" className="block">
                                <img src={settings?.logoUrl || '/logo.png'} alt="Starinc Logo" className="h-8 sm:h-10 w-auto object-contain" />
                            </Link>
                        </div>

                        {/* Right: User & Cart */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link to="/login" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <User size={22} strokeWidth={1.5} className="text-gray-900" />
                            </Link>
                            <button
                                onClick={openCart}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors relative active:scale-95"
                            >
                                <ShoppingBag size={22} strokeWidth={1.5} className="text-gray-900" />
                                <span className="absolute top-0.5 right-0.5 bg-[var(--color-accent)] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {getCartCount()}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Slide-out Sidebar Menu (Drawer) - Optimized for Mobile Thumb Reach */}
            <div className={cn(
                "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 backdrop-blur-sm",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsOpen(false)} />

            <div className={cn(
                "fixed inset-y-0 left-0 z-[60] w-[80%] max-w-[300px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50">
                    <img src={settings?.logoUrl || '/logo.png'} alt="Starinc" className="h-8 w-auto" />
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <Menu size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    <ul className="space-y-1">
                        {[
                            { name: 'Home', path: '/' },
                            { name: 'Catalog', path: '/products' },
                            { name: 'New in', path: '/products' },
                            { name: 'Sale zone', path: '/products' },
                            { name: 'Gift Sets', path: '/products' },
                            { name: 'Pesanan Saya', path: '/orders' },
                            { name: 'Our concept', path: '/about' },
                            { name: 'Shop Business', path: '/login' }
                        ].map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className="block px-6 py-4 text-gray-900 hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-dark)] font-medium text-lg border-l-4 border-transparent hover:border-[var(--color-accent)] transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button className="w-full py-3 bg-[var(--color-accent)] text-white font-bold rounded-lg shadow-md active:scale-95 transition-transform">
                        Login / Register
                    </button>
                </div>
            </div>
        </>
    );
}
