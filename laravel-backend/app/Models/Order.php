<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_email',
        'company',
        'items',
        'amount',
        'payment_method',
        'aba_link',
        'status',
        'api_key',
        'activation_link',
        'activation_note',
        'activated_at',
    ];

    protected $casts = [
        'items' => 'array',
        'amount' => 'float',
        'activated_at' => 'datetime',
    ];
}
