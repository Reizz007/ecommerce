<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    /**
     * Get configured bot token
     */
    public static function getBotToken(): ?string
    {
        $token = Setting::get('telegram_bot_token');
        if (!empty($token)) {
            return trim($token);
        }
        $envToken = env('TELEGRAM_BOT_TOKEN');
        return !empty($envToken) ? trim($envToken) : null;
    }

    /**
     * Get configured chat ID
     */
    public static function getChatId(): ?string
    {
        $chatId = Setting::get('telegram_chat_id');
        if (!empty($chatId)) {
            return trim($chatId);
        }
        $envChatId = env('TELEGRAM_CHAT_ID');
        return !empty($envChatId) ? trim($envChatId) : null;
    }

    /**
     * Check if Telegram alerts are enabled
     */
    public static function isEnabled(): bool
    {
        $enabled = Setting::get('telegram_enabled', null);
        if ($enabled !== null) {
            return filter_var($enabled, FILTER_VALIDATE_BOOLEAN);
        }
        return (bool) env('TELEGRAM_ENABLED', true);
    }

    /**
     * Send raw HTML message to Telegram
     */
    public static function sendMessage(string $text, ?string $token = null, ?string $chatId = null): array
    {
        $botToken = $token ?: self::getBotToken();
        $targetChatId = $chatId ?: self::getChatId();

        if (empty($botToken) || empty($targetChatId)) {
            return [
                'success' => false,
                'message' => 'Telegram Bot Token or Chat ID is not configured.',
            ];
        }

        try {
            $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
            $response = Http::timeout(8)->post($url, [
                'chat_id' => $targetChatId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Telegram alert sent successfully.',
                    'data' => $response->json(),
                ];
            }

            $errMsg = $response->json('description') ?: $response->body();
            Log::warning('Telegram API error: ' . $errMsg);
            return [
                'success' => false,
                'message' => 'Telegram API error: ' . $errMsg,
            ];
        } catch (\Throwable $e) {
            Log::warning('Telegram exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Could not connect to Telegram: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send Order Created Alert
     */
    public static function sendOrderAlert(Order $order, string $title = 'New Order'): void
    {
        if (!self::isEnabled()) return;

        $amount = number_format((float) $order->amount, 2);
        $customer = htmlspecialchars($order->customer_name ?: 'Valued Customer', ENT_QUOTES);
        $email = htmlspecialchars($order->customer_email ?: 'N/A', ENT_QUOTES);
        $orderNo = htmlspecialchars($order->order_number ?: (string)$order->id, ENT_QUOTES);
        $method = htmlspecialchars($order->payment_method ?: 'KHQR', ENT_QUOTES);
        $date = now()->setTimezone('Asia/Phnom_Penh')->format('Y-m-d H:i:s');

        $text = "🔔 <b>{$title}</b>\n\n";
        $text .= "📦 <b>Order:</b> <code>{$orderNo}</code>\n";
        $text .= "👤 <b>Customer:</b> {$customer}\n";
        $text .= "📧 <b>Email:</b> {$email}\n";
        $text .= "💰 <b>Amount:</b> \${$amount} USD\n";
        $text .= "💳 <b>Method:</b> {$method}\n";
        $text .= "🕒 <b>Time:</b> {$date} (Cambodia)\n";

        self::sendMessage($text);
    }

    /**
     * Send Order Success & Verified Alert
     */
    public static function sendOrderSuccessAlert(Order $order): void
    {
        if (!self::isEnabled()) return;

        $amount = number_format((float) $order->amount, 2);
        $customer = htmlspecialchars($order->customer_name ?: 'Valued Customer', ENT_QUOTES);
        $email = htmlspecialchars($order->customer_email ?: 'N/A', ENT_QUOTES);
        $orderNo = htmlspecialchars($order->order_number ?: (string)$order->id, ENT_QUOTES);
        $method = htmlspecialchars($order->payment_method ?: 'KHQR', ENT_QUOTES);
        $date = now()->setTimezone('Asia/Phnom_Penh')->format('Y-m-d H:i:s');

        $text = "🎉 <b>Order Successful & Verified!</b>\n\n";
        $text .= "📦 <b>Order:</b> <code>{$orderNo}</code>\n";
        $text .= "👤 <b>Customer:</b> {$customer}\n";
        $text .= "📧 <b>Email:</b> {$email}\n";
        $text .= "💰 <b>Amount:</b> \${$amount} USD\n";
        $text .= "💳 <b>Method:</b> {$method}\n";
        $text .= "✅ <b>Status:</b> Verified & Paid\n";
        if (!empty($order->api_key)) {
            $text .= "🔑 <b>License Key:</b> <code>{$order->api_key}</code>\n";
        }
        $text .= "🕒 <b>Time:</b> {$date} (Cambodia)\n";

        self::sendMessage($text);
    }

    /**
     * Send OTP Alert to Admin Telegram
     */
    public static function sendOtpAlert(string $email, string $otp): void
    {
        $date = now()->setTimezone('Asia/Phnom_Penh')->format('H:i:s');
        $text = "🔐 <b>SYNAPSE.AI — One-Time Login Code</b>\n\n";
        $text .= "👤 <b>Email:</b> <code>{$email}</code>\n";
        $text .= "🔢 <b>Verification Code:</b> <code>{$otp}</code>\n\n";
        $text .= "⏱️ Valid for 10 minutes.\n";
        $text .= "🕒 Requested at {$date}\n";

        self::sendMessage($text);
    }
}
