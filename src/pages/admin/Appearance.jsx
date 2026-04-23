import React, { useState, useEffect } from 'react';
import { adminSettingsApi } from '../../api/settingsApi';
import { Save, Image, Type, Palette, Video, Upload, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const DEFAULT_CONFIG = {
    heroVideoUrl: 'https://cdn.pixabay.com/video/2023/10/22/186175-877661556_large.mp4',
    heroTitle: 'True Radiance',
    heroSubtitle: 'Discover the new Gold Standard for your skin.',
    logoUrl: '/logo.png',
    announcementText: 'New Collection 2026',
    primaryColor: '#1A1A1A',
    accentColor: '#C5A059',
    goldSerumVideoUrl: '',
    goldSerumSubtitle: 'Face cleansing balm',
    goldSerumDescription1: 'This gentle cleansing balm deeply cleanses and removes even waterproof makeup without irritating or drying out eyes.',
    goldSerumDescription2: 'Fragrance-free, lightly scented with ginger and lemon essential oils.',
    secondFeaturedVideoUrl: '',
    secondFeaturedSubtitle: 'Our Concept',
    secondFeaturedDescription1: 'A focus on healthy, radiant skin.',
    secondFeaturedDescription2: 'Crafted with passion.'
};

/**
 * Komponen untuk upload video dengan progress bar.
 * Menggunakan adminSettingsApi.uploadFile (Laravel storage).
 */
function VideoUploadField({ label, fieldName, value, onChange, hint }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const result = await adminSettingsApi.uploadFile(
                file,
                'appearance',
                (percent) => setUploadProgress(percent)
            );
            onChange(fieldName, result.url);
        } catch (error) {
            console.error('Upload gagal:', error);
            Swal.fire({
                title: 'Upload Gagal!',
                text: error?.response?.data?.message || error.message || 'Terjadi kesalahan saat upload.',
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">{label}</label>
            {hint && <p className="text-xs text-gray-500">{hint}</p>}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <input
                    name={fieldName}
                    value={value || ''}
                    onChange={(e) => onChange(fieldName, e.target.value)}
                    className="flex-1 min-w-0 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-xs"
                    placeholder="Paste video URL atau upload di bawah"
                />
                <label className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shrink-0">
                    <Upload size={16} /> Upload Video
                    <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                </label>
            </div>
            {isUploading && (
                <div className="mt-2 flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={14} />
                    <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{uploadProgress}%</span>
                </div>
            )}
            {value && (
                <div className="mt-4 max-w-[150px] aspect-[3/4] bg-black rounded-lg overflow-hidden relative">
                    <video src={value} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
}

export default function AdminAppearance() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [config, setConfig] = useState(DEFAULT_CONFIG);

    useEffect(() => {
        const fetchAppearance = async () => {
            try {
                const data = await adminSettingsApi.getAppearance();
                if (data && typeof data === 'object') {
                    setConfig(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Error fetching appearance settings:', error);
                // Gunakan default config jika fetch gagal
            } finally {
                setLoading(false);
            }
        };

        fetchAppearance();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    // Handler khusus untuk field yang diupdate dari komponen anak (VideoUploadField)
    const handleFieldChange = (fieldName, value) => {
        setConfig(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminSettingsApi.updateAppearance(config);
            localStorage.removeItem('appearance_settings_cache');
            setLastSaved(new Date());
            Swal.fire({
                title: 'Berhasil!',
                text: 'Pengaturan tampilan berhasil disimpan.',
                icon: 'success',
                confirmButtonColor: '#111827',
                confirmButtonText: 'Tutup'
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            Swal.fire({
                title: 'Gagal!',
                text: error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.',
                icon: 'error',
                confirmButtonColor: '#111827',
                confirmButtonText: 'Tutup'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-gray-500">Loading settings...</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Concept Appearance</h1>
                    <p className="text-gray-500 mt-1">Sesuaikan tampilan halaman depan website Anda.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-[#111827] hover:bg-black text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm shrink-0"
                >
                    <Save size={18} />
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Kolom Kiri: Form Settings */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Hero Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Video size={20} className="text-gray-400" />
                            Hero Section
                        </h3>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Type size={14} /> Headline Text
                                    </label>
                                    <input
                                        name="heroTitle"
                                        value={config.heroTitle}
                                        onChange={handleChange}
                                        placeholder="Contoh: True Radiance"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Subtitle Text</label>
                                    <input
                                        name="heroSubtitle"
                                        value={config.heroSubtitle}
                                        onChange={handleChange}
                                        placeholder="Contoh: Discover the new..."
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Hero Video Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Video URL (Background)
                                </label>
                                <div className="space-y-3">
                                    <input
                                        name="heroVideoUrl"
                                        value={config.heroVideoUrl}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-xs text-gray-600"
                                        placeholder="Paste video URL atau upload di bawah..."
                                    />
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <HeroVideoUploader
                                            onChange={(url) => handleFieldChange('heroVideoUrl', url)}
                                        />
                                    </div>
                                    {config.heroVideoUrl && (
                                        <div className="mt-2 relative rounded-lg overflow-hidden bg-black aspect-video group">
                                            <video
                                                src={config.heroVideoUrl}
                                                className="w-full h-full object-cover opacity-80"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <p className="text-white/80 text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                                    Current Background Preview
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400">Pastikan link berakhiran .mp4 untuk hasil terbaik.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branding Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Palette size={20} className="text-gray-400" />
                            Branding & Logo
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Image size={14} /> Logo Image URL
                                </label>
                                <input
                                    name="logoUrl"
                                    value={config.logoUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-xs"
                                />
                                <div className="p-4 bg-gray-100/50 border border-dashed border-gray-300 rounded-lg flex justify-center h-24 items-center">
                                    {config.logoUrl ? (
                                        <img src={config.logoUrl} alt="Preview" className="h-12 w-auto object-contain" />
                                    ) : (
                                        <span className="text-xs text-gray-400">No logo preview</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Accent Color (Gold)</label>
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <input
                                        type="color"
                                        name="accentColor"
                                        value={config.accentColor}
                                        onChange={handleChange}
                                        className="h-10 w-10 p-0 border-0 rounded cursor-pointer bg-transparent"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-700">{config.accentColor}</span>
                                        <span className="text-xs text-gray-400">Click color box to change</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Video & Text Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Video size={20} className="text-gray-400" />
                            Featured Video & Text Section
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Sub Judul</label>
                                <input
                                    name="goldSerumSubtitle"
                                    value={config.goldSerumSubtitle || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi Paragraf 1</label>
                                <textarea
                                    name="goldSerumDescription1"
                                    value={config.goldSerumDescription1 || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi Paragraf 2</label>
                                <textarea
                                    name="goldSerumDescription2"
                                    value={config.goldSerumDescription2 || ''}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <VideoUploadField
                                label="Video URL (Format MP4/WebM Terkompres)"
                                fieldName="goldSerumVideoUrl"
                                value={config.goldSerumVideoUrl}
                                onChange={handleFieldChange}
                                hint="Gunakan format video terkompres dengan framerate 30fps dan resolusi maksimal 1080p (vertikal 4:3) agar performa website tetap cepat."
                            />
                        </div>
                    </div>

                    {/* Second Featured Video Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Video size={20} className="text-gray-400" />
                            Second Featured Video Section (Video di kanan)
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Sub Judul</label>
                                <input
                                    name="secondFeaturedSubtitle"
                                    value={config.secondFeaturedSubtitle || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi Paragraf 1</label>
                                <textarea
                                    name="secondFeaturedDescription1"
                                    value={config.secondFeaturedDescription1 || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi Paragraf 2</label>
                                <textarea
                                    name="secondFeaturedDescription2"
                                    value={config.secondFeaturedDescription2 || ''}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <VideoUploadField
                                label="Video URL (Format MP4/WebM Terkompres)"
                                fieldName="secondFeaturedVideoUrl"
                                value={config.secondFeaturedVideoUrl}
                                onChange={handleFieldChange}
                                hint="Gunakan format video terkompres dengan framerate 30fps dan resolusi maksimal 1080p (vertikal 4:3)."
                            />
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Info */}
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                        <h4 className="text-blue-800 font-bold mb-2">Live Preview</h4>
                        <p className="text-sm text-blue-600 mb-4 leading-relaxed">
                            Setiap perubahan yang Anda simpan akan langsung aktif di halaman utama website.
                        </p>
                        <div className="text-xs bg-white/50 p-3 rounded text-blue-800 font-mono">
                            {lastSaved
                                ? `Last saved: ${lastSaved.toLocaleTimeString('id-ID')}`
                                : 'Belum ada perubahan disimpan'}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

/**
 * Sub-komponen upload untuk hero video (inline, karena layoutnya berbeda).
 */
function HeroVideoUploader({ onChange }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const result = await adminSettingsApi.uploadFile(
                file,
                'appearance',
                (percent) => setUploadProgress(percent)
            );
            onChange(result.url);
        } catch (error) {
            console.error('Upload gagal:', error);
            Swal.fire({
                title: 'Upload Gagal!',
                text: error?.response?.data?.message || error.message || 'Terjadi kesalahan saat upload.',
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <>
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Upload size={16} />
                Upload Video (MP4)
                <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={isUploading}
                />
            </label>
            {isUploading && (
                <div className="flex-1 flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={16} />
                    <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(uploadProgress)}%</span>
                </div>
            )}
        </>
    );
}
