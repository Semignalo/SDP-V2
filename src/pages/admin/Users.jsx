import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Edit2, Search, UserCheck, UserX, Shield, Crown, User as UserIcon, Eye, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers();
            setUsers(data.data || data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditRole = async (user) => {
        const { value: newRole } = await Swal.fire({
            title: `Ubah Tipe User untuk ${user.name || user.email}`,
            input: 'select',
            inputOptions: {
                'regular': 'Regular Member',
                'starcenter': 'Official Starinc Distributor (Starcenter)',
                'admin': 'Admin'
            },
            inputPlaceholder: 'Pilih Tipe User',
            inputValue: user.role || 'regular',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal'
        });

        if (newRole && newRole !== user.role) {
            try {
                await adminApi.updateUserRole(user.id, newRole);
                const updatedTier = newRole === 'starcenter' ? { slug: 'diamond', name: 'Diamond' } : user.tier;
                setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole, tier: updatedTier } : u));
                Swal.fire({
                    title: 'Berhasil!',
                    text: `Tipe berhasil diubah menjadi ${newRole.toUpperCase()}.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Error updating user role:", error);
                Swal.fire('Error', 'Gagal mengubah tipe user.', 'error');
            }
        }
    };

    const handleViewDetail = async (user) => {
        setDetailLoading(true);
        setSelectedUser({ ...user, fetchedDetails: null });
        try {
            const data = await adminApi.getUserDetail(user.id);
            setSelectedUser({ ...user, fetchedDetails: data });
        } catch (e) {
            console.error("Error fetching detail", e);
            Swal.fire('Error', 'Gagal mengambil detail.', 'error');
            setSelectedUser(null);
        } finally {
            setDetailLoading(false);
        }
    }

    const getRoleBadge = (user) => {
        if (user.role === 'admin') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200 flex items-center w-max gap-1">
                    <Shield size={14} /> Admin
                </span>
            );
        }
        if (user.role === 'starcenter') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200 flex items-center w-max gap-1">
                    <Crown size={14} /> Official Starinc Distributor
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200 flex items-center w-max gap-1">
                <UserIcon size={14} /> Regular Member
            </span>
        );
    };

    const getTierBadge = (tier) => {
        const colors = {
            bronze: 'bg-[#cd7f32] text-white',
            silver: 'bg-gray-300 text-gray-800',
            gold: 'bg-yellow-400 text-yellow-900',
            platinum: 'bg-blue-200 text-blue-900',
            diamond: 'bg-purple-500 text-white'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[tier] || colors.silver}`}>
                {tier || 'SILVER'}
            </span>
        );
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
                    <p className="text-sm text-gray-500">Kelola role dan tier customer</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari Nama / Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">Memuat data pengguna...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">Tidak ada pengguna ditemukan.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100 text-sm">
                                <tr>
                                    <th className="p-4">Nama Lengkap</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Tanggal Daftar</th>
                                    <th className="p-4">Tipe User & Tier</th>
                                    <th className="p-4">Total Spending</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => {
                                    const dateStr = user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
                                    const tierSlug = user.tier?.slug || 'bronze';
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm font-medium text-gray-900">
                                                {user.name || '-'}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {dateStr}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2 items-start">
                                                    {getRoleBadge(user)}
                                                    {user.role !== 'admin' && getTierBadge(tierSlug)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-gray-900">
                                                Rp. {(user.cumulative_spending || user.cumulativeSpending || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetail(user)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                                                        title="Detail User"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditRole(user)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center"
                                                        title="Ubah Role"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserIcon className="text-blue-500" /> Detail Pengguna
                            </h2>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            {detailLoading || !selectedUser.fetchedDetails ? (
                                <div className="py-20 text-center text-gray-500">Memuat detail riwayat pelanggan...</div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Nama</p>
                                            <p className="font-bold">{selectedUser.fetchedDetails.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-bold">{selectedUser.fetchedDetails.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-bold">{selectedUser.fetchedDetails.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Referrer (Upline)</p>
                                            <p className="font-bold text-blue-600">{selectedUser.fetchedDetails.referrer?.name || 'Tidak ada'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Role / Auth</p>
                                            <div>{getRoleBadge(selectedUser.fetchedDetails)}</div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Tier Aktif</p>
                                            <div className="mt-1">{getTierBadge(selectedUser.fetchedDetails.tier?.slug)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 pt-6"></div>

                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-4">Riwayat Pesanan (20 Terakhir)</h3>
                                        {selectedUser.fetchedDetails.orders?.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">Belum ada riwayat pesanan.</p>
                                        ) : (
                                            <div className="border rounded-lg overflow-hidden shrink-0">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2">ID</th>
                                                            <th className="px-4 py-2">Tanggal</th>
                                                            <th className="px-4 py-2 text-right">Total</th>
                                                            <th className="px-4 py-2">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {selectedUser.fetchedDetails.orders?.map(order => (
                                                            <tr key={order.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 font-medium">{order.order_number}</td>
                                                                <td className="px-4 py-2 text-gray-600">
                                                                    {new Date(order.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-2 text-right font-bold whitespace-nowrap">
                                                                    Rp {Number(order.total).toLocaleString('id-ID')}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-100 px-2 flex py-0.5 w-max">
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
