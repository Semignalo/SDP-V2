import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import apiClient from '../../api/client';
import { ArrowLeft, Lock, Shield, Zap, Users, ShoppingCart, TrendingUp, Copy, Check, X, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [network, setNetwork] = useState(null);
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    // Form states
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newTierId, setNewTierId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUserDetail();
        fetchTiers();
    }, [id]);

    const fetchUserDetail = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUserDetail(id);
            setUser(data.user);
            setNetwork(data.network);
            setNewRole(data.user.role);
            setNewTierId(data.user.tier_id);
        } catch (error) {
            console.error("Error fetching user:", error);
            Swal.fire('Error', 'Gagal memuat data user.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTiers = async () => {
        try {
            const response = await apiClient.get('/tiers');
            setTiers(response.data);
        } catch (error) {
            console.error("Error fetching tiers:", error);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Swal.fire('Error', 'Password harus diisi.', 'error');
            return;
        }
        if (newPassword.length < 8) {
            Swal.fire('Error', 'Password minimal 8 karakter.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire('Error', 'Password tidak cocok.', 'error');
            return;
        }

        try {
            setSubmitting(true);
            await adminApi.updateUserPassword(id, newPassword, confirmPassword);
            setNewPassword('');
            setConfirmPassword('');
            Swal.fire('Berhasil', 'Password user berhasil diubah.', 'success');
        } catch (error) {
            console.error("Error updating password:", error);
            Swal.fire('Error', 'Gagal mengubah password.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRole = async () => {
        if (newRole === user.role) {
            Swal.fire('Info', 'Role tidak berubah.', 'info');
            return;
        }

        try {
            setSubmitting(true);
            const response = await adminApi.updateUserRole(id, newRole);
            setUser(response.user);
            Swal.fire('Berhasil', `Role berhasil diubah menjadi ${newRole}.`, 'success');
        } catch (error) {
            console.error("Error updating role:", error);
            Swal.fire('Error', 'Gagal mengubah role.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateTier = async () => {
        if (newTierId === user.tier_id) {
            Swal.fire('Info', 'Tier tidak berubah.', 'info');
            return;
        }

        try {
            setSubmitting(true);
            const response = await adminApi.updateUserTier(id, newTierId);
            setUser(response.user);
            setNewTierId(response.user.tier_id);
            Swal.fire('Berhasil', response.message, 'success');
        } catch (error) {
            console.error("Error updating tier:", error);
            Swal.fire('Error', 'Gagal mengubah tier.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        Swal.fire('Berhasil', 'Teks disalin ke clipboard.', 'success');
    };

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    if (!user) {
        return <div className="p-6 text-center text-red-600">User tidak ditemukan.</div>;
    }

    const currentTier = tiers.find(t => t.id === user.tier_id);
    const roleDisplay = {
        regular: { label: 'Regular Member', color: 'bg-blue-100 text-blue-800' },
        starcenter: { label: 'Starcenter (Distributor)', color: 'bg-purple-100 text-purple-800' },
        admin: { label: 'Admin', color: 'bg-red-100 text-red-800' }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Kembali"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{user.name || user.email}</h1>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleDisplay[user.role].color}`}>
                    {roleDisplay[user.role].label}
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {['profile', 'access', 'password', 'network', 'orders', 'commissions'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium transition-colors capitalize border-b-2 ${
                            activeTab === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'network' && network ? `Network (${network.total_downlines})` : tab}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Nama</p>
                            <p className="text-sm font-medium text-gray-900">{user.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Email</p>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Role</p>
                            <p className="text-sm font-medium text-gray-900">{roleDisplay[user.role].label}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Tier</p>
                            <p className="text-sm font-medium text-gray-900">{currentTier?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Cumulative Spending</p>
                            <p className="text-sm font-medium text-gray-900">Rp. {Number(user.cumulative_spending || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Referral Code</p>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded">{user.referral_code || '-'}</code>
                                {user.referral_code && (
                                    <button
                                        onClick={() => copyToClipboard(user.referral_code)}
                                        className="p-1 hover:bg-gray-100 rounded transition"
                                        title="Copy"
                                    >
                                        <Copy size={16} className="text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {user.referrer && (
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Upline / Referrer</p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-900">{user.referrer.name}</p>
                                <p className="text-xs text-gray-500">{user.referrer.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Access Control Tab */}
            {activeTab === 'access' && (
                <div className="space-y-6">
                    {/* Role Change */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={20} /> Ubah Role
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role Baru</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="regular">Regular Member</option>
                                    <option value="starcenter">Starcenter (Distributor)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button
                                onClick={handleUpdateRole}
                                disabled={submitting || newRole === user.role}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                            >
                                {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                                Simpan Role
                            </button>
                        </div>
                    </div>

                    {/* Tier Change */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap size={20} /> Ubah Tier (Manual Override)
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tier Baru</label>
                                <select
                                    value={newTierId}
                                    onChange={(e) => setNewTierId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    {tiers.map(tier => (
                                        <option key={tier.id} value={tier.id}>
                                            {tier.name} ({tier.discount_percent}% discount) - Min: Rp. {Number(tier.min_spend).toLocaleString('id-ID')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleUpdateTier}
                                disabled={submitting || newTierId === user.tier_id}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                            >
                                {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                                Simpan Tier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock size={20} /> Reset Password
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ulangi password"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleUpdatePassword}
                            disabled={submitting || !newPassword || !confirmPassword}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                        >
                            {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
                            Reset Password
                        </button>
                    </div>
                </div>
            )}

            {/* Network Tab */}
            {activeTab === 'network' && network && (
                <div className="space-y-6">
                    {network.uplines.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Upline Chain</h3>
                            <div className="space-y-2">
                                {network.uplines.map(upline => (
                                    <div key={upline.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm font-medium text-gray-900">{upline.name}</p>
                                        <p className="text-xs text-gray-500">{upline.email} • Level {upline.depth}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {network.downlines.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Users size={20} /> Downline ({network.downlines.length})
                            </h3>
                            <div className="space-y-2">
                                {network.downlines.map(downline => (
                                    <div key={downline.id} className="p-3 bg-green-50 rounded-lg border border-green-200 flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{downline.name}</p>
                                            <p className="text-xs text-gray-500">{downline.email}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Level {downline.depth}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {network.downlines.length === 0 && network.uplines.length === 0 && (
                        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
                            User ini bukan starcenter atau tidak memiliki jaringan.
                        </div>
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && user.orders && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Order</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Tanggal</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Total</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {user.orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td>
                                        <td className="px-4 py-3 text-gray-600">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">Rp. {Number(order.total).toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {user.orders.length === 0 && (
                        <div className="p-6 text-center text-gray-500">User belum memiliki order.</div>
                    )}
                </div>
            )}

            {/* Commissions Tab */}
            {activeTab === 'commissions' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-500 text-sm">Commission history akan ditampilkan di sini.</p>
                </div>
            )}
        </div>
    );
}
