import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { ChevronDown, SlidersHorizontal, ChevronRight, Check } from 'lucide-react';

export default function Catalog() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 1000000]);
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Checkbox states for product types
    const [filters, setFilters] = useState({
        bodyScrub: false,
        faceCare: false,
        kids: false,
        bodyCare: false,
        hairCare: false,
        homeDecor: false
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await productApi.getProducts({ per_page: 50 });
                const productsData = response.data || [];
                setProducts(productsData);
                setFilteredProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = products;

        // 1. Filter by Name (Search Query)
        if (searchQuery) {
            result = result.filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Filter by Price (backend returns decimal string e.g. "150000.00")
        result = result.filter(product => {
            const price = parseFloat(String(product.price || '0').replace(/[^0-9.]/g, '')) || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // 3. Filter by Category (Product Type)
        // Check if any filter is active
        const activeFilters = Object.keys(filters).filter(key => filters[key]);
        if (activeFilters.length > 0) {
            result = result.filter(product => {
                return activeFilters.some(filterKey => {
                    const label = filterKey.replace(/([A-Z])/g, ' $1').toLowerCase(); // "bodyScrub" -> "body scrub"
                    const productCategory = (product.category || '').toLowerCase();
                    const productTitle = (product.title || '').toLowerCase();

                    return productCategory.includes(label) || productTitle.includes(label);
                });
            });
        }

        setFilteredProducts(result);
    }, [products, searchQuery, priceRange, filters, showOutOfStock]);

    const toggleFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Top Badge (Optional if needed to match image exactly, but maybe redundant with Navbar) */}

            <div className="container mx-auto px-4 py-8 md:py-12">

                {/* Header Section */}
                <div className="text-center mb-10">
                    <span className="bg-[#FFE066] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest mb-2 inline-block">
                        Best Sellers
                    </span>
                    <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-primary)] font-medium mb-2">
                        All products
                    </h1>
                    <p className="text-gray-500 text-sm">{filteredProducts.length} products</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">

                        {/* Filter Header & Search */}
                        <div className="space-y-4 border-b border-gray-100 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <SlidersHorizontal size={18} />
                                    <span>Filter</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </div>
                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-sm px-3 py-2 outline-none focus:border-black transition-colors"
                            />
                        </div>

                        {/* Out of Stock Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">Out of stock</span>
                            <div className="flex items-center text-xs font-medium border border-gray-200 rounded-sm">
                                <button
                                    className={`px-3 py-1 ${showOutOfStock ? 'bg-black text-white' : 'bg-transparent text-gray-500'}`}
                                    onClick={() => setShowOutOfStock(true)}
                                >
                                    Show
                                </button>
                                <button
                                    className={`px-3 py-1 ${!showOutOfStock ? 'bg-black text-white' : 'bg-transparent text-gray-500'}`}
                                    onClick={() => setShowOutOfStock(false)}
                                >
                                    Hide
                                </button>
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-gray-900">Price</span>
                                <ChevronDown size={16} className="text-gray-400 rotate-180" />
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="border border-gray-200 px-3 py-2 text-sm text-gray-600 w-1/2 rounded-sm flex items-center">
                                    <span className="text-gray-400 mr-1">Rp.</span>
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        className="w-full outline-none bg-transparent"
                                        onChange={(e) => {
                                            const val = Math.min(Number(e.target.value), priceRange[1] - 1);
                                            setPriceRange([val, priceRange[1]]);
                                        }}
                                    />
                                </div>
                                <div className="border border-gray-200 px-3 py-2 text-sm text-gray-600 w-1/2 rounded-sm flex items-center">
                                    <span className="text-gray-400 mr-1">Rp.</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        className="w-full outline-none bg-transparent"
                                        onChange={(e) => {
                                            const val = Math.max(Number(e.target.value), priceRange[0] + 1);
                                            setPriceRange([priceRange[0], val]);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Functional Dual Slider */}
                            <div className="relative h-6 mt-6">
                                {/* Track */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2"></div>

                                {/* Active Track Range */}
                                <div
                                    className="absolute top-1/2 h-1 bg-black rounded-full -translate-y-1/2"
                                    style={{
                                        left: `${(priceRange[0] / 1000000) * 100}%`,
                                        right: `${100 - (priceRange[1] / 1000000) * 100}%`
                                    }}
                                ></div>

                                {/* Min Thumb Input */}
                                <input
                                    type="range"
                                    min="0"
                                    max="1000000"
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const val = Math.min(Number(e.target.value), priceRange[1] - 10000); // Prevent overlap
                                        setPriceRange([val, priceRange[1]]);
                                    }}
                                    className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer z-10"
                                />

                                {/* Max Thumb Input */}
                                <input
                                    type="range"
                                    min="0"
                                    max="1000000"
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const val = Math.max(Number(e.target.value), priceRange[0] + 10000); // Prevent overlap
                                        setPriceRange([priceRange[0], val]);
                                    }}
                                    className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer z-20"
                                />
                            </div>
                        </div>

                        {/* Product Type Filter */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-gray-900">Product type</span>
                                <ChevronDown size={16} className="text-gray-400 rotate-180" />
                            </div>
                            <div className="grid grid-cols-2 gap-y-3">
                                {Object.entries(filters).map(([key, checked]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center transition-colors ${checked ? 'bg-black border-black' : 'bg-white group-hover:border-gray-400'}`}>
                                            {checked && <Check size={12} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleFilter(key)}
                                            className="hidden"
                                        />
                                        <span className="text-sm text-gray-600 capitalize group-hover:text-gray-900 transition-colors">
                                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Sort Bar */}
                        <div className="flex justify-end mb-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 cursor-pointer">
                                <span>Featured</span>
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} {...product} />
                                ))}
                            </div>
                        )}

                        {!loading && filteredProducts.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No products found matching your filters.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
