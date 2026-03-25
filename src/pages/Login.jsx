import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AtSign, Lock, User, LogIn, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Default redirect to home, or where they came from
    const from = location.state?.from?.pathname || "/";

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
                await signup(email, password, name);
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
                text: getErrorMessage(error.code)
            });
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-credential':
                return 'Email atau password salah. Coba lagi.';
            case 'auth/email-already-in-use':
                return 'Email ini sudah terdaftar. Silakan login.';
            case 'auth/weak-password':
                return 'Password terlalu lemah. Minimal 6 karakter.';
            default:
                return 'Terjadi kesalahan. Silakan coba lagi.';
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
                                    <AtSign className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-sm focus:ring-primary focus:border-primary border transition"
                                    placeholder="kamu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="6"
                                    className="pl-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-sm focus:ring-primary focus:border-primary border transition"
                                    placeholder="••••••••"
                                />
                            </div>
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
