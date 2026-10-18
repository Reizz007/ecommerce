<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function getSettings(): JsonResponse
    {
        $abaPayLink = Setting::get('aba_pay_link', '');
        $announcementText = Setting::get('announcement_text', 'Synapse Omni-LLM 4.5 & VideoGen 4D are now live! Get 20% OFF all annual subscriptions with code NEURON20');
        $maintenanceMode = Setting::get('maintenance_mode', false);
        $systemStatus = Setting::get('system_status', 'All AI Clusters Operational (99.99% SLA)');
        $promoCodes = Setting::get('promo_codes', [
            ['code' => 'NEURON20', 'percent' => 20, 'active' => true],
            ['code' => 'AIWELCOME', 'amount' => 10, 'active' => true],
        ]);

        $khqrGatewayUrl = Setting::get('khqr_gateway_url', config('services.khqr.gateway_url', 'https://khqr.cc/api/payment/requestv2'));
        $khqrProfileId = Setting::get('khqr_profile_id', config('services.khqr.profile_id', 'tW6PHjgPyzISFi3KK22hKZ57rag1cWHS'));
        $khqrSecretKey = Setting::get('khqr_secret_key', config('services.khqr.secret_key', 'zsFq7SWHV4gYFSAdfg2ud8WV747tBOei'));

        $telegramBotToken = Setting::get('telegram_bot_token', env('TELEGRAM_BOT_TOKEN', ''));
        $telegramChatId = Setting::get('telegram_chat_id', env('TELEGRAM_CHAT_ID', ''));
        $telegramEnabled = Setting::get('telegram_enabled', env('TELEGRAM_ENABLED', false));

        $settings = [
            'abaPayLink' => $abaPayLink,
            'khqrGatewayUrl' => $khqrGatewayUrl,
            'khqrProfileId' => $khqrProfileId,
            'khqrSecretKey' => $khqrSecretKey,
            'announcementText' => $announcementText,
            'maintenanceMode' => (bool) $maintenanceMode,
            'systemStatus' => $systemStatus,
            'promoCodes' => $promoCodes,
            'telegramBotToken' => $telegramBotToken,
            'telegramChatId' => $telegramChatId,
            'telegramEnabled' => (bool) $telegramEnabled,
        ];

        return response()->json([
            'success' => true,
            'settings' => $settings,
            'abaPayLink' => $abaPayLink,
            'khqrGatewayUrl' => $khqrGatewayUrl,
            'khqrProfileId' => $khqrProfileId,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        if ($request->has('abaPayLink')) {
            Setting::set('aba_pay_link', $request->abaPayLink);
        }
        if ($request->has('khqrGatewayUrl')) {
            Setting::set('khqr_gateway_url', $request->khqrGatewayUrl);
        }
        if ($request->has('khqrProfileId')) {
            Setting::set('khqr_profile_id', $request->khqrProfileId);
        }
        if ($request->has('khqrSecretKey')) {
            Setting::set('khqr_secret_key', $request->khqrSecretKey);
        }
        if ($request->has('announcementText')) {
            Setting::set('announcement_text', $request->announcementText);
        }
        if ($request->has('maintenanceMode')) {
            Setting::set('maintenance_mode', $request->maintenanceMode);
        }
        if ($request->has('systemStatus')) {
            Setting::set('system_status', $request->systemStatus);
        }
        if ($request->has('promoCodes')) {
            Setting::set('promo_codes', $request->promoCodes);
        }
        if ($request->has('telegramBotToken')) {
            Setting::set('telegram_bot_token', $request->telegramBotToken);
        }
        if ($request->has('telegramChatId')) {
            Setting::set('telegram_chat_id', $request->telegramChatId);
        }
        if ($request->has('telegramEnabled')) {
            Setting::set('telegram_enabled', (bool) $request->telegramEnabled);
        }

        return $this->getSettings();
    }

    public function testTelegram(Request $request): JsonResponse
    {
        $token = $request->input('token') ?: Setting::get('telegram_bot_token', env('TELEGRAM_BOT_TOKEN'));
        $chatId = $request->input('chat_id') ?: Setting::get('telegram_chat_id', env('TELEGRAM_CHAT_ID'));

        if (empty($token) || empty($chatId)) {
            return response()->json([
                'success' => false,
                'message' => 'Both Telegram Bot Token and Chat ID are required.',
            ], 422);
        }

        $testMessage = "🚀 <b>Synapse AI Control Center</b>\n\nTelegram notification channel verified successfully!\nYou will now receive live alerts for KHQR payments, orders, and security events.";

        $result = TelegramService::sendMessage($testMessage, $token, $chatId);

        return response()->json($result, $result['success'] ? 200 : 400);
    }
}
