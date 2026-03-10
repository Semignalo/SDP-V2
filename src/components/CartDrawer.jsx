import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function CartDrawer() {
    const {
        cart,
        isCartOpen,
        closeCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount
    } = useCart();

    const navigate = useNavigate();

    // Timer state for "Cart reserved"
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (!isCartOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isCartOpen]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const cartTotal = getCartTotal();
    const freeShippingThreshold = 500000;
    const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
    const remainingForFreeShipping = Math.max(freeShippingThreshold - cartTotal, 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 backdrop-blur-sm",
                    isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-[80] w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-serif font-medium text-[var(--color-primary)]">
                        Your cart ({getCartCount()})
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                <div className="px-5 py-4 bg-gray-50/50">
                    <p className="text-sm text-gray-600 mb-2">
                        {remainingForFreeShipping > 0 ? (
                            <>Spend <span className="font-bold text-black">Rp. {remainingForFreeShipping.toLocaleString('id-ID')}</span> more for <span className="font-bold text-black">free shipping!</span></>
                        ) : (
                            <span className="font-bold text-green-600">You've unlocked free shipping!</span>
                        )}
                    </p>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Hot Choice Timer */}
                {cart.length > 0 && (
                    <div className="bg-[#FFF4C3] px-5 py-3 flex items-center gap-2 text-sm text-yellow-900">
                        <Clock size={16} />
                        <span>Hot choice! Cart reserved for {formatTime(timeLeft)} minutes!</span>
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                            <p>Your cart is empty.</p>
                            <button
                                onClick={closeCart}
                                className="text-[var(--color-accent)] underline font-medium"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.cartItemId || item.id} className="flex gap-4">
                                <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                                            {item.variantName && (
                                                <p className="text-xs font-medium text-[var(--color-primary)] mt-0.5">{item.variantName}</p>
                                            )}
                                            <p className="text-gray-500 text-xs mt-1">Rp. {item.price}</p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">
                                            Rp. {(parseFloat(String(item.price || 0).replace(/,/g, '')) * item.quantity).toLocaleString('id-ID')}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-gray-200 rounded-sm">
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                                                className="px-2 py-1 hover:bg-gray-50 text-gray-600 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="px-2 py-1 text-sm font-medium min-w-[30px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                                                className="px-2 py-1 hover:bg-gray-50 text-gray-600 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.cartItemId || item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                            <span>Subtotal:</span>
                            <span>Rp. {cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-xs text-gray-500">Taxes and Shipping calculated at checkout</p>

                        <div className="space-y-2">
                            <button
                                onClick={() => { closeCart(); navigate('/checkout'); }}
                                className="w-full bg-[#047857] hover:bg-[#065F46] text-white font-bold py-3.5 rounded-sm shadow-md transition-colors uppercase tracking-widest text-sm"
                            >
                                Checkout
                            </button>
                            <button
                                onClick={closeCart}
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-3.5 rounded-sm transition-colors uppercase tracking-widest text-sm"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
