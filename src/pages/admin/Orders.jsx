import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { Eye, Edit2, CheckCircle, XCircle, Search, Clock, Box, Rocket } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            const data = await getDocs(q);
            setOrders(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { status: newStatus });

            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }

            Swal.fire({
                title: 'Berhasil',
                text: 'Status pesanan berhasil diperbarui!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire('Error', 'Gagal memperbarui status.', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Menunggu Pembayaran': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Pesanan Diproses': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Dikirim': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Selesai': return 'bg-green-100 text-green-800 border-green-200';
            case 'Ditolak': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Menunggu Pembayaran': return <Clock size={14} className="mr-1 inline" />;
            case 'Pesanan Diproses': return <Box size={14} className="mr-1 inline" />;
            case 'Dikirim': return <Rocket size={14} className="mr-1 inline" />;
            case 'Selesai': return <CheckCircle size={14} className="mr-1 inline" />;
            case 'Ditolak': return <XCircle size={14} className="mr-1 inline" />;
            default: return null;
        }
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-sm text-gray-500">Kelola pesanan dari customer</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari ID Pesanan / Nama..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">Memuat pesanan...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">Tidak ada pesanan ditemukan.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100 text-sm">
                                <tr>
                                    <th className="p-4">Tanggal / ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => {
                                    const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tanggal tidak tersedia';
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="text-xs text-gray-400 mb-1">{dateStr}</div>
                                                <div className="text-sm font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-medium text-gray-900">{order.customer?.name}</div>
                                                <div className="text-xs text-gray-500">{order.customer?.city}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center w-max ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-gray-900">
                                                Rp. {order.total?.toLocaleString('id-ID')}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => openOrderDetails(order)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Lihat Detail Pesanan"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col pt-6 overflow-hidden">

                        {/* Header */}
                        <div className="px-6 flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Detail Pesanan</h2>
                                <p className="text-sm text-gray-500">#{selectedOrder.id.toUpperCase()}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full">
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">

                            {/* Update Status Actions */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Ubah Status Pesanan</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Menunggu Pembayaran', 'Pesanan Diproses', 'Dikirim', 'Selesai', 'Ditolak'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${selectedOrder.status === status ? getStatusColor(status) : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-3">Informasi Customer</h3>
                                    <div className="text-sm space-y-2 text-gray-600">
                                        <p><span className="font-medium text-gray-900">Nama:</span> {selectedOrder.customer?.name}</p>
                                        <p><span className="font-medium text-gray-900">Telepon:</span> {selectedOrder.customer?.phone}</p>
                                        <p><span className="font-medium text-gray-900">Alamat:</span><br />{selectedOrder.customer?.address}</p>
                                        <p>{selectedOrder.customer?.city}, {selectedOrder.customer?.postalCode}</p>
                                    </div>
                                </div>

                                {/* Order Summary Block */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-max">
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">Rincian Biaya</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>Rp. {selectedOrder.subtotal?.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ongkos Kirim</span>
                                            <span>Rp. {selectedOrder.shipping?.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-gray-900 text-base">
                                            <span>Total</span>
                                            <span>Rp. {selectedOrder.total?.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-3">Daftar Produk ({selectedOrder.items?.length || 0})</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center border border-gray-100 rounded-lg p-3 bg-white">
                                            <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                                                {item.variantName && <p className="text-xs font-medium text-[var(--color-primary)] mb-1">{item.variantName}</p>}
                                                <p className="text-xs text-gray-500">{item.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">{item.quantity}x @ Rp. {item.price}</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    Rp. {(parseFloat(String(item.price || 0).replace(/,/g, '')) * item.quantity).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
