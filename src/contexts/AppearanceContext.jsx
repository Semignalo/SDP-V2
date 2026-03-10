import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

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
        // Real-time subscription to appearance settings
        if (!db) {
            console.warn("Firebase DB not initialized, skipping real-time updates.");
            setLoading(false);
            return;
        }

        try {
            const unsubscribe = onSnapshot(doc(db, "settings", "appearance"), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setSettings(prev => ({ ...prev, ...data }));

                    // Update CSS variable dynamically
                    if (data.accentColor) {
                        document.documentElement.style.setProperty('--color-accent', data.accentColor);
                    }
                }
                setLoading(false);
            }, (error) => {
                console.error("Failed to fetch settings:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Critical error in AppearanceContext:", err);
            setLoading(false);
        }
    }, []);

    return (
        <AppearanceContext.Provider value={{ settings, loading }}>
            {children}
        </AppearanceContext.Provider>
    );
}
