import apiClient from './client';

export const adminApi = {
    getDashboard: async () => {
        const response = await apiClient.get('/admin/dashboard');
        return response.data;
    },

    getUsers: async (page = 1, search = '') => {
        const response = await apiClient.get('/admin/users', { params: { page, search } });
        return response.data;
    },

    updateUserRole: async (id, role) => {
        const response = await apiClient.put(`/admin/users/${id}/role`, { role });
        return response.data;
    },

    getCommissions: async (page = 1, status = '') => {
        const params = { page };
        if (status) params.status = status;
        const response = await apiClient.get('/admin/commissions', { params });
        return response.data;
    },

    payCommission: async (id) => {
        const response = await apiClient.put(`/admin/commissions/${id}/pay`);
        return response.data;
    },

    getUserDetail: async (id) => {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data;
    },

    bulkPayCommissions: async (commissionIds) => {
        const response = await apiClient.post('/admin/commissions/bulk-pay', { commission_ids: commissionIds });
        return response.data;
    },

    exportOrders: async () => {
        const response = await apiClient.get('/admin/orders/export');
        return response.data;
    },

    exportCommissions: async () => {
        const response = await apiClient.get('/admin/commissions/export');
        return response.data;
    }
};

export const userCommissionsApi = {
    getMyCommissions: async (page = 1) => {
        const response = await apiClient.get('/user/commissions', { params: { page } });
        return response.data;
    },

    getReferralLink: async () => {
        const response = await apiClient.get('/user/referral-link');
        return response.data;
    }
};
