<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function index(): JsonResponse
    {
        $subscribers = Subscriber::latest()->get();

        return response()->json([
            'success' => true,
            'subscribers' => $subscribers,
        ]);
    }

    public function updateTokens(Request $request, $id): JsonResponse
    {
        $sub = Subscriber::findOrFail($id);

        if ($request->has('tokensUsed')) {
            $sub->tokens_used = (int) $request->tokensUsed;
        }
        if ($request->has('tokenLimit')) {
            $sub->token_limit = (int) $request->tokenLimit;
        }
        if ($request->has('status')) {
            $sub->status = $request->status;
        }

        $sub->save();

        return response()->json([
            'success' => true,
            'subscriber' => $sub,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $subscriber = Subscriber::where('id', $id)
            ->orWhere('email', $id)
            ->first();

        if (!$subscriber) {
            return response()->json([
                'success' => false,
                'message' => 'Subscriber not found',
            ], 404);
        }

        $subscriber->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subscriber deleted successfully',
        ]);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (!empty($ids) && is_array($ids)) {
            Subscriber::whereIn('id', $ids)->delete();
        } elseif ($request->input('all') === true) {
            Subscriber::query()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Subscribers deleted successfully',
        ]);
    }
}
