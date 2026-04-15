<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * List all products (public).
     */
    public function index(Request $request)
    {
        $query = Product::with(['variants', 'media']);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('promo')) {
            $query->where('is_promo', true);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('sort_order')->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($products);
    }

    /**
     * Get a single product (public).
     */
    public function show(int $id)
    {
        $product = Product::with(['variants', 'media'])->findOrFail($id);
        return response()->json($product);
    }

    /**
     * Create a product (admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'price'          => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'discount_label' => 'nullable|string|max:50',
            'category'       => 'required|string|max:100',
            'description'    => 'nullable|string',
            'is_promo'       => 'boolean',
            'sort_order'     => 'integer',
            'variants'       => 'nullable|array',
            'variants.*.name'  => 'required_with:variants|string|max:100',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
        ]);

        $product = Product::create($validated);

        // Create variants
        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $variant) {
                $product->variants()->create($variant);
            }
        }

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'product' => $product->load(['variants', 'media']),
        ], 201);
    }

    /**
     * Update a product (admin).
     */
    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'title'          => 'sometimes|string|max:255',
            'price'          => 'sometimes|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'discount_label' => 'nullable|string|max:50',
            'category'       => 'sometimes|string|max:100',
            'description'    => 'nullable|string',
            'is_promo'       => 'boolean',
            'sort_order'     => 'integer',
            'variants'       => 'nullable|array',
            'variants.*.name'  => 'required_with:variants|string|max:100',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
        ]);

        $product->update($validated);

        // Sync variants if provided
        if (array_key_exists('variants', $validated)) {
            $product->variants()->delete();
            foreach ($validated['variants'] ?? [] as $variant) {
                $product->variants()->create($variant);
            }
        }

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'product' => $product->load(['variants', 'media']),
        ]);
    }

    /**
     * Delete a product (admin).
     */
    public function destroy(int $id)
    {
        $product = Product::findOrFail($id);

        // Delete associated media files
        foreach ($product->media as $media) {
            Storage::disk('public')->delete($media->file_path);
        }

        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    /**
     * Upload media for a product (admin).
     */
    public function uploadMedia(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'files'   => 'required|array',
            'files.*' => 'file|mimes:jpg,jpeg,png,webp,gif,mp4,webm|max:20480', // 20MB max
        ]);

        $uploaded = [];

        foreach ($request->file('files') as $file) {
            $path = $file->store('products', 'public');
            $type = str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image';

            $media = $product->media()->create([
                'file_path'  => $path,
                'type'       => $type,
                'sort_order' => $product->media()->count(),
            ]);

            $uploaded[] = $media;

            // Set as main image if product doesn't have one
            if (!$product->main_image) {
                $product->update(['main_image' => $path]);
            }
        }

        return response()->json([
            'message' => count($uploaded) . ' file berhasil diunggah.',
            'media'   => $uploaded,
        ]);
    }
}
