import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../api/orderApi';
import { settingsApi } from '../api/settingsApi';
import { TIER_CONFIG } from '../lib/tierUtils';
import { getErrorMessage } from '../api/client';
import { CheckCircle2, MapPin, ShoppingBag, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

// Progress Stepper Component
function CheckoutStepper({ currentStep }) {
    const steps = [
        { id: 1, label: 'Shipping', icon: MapPin },
        { id: 2, label: 'Review', icon: ShoppingBag },
        { id: 3, label: 'Payment', icon: CreditCard },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="flex items-center justify-center gap-0">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isCompleted ? 'bg-[#047857] text-white' : isActive ? 'bg-[var(--color-primary)] text-white ring-4 ring-gray-200' : 'bg-gray-100 text-gray-400'}
                                `}>
                                    {isCompleted ? (
                                        <CheckCircle2 size={20} />
                                    ) : (
                                        <Icon size={18} />
                                    )}
                                </div>
                                <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-[var(--color-primary)]' : isCompleted ? 'text-[#047857]' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-0.5 w-16 sm:w-24 mx-1 mb-4 transition-colors duration-300 ${currentStep > step.id ? 'bg-[#047857]' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { userData } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [moqThreshold, setMoqThreshold] = useState(5000000); // Default fallback
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
    });

    // Fetch MOQ threshold from server
    useEffect(() => {
        if (userData?.role === 'starcenter') {
            settingsApi.getSystemSettings()
                .then((data) => {
                    setMoqThreshold(data.moq_threshold ?? 5000000);
                })
                .catch((error) => {
                    console.error('Failed to fetch MOQ threshold:', error);
                    // Use default fallback
                });
        }
    }, [userData]);

    // Initialize form with UserData if logged in
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name || prev.name,
                phone: userData.phone || prev.phone,
                address: userData.address || prev.address,
                city: userData.city || prev.city,
                postalCode: userData.postal_code || prev.postalCode
            }));
        }
    }, [userData]);

    const subtotal = getCartTotal();
    const isStarcenter = userData?.role === 'starcenter';
    const moqMet = !isStarcenter || subtotal >= moqThreshold;

    // Tier Discount Logic (just for frontend display, backend recalculates)
    const discountPercentage = userData?.tier?.discount_percent || 0;
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

        // Starcenter Batch check (frontend validation, backend also validates)
        if (userData?.role === 'starcenter' && total < moqThreshold) {
            Swal.fire({
                title: 'Minimum Belanja Belum Tercapai',
                text: `Sebagai akun Starcenter (Official Distributor), minimum transaksi adalah Rp ${moqThreshold.toLocaleString('id-ID')}.`,
                icon: 'warning',
                confirmButtonColor: '#111827'
            });
            return;
        }

        setLoading(true);

        try {
            const itemsData = cart.map(item => ({
                product_id: item.id,
                variant_id: item.variantId || null,
                quantity: item.quantity
            }));

            const response = await orderApi.checkout({
                customer_info: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode
                },
                items: itemsData
            });

            clearCart();

            Swal.fire({
                title: 'Pesanan Dibuat!',
                text: 'Silakan lanjutkan ke halaman pembayaran.',
                icon: 'success',
                confirmButtonColor: '#111827',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate(`/invoice/${response.order_number}`);
            });

        } catch (error) {
            console.error('Error creating order:', error);
            Swal.fire({
                title: 'Gagal!',
                text: getErrorMessage(error, 'Terjadi kesalahan saat membuat pesanan.'),
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <CheckoutStepper currentStep={1} />
            <div className="flex justify-center">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Form */}
                <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
                    {/* MOQ Warning Banner for Starcenter */}
                    {isStarcenter && !moqMet && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Minimum Order Belum Terpenuhi</p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Akun Starcenter memiliki minimum transaksi <strong>Rp {moqThreshold.toLocaleString('id-ID')}</strong>.
                                    Saat ini subtotal Anda <strong>Rp {subtotal.toLocaleString('id-ID')}</strong>.
                                </p>
                            </div>
                        </div>
                    )}
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
                            disabled={loading || !moqMet}
                            title={!moqMet ? `Minimum order Rp ${moqThreshold.toLocaleString('id-ID')} belum terpenuhi` : ''}
                            className={`w-full font-bold py-4 rounded-sm shadow-md transition-colors uppercase tracking-widest text-sm mt-6 ${
                                loading || !moqMet
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#047857] hover:bg-[#065F46] text-white'
                            }`}
                        >
                            {loading ? 'Processing...' : !moqMet ? 'MOQ Belum Terpenuhi' : 'Place Order'}
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
                                    <img src={item.main_image || item.image} alt={item.title} className="w-full h-full object-cover" />
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
        </div>
    );
}
