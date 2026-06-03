import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { publicApi } from '../../utils/apiClient';

const CartContext = createContext(null);

const CART_ID_KEY = 'marvel_cart_id';

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cartId, setCartId] = useState(() => localStorage.getItem(CART_ID_KEY) || null);

    const buildHeaders = useCallback(() => ({
        ...(cartId ? { 'x-cart-id': cartId } : {}),
    }), [cartId]);

    const saveCartId = (id) => {
        if (id) {
            localStorage.setItem(CART_ID_KEY, id);
            setCartId(id);
        }
    };

    const syncCart = (data) => {
        if (data?.id) saveCartId(data.id);
        setCart(data);
    };

    const fetchCart = useCallback(async () => {
        if (!cartId) return;
        try {
            setLoading(true);
            const { data } = await publicApi.get('/api/v1/cart/', { headers: buildHeaders() });
            syncCart(data);
        } catch (err) {
            console.error('fetchCart error:', err);
        } finally {
            setLoading(false);
        }
    }, [cartId, buildHeaders]);

    useEffect(() => {
        fetchCart();
    }, []); // intentionally run once on mount

    const addItem = async (productId, sizeId, quantity = 1) => {
        try {
            setLoading(true);
            const { data } = await publicApi.post(
                '/api/v1/cart/items',
                { product_id: productId, size_id: sizeId, quantity },
                { headers: buildHeaders() }
            );
            syncCart(data);
            return { success: true };
        } catch (err) {
            console.error('addItem error:', err);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (itemId, quantity) => {
        try {
            const { data } = await publicApi.put(
                `/api/v1/cart/items/${itemId}`,
                { quantity },
                { headers: buildHeaders() }
            );
            syncCart(data);
        } catch (err) {
            console.error('updateItem error:', err);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const { data } = await publicApi.delete(
                `/api/v1/cart/items/${itemId}`,
                { headers: buildHeaders() }
            );
            syncCart(data);
        } catch (err) {
            console.error('removeItem error:', err);
        }
    };

    const clearCart = async () => {
        try {
            const { data } = await publicApi.delete('/api/v1/cart/', { headers: buildHeaders() });
            syncCart(data);
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
