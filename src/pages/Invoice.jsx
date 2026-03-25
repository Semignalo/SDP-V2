import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Copy, AlertCircle, Printer } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Invoice() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isPrintMode = searchParams.get('print') === 'true';
    
    const [order, setOrder] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderAndPayment = async () => {
            try {
                // Fetch Order
                const orderDoc = await getDoc(doc(db, "orders", id));
                if (orderDoc.exists()) {
                    setOrder({ id: orderDoc.id, ...orderDoc.data() });
                } else {
                    console.log("Order not found!");
                }

                // Fetch Payment Config
                const paymentDoc = await getDoc(doc(db, "settings", "payment"));
                if (paymentDoc.exists()) {
                    setPaymentConfig(paymentDoc.data());
                } else {
                    // Fallback default config if admin hasn't set it yet
                    setPaymentConfig({
                        bankName: 'BCA',
                        accountNumber: '888888888',
                        accountName: 'PT BBK'
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderAndPayment();
        }
    }, [id]);

    useEffect(() => {
        if (!loading && order && isPrintMode) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, order, isPrintMode]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        Swal.fire({
            title: 'Tersalin!',
            text: 'Nomor rekening telah disalin.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-serif mb-4">Invoice Not Found</h2>
                <Link to="/" className="text-[var(--color-accent)] underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 flex justify-center">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-[#047857] p-8 text-center text-white">
                    <CheckCircle className="mx-auto h-16 w-16 mb-4 text-green-300" />
                    <h1 className="text-3xl font-serif mb-2">Order Dibuat!</h1>
                    <p className="text-green-100">Silakan selesaikan pembayaran agar pesanan Anda dapat segera kami proses.</p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">

                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                        <h2 className="text-4xl font-bold text-gray-900">
                            Rp. {order.total?.toLocaleString('id-ID')}
                        </h2>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            Informasi Transfer
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Bank</p>
                                <p className="font-medium text-lg uppercase">{paymentConfig?.bankName}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Nomor Rekening</p>
                                <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-md mt-1">
                                    <span className="font-bold text-xl tracking-wider text-gray-900">
                                        {paymentConfig?.accountNumber}
                                    </span>
                                    <button
                                        onClick={() => handleCopy(paymentConfig?.accountNumber)}
                                        className="text-[var(--color-accent)] hover:text-gray-900 flex items-center gap-1 text-sm font-medium transition-colors"
                                    >
                                        <Copy size={16} />
                                        Salin
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Atas Nama</p>
                                <p className="font-medium">{paymentConfig?.accountName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Order ID:</span>
                            <span className="font-medium">#{order.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Status:</span>
                            <span className="font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full text-xs">
                                {order.status}
                            </span>
                        </div>
                    </div>

                    <div className="text-center pt-4 flex flex-col md:flex-row justify-center items-center gap-4 print:hidden">
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition"
                        >
                            <Printer size={18} /> Cetak / Download Invoice
                        </button>
                        <Link to="/" className="text-sm text-gray-500 underline hover:text-gray-900">
                            Kembali ke Halaman Utama
                        </Link>
                    </div>

                </div>
            </div>
            
            {/* Global style to hide the print button locally */}
            <style>{`
                @media print {
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}
