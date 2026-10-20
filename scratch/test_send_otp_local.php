<?php
require __DIR__ . '/../laravel-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../laravel-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Configure SMTP with requested Gmail credentials
config([
    'mail.default' => 'smtp',
    'mail.mailers.smtp.transport' => 'smtp',
    'mail.mailers.smtp.host' => 'smtp.gmail.com',
    'mail.mailers.smtp.port' => 587,
    'mail.mailers.smtp.encryption' => 'tls',
    'mail.mailers.smtp.username' => 'rrqkh61@gmail.com',
    'mail.mailers.smtp.password' => 'ikowlciyetgjggil',
    'mail.mailers.smtp.timeout' => 8,
    'mail.from.address' => 'rrqkh61@gmail.com',
    'mail.from.name' => 'Admin OTP',
]);

$controller = new App\Http\Controllers\AuthController();
$request = Illuminate\Http\Request::create('/api/auth/send-otp', 'POST', ['email' => 'chetranicky@gmail.com']);

try {
    $res = $controller->sendOtp($request);
    echo "STATUS: " . $res->getStatusCode() . "\n";
    echo "BODY: " . $res->getContent() . "\n";
} catch (\Throwable $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
