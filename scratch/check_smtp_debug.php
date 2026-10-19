<?php
require __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mime\Email;

$host = env('MAIL_HOST', 'smtp.gmail.com');
$port = (int) env('MAIL_PORT', 587);
$user = env('MAIL_USERNAME');
$pass = env('MAIL_PASSWORD');

echo "Connecting to $host:$port as $user...\n";

try {
    $transport = new EsmtpTransport($host, $port, false);
    $transport->setUsername($user);
    $transport->setPassword($pass);
    
    $email = (new Email())
        ->from($user)
        ->to('chetranicky@gmail.com')
        ->subject('Test OTP Delivery Verification ' . date('H:i:s'))
        ->text('Your OTP code is 999888. Please check if this email arrived.');
        
    $sentMessage = $transport->send($email);
    echo "SUCCESS: Message sent!\n";
    echo "Debug: " . $sentMessage->getDebug() . "\n";
} catch (\Throwable $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
