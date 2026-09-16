<?php

return [
    'kra' => [
        'mode' => env('KRA_MODE', 'sandbox'),
        'base_url' => env('KRA_BASE_URL', 'https://etims-sbx.kra.go.ke'),
        'pin' => env('KRA_PIN'),
        'client_id' => env('KRA_CLIENT_ID'),
        'client_secret' => env('KRA_CLIENT_SECRET'),
    ],
];
