import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { Star, Truck, ShieldCheck, Leaf, Info } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                if (!id) return;
                
                const data = await productApi.getProduct(id);
                setProduct(data);
                setMainImage(data.main_image_url || data.main_image);
                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
                <Link to="/" className="text-[var(--color-accent)] underline">Return into Home</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                {/* Left Column - Images */}
                <div className="space-y-4">
                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden rounded-sm">
                        {product.discount && (
                            <div className="absolute top-0 right-0 bg-[#E53E3E] text-white text-sm font-bold px-4 py-1.5 z-10">
                                {product.discount} OFF
                            </div>
                        )}

                        {mainImage && (mainImage.includes('.mp4') || mainImage.includes('video')) ? (
                            <video
                                src={mainImage}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={mainImage}
                                alt={product.title}
                                className="w-full h-full object-cover object-center"
                            />
                        )}
                    </div>
                    {/* Thumbnails */}
                    {product.media && product.media.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.media.map((item, idx) => {
                                const itemUrl = item.url || item;
                                const isVideo = item.type === 'video' || itemUrl?.includes('.mp4') || itemUrl?.includes('.webm');
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(itemUrl)}
                                        className={`relative aspect-[3/4] bg-gray-50 overflow-hidden border transition-all ${mainImage === itemUrl ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        {isVideo ? (
                                            <video src={itemUrl} className="w-full h-full object-cover pointer-events-none" muted />
                                        ) : (
                                            <img src={itemUrl} alt={`View ${idx}`} className="w-full h-full object-cover" />
                                        )}
                                        {isVideo && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center p-1">
                                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-black border-b-[4px] border-b-transparent ml-0.5"></div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column - Product Info */}
                <div className="flex flex-col">
                    <div className="mb-2">
                        <span className="text-sm font-medium text-gray-900 border-b border-black pb-0.5">By {product.category || 'The Act'}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-primary)] mb-4 font-normal">
                        {product.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-medium text-[var(--color-sale)]">
                                Rp. {Number(selectedVariant ? selectedVariant.price : product.price).toLocaleString('id-ID')}
                            </span>
                            {product.originalPrice && !selectedVariant && (
                                <span className="text-lg text-gray-400 line-through">Rp. {Number(product.originalPrice).toLocaleString('id-ID')}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={14} className="fill-[#fbbf24] text-[#fbbf24]" />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">(12 reviews)</span>
                        </div>
                    </div>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Varian Produk</h4>
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((v, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVariant(v)}
                                        className={`px-4 py-2 border rounded-sm text-sm font-medium transition-all ${selectedVariant?.name === v.name
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-300 text-gray-700 hover:border-black'
                                            }`}
                                    >
                                        {v.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                        <p>
                            Soft and smooth skin on your feet is easy even without professional care in a salon.
                            The Act foot cream contains urea, a natural component of our body and a natural moisturizer.
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-1">
                            <li>Retains moisture inside the skin</li>
                            <li>Accelerates the healing process of small wounds</li>
                            <li>Softens rough skin layers</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-2">Volume: <span className="text-gray-900 font-medium">150 ml</span></p>
                        <p className="text-sm text-gray-500">Weight: <span className="text-gray-900 font-medium">70 g</span></p>
                    </div>

                    {/* Free Sachets Box */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-8 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-sm mb-1">Free sachets</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>3 gifts items included</span>
                            </div>
                        </div>
                        <div className="flex -space-x-2">
                            <div className="w-10 h-12 bg-green-800 rounded-sm shadow-sm"></div>
                            <div className="w-10 h-12 bg-orange-400 rounded-sm shadow-sm z-10"></div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 mb-10">
                        <button
                            onClick={() => {
                                const productToAdd = {
                                    ...product,
                                    cartItemId: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
                                    price: selectedVariant ? selectedVariant.price : product.price,
                                    variantName: selectedVariant ? selectedVariant.name : undefined,
                                    variantId: selectedVariant ? selectedVariant.id : undefined
                                };
                                addToCart(productToAdd);
                            }}
                            className="w-full border border-black text-black py-4 font-bold text-sm tracking-widest hover:bg-black hover:text-white transition-colors uppercase"
                        >
                            Add to Cart
                        </button>
                        <button className="w-full bg-[#047857] text-white py-4 font-bold text-sm tracking-widest hover:bg-[#065F46] transition-colors uppercase shadow-sm">
                            Buy it Now
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8 text-center bg-gray-50/50 p-4 rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                            <Leaf size={24} className="text-gray-400 stroke-[1.5]" />
                            <span className="text-xs text-gray-600 font-medium">100% Vegan</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <ShieldCheck size={24} className="text-gray-400 stroke-[1.5]" />
                            <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Truck size={24} className="text-gray-400 stroke-[1.5]" />
                            <span className="text-xs text-gray-600 font-medium">Fast Shipping</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
