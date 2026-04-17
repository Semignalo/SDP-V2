import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AtSign, Lock, User, LogIn, UserPlus, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../api/client';

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
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

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
                await signup(email, password, name, refCodeParam || null);
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
                        {!isLogin && refCodeParam && (
                            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 text-sm font-medium mb-4 flex items-center justify-center">
                                Bergabung dengan referral: <span className="font-bold ml-1">{refCodeParam}</span>
                            </div>
                        )}

                        {!isLogin && (
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
                                        className="pl-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-sm focus:ring-primary focus:border-primary border transition"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
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
                                    className={`pl-10 w-full rounded-xl bg-neutral-50 p-3 text-sm border transition focus:outline-none focus:ring-2 ${
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
                                    minLength="6"
                                    className="pl-10 pr-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-sm focus:ring-primary/20 focus:border-primary border transition focus:outline-none focus:ring-2"
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
                </div>
            </div>
        </div>
    );
}
