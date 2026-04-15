import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../api/settingsApi';

const AppearanceContext = createContext();

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error('useAppearance must be used within an AppearanceProvider');
    }
    return context;
}

export function AppearanceProvider({ children }) {
    const [settings, setSettings] = useState({
        heroVideoUrl: 'https://cdn.pixabay.com/video/2023/10/22/186175-877661556_large.mp4',
        heroTitle: 'True Radiance',
        heroSubtitle: 'Discover the new Gold Standard for your skin.',
        logoUrl: '/logo.png',
        accentColor: '#C5A059'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsApi.getAppearance();
                setSettings(prev => ({ ...prev, ...data }));
                
                // Update CSS variable dynamically
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

    return (
        <AppearanceContext.Provider value={{ settings, loading }}>
            {children}
        </AppearanceContext.Provider>
    );
}
