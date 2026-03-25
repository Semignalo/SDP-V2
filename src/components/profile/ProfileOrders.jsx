import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Package, ExternalLink, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileOrders() {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyOrders = async () => {
            if (!currentUser) return;
            try {
                // Fetch logged-in user's orders
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", currentUser.uid)
                );
                
                const snap = await getDocs(q);
                let fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sort by date descending natively in JS because firestore requires composite index for query+orderby
                fetched.sort((a, b) => {
                    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                    return timeB - timeA;
                });
                
                setOrders(fetched);
            } catch (error) {
                console.error("Gagal menarik data pesanan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [currentUser]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Menunggu Pembayaran': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Pesanan Diproses': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Dalam Pengiriman': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Selesai': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Ditolak': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Memuat riwayat pesanan...</div>;

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Package size={48} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada pesanan</h3>
                <p className="text-gray-500 mb-6">Kamu belum pernah melakukan transaksi apa pun. Yuk mulai belanja sekarang!</p>
                <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-medium shadow-md shadow-gray-200 hover:bg-gray-800 transition">
                    Belanja Sekarang
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Package className="text-primary" /> Riwayat & Progress Pesanan
            </h2>
            
            <div className="flex flex-col gap-6">
                {orders.map((order) => {
                    const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    }) : '-';
                    
                    return (
                        <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500 font-mono tracking-wider mb-1">
                                        ORDER ID: {order.id.toUpperCase()}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">{dateStr}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                        {order.status || 'Menunggu Pembayaran'}
                                    </span>
                                </div>
                            </div>

                            {/* Tracking Progress Bar */}
                            <div className="mb-6 relative hidden md:block px-4 pt-2">
                                <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-gray-100 z-0"></div>
                                <div className="relative z-10 flex justify-between">
                                    {['Menunggu Pembayaran', 'Pesanan Diproses', 'Dalam Pengiriman', 'Selesai'].map((step, idx) => {
                                        const statusOrder = ['Menunggu Pembayaran', 'Pesanan Diproses', 'Dalam Pengiriman', 'Selesai'];
                                        const currentIndex = statusOrder.indexOf(order.status);
                                        const isPast = currentIndex >= idx;
                                        const isActive = currentIndex === idx;
                                        const isRejected = order.status === 'Ditolak';
                                        
                                        // Override styles if rejected
                                        const stepClass = isRejected ? 'bg-red-100 border-red-300 text-red-500' :
                                                          isActive ? 'bg-primary border-primary text-white scale-110 shadow-lg' : 
                                                          isPast ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-400';
                                                          
                                        return (
                                            <div key={step} className="flex flex-col items-center gap-2 group">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${stepClass}`}>
                                                    {isPast && !isRejected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                                                </div>
                                                <span className={`text-[10px] uppercase tracking-wide font-bold transition-colors ${isActive ? 'text-primary' : isPast && !isRejected ? 'text-gray-800' : 'text-gray-400'}`}>
                                                    {step}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                <div className="flex-1 space-y-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                                                {item.variantName && <p className="text-xs text-primary">{item.variantName}</p>}
                                                <p className="text-xs text-gray-500 mt-1">{item.quantity} x Rp. {parseFloat(String(item.price||0).replace(/,/g,'')).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between min-w-[200px]">
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Tagihan</div>
                                        <div className="text-xl font-bold text-gray-900 mb-2">Rp. {(order.total || 0).toLocaleString('id-ID')}</div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 mt-4">
                                        <Link to={`/invoice/${order.id}`} className="text-xs font-bold flex justify-center items-center gap-1 w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
                                            <ExternalLink size={14} /> Lihat Detail
                                        </Link>
                                        
                                        {/* Download Invoice Button for completed orders */}
                                        {order.status === 'Selesai' && (
                                            <button 
                                                onClick={() => window.open(`/invoice/${order.id}?print=true`, '_blank')}
                                                className="text-xs font-bold flex justify-center items-center gap-1 w-full bg-primary text-white shadow-sm border border-primary py-2 rounded-lg hover:bg-gray-800 transition"
                                            >
                                                <Printer size={14} /> Cetak/Download Invoice
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
