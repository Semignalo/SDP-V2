import apiClient from './client';

export const settingsApi = {
    getAppearance: async () => {
        const response = await apiClient.get('/appearance');
        return response.data;
    },
    
    getPaymentInfo: async () => {
        const response = await apiClient.get('/settings/payment');
        return response.data;
    },

    getTiers: async () => {
        const response = await apiClient.get('/tiers');
        return response.data;
    }
};

export const adminSettingsApi = {
    getSettings: async () => {
        const response = await apiClient.get('/admin/settings');
        return response.data;
    },
    
    updateSettings: async (settings) => {
        const response = await apiClient.put('/admin/settings', { settings });
        return response.data;
    },

    getAppearance: async () => {
        const response = await apiClient.get('/admin/appearance');
        return response.data;
    },

    updateAppearance: async (settings) => {
        const response = await apiClient.put('/admin/appearance', { settings });
        return response.data;
    }
};
