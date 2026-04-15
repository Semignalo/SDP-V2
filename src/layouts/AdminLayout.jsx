import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    CreditCard,
    LogOut,
    ArrowLeft,
    Banknote,
    Crown
} from 'lucide-react';
import { cn } from '../lib/utils'; // Adjust path if needed
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminLayout() {
    const { currentUser, userRole, logout } = useAuth();
    
    // Redirect if not admin
    if (!currentUser || userRole !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const sidebarLinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
        { name: 'Pesanan', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Produk', path: '/admin/products', icon: Package },
        { name: 'Users / Center', path: '/admin/users', icon: Users },
        { name: 'Komisi', path: '/admin/commissions', icon: Banknote },
        { name: 'Level / Tiers', path: '/admin/tiers', icon: Crown },
        { name: 'Rekening Pembayaran', path: '/admin/payment-settings', icon: CreditCard },
        { name: 'Tampilan Web', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111827] text-white flex flex-col fixed inset-y-0 left-0 z-50">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold text-white">SDP Admin<span className="text-[var(--color-accent)]">.</span></h1>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {sidebarLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.end}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-[#1F2937] text-white border-l-4 border-[var(--color-accent)]"
                                    : "text-gray-400 hover:bg-[#1F2937] hover:text-white"
                            )}
                        >
                            <link.icon size={20} />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-2">
                    <NavLink to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                        Back to App
                    </NavLink>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-900/10 rounded-lg transition-colors">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <Outlet />
            </main>
        </div>
    );
}
