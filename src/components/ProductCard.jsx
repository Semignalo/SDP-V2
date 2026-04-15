import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function ProductCard({ id, title, price, originalPrice, discount, image, main_image, main_image_url, category = "The Act", variants = [] }) {
    // Parse numeric price (backend returns decimal string, e.g. "150000.00")
    const parsePrice = (p) => parseFloat(String(p || '0').replace(/[^0-9.]/g, '')) || 0;
    const displayPrice = variants && variants.length > 0
        ? `Mulai dari Rp. ${Math.min(...variants.map(v => parsePrice(v.price))).toLocaleString('id-ID')}`
        : `Rp. ${parsePrice(price).toLocaleString('id-ID')}`;

    // Image: prefer accessor url, fallback to raw path, then legacy image prop
    const imageUrl = main_image_url || main_image || image;
    return (
        <Link to={`/product/${id}`} className="group cursor-pointer block">
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                {discount && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wide z-10">
                        {discount} off
                    </div>
                )}
                <img
                    src={imageUrl || '/logo.png'}
                    alt={title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = '/logo.png'; }}
                />
                {/* Dots placeholder for slider indicator */}
                <div className="absolute bottom-4 left-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm"></div>
                </div>
            </div>

            {/* Details */}
            <div className="flex flex-col items-start text-left">
                <p className="text-xs text-gray-400 mb-1">{category}</p>
                <h3 className="text-base font-normal text-gray-900 mb-2 group-hover:underline decoration-1 underline-offset-4">{title}</h3>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                    <span className="text-lg font-medium text-gray-900">{displayPrice}</span>
                    {originalPrice && variants.length === 0 && (
                        <span className="text-sm text-gray-400 line-through decoration-gray-400">Rp. {originalPrice}</span>
                    )}
                </div>

                {discount && <p className="text-red-600 text-sm mt-1">Sale</p>}
            </div>
        </Link>
    );
}
