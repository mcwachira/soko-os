<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Http\Requests\StoreCartRequest;
use App\Http\Requests\UpdateCartRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Cart::class);

        $carts = Cart::where('organization_id', $request->user()->organization_id)
            ->with(['items.product', 'customer'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($carts);
    }

    public function show(string $id)
    {
        $cart = Cart::where('organization_id', request()->user()->organization_id)
            ->with(['items.product', 'customer'])
            ->findOrFail($id);

        $this->authorize('view', $cart);

        return response()->json(['data' => $cart]);
    }

    public function store(StoreCartRequest $request)
    {
        $this->authorize('create', Cart::class);

        $validated = $request->validated();
        $user = $request->user();

        $cart = DB::transaction(function () use ($validated, $user) {
            $cart = Cart::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'branch_id' => $validated['branch_id'],
                'terminal_id' => $validated['terminal_id'] ?? null,
                'user_id' => $user->id,
                'customer_id' => $validated['customer_id'] ?? null,
                'status' => 'active',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $this->addCartItem($cart, $item);
            }

            $cart->refresh();
            $this->recalculateCart($cart);

            return $cart;
        });

        return response()->json(['data' => $cart->load('items.product', 'customer')], 201);
    }

    public function update(UpdateCartRequest $request, string $id)
    {
        $cart = Cart::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $cart);

        $validated = $request->validated();

        DB::transaction(function () use ($cart, $validated) {
            if (isset($validated['customer_id'])) {
                $cart->update(['customer_id' => $validated['customer_id']]);
            }

            if (isset($validated['notes'])) {
                $cart->update(['notes' => $validated['notes']]);
            }

            if (isset($validated['items'])) {
                $cart->items()->delete();
                foreach ($validated['items'] as $item) {
                    $this->addCartItem($cart, $item);
                }
            }

            $this->recalculateCart($cart);
        });

        return response()->json(['data' => $cart->load('items.product', 'customer')]);
    }

    public function hold(string $id)
    {
        $cart = Cart::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $cart);

        $cart->update([
            'status' => 'held',
            'held_at' => now(),
        ]);

        return response()->json(['data' => $cart->load('items.product', 'customer')]);
    }

    public function recall(string $id)
    {
        $cart = Cart::where('organization_id', request()->user()->organization_id)
            ->where('status', 'held')
            ->findOrFail($id);

        $this->authorize('update', $cart);

        $cart->update([
            'status' => 'active',
            'held_at' => null,
        ]);

        return response()->json(['data' => $cart->load('items.product', 'customer')]);
    }

    public function destroy(string $id)
    {
        $cart = Cart::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $cart);

        $cart->delete();

        return response()->json(['message' => 'Cart deleted']);
    }

    private function addCartItem(Cart $cart, array $item): void
    {
        $product = Product::find($item['product_id']);
        if (! $product) {
            return;
        }

        $unitPrice = $item['unit_price_minor'] ?? $product->selling_price_minor;
        $discount = $item['discount_minor'] ?? 0;
        $quantity = $item['quantity'] ?? 1;
        $taxRate = $item['tax_rate_percentage'] ?? 16.0;

        $itemTotal = (int) ($quantity * $unitPrice) - $discount;
        $taxAmount = $taxRate > 0 ? (int) round(($itemTotal * $taxRate) / (100 + $taxRate)) : 0;
        $subtotal = $itemTotal - $taxAmount;

        CartItem::create([
            'id' => Str::uuid()->toString(),
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'sku' => $product->sku,
            'name' => $product->name,
            'quantity' => $quantity,
            'unit_price_minor' => $unitPrice,
            'discount_minor' => $discount,
            'tax_rate_percentage' => $taxRate,
            'tax_amount_minor' => $taxAmount,
            'subtotal_minor' => $subtotal,
            'total_minor' => $itemTotal,
        ]);
    }

    private function recalculateCart(Cart $cart): void
    {
        $items = $cart->items;
        $subtotal = $items->sum('subtotal_minor');
        $tax = $items->sum('tax_amount_minor');
        $discount = $items->sum('discount_minor');
        $total = $subtotal + $tax;

        $cart->update([
            'subtotal_minor' => $subtotal,
            'tax_total_minor' => $tax,
            'discount_minor' => $discount,
            'grand_total_minor' => $total,
        ]);
    }
}
