import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem('shopping-cart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Failed to parse cart from local storage", error);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('shopping-cart', JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save cart to local storage", error);
        }
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart(prevCart => {
            const compositeId = product.cartItemId || product.id;
            const existingItem = prevCart.find(item => (item.cartItemId || item.id) === compositeId);
            if (existingItem) {
                return prevCart.map(item =>
                    (item.cartItemId || item.id) === compositeId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity }];
            }
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (identifier) => {
        setCart(prevCart => prevCart.filter(item => (item.cartItemId || item.id) !== identifier));
    };

    const updateQuantity = (identifier, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(identifier);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                (item.cartItemId || item.id) === identifier ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            if (!item || !item.price) return total;
            // Remove commas and parse price
            const priceStr = String(item.price).replace(/,/g, '');
            const price = parseFloat(priceStr) || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const value = {
        cart,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        openCart,
        closeCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
