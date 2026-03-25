import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function CenterShop() {
    const { currentUser, userRole, loading } = useAuth();

    if (!currentUser) return <Navigate to="/login" replace />;
    if (userRole !== 'center' && userRole !== 'admin') {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
                <ShoppingBag size={64} className="text-gray-300 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
                <p className="text-gray-500 max-w-md">
                    Halaman ini khusus untuk member dengan tier Center. Silakan belanja melalui katalog reguler atau hubungi admin untuk upgrade tier kamu.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-neutral-50">
            <div className="container mx-auto px-4">
                <div className="bg-primary text-white rounded-2xl p-8 mb-8 shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Center Shop</h1>
                    <p className="text-emerald-100/90">
                        Selamat datang, Center Member! Nikmati harga khusus dan paket grosir di halaman ini.
                    </p>
                </div>

                {/* Placeholder For Center Products / Features */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <p className="text-gray-600">Katalog khusus Center sedang dalam pengembangan...</p>
                </div>
            </div>
        </div>
    );
}
