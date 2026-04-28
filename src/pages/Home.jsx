import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppearance } from '../contexts/AppearanceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/home';
import { productApi } from '../api/productApi';
import { ArrowRight, ArrowLeft, Star, Leaf, Heart, ShieldCheck, Award, Quote } from 'lucide-react';

const PRODUCTS_PER_PAGE = 3;

/* ─────────────────────────────────────────────────────────────
   Home Product Card  (Aesop-style)
───────────────────────────────────────────────────────────── */
function HomeProductCard({ id, title, price, main_image_url, main_image, image, category, variants, stock, viewLabel, outOfStockLabel }) {
    const parsePrice = (p) => parseFloat(String(p || '0').replace(/[^0-9.]/g, '')) || 0;
    const displayPrice = variants?.length > 0
        ? `Rp ${Math.min(...variants.map(v => parsePrice(v.price))).toLocaleString('id-ID')}`
        : `Rp ${parsePrice(price).toLocaleString('id-ID')}`;
    const imageUrl = main_image_url || main_image || image;
    const isOutOfStock = stock !== undefined && stock !== null && stock <= 0;

    return (
        <Link to={`/product/${id}`} className="group flex flex-col">
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-5">
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <span className="text-white text-[10px] uppercase tracking-[0.2em]">{outOfStockLabel}</span>
                    </div>
                )}
                <img
                    src={imageUrl || '/logo.png'} alt={title}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    loading="lazy" onError={e => { e.target.src = '/logo.png'; }}
                />
            </div>
            <div className="text-center flex-1 flex flex-col px-2">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wide">{category}</p>
                <h3 className="font-serif text-gray-900 text-base mb-3 leading-snug">{title}</h3>
                <p className="text-sm text-gray-600 mb-5">{displayPrice}</p>
                <span className="mt-auto block w-full bg-[#1a1a1a] text-white text-[11px] tracking-[0.15em] uppercase py-3.5 group-hover:bg-[var(--color-accent)] transition-colors duration-300">
                    {viewLabel}
                </span>
            </div>
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default function Home() {
    const { settings }              = useAppearance();
    const { lang }                  = useLanguage();
    const tx                        = t[lang];

    const [allProducts, setAllProducts]   = useState([]);
    const [productPage, setProductPage]   = useState(0);
    const [productsError, setProductsError] = useState(false);

    useEffect(() => {
        productApi.getProducts({ per_page: 9 })
            .then(r => { setAllProducts(r.data || []); setProductsError(false); })
            .catch(() => setProductsError(true));
    }, []);

    const BRAND_VALUES = [
        { icon: Leaf,        ...tx.natural },
        { icon: Heart,       ...tx.cruelty },
        { icon: ShieldCheck, ...tx.halal   },
        { icon: Award,       ...tx.derm    },
    ];

    const totalPages      = Math.max(1, Math.ceil(allProducts.length / PRODUCTS_PER_PAGE));
    const visibleProducts = allProducts.slice(productPage * PRODUCTS_PER_PAGE, (productPage + 1) * PRODUCTS_PER_PAGE);

    return (
        <div className="flex flex-col w-full overflow-hidden">

            {/* ── 1. Hero ──────────────────────────────────────────── */}
            <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden">
                <video
                    key={settings?.heroVideoUrl || 'default-vid'}
                    autoPlay loop muted playsInline
                    preload="auto"
                    poster={settings?.heroVideoPoster || undefined}
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src={settings?.heroVideoUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-[12%] px-4 z-10 text-center">
                    <p className="text-white/60 text-xs italic tracking-widest mb-4">
                        {settings?.heroTag || tx.heroTag}
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-serif text-white mb-5 leading-tight max-w-2xl drop-shadow">
                        {settings?.heroTitle || 'True Radiance'}
                    </h1>
                    <p className="text-white/70 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
                        {settings?.heroSubtitle || (lang === 'en'
                            ? 'Discover the new Gold Standard for your skin.'
                            : 'Temukan standar baru keemasan untuk kulitmu.')}
                    </p>
                    <button className="border border-white/80 text-white px-10 py-3.5 text-xs tracking-[0.2em] hover:bg-white hover:text-gray-900 transition-colors duration-300 uppercase flex items-center gap-3">
                        {tx.heroBtn} <ArrowRight size={13} />
                    </button>
                </div>
            </section>

            {/* ── 2. Brand Values ──────────────────────────────────── */}
            <section className="py-14 bg-[#1a1a1a]">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {BRAND_VALUES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex flex-col items-center text-center gap-3">
                                <div className="w-11 h-11 rounded-full border border-[var(--color-accent)]/40 flex items-center justify-center mb-1">
                                    <Icon size={18} className="text-[var(--color-accent)]" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-serif text-white text-sm">{title}</h3>
                                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. Featured Split #1 ─────────────────────────────── */}
            <section className="py-16 md:py-24 bg-[#faf8f5]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-20">
                        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                            <div className="w-full max-w-[400px] aspect-[3/4] bg-stone-100 rounded-sm overflow-hidden relative shadow-sm">
                                {settings?.goldSerumVideoUrl ? (
                                    <video autoPlay loop muted playsInline preload="none"
                                        className="w-full h-full object-cover pointer-events-none"
                                        src={settings.goldSerumVideoUrl} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-stone-100">
                                        <div className="animate-pulse bg-stone-200 w-full h-full absolute inset-0" />
                                        <span className="relative z-10 text-sm">Video belum diatur</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center">
                            <h2 className="text-2xl md:text-3xl text-[var(--color-accent)] font-serif mb-6 md:mb-8 font-medium">
                                {settings?.goldSerumSubtitle || 'Face cleansing balm'}
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 max-w-[400px] mx-auto">
                                {settings?.goldSerumDescription1 || 'This gentle cleansing balm deeply cleanses and removes even waterproof makeup without irritating or drying out eyes.'}
                            </p>
                            <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-[400px] mx-auto">
                                {settings?.goldSerumDescription2 || 'Fragrance-free, lightly scented with ginger and lemon essential oils.'}
                            </p>
                            <button className="border border-[var(--color-accent)] text-[var(--color-accent)] px-8 py-3.5 text-xs font-bold tracking-[0.2em] hover:bg-[var(--color-accent)] hover:text-white transition-colors uppercase w-[200px] rounded-sm">
                                {lang === 'en' ? 'TRY NOW' : 'COBA SEKARANG'} &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. Featured Split #2 ─────────────────────────────── */}
            <section className="py-16 md:py-24 bg-[#f0ede8]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-10 lg:gap-20">
                        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                            <div className="w-full max-w-[400px] aspect-[3/4] bg-stone-50 rounded-sm overflow-hidden relative shadow-sm">
                                {settings?.secondFeaturedVideoUrl ? (
                                    <video autoPlay loop muted playsInline preload="none"
                                        className="w-full h-full object-cover pointer-events-none"
                                        src={settings.secondFeaturedVideoUrl} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-stone-100">
                                        <div className="animate-pulse bg-stone-200 w-full h-full absolute inset-0" />
                                        <span className="relative z-10 text-sm">Video belum diatur</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center">
                            <h2 className="text-2xl md:text-3xl text-[var(--color-accent)] font-serif mb-6 md:mb-8 font-medium">
                                {settings?.secondFeaturedSubtitle || 'Our Concept'}
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 max-w-[400px] mx-auto">
                                {settings?.secondFeaturedDescription1 || 'A focus on healthy, radiant skin.'}
                            </p>
                            <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-[400px] mx-auto">
                                {settings?.secondFeaturedDescription2 || 'Crafted with passion.'}
                            </p>
                            <button className="border border-[var(--color-accent)] text-[var(--color-accent)] px-8 py-3.5 text-xs font-bold tracking-[0.2em] hover:bg-[var(--color-accent)] hover:text-white transition-colors uppercase w-[200px] rounded-sm">
                                {lang === 'en' ? 'EXPLORE' : 'JELAJAHI'} &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. Editorial Image & Text (moved up, before products) */}
            <section className="flex flex-col md:flex-row min-h-[420px] md:min-h-[520px] bg-stone-50">
                <div className="w-full md:w-[45%] flex items-center px-8 md:px-16 lg:px-24 py-16 md:py-20">
                    <div className="max-w-[420px]">
                        {settings?.editorialTag && (
                            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-4">
                                {settings.editorialTag}
                            </p>
                        )}
                        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 leading-snug">
                            {settings?.editorialTitle || 'Crafted for Your Skin'}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-10">
                            {settings?.editorialDescription || ''}
                        </p>
                        <button className="border border-gray-900 text-gray-900 px-8 py-3.5 text-xs tracking-[0.15em] hover:bg-gray-900 hover:text-white transition-colors uppercase flex items-center gap-2">
                            {settings?.editorialCtaText || (lang === 'en' ? 'Browse Collection' : 'Lihat Koleksi')} <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
                <div className="w-full md:w-[55%] h-[300px] md:h-auto overflow-hidden">
                    {settings?.editorialImageUrl ? (
                        <img src={settings.editorialImageUrl} alt={settings?.editorialTitle || ''}
                            className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-stone-200 flex items-center justify-center min-h-[300px]">
                            <span className="text-stone-400 text-sm">
                                {lang === 'en' ? 'Image not set' : 'Gambar belum diatur'}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* ── 6. Products Carousel ─────────────────────────────── */}
            <section className="py-16 md:py-20 bg-[#faf8f5]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">{tx.productsLabel}</p>
                            <h2 className="text-2xl md:text-3xl font-serif text-gray-900">{tx.productsTitle}</h2>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setProductPage(p => Math.max(0, p - 1))}
                                disabled={productPage === 0}
                                className="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                aria-label="Previous"
                            ><ArrowLeft size={16} /></button>
                            <button
                                onClick={() => setProductPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={productPage >= totalPages - 1}
                                className="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                aria-label="Next"
                            ><ArrowRight size={16} /></button>
                        </div>
                    </div>

                    {productsError ? (
                        <div className="col-span-3 text-center py-16 text-gray-400 text-sm">
                            {lang === 'en'
                                ? 'Unable to load products. Please try again later.'
                                : 'Produk tidak dapat dimuat. Silakan coba lagi nanti.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
                            {visibleProducts.map(product => (
                                <HomeProductCard
                                    key={product.id} {...product}
                                    viewLabel={tx.viewProduct}
                                    outOfStockLabel={tx.outOfStock}
                                />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-10">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button key={i} onClick={() => setProductPage(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === productPage ? 'bg-gray-900 w-6' : 'bg-gray-300 w-1.5'}`}
                                    aria-label={`Page ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── 7. Testimonials ──────────────────────────────────── */}
            <section className="py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-3">{tx.testimLabel}</p>
                        <h2 className="text-2xl md:text-3xl font-serif text-gray-900">{tx.testimTitle}</h2>
                        <div className="h-px w-10 bg-[var(--color-accent)] mx-auto mt-5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tx.testimonials.map((t, i) => (
                            <div key={i} className="bg-[#faf8f5] rounded-sm p-7 border border-stone-100 flex flex-col gap-4 relative">
                                <Quote size={26} className="text-[var(--color-accent)]/15 absolute top-5 right-5" strokeWidth={1} />
                                <div className="flex gap-0.5">
                                    {Array.from({ length: t.rating }).map((_, s) => (
                                        <Star key={s} size={12} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
                                <div className="border-t border-stone-200 pt-4">
                                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                                    <p className="text-xs text-[var(--color-accent)] mt-0.5">{t.product}</p>
                                    <p className="text-xs text-gray-400">{t.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 8. Partnership CTA (moved to bottom, no MLM language) */}
            <section className="py-20 bg-[#111] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">{tx.ctaLabel}</p>
                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-5 leading-snug whitespace-pre-line">
                        {tx.ctaTitle}
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed max-w-lg mx-auto mb-10">
                        {tx.ctaDesc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button className="bg-[var(--color-accent)] text-white px-8 py-3.5 text-xs font-bold tracking-widest hover:bg-[var(--color-accent-dark)] transition-colors uppercase rounded-sm">
                            {tx.ctaBtn1}
                        </button>
                        <button className="border border-white/25 text-white/70 px-8 py-3.5 text-xs font-bold tracking-widest hover:border-white/60 hover:text-white transition-colors uppercase rounded-sm">
                            {tx.ctaBtn2}
                        </button>
                    </div>
                </div>
            </section>

            {/* ── 9. Quote (very bottom) ───────────────────────────── */}
            <section className="py-24 md:py-32 bg-[#f5f2ed]">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <p className="font-serif text-2xl md:text-3xl text-gray-800 italic leading-relaxed mb-7 whitespace-pre-line">
                        {tx.quoteText}
                    </p>
                    <div className="w-8 h-px bg-[var(--color-accent)] mx-auto mb-5" />
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">
                        {tx.quoteAuthor}
                    </p>
                </div>
            </section>

        </div>
    );
}
