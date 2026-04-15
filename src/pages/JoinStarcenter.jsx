import React, { useState } from 'react';
import { Network, Crown, TrendingUp, ShieldCheck, ChevronRight, CheckCircle2, UserPlus, Coins, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function JoinStarcenter() {
    const [refCode, setRefCode] = useState('');
    const navigate = useNavigate();

    const handleJoinClick = (e) => {
        e.preventDefault();
        const url = refCode ? `/login?ref=${refCode}&mode=register` : '/login?mode=register';
        navigate(url);
    };

    const benefits = [
        {
            icon: <Crown className="text-yellow-500" size={32} />,
            title: "Diskon Grosir Permanen",
            desc: "Dapatkan margin profit maksimal dengan status Diamond permanen. Bebas belanja kebutuhan stok mingguan dengan potongan harga terbesar tanpa batas."
        },
        {
            icon: <Network className="text-blue-500" size={32} />,
            title: "Komisi 7 Kedalaman (Level)",
            desc: "Berhak menerima komisi setiap ada pergerakan transaksi dari struktur downline yang berafiliasi dengan Anda, memanjang tanpa putus hingga generasi ke-7."
        },
        {
            icon: <ShieldCheck className="text-emerald-500" size={32} />,
            title: "Sistem Anti-Downgrade",
            desc: "Sebagai bagian eksklusif dari tim penjualan sentral, ranking Anda kebal terhadap pinalti tutup poin bulanan. Tetap fokus memperluas jaringan bisnis!"
        },
        {
            icon: <TrendingUp className="text-purple-500" size={32} />,
            title: "Pasif Income",
            desc: "Biarkan sistem membagi komisi otomatis langsung ke dashboard Anda secara real-time setiap kali pelanggan dalam pohon afiliasi Anda checkout."
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 pb-24 font-sans">
            {/* Hero Section */}
            <div className="relative bg-[#111827] text-white pt-32 pb-24 px-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[150%] bg-gradient-to-l from-blue-900/40 to-transparent blur-3xl transform rotate-12"></div>
                    <div className="absolute top-[60%] -left-[10%] w-[50%] h-[100%] bg-gradient-to-tr from-purple-900/40 to-transparent blur-3xl rounded-full"></div>
                </div>
                
                <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-300 text-sm font-bold uppercase tracking-widest mb-6">
                            Peluang Kemitraan
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                            Jadilah Penggerak Utama bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Starcenter</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                            Buka keran penghasilan pasif yang eksponensial lewat sistem afiliasi tercanggih kami. Tidak ada penalti, tidak ada target mengikat. Murni profit dari jaringan langsung di tangan Anda.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                            <a href="#join-form" className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-900/50 transition flex items-center gap-2">
                                <UserPlus size={22} /> Daftar Jadi Mitra
                            </a>
                            <Link to="/products" className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg backdrop-blur-sm transition flex items-center gap-2 border border-white/10">
                                <ShoppingBag size={22} /> Jelajahi Produk
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-lg hidden md:block relative">
                        <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 shadow-2xl relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
                                    <Network className="text-white" size={32}/>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">Potensi Komisi</div>
                                    <div className="text-3xl font-extrabold text-white">Tak Terbatas</div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                                    <span className="text-gray-300">Level 1 (Direct)</span>
                                    <span className="font-bold text-emerald-400 text-lg">10%</span>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                                    <span className="text-gray-300">Level 2 (Cucu)</span>
                                    <span className="font-bold text-emerald-400 text-lg">5%</span>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center opacity-80">
                                    <span className="text-gray-400">Level 3 - 7</span>
                                    <span className="font-bold text-emerald-400/80">0.5% - 2%</span>
                                </div>
                            </div>
                        </div>
                        {/* Decorative background blocks */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-600 rounded-3xl -z-10 opacity-30 blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-600 rounded-full -z-10 opacity-20 blur-3xl"></div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="container mx-auto max-w-6xl px-4 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mengapa Memilih Ekosistem Starcenter?</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Sistem kemitraan kami dirancang seratus persen untuk mendukung profit mitra dan mempermudah penetrasi pasar. Kami menanggung infrastruktur digital Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((b, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                                {b.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {b.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Registration Form / Action Card */}
            <div id="join-form" className="container mx-auto max-w-4xl px-4">
                <div className="bg-gradient-to-br from-white to-neutral-50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-200 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Mulai Perjalanan Anda</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Punya kode khusus dari upline Anda? Masukkan di bawah ini agar Anda otomatis terhubung ke jaringannya. 
                            Atau lewati jika Anda mendaftar sebagai pelopor ring-1 independen.
                        </p>
                        <form onSubmit={handleJoinClick} className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="text"
                                value={refCode}
                                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                                placeholder="Kode Referral (Opsional)"
                                className="flex-1 px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg uppercase transition shadow-sm"
                            />
                            <button type="submit" className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition shadow-lg shadow-gray-300 whitespace-nowrap">
                                Lanjutkan <ChevronRight size={20}/>
                            </button>
                        </form>
                        <p className="text-xs text-gray-400 mt-4">
                            <CheckCircle2 size={12} className="inline mr-1 text-emerald-500"/>
                            Dengan mendaftar, Anda menyetujui syarat & ketentuan agen.
                        </p>
                    </div>

                    <div className="w-full md:w-auto flex-shrink-0 relative hidden sm:block">
                        <div className="w-48 h-48 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center p-1 shadow-2xl relative z-10">
                            <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center">
                                <Coins className="text-yellow-500 mb-2" size={48}/>
                                <span className="font-extrabold text-gray-900">STARINC</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
