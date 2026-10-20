<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')->latest();

        if ($request->has('category') && $request->category !== 'all' && $request->category !== '') {
            $cat = $request->category;
            $query->where(function ($q) use ($cat) {
                $q->where('category_slug', $cat)
                    ->orWhere('category_id', $cat)
                    ->orWhereHas('category', function ($sub) use ($cat) {
                        $sub->where('slug', $cat)
                            ->orWhere('id', $cat)
                            ->orWhere('name', $cat);
                    });
            });
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_desc', 'like', "%{$search}%");
            });
        }

        $products = $query->get();

        return response()->json([
            'success' => true,
            'tools' => $products,
            'products' => $products,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        if (isset($input['priceMonthly']) && ! isset($input['price_monthly'])) {
            $input['price_monthly'] = $input['priceMonthly'];
        }
        if (isset($input['priceLifetime']) && ! isset($input['price_lifetime'])) {
            $input['price_lifetime'] = $input['priceLifetime'];
        }
        if (isset($input['shortDesc']) && ! isset($input['short_desc'])) {
            $input['short_desc'] = $input['shortDesc'];
        }
        if (isset($input['category'])) {
            if (is_numeric($input['category'])) {
                $input['category_id'] = (int) $input['category'];
            } elseif (! isset($input['category_slug'])) {
                $input['category_slug'] = (string) $input['category'];
            }
        }
        if (isset($input['includedInSub']) && ! isset($input['included_in_sub'])) {
            $input['included_in_sub'] = $input['includedInSub'];
        }
        $request->merge($input);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'product_id' => 'nullable|string|unique:products,product_id',
            'category_id' => 'nullable|exists:categories,id',
            'category_slug' => 'nullable|string',
            'badge' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews_count' => 'nullable|integer',
            'users_count' => 'nullable|string',
            'short_desc' => 'nullable|string',
            'description' => 'nullable|string',
            'capabilities' => 'nullable',
            'price_monthly' => 'nullable|numeric|min:0',
            'price_lifetime' => 'nullable|numeric|min:0',
            'included_in_sub' => 'nullable|boolean',
            'engine_version' => 'nullable|string',
            'latency' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $count = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$count++;
            }
            $validated['slug'] = $slug;
        }
        if (empty($validated['product_id'])) {
            $validated['product_id'] = $validated['slug'];
        }

        // Resolve Category robustly by ID or Slug
        if (! empty($validated['category_id'])) {
            $cat = Category::find($validated['category_id']);
            if ($cat) {
                $validated['category_slug'] = $cat->slug;
            }
        } elseif (! empty($validated['category_slug'])) {
            $cat = is_numeric($validated['category_slug'])
                ? Category::find($validated['category_slug'])
                : Category::where('slug', $validated['category_slug'])->first();
            if ($cat) {
                $validated['category_id'] = $cat->id;
                $validated['category_slug'] = $cat->slug;
            }
        }

        // Capabilities formatting
        if (isset($validated['capabilities']) && is_string($validated['capabilities'])) {
            $validated['capabilities'] = array_map('trim', explode(',', $validated['capabilities']));
        }

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'tool' => $product->load('category'),
            'product' => $product->load('category'),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $product = Product::where('id', $id)
            ->orWhere('slug', $id)
            ->orWhere('product_id', $id)
            ->with('category')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'tool' => $product,
            'product' => $product,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::where('id', $id)
            ->orWhere('slug', $id)
            ->orWhere('product_id', $id)
            ->firstOrFail();

        $input = $request->all();
        if (isset($input['priceMonthly']) && ! isset($input['price_monthly'])) {
            $input['price_monthly'] = $input['priceMonthly'];
        }
        if (isset($input['priceLifetime']) && ! isset($input['price_lifetime'])) {
            $input['price_lifetime'] = $input['priceLifetime'];
        }
        if (isset($input['shortDesc']) && ! isset($input['short_desc'])) {
            $input['short_desc'] = $input['shortDesc'];
        }
        if (isset($input['category'])) {
            if (is_numeric($input['category'])) {
                $input['category_id'] = (int) $input['category'];
            } elseif (! isset($input['category_slug'])) {
                $input['category_slug'] = (string) $input['category'];
            }
        }
        if (isset($input['includedInSub']) && ! isset($input['included_in_sub'])) {
            $input['included_in_sub'] = $input['includedInSub'];
        }
        $request->merge($input);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|nullable|string|max:255|unique:products,slug,'.$product->id,
            'category_id' => 'nullable|exists:categories,id',
            'category_slug' => 'nullable|string',
            'badge' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews_count' => 'nullable|integer',
            'users_count' => 'nullable|string',
            'short_desc' => 'nullable|string',
            'description' => 'nullable|string',
            'capabilities' => 'nullable',
            'price_monthly' => 'nullable|numeric|min:0',
            'price_lifetime' => 'nullable|numeric|min:0',
            'included_in_sub' => 'nullable|boolean',
            'engine_version' => 'nullable|string',
            'latency' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        if (! empty($validated['category_id'])) {
            $cat = Category::find($validated['category_id']);
            if ($cat) {
                $validated['category_slug'] = $cat->slug;
            }
        } elseif (! empty($validated['category_slug'])) {
            $cat = is_numeric($validated['category_slug'])
                ? Category::find($validated['category_slug'])
                : Category::where('slug', $validated['category_slug'])->first();
            if ($cat) {
                $validated['category_id'] = $cat->id;
                $validated['category_slug'] = $cat->slug;
            }
        }

        if (isset($validated['capabilities']) && is_string($validated['capabilities'])) {
            $validated['capabilities'] = array_map('trim', explode(',', $validated['capabilities']));
        }

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'tool' => $product->load('category'),
            'product' => $product->load('category'),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $product = Product::where('id', $id)
            ->orWhere('slug', $id)
            ->orWhere('product_id', $id)
            ->firstOrFail();

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Delete all uncategorized products
     */
    public function destroyUncategorized(): JsonResponse
    {
        $deleted = Product::whereNull('category_id')
            ->orWhere('category_slug', 'uncategorized')
            ->orWhere('category_slug', '')
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "Successfully deleted {$deleted} uncategorized products",
            'deleted_count' => $deleted,
        ]);
    }

    /**
     * Bulk delete products
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! empty($ids) && is_array($ids)) {
            Product::whereIn('id', $ids)
                ->orWhereIn('slug', $ids)
                ->orWhereIn('product_id', $ids)
                ->delete();
        } elseif ($request->input('all') === true) {
            Product::query()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Products deleted successfully',
        ]);
    }
}
