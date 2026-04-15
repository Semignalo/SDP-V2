<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    protected $fillable = [
        'title', 'price', 'original_price', 'discount_label',
        'category', 'description', 'main_image', 'is_promo', 'sort_order',
    ];

    protected $casts = [
        'price'          => 'decimal:2',
        'original_price' => 'decimal:2',
        'is_promo'       => 'boolean',
    ];

    protected $appends = ['main_image_url'];

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ProductMedia::class)->orderBy('sort_order');
    }

    /**
     * Full public URL for the main image.
     * Returns null if no main_image is set.
     */
    public function getMainImageUrlAttribute(): ?string
    {
        if (!$this->main_image) return null;
        return Storage::disk('public')->url($this->main_image);
    }
}
