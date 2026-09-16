<?php

return [
    'card' => [
        'terminal_id' => env('CARD_TERMINAL_ID'),
        'merchant_id' => env('CARD_MERCHANT_ID'),
        'api_key' => env('CARD_API_KEY'),
    ],

    'mpesa' => [
        'consumer_key' => env('MPESA_CONSUMER_KEY'),
        'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
        'passkey' => env('MPESA_PASSKEY'),
        'short_code' => env('MPESA_SHORT_CODE'),
        'base_url' => env('MPESA_BASE_URL', 'https://sandbox.safaricom.co.ke'),
        'callback_url' => env('MPESA_CALLBACK_URL'),
        'environment' => env('MPESA_ENVIRONMENT', 'sandbox'),
        'initiator_name' => env('MPESA_INITIATOR_NAME'),
        'security_credential' => env('MPESA_SECURITY_CREDENTIAL'),
    ],

    'bank' => [
        'bank_code' => env('BANK_CODE'),
        'account_number' => env('BANK_ACCOUNT_NUMBER'),
        'account_name' => env('BANK_ACCOUNT_NAME'),
        'reference_prefix' => env('BANK_REFERENCE_PREFIX', 'BANK'),
    ],
];
