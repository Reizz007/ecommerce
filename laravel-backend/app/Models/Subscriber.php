<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'plan',
        'tier',
        'tokens_used',
        'token_limit',
        'status',
        'renews_on',
        'payment_method',
    ];

    protected $casts = [
        'tokens_used' => 'integer',
        'token_limit' => 'integer',
    ];
}
