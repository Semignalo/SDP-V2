import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppearance } from '../contexts/AppearanceContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { settings } = useAppearance();
    const { openCart, getCartCount } = useCart();
    const { currentUser, userRole, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil Logout',
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-16 sm:h-20">
                <div className="container mx-auto px-4 h-full">
                    <div className="flex items-center justify-between h-full">

                        {/* Left: Mobile Menu & Search (Mobile Focused) */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors active:scale-95"
                                aria-label="Menu"
                            >
                                <Menu size={24} strokeWidth={1.5} className="text-gray-900" />
                            </button>
                            <button className="min-w-[44px] min-h-[44px] items-center justify-center hover:bg-gray-50 rounded-full transition-colors hidden sm:flex">
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
                        <div className="flex items-center gap-1 sm:gap-2">
                            {currentUser ? (
                                <div className="group relative">
                                    <button className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {currentUser.email?.charAt(0).toUpperCase()}
                                        </div>
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm font-semibold truncate">{currentUser.email}</p>
                                            <p className="text-xs text-gray-500 capitalize">{userRole} Member</p>
                                        </div>
                                        <div className="py-2">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                                                Profil Saya
                                            </Link>
                                            {userRole === 'center' && (
                                                <Link to="/center" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                                                    Center Shop
                                                </Link>
                                            )}
                                            {userRole === 'admin' && (
                                                <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors">
                                    <User size={22} strokeWidth={1.5} className="text-gray-900" />
                                </Link>
                            )}

                            <button
                                onClick={openCart}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors relative active:scale-95"
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
                            ...(currentUser ? [{ name: 'Profil Saya', path: '/profile' }] : []),
                            ...(userRole === 'center' ? [{ name: 'Center Shop', path: '/center' }] : []),
                            ...(!currentUser ? [{ name: 'Daftar Center', path: '/daftar-center' }] : [])
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
                    {currentUser ? (
                        <button
                            onClick={() => { setIsOpen(false); handleLogout(); }}
                            className="w-full py-3 bg-red-500 text-white font-bold rounded-lg shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3 block text-center bg-[var(--color-accent)] text-white font-bold rounded-lg shadow-md active:scale-95 transition-transform"
                        >
                            Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
