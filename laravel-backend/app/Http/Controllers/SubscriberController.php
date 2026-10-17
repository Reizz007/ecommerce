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
}
