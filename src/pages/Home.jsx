import { useState, useEffect } from 'react';
import { useAppearance } from '../contexts/AppearanceContext';
import { productApi } from '../api/productApi';
import { ArrowRight, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Home() {
    const { settings } = useAppearance();

    const [allProducts, setAllProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products from API
                const result = await productApi.getProducts({ per_page: 8 });
                setAllProducts(result.data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);


    return (
        <div className="flex flex-col w-full overflow-hidden">
            {/* Hero Section - Video Background */}
            <section className="relative w-full h-[85vh] sm:h-[600px] overflow-hidden">
                <video
                    key={settings?.heroVideoUrl || 'default-vid'}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    {/* Placeholder Luxury Gold/Liquid Video */}
                    <source src={settings?.heroVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="absolute bottom-[15%] left-0 right-0 text-center px-4 z-10">
                    <h1 className="text-4xl sm:text-5xl font-serif text-white mb-2 drop-shadow-md">
                        {settings?.heroTitle || 'True Radiance'}
                    </h1>
                    <p className="text-white/90 mb-8 max-w-xs mx-auto text-sm sm:text-base">
                        {settings?.heroSubtitle || 'Discover the new Gold Standard for your skin.'}
                    </p>
                    <button className="bg-[var(--color-accent)] text-white px-10 py-3.5 text-sm font-bold tracking-widest hover:bg-[var(--color-accent-dark)] transition-colors uppercase rounded-sm shadow-lg w-[200px]">
                        Explore
                    </button>
                </div>
            </section>

            {/* Promo / Special Sets Section (Horizontal Scroll for Mobile) */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                <Star className="text-[var(--color-accent)] fill-[var(--color-accent)]" size={20} />
                                <span>Promo</span>
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Special offers just for you</p>
                        </div>
                        <a href="#" className="text-xs font-bold text-[var(--color-accent-dark)] uppercase border-b border-[var(--color-accent)] pb-0.5">View all</a>
                    </div>

                    <div className="flex overflow-x-auto pb-4 gap-4 snap-x scrollbar-hide">
                        {allProducts.filter(p => p.isPromo).map(product => (
                            <div key={product.id} className="w-[170px] md:w-[240px] snap-start flex-shrink-0">
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Split Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-20">
                        {/* Video Left */}
                        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                            <div className="w-full max-w-[400px] aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden relative shadow-sm">
                                {settings?.goldSerumVideoUrl ? (
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        className="w-full h-full object-cover pointer-events-none"
                                        src={settings?.goldSerumVideoUrl}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 flex-col gap-2">
                                        <div className="animate-pulse bg-gray-200 w-full h-full absolute inset-0"></div>
                                        <span className="relative z-10 text-sm">Video belum diatur</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Right */}
                        <div className="w-full md:w-1/2 text-center">
                            <h2 className="text-2xl md:text-3xl text-[var(--color-accent)] font-serif mb-6 md:mb-8 font-medium">
                                {settings?.goldSerumSubtitle || 'Face cleansing balm'}
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 max-w-[400px] mx-auto font-medium">
                                {settings?.goldSerumDescription1 || 'This gentle cleansing balm deeply cleanses and removes even waterproof makeup without irritating or drying out eyes.'}
                            </p>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-10 max-w-[400px] mx-auto">
                                {settings?.goldSerumDescription2 || 'Fragrance-free, lightly scented with ginger and lemon essential oils.'}
                            </p>

                            <button className="border border-[var(--color-accent)] text-[var(--color-accent)] px-8 py-3.5 text-xs font-bold tracking-[0.2em] hover:bg-[var(--color-accent)] hover:text-white transition-colors uppercase w-[200px] rounded-sm">
                                TRY NOW &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Second Featured Split Section (Swapped Layout) */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-10 lg:gap-20">
                        {/* Video Right */}
                        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                            <div className="w-full max-w-[400px] aspect-[3/4] bg-white rounded-sm overflow-hidden relative shadow-sm">
                                {settings?.secondFeaturedVideoUrl ? (
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        className="w-full h-full object-cover pointer-events-none"
                                        src={settings?.secondFeaturedVideoUrl}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 flex-col gap-2">
                                        <div className="animate-pulse bg-gray-200 w-full h-full absolute inset-0"></div>
                                        <span className="relative z-10 text-sm">Video belum diatur</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Left */}
                        <div className="w-full md:w-1/2 text-center">
                            <h2 className="text-2xl md:text-3xl text-[var(--color-accent)] font-serif mb-6 md:mb-8 font-medium">
                                {settings?.secondFeaturedSubtitle || 'Our Concept'}
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 max-w-[400px] mx-auto font-medium">
                                {settings?.secondFeaturedDescription1 || 'A focus on healthy, radiant skin.'}
                            </p>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-10 max-w-[400px] mx-auto">
                                {settings?.secondFeaturedDescription2 || 'Crafted with passion.'}
                            </p>

                            <button className="border border-[var(--color-accent)] text-[var(--color-accent)] px-8 py-3.5 text-xs font-bold tracking-[0.2em] hover:bg-[var(--color-accent)] hover:text-white transition-colors uppercase w-[200px] rounded-sm">
                                EXPLORE &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Products Section (Grid 2 cols mobile) */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-serif text-gray-900 mb-2">All Product</h2>
                        <div className="h-0.5 w-10 bg-[var(--color-accent)] mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {allProducts.map(product => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
