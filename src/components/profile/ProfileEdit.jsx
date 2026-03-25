import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, Mail, Lock, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProfileEdit() {
    const { currentUser, userData, updateFirestoreUser, updateEmail, updatePassword } = useAuth();
    
    // Manage States
    const [name, setName] = useState(userData?.name || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [address, setAddress] = useState(userData?.address || '');
    const [email, setEmail] = useState(userData?.email || '');
    const [password, setPassword] = useState('');
    
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let updatePayload = {};

            if (name !== userData.name) updatePayload.name = name;
            if (phone !== userData.phone) updatePayload.phone = phone;
            if (address !== userData.address) updatePayload.address = address;

            if (Object.keys(updatePayload).length > 0) {
                await updateFirestoreUser(currentUser.uid, updatePayload);
            }

            if (email !== userData.email) {
                // Warning: Might throw 'auth/requires-recent-login'
                await updateEmail(email);
                await updateFirestoreUser(currentUser.uid, { email });
            }

            if (password) {
                // Warning: Might throw 'auth/requires-recent-login'
                await updatePassword(password);
            }

            Swal.fire({
                icon: 'success',
                title: 'Profil Diperbarui',
                text: 'Data profil berhasil disimpan.',
                timer: 1500,
                showConfirmButton: false
            });

            // Clear password field after update
            setPassword('');

        } catch (error) {
            console.error("Update profile error:", error);
            if (error.code === 'auth/requires-recent-login') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sesi Kedaluwarsa',
                    text: 'Untuk mengubah email atau password, mohon logout dan login kembali untuk memverifikasi keamanan.'
                });
            } else {
                Swal.fire('Error', error.message || 'Gagal memperbarui profil.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-[var(--color-primary)]" />
                Informasi Personal
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10 w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-primary focus:border-primary border transition"
                                placeholder="Masukkan nama"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp / HP</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="pl-10 w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-primary focus:border-primary border transition"
                                placeholder="Contoh: 08123456789"
                                required
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman Utama</label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows="2"
                            className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-primary focus:border-primary border transition resize-none"
                            placeholder="Alamat domisili kamu untuk mempermudah checkout..."
                        ></textarea>
                    </div>
                </div>

                <hr className="border-gray-100 my-6" />

                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Lock className="text-[var(--color-primary)]" />
                    Keamanan Akun
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-primary focus:border-primary border transition"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ubah Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength="6"
                                className="pl-10 w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-primary focus:border-primary border transition"
                                placeholder="Kosongkan jika tidak ingin diubah"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-transform transform active:scale-95"
                    >
                        {loading ? 'Menyimpan...' : <><Save size={18} /> Simpan Perubahan</>}
                    </button>
                </div>

            </form>
        </div>
    );
}
