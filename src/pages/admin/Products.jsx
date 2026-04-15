import React, { useState, useEffect } from 'react';
import { adminProductApi, productApi } from '../../api/productApi';
import { Plus, Trash2, Edit2, X, LayoutGrid, List, Upload, Loader2, GripHorizontal } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isGridView, setIsGridView] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        originalPrice: '',
        discount: '',
        category: 'The Act',
        description: '',
        image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800',
        media: [], // New media array for multiple images/videos
        variants: [], // Array of { name: '', price: '' }
        isPromo: false // Promo flag
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productApi.getProducts();
            setProducts(data.data || data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            title: '',
            price: '',
            originalPrice: '',
            discount: '',
            category: 'The Act',
            description: '',
            image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800',
            media: [],
            variants: [],
            isPromo: false
        });
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setEditId(product.id);
        const initialMedia = product.media && product.media.length > 0
            ? product.media.map(m => m.file_path ? `/storage/${m.file_path}` : m.url)
            : (product.main_image || product.image && product.image !== 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800' ? [product.main_image || product.image] : []);

        setFormData({
            title: product.title || '',
            price: product.price ? parseFloat(product.price).toString() : '',
            originalPrice: product.original_price || product.originalPrice ? parseFloat(product.original_price || product.originalPrice).toString() : '',
            discount: product.discount_label || product.discount || '',
            category: product.category || 'The Act',
            description: product.description || '',
            image: product.main_image || product.image || '',
            media: initialMedia,
            variants: product.variants ? product.variants.map(v => ({ name: v.name, price: v.price })) : [],
            isPromo: product.is_promo || product.isPromo || false
        });
        setIsModalOpen(true);
    };

    const [filesToUpload, setFilesToUpload] = useState([]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Save files to state so we upload them when submitting
        setFilesToUpload(prev => [...prev, ...files]);
        
        // Show local preview URLs immediately
        const previewUrls = files.map(file => URL.createObjectURL(file));
        
        setFormData(prev => {
            const newMedia = [...prev.media, ...previewUrls];
            const newImage = (prev.image === 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800' || !prev.image) && newMedia.length > 0
                ? newMedia[0]
                : prev.image;

            return {
                ...prev,
                media: newMedia,
                image: newImage
            };
        });
    };

    const removeMedia = (index) => {
        setFormData(prev => {
            const newMedia = prev.media.filter((_, i) => i !== index);
            // If main image was removed, update it
            let newImage = prev.image;
            if (prev.media[index] === prev.image) {
                newImage = newMedia.length > 0 ? newMedia[0] : '';
            }
            return { ...prev, media: newMedia, image: newImage };
        });
    };

    const setMainImage = (url) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    const handleAddVariant = () => {
        setFormData(prev => ({ ...prev, variants: [...prev.variants, { name: '', price: '' }] }));
    };

    const handleRemoveVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleVariantChange = (index, field, value) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[index][field] = value;
            return { ...prev, variants: newVariants };
        });
    };

    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedItemIndex === null) return;
        if (draggedItemIndex === targetIndex) return;

        setFormData(prev => {
            const newMedia = [...prev.media];
            const draggedItem = newMedia[draggedItemIndex];

            newMedia.splice(draggedItemIndex, 1);
            newMedia.splice(targetIndex, 0, draggedItem);

            return { ...prev, media: newMedia };
        });
        setDraggedItemIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsUploading(true);
            const apiData = {
                title: formData.title,
                price: parseFloat(String(formData.price).replace(/,/g, '')),
                original_price: formData.originalPrice ? parseFloat(String(formData.originalPrice).replace(/,/g, '')) : null,
                discount_label: formData.discount,
                category: formData.category,
                description: formData.description,
                is_promo: formData.isPromo,
                variants: formData.variants.map(v => ({ name: v.name, price: parseFloat(String(v.price).replace(/,/g, '')) }))
            };

            let savedProduct;

            if (isEditing && editId) {
                savedProduct = await adminProductApi.updateProduct(editId, apiData);
            } else {
                savedProduct = await adminProductApi.createProduct(apiData);
            }

            const productId = savedProduct.product?.id || editId;

            // Handle file uploads if any
            if (filesToUpload.length > 0 && productId) {
                setUploadProgress(50);
                await adminProductApi.uploadMedia(productId, filesToUpload);
                setFilesToUpload([]);
            }
            
            Swal.fire({
                title: 'Berhasil!',
                text: isEditing ? 'Produk berhasil diperbarui.' : 'Produk baru berhasil ditambahkan.',
                icon: 'success',
                confirmButtonColor: '#111827',
                timer: 2000,
                showConfirmButton: false
            });

            setIsModalOpen(false);
            setUploadProgress(0);
            setIsUploading(false);
            fetchProducts();
        } catch (error) {
            setIsUploading(false);
            console.error("Error saving product: ", error);
            Swal.fire({
                title: 'Gagal!',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan produk.',
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Produk?',
            text: "Anda tidak dapat mengembalikan produk yang sudah dihapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#111827',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await adminProductApi.deleteProduct(id);
                fetchProducts();
                Swal.fire({
                    title: 'Terhapus!',
                    text: 'Produk berhasil dihapus.',
                    icon: 'success',
                    confirmButtonColor: '#111827',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Error deleting product:", error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menghapus produk.',
                    icon: 'error',
                    confirmButtonColor: '#111827'
                });
            }
        }
    };

    const dummyData = [
        { title: "Starinc Glow Set", price: "1,250,000", originalPrice: "1,500,000", discount: "20%", category: "The Act", description: "A complete set for glowing skin.", image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800" },
        { title: "Ultimate Hydration", price: "980,000", originalPrice: "1,200,000", discount: "18%", category: "The Act", description: "Deep hydration for dry skin.", image: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=800" },
        { title: "Gold Serum Series", price: "450,000", originalPrice: "550,000", discount: "10%", category: "The Act", description: "Luxury gold serum for radiance.", image: "https://images.unsplash.com/photo-1611095567219-8fa7d4d8bf48?auto=format&fit=crop&q=80&w=800" },
        // ... (keeping dummy data concise for brevity, but functionality remains)
    ];

    const handleAddDummyData = async () => {
        const result = await Swal.fire({
            title: 'Tambahkan Data Dummy?',
            text: "Ini akan menambahkan beberapa produk contoh ke database via API.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#111827',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, tambahkan!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const batchPromises = dummyData.map(product => {
                    const priceNum = parseFloat(String(product.price).replace(/,/g, ''));
                    const originalPriceNum = parseFloat(String(product.originalPrice).replace(/,/g, ''));
                    return adminProductApi.createProduct({
                        title: product.title,
                        price: priceNum,
                        original_price: originalPriceNum,
                        discount_label: product.discount,
                        category: product.category,
                        description: product.description,
                        is_promo: false
                    }).then(res => {
                        // After creation, we ideally want to set the main image URL to the dummy URL
                        // But since API requires file uploads and doesn't take 'image' URL directly in store endpoint easily,
                        // we can try fetching the product and assuming the main image will be fallback.
                        // For a real app, dummy data would include sample media files.
                        return res;
                    });
                });
                await Promise.all(batchPromises);
                fetchProducts();
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data produk dummy berhasil ditambahkan.',
                    icon: 'success',
                    confirmButtonColor: '#111827'
                });
            } catch (error) {
                console.error("Error adding dummy products: ", error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menambah data dummy.',
                    icon: 'error',
                    confirmButtonColor: '#111827'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-sm text-gray-500">Manage your product inventory</p>
                </div>
                <div className="flex gap-3 items-center">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
                        <button
                            onClick={() => setIsGridView(false)}
                            className={`p-2 rounded-md transition-all ${!isGridView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setIsGridView(true)}
                            className={`p-2 rounded-md transition-all ${isGridView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>

                    <button
                        onClick={handleAddDummyData}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium hidden md:block"
                    >
                        + Dummy Data
                    </button>
                    <button
                        onClick={openAddModal}
                        className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[var(--color-accent-dark)] transition-colors"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Product List Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">No products found. Add your first one!</div>
                ) : (
                    <>
                        {isGridView ? (
                            // GRID VIEW
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => {
                                    const productImage = product.main_image || product.image || '/logo.png';
                                    const discountLabel = product.discount_label || product.discount;
                                    const originalPrice = product.original_price || product.originalPrice;

                                    return (
                                    <div key={product.id} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                            <img
                                                src={productImage}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {discountLabel && (
                                                <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                                                    {discountLabel}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                                            <h3 className="font-bold text-gray-900 mb-2 truncate">
                                                {product.title}
                                                {product.is_promo && <span className="ml-2 text-[10px] bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded uppercase font-bold">Promo</span>}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-[var(--color-primary)]">Rp. {parseFloat(product.price).toLocaleString('id-ID')}</div>
                                                    {originalPrice && (
                                                        <div className="text-xs text-gray-400 line-through">Rp. {parseFloat(originalPrice).toLocaleString('id-ID')}</div>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // LIST VIEW (TABLE)
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Description</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">Discount</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map((product) => {
                                            const productImage = product.main_image || product.image || '/logo.png';
                                            const discountLabel = product.discount_label || product.discount;
                                            const originalPrice = product.original_price || product.originalPrice;

                                            return (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={productImage}
                                                            alt={product.title}
                                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                        />
                                                        <span className="font-medium text-gray-900">
                                                            {product.title}
                                                            {product.is_promo && <span className="ml-2 text-[10px] bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded uppercase font-bold">Promo</span>}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600">{product.category}</td>
                                                <td className="p-4 text-gray-500 text-sm max-w-xs truncate">{product.description || '-'}</td>
                                                <td className="p-4 font-medium">
                                                    <div>Rp. {parseFloat(product.price).toLocaleString('id-ID')}</div>
                                                    {originalPrice && (
                                                        <div className="text-xs text-gray-400 line-through">Rp. {parseFloat(originalPrice).toLocaleString('id-ID')}</div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {discountLabel ? (
                                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                                                            {discountLabel}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold mb-6 text-gray-800">
                            {isEditing ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                                    placeholder="e.g. Starinc Glow Set"
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                <input
                                    type="checkbox"
                                    id="isPromo"
                                    name="isPromo"
                                    checked={formData.isPromo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPromo: e.target.checked }))}
                                    className="w-4 h-4 text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)]"
                                />
                                <label htmlFor="isPromo" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Tampilkan di Kolom Promo
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rp)</label>
                                    <input
                                        type="text"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                                        placeholder="e.g. 1,250,000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (Optional)</label>
                                    <input
                                        type="text"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                                        placeholder="e.g. 1,500,000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                                        placeholder="e.g. The Act"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                                    <input
                                        type="text"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                                        placeholder="e.g. 20%"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Details</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all resize-none"
                                    placeholder="Enter product description and details..."
                                ></textarea>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">Product Variants (Optional)</label>
                                    <button
                                        type="button"
                                        onClick={handleAddVariant}
                                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        + Add Variant
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">Adding variants will allow users to choose options (e.g. Size 50ml, Size 100ml) with independent pricing.</p>

                                {formData.variants.length > 0 && (
                                    <div className="space-y-3">
                                        {formData.variants.map((variant, index) => (
                                            <div key={index} className="flex gap-3 items-center">
                                                <input
                                                    type="text"
                                                    placeholder="Variant Name (e.g. Besar 100ml)"
                                                    value={variant.name}
                                                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                                    required
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Price (Rp)"
                                                    value={variant.price}
                                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                    required
                                                    className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariant(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Media (Images & Videos)</label>

                                {/* URL Input (for manual add) */}
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all mb-2"
                                    placeholder="Paste Main Image URL manually or use upload below..."
                                />

                                {/* File Upload */}
                                <div className="flex items-center gap-2 mb-4">
                                    <label className="flex-1 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Upload size={24} />
                                            <span className="text-sm font-medium">Click to upload images or videos</span>
                                            <span className="text-xs text-gray-400">Multiple files supported</span>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>

                                {/* Progress Bar */}
                                {isUploading && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Uploading media...</span>
                                            <span>{Math.round(uploadProgress)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--color-accent)] transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Media Grid */}
                                {formData.media && formData.media.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {formData.media.map((url, idx) => (
                                            <div
                                                key={url + idx}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, idx)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, idx)}
                                                onDragEnd={handleDragEnd}
                                                className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-move transition-all ${formData.image === url ? 'border-[var(--color-accent)]' : 'border-gray-200'} ${draggedItemIndex === idx ? 'opacity-40 scale-95 border-dashed border-gray-400' : 'opacity-100 hover:scale-[1.02]'}`}
                                            >
                                                {/* Visual Grip Icon */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    <div className="bg-black/40 p-2 rounded-full text-white backdrop-blur-sm shadow-sm ring-1 ring-white/20">
                                                        <GripHorizontal size={24} />
                                                    </div>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeMedia(idx); }}
                                                    className="absolute top-1 right-1 z-20 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                                    title="Remove"
                                                >
                                                    <X size={14} />
                                                </button>

                                                {/* Set Main Image Button */}
                                                {formData.image !== url && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMainImage(url); }}
                                                        className="absolute bottom-1 left-1 right-1 z-20 bg-white/95 text-xs py-1.5 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity font-medium shadow-sm hover:bg-gray-50 text-gray-800"
                                                    >
                                                        Set as Main
                                                    </button>
                                                )}

                                                {/* Main Image Label */}
                                                {formData.image === url && (
                                                    <div className="absolute top-1 left-1 z-20 bg-[var(--color-accent)] text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">
                                                        MAIN
                                                    </div>
                                                )}

                                                {/* Media Content */}
                                                {url.includes('.mp4') || url.includes('.webm') || url.includes('video') ? (
                                                    <video
                                                        src={url}
                                                        className="w-full h-full object-cover pointer-events-none"
                                                        controls={false}
                                                        muted
                                                    />
                                                ) : (
                                                    <img
                                                        src={url}
                                                        alt="Product media"
                                                        className="w-full h-full object-cover pointer-events-none bg-gray-50 bg-opacity-50"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[var(--color-accent)] text-white font-bold py-3 rounded-lg hover:bg-[var(--color-accent-dark)] transition-colors"
                                >
                                    {isEditing ? 'Update Product' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
