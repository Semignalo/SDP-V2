/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../api/settingsApi';

const AppearanceContext = createContext();

// Cache TTL: 5 menit (dalam milidetik)
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_KEY = 'appearance_settings_cache';

const DEFAULT_SETTINGS = {
    heroVideoUrl: 'https://cdn.pixabay.com/video/2023/10/22/186175-877661556_large.mp4',
    heroTitle: 'True Radiance',
    heroSubtitle: 'Discover the new Gold Standard for your skin.',
    logoUrl: '/logo.png',
    accentColor: '#C5A059'
};

/**
 * Membaca cache appearance dari localStorage.
 * Mengembalikan data jika belum expired, null jika expired atau tidak ada.
 */
function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, timestamp } = JSON.parse(raw);
        const isExpired = Date.now() - timestamp > CACHE_TTL;
        if (isExpired) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        return data;
    } catch {
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
}

/**
 * Menyimpan data appearance ke localStorage dengan timestamp.
 */
function writeCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
        // localStorage penuh atau disabled, abaikan
    }
}

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error('useAppearance must be used within an AppearanceProvider');
    }
    return context;
}

export function AppearanceProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            // Cek cache terlebih dahulu
            const cached = readCache();
            if (cached) {
                setSettings(prev => ({ ...prev, ...cached }));
                if (cached.accentColor) {
                    document.documentElement.style.setProperty('--color-accent', cached.accentColor);
                }
                setLoading(false);
                return;
            }

            // Cache miss — fetch dari API
            try {
                const data = await settingsApi.getAppearance();
                setSettings(prev => ({ ...prev, ...data }));
                writeCache(data);

                if (data.accentColor) {
                    document.documentElement.style.setProperty('--color-accent', data.accentColor);
                }
            } catch (err) {
                console.error("Failed to fetch appearance settings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    /**
     * Memaksa refresh appearance (invalidate cache lalu fetch ulang).
     * Bisa dipanggil setelah admin mengubah appearance.
     */
    const refreshAppearance = async () => {
        localStorage.removeItem(CACHE_KEY);
        setLoading(true);
        try {
            const data = await settingsApi.getAppearance();
            setSettings(prev => ({ ...prev, ...data }));
            writeCache(data);
            if (data.accentColor) {
                document.documentElement.style.setProperty('--color-accent', data.accentColor);
            }
        } catch (err) {
            console.error("Failed to refresh appearance settings:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppearanceContext.Provider value={{ settings, loading, refreshAppearance }}>
            {children}
        </AppearanceContext.Provider>
    );
}
