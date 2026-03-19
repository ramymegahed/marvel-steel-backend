import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../../App';

const CartContext = createContext(null);

// Cart ID is stored in localStorage to persist across sessions (anonymous cart).
// The backend identifies carts via the `x-cart-id` header.
const CART_ID_KEY = 'marvel_cart_id';

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);   // full cart object from API
    const [loading, setLoading] = useState(false);
    const [cartId, setCartId] = useState(() => localStorage.getItem(CART_ID_KEY) || null);

    // Build headers — always include cart-id when available
    const buildHeaders = useCallback((extra = {}) => ({
        'Content-Type': 'application/json',
        ...(cartId ? { 'x-cart-id': cartId } : {}),
        ...extra,
    }), [cartId]);

    // Persist cart ID to localStorage whenever it changes
    const saveCartId = (id) => {
        if (id) {
            localStorage.setItem(CART_ID_KEY, id);
            setCartId(id);
        }
    };

    // Sync cart state from an API response and capture the cart ID
    const syncCart = (data) => {
        if (data?.id) saveCartId(data.id);
        setCart(data);
    };

    // ─── Fetch current cart ────────────────────────────────────────────────────
    const fetchCart = useCallback(async () => {
        if (!cartId) return;
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/api/v1/cart/`, {
                headers: buildHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                syncCart(data);
            }
        } catch (err) {
            console.error('fetchCart error:', err);
        } finally {
            setLoading(false);
        }
    }, [cartId, buildHeaders]);

    // Hydrate cart on mount if we already have a stored cart ID
    useEffect(() => {
        fetchCart();
    }, []);  // intentionally run once on mount

    // ─── Add item ──────────────────────────────────────────────────────────────
    const addItem = async (productId, sizeId, quantity = 1) => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/api/v1/cart/items`, {
                method: 'POST',
                headers: buildHeaders(),
                body: JSON.stringify({ product_id: productId, size_id: sizeId, quantity }),
            });
            if (res.ok) {
                const data = await res.json();
                syncCart(data);
                return { success: true };
            }
            return { success: false };
        } catch (err) {
            console.error('addItem error:', err);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // ─── Update item quantity ──────────────────────────────────────────────────
    const updateItem = async (itemId, quantity) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/cart/items/${itemId}`, {
                method: 'PUT',
                headers: buildHeaders(),
                body: JSON.stringify({ quantity }),
            });
            if (res.ok) {
                const data = await res.json();
                syncCart(data);
            }
        } catch (err) {
            console.error('updateItem error:', err);
        }
    };

    // ─── Remove single item ────────────────────────────────────────────────────
    const removeItem = async (itemId) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: buildHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                syncCart(data);
            }
        } catch (err) {
            console.error('removeItem error:', err);
        }
    };

    // ─── Clear entire cart ─────────────────────────────────────────────────────
    const clearCart = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/cart/`, {
                method: 'DELETE',
                headers: buildHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                syncCart(data);
            }
        } catch (err) {
            console.error('clearCart error:', err);
        }
    };

    const totalItems = cart?.total_items ?? 0;
    const totalPrice = cart?.total_price ?? 0;
    const items = cart?.items ?? [];

    return (
        <CartContext.Provider value={{
            cart, items, totalItems, totalPrice,
            loading, cartId,
            addItem, updateItem, removeItem, clearCart, fetchCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
};