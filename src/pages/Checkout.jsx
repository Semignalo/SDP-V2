import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { TIER_CONFIG } from '../lib/tierUtils';
import Swal from 'sweetalert2';

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
    });

    // Initialize form with UserData if logged in
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name || prev.name,
                phone: userData.phone || prev.phone,
                address: userData.address || prev.address,
                city: userData.city || prev.city,
                postalCode: userData.postalCode || prev.postalCode
            }));
        }
    }, [userData]);

    const subtotal = getCartTotal();
    
    // Tier Discount Logic
    const tierData = TIER_CONFIG[userData?.tier] || TIER_CONFIG['bronze'];
    const discountPercentage = userData ? tierData.discount : 0;
    const discountAmount = (subtotal * discountPercentage) / 100;
    
    const shipping = 20000;
    const total = subtotal - discountAmount + shipping;

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
                <button
                    onClick={() => navigate('/products')}
                    className="text-[var(--color-accent)] underline hover:text-[var(--color-primary)]"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        // Starcenter Batch check
        if (userData?.role === 'starcenter' && total < 5000000) {
            Swal.fire({
                title: 'Minimum Belanja Belum Tercapai',
                text: 'Sebagai akun Starcenter (Official Distributor), minimum transaksi adalah Rp 5.000.000.',
                icon: 'warning',
                confirmButtonColor: '#111827'
            });
            return;
        }

        setLoading(true);

        try {
            // Sanitize order data to remove undefined values (Firebase rejects undefined deeply nested in arrays)
            const rawOrderData = {
                customer: formData,
                userId: currentUser?.uid || null,
                items: cart,
                subtotal,
                discountPercentage,
                discountAmount,
                shipping,
                total,
                status: 'Menunggu Pembayaran'
            };
            
            // JSON stringify trick strips out undefined keys completely
            const sanitizedOrderData = JSON.parse(JSON.stringify(rawOrderData));
            
            const orderData = {
                ...sanitizedOrderData,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "orders"), orderData);

            // Update Last Transaction Date limit for downgrades (reset timer 30 hari)
            if (currentUser) {
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                    lastTransactionDate: serverTimestamp()
                });
            }

            // Save to localStorage for tracking without login
            const myOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
            myOrders.push(docRef.id);
            localStorage.setItem('my_orders', JSON.stringify(myOrders));

            clearCart();

            Swal.fire({
                title: 'Pesanan Dibuat!',
                text: 'Silakan lanjutkan ke halaman pembayaran.',
                icon: 'success',
                confirmButtonColor: '#111827',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate(`/invoice/${docRef.id}`);
            });

        } catch (error) {
            console.error("Error creating order:", error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Terjadi kesalahan: ' + (error.message || error),
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Form */}
                <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-serif mb-6 text-[var(--color-primary)]">Shipping Details</h2>
                    <form onSubmit={handleCheckout} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                required
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                placeholder="+62 812 3456 7890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                required
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                                placeholder="Street name, house number"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City / District</label>
                                <input
                                    required
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                    placeholder="Jakarta Selatan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                <input
                                    required
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                    placeholder="12345"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#047857] hover:bg-[#065F46] text-white font-bold py-4 rounded-sm shadow-md transition-colors uppercase tracking-widest text-sm mt-6"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                {/* Right Summary */}
                <div className="bg-gray-50 p-6 md:p-8 rounded-lg border border-gray-100">
                    <h2 className="text-xl font-serif mb-6 text-gray-900 border-b border-gray-200 pb-4">Order Summary</h2>

                    <div className="space-y-4 mb-6">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-16 h-16 rounded-sm bg-white overflow-hidden border border-gray-100 flex-shrink-0 relative">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                        {item.quantity}
                                    </div>
                                </div>
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700 font-medium line-clamp-2 pr-2">{item.title}</h3>
                                        {item.variantName && <p className="text-xs text-[var(--color-primary)] mt-0.5">{item.variantName}</p>}
                                    </div>
                                    <span className="text-sm font-medium whitespace-nowrap">
                                        Rp. {(parseFloat(String(item.price || 0).replace(/,/g, '')) * item.quantity).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>Rp. {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-[var(--color-primary)] font-medium">
                                <span>Tier Discount ({discountPercentage}%)</span>
                                <span>- Rp. {discountAmount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Shipping (Flat Rate)</span>
                            <span>Rp. {shipping.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                            <span>Total</span>
                            <span>Rp. {total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
