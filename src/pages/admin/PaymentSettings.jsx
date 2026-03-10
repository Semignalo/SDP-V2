import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Building2, CreditCard, User } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PaymentSettings() {
    const [config, setConfig] = useState({
        bankName: 'BCA',
        accountNumber: '888888888',
        accountName: 'PT BBK' // Default as requested
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPaymentSettings = async () => {
            try {
                const docRef = doc(db, "settings", "payment");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setConfig(docSnap.data());
                } else {
                    console.log("No payment settings found, using defaults.");
                }
            } catch (error) {
                console.error("Error fetching payment settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentSettings();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "payment"), config);
            Swal.fire({
                title: 'Berhasil!',
                text: 'Pengaturan pembayaran berhasil disimpan.',
                icon: 'success',
                confirmButtonColor: '#111827',
                confirmButtonText: 'Tutup'
            });
        } catch (error) {
            console.error("Error saving payment settings:", error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Terjadi kesalahan saat menyimpan pengaturan.',
                icon: 'error',
                confirmButtonColor: '#111827',
                confirmButtonText: 'Tutup'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-gray-500">Memuat pengaturan...</div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payment Settings</h1>
                    <p className="text-sm text-gray-500">Atur rekening bank tujuan transfer pembayaran customer</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#047857] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#065F46] transition-colors disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Loading...' : 'Save Settings'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Building2 size={16} /> Nama Bank
                    </label>
                    <input
                        type="text"
                        name="bankName"
                        value={config.bankName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all uppercase"
                        placeholder="Contoh: BCA, BNI, MANDIRI"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CreditCard size={16} /> Nomor Rekening
                    </label>
                    <input
                        type="text"
                        name="accountNumber"
                        value={config.accountNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all font-mono tracking-wider"
                        placeholder="Contoh: 888888888"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <User size={16} /> Nama Pemilik Rekening (A/N)
                    </label>
                    <input
                        type="text"
                        name="accountName"
                        value={config.accountName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all uppercase"
                        placeholder="Contoh: PT BBK"
                    />
                </div>

            </div>
        </div>
    );
}
