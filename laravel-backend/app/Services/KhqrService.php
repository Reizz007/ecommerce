<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Str;

class KhqrService
{
    protected string $gatewayUrl;
    protected string $profileId;
    protected string $secretKey;

    public function __construct()
    {
        // Allow dynamic override from database settings, fallback to services config or env
        $this->gatewayUrl = Setting::get('khqr_gateway_url', config('services.khqr.gateway_url', 'https://khqr.cc/api/payment/requestv2'));
        $this->profileId = Setting::get('khqr_profile_id', config('services.khqr.profile_id', 'tW6PHjgPyzISFi3KK22hKZ57rag1cWHS'));
        $this->secretKey = Setting::get('khqr_secret_key', config('services.khqr.secret_key', 'zsFq7SWHV4gYFSAdfg2ud8WV747tBOei'));
    }

    /**
     * Generate dynamic KHQR Payment Checkout URL and security hash.
     *
     * Hash formula:
     * - With success_url: sha1(secretKey + transactionId + formattedAmount + successUrl + remark)
     * - Without success_url: sha1(secretKey + transactionId + formattedAmount + remark)
     */
    public function createPayment(float|string $amount, ?string $transactionId = null, ?string $remark = null, ?string $successUrl = null): array
    {
        if (empty($transactionId)) {
            $transactionId = 'SYN-' . strtoupper(Str::random(10)) . '-' . time();
        }

        $formattedAmount = number_format((float) $amount, 2, '.', '');
        
        if (empty($remark)) {
            $remark = 'SYNAPSE_AI_' . substr(preg_replace('/[^A-Za-z0-9]/', '', $transactionId), -10);
        }
        $cleanRemark = substr($remark, 0, 50);

        // Security Hash generation matching khqr.cc specification
        if (!empty($successUrl)) {
            $rawStringToHash = $this->secretKey . $transactionId . $formattedAmount . $successUrl . $cleanRemark;
        } else {
            $rawStringToHash = $this->secretKey . $transactionId . $formattedAmount . $cleanRemark;
        }
        $hash = sha1($rawStringToHash);

        // Normalize Gateway URL with Profile ID
        $cleanGateway = rtrim($this->gatewayUrl, '/');
        if (str_ends_with($cleanGateway, $this->profileId)) {
            $baseUrl = $cleanGateway;
        } else {
            $baseUrl = $cleanGateway . '/' . $this->profileId;
        }

        $queryParams = [
            'transaction_id' => $transactionId,
            'amount' => $formattedAmount,
            'remark' => $cleanRemark,
            'hash' => $hash,
        ];

        if (!empty($successUrl)) {
            $queryParams['success_url'] = $successUrl;
        }

        $checkoutUrl = $baseUrl . '?' . http_build_query($queryParams);
        $iframeUrl = $checkoutUrl . '&iframe=1';

        return [
            'success' => true,
            'transaction_id' => $transactionId,
            'amount' => $formattedAmount,
            'currency' => 'USD',
            'merchant_name' => 'dyzz',
            'remark' => $cleanRemark,
            'hash' => $hash,
            'profile_id' => $this->profileId,
            'checkout_url' => $checkoutUrl,
            'iframe_url' => $iframeUrl,
            'success_url' => $successUrl,
            'gateway_url' => $baseUrl,
            'created_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Verify hash validity
     */
    public function verifyHash(string $transactionId, string|float $amount, string $remark, string $hashToVerify, ?string $successUrl = null): bool
    {
        $formattedAmount = number_format((float) $amount, 2, '.', '');
        $cleanRemark = substr($remark, 0, 50);
        if (!empty($successUrl)) {
            $expectedHash = sha1($this->secretKey . $transactionId . $formattedAmount . $successUrl . $cleanRemark);
        } else {
            $expectedHash = sha1($this->secretKey . $transactionId . $formattedAmount . $cleanRemark);
        }

        return hash_equals($expectedHash, $hashToVerify);
    }

    public function getProfileId(): string
    {
        return $this->profileId;
    }

    public function getGatewayUrl(): string
    {
        return $this->gatewayUrl;
    }
}
