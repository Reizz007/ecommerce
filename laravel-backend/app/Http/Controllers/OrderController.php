<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::latest()->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customerName' => 'nullable|string',
            'customerEmail' => 'nullable|email',
            'company' => 'nullable|string',
            'items' => 'nullable',
            'amount' => 'required|numeric',
            'paymentMethod' => 'nullable|string',
            'abaLink' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $apiKey = 'sk_synapse_live_' . Str::random(28);
        $orderNum = 'SYN-ORD-' . rand(1000, 9999);

        $order = Order::create([
            'order_number' => $orderNum,
            'customer_name' => $validated['customerName'] ?? 'Valued Customer',
            'customer_email' => $validated['customerEmail'] ?? 'customer@synapse.ai',
            'company' => $validated['company'] ?? '',
            'items' => is_array($validated['items'] ?? null) ? $validated['items'] : [$validated['items'] ?? 'Pro AI Suite'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['paymentMethod'] ?? 'ABA PAY / PayWay',
            'aba_link' => $validated['abaLink'] ?? '',
            'status' => $validated['status'] ?? 'Verified',
            'api_key' => $apiKey,
        ]);

        // Auto create/update subscriber record
        if (!empty($order->customer_email)) {
            Subscriber::updateOrCreate(
                ['email' => $order->customer_email],
                [
                    'name' => $order->customer_name,
                    'plan' => 'Pro AI Suite (Annual)',
                    'tier' => 'pro',
                    'tokens_used' => 0,
                    'token_limit' => 15000000,
                    'status' => 'Active',
                    'renews_on' => now()->addYear()->format('Y-m-d'),
                    'payment_method' => $order->payment_method,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'order' => $order,
            'apiKey' => $apiKey,
        ], 201);
    }

    public function show(string $idOrNumber): JsonResponse
    {
        $order = Order::where('id', $idOrNumber)
            ->orWhere('order_number', $idOrNumber)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }

    public function activate(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'activation_link' => 'required|string',
            'activation_note' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $order->activation_link = $validated['activation_link'];
        if (isset($validated['activation_note'])) {
            $order->activation_note = $validated['activation_note'];
        }
        $order->status = $validated['status'] ?? 'Activated';
        $order->activated_at = now();
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Activation link published successfully to user!',
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->status = $request->input('status', 'Verified');
        if ($request->has('activation_link')) {
            $order->activation_link = $request->input('activation_link');
            $order->activated_at = now();
        }
        $order->save();

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }
}
