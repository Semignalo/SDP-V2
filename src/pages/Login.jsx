import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AtSign, Lock, User, LogIn, UserPlus, Eye, EyeOff, CheckCircle, XCircle, Phone, MapPin, Building2, Hash, Tag } from 'lucide-react';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../api/client';
import { authApi } from '../api/authApi';

function getPasswordStrength(pwd) {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Lemah', color: 'bg-red-400', width: '25%', textColor: 'text-red-600' };
    if (score === 2) return { label: 'Sedang', color: 'bg-yellow-400', width: '50%', textColor: 'text-yellow-600' };
    if (score === 3) return { label: 'Kuat', color: 'bg-blue-400', width: '75%', textColor: 'text-blue-600' };
    return { label: 'Sangat Kuat', color: 'bg-green-500', width: '100%', textColor: 'text-green-600' };
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Default redirect to home, or where they came from
    const from = location.state?.from?.pathname || "/";
    const searchParams = new URLSearchParams(location.search);
    const refCodeParam = searchParams.get('ref') || '';

    // Initialize isLogin based on URL parameter — MUST be before useMemo
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'register' ? false : true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [referralCode, setReferralCode] = useState(refCodeParam);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

    const [referralStatus, setReferralStatus] = useState(null); // null | 'loading' | 'valid' | 'invalid'
    const [referralOwner, setReferralOwner] = useState('');
    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (referralCode.length !== 8) {
            setReferralStatus(null);
            setReferralOwner('');
            return;
        }
        setReferralStatus('loading');
        debounceRef.current = setTimeout(async () => {
            try {
                const data = await authApi.lookupReferral(referralCode);
                setReferralOwner(data.name);
                setReferralStatus('valid');
            } catch {
                setReferralOwner('');
                setReferralStatus('invalid');
            }
        }, 500);
        return () => clearTimeout(debounceRef.current);
    }, [referralCode]);

    const passwordStrength = useMemo(() => !isLogin ? getPasswordStrength(password) : null, [password, isLogin]);
    const emailError = emailTouched && email && !isValidEmail(email) ? 'Format email tidak valid' : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil',
                    text: 'Selamat datang kembali!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await signup({
                    name,
                    email,
                    password,
                    phone: phone || null,
                    referral_code: referralCode || null,
                    address: address || null,
                    city: city || null,
                    postal_code: postalCode || null,
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Registrasi Berhasil',
                    text: 'Akun kamu berhasil dibuat!',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            navigate(from, { replace: true });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: getErrorMessage(error)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-primary text-white p-8 text-center">
                    <h2 className="text-3xl font-bold mb-2">
                        {isLogin ? 'Selamat Datang' : 'Buat Akun Baru'}
                    </h2>
                    <p className="text-emerald-100/80 text-sm">
                        {isLogin ? 'Silakan masuk ke akun kamu untuk melanjutkan' : 'Daftar sekarang untuk mulai berbelanja'}
                    </p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <>
                                {/* Nama Lengkap */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-neutral-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="pl-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-base focus:ring-primary focus:border-primary border transition"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* No. HP */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        No. HP <span className="text-neutral-400 font-normal">(opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-neutral-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="pl-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-base focus:ring-primary/20 focus:border-primary border transition focus:outline-none focus:ring-2"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <AtSign className={`h-5 w-5 ${emailError ? 'text-red-400' : 'text-neutral-400'}`} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => setEmailTouched(true)}
                                    required
                                    className={`pl-10 w-full rounded-xl bg-neutral-50 p-3 text-base border transition focus:outline-none focus:ring-2 ${
                                        emailError
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                            : 'border-neutral-300 focus:ring-primary/20 focus:border-primary'
                                    }`}
                                    placeholder="kamu@email.com"
                                />
                                {emailTouched && email && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        {isValidEmail(email)
                                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                                            : <XCircle className="h-4 w-4 text-red-400" />}
                                    </div>
                                )}
                            </div>
                            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="8"
                                    className="pl-10 pr-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-base focus:ring-primary/20 focus:border-primary border transition focus:outline-none focus:ring-2"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition"
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Password strength indicator — only on register */}
                            {!isLogin && password && passwordStrength && (
                                <div className="mt-2">
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: passwordStrength.width }}
                                        />
                                    </div>
                                    <p className={`text-xs mt-1 font-medium ${passwordStrength.textColor}`}>
                                        Kekuatan password: {passwordStrength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {!isLogin && (
                            <>
                                {/* Alamat Pengiriman */}
                                <div className="pt-1">
                                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                                        Alamat Pengiriman <span className="text-neutral-400 font-normal normal-case">(opsional)</span>
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1">Alamat Lengkap</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPin className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="pl-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-base focus:ring-primary/20 focus:border-primary border transition focus:outline-none focus:ring-2"
                                                    placeholder="Jl. Contoh No. 123"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 mb-1">Kota</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Building2 className="h-4 w-4 text-neutral-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
                                                        className="pl-9 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-base focus:ring-primary/20 focus:border-primary border transition focus:outline-none focus:ring-2"
                                                        placeholder="Jakarta"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 mb-1">Kode Pos</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Hash className="h-4 w-4 text-neutral-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={postalCode}
                                                        onChange={(e) => setPostalCode(e.target.value)}
                                                        maxLength={10}
                                                        className="pl-9 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-base focus:ring-primary/20 focus:border-primary border transition focus:outline-none focus:ring-2"
                                                        placeholder="12345"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Kode Referral */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Kode Referral <span className="text-neutral-400 font-normal">(opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Tag className="h-5 w-5 text-neutral-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={referralCode}
                                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                            className="pl-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-base focus:ring-primary/20 focus:border-primary border transition focus:outline-none focus:ring-2 uppercase tracking-widest"
                                            placeholder="Contoh: ABCD1234"
                                            maxLength={8}
                                        />
                                    </div>
                                    {referralStatus === 'loading' && (
                                        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 border-2 border-neutral-300 border-t-primary rounded-full animate-spin" />
                                            Memeriksa kode...
                                        </p>
                                    )}
                                    {referralStatus === 'valid' && (
                                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Referral dari <span className="font-semibold">{referralOwner}</span>
                                        </p>
                                    )}
                                    {referralStatus === 'invalid' && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <XCircle className="w-3.5 h-3.5" />
                                            Kode referral tidak ditemukan
                                        </p>
                                    )}
                                    {!referralStatus && (
                                        <p className="text-xs text-neutral-400 mt-1">Kosongkan jika tidak punya kode referral</p>
                                    )}
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white p-3 rounded-xl font-medium transition-all transform hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="animate-pulse">Memproses...</span>
                            ) : isLogin ? (
                                <>
                                    <LogIn size={20} />
                                    Masuk Sekarang
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    Daftar Sekarang
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Section */}
                    <div className="mt-6 text-center text-sm text-neutral-600">
                        {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-semibold text-primary hover:underline"
                        >
                            {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
                        </button>
                    </div>

                    {/* Starcenter CTA */}
                    {!isLogin && (
                        <div className="mt-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-sm text-neutral-600">
                            Ingin bergabung sebagai mitra?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/daftar-center')}
                                className="font-semibold text-primary hover:underline"
                            >
                                Daftar sebagai Center
                            </button>
                        </div>
                    )}

                    {/* Forgot Password Link */}
                    {isLogin && (
                        <div className="mt-3 text-center text-sm">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-primary hover:underline font-medium"
                            >
                                Lupa Password?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
