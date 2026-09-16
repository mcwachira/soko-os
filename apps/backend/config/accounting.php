<?php

return [
    'zoho' => [
        'client_id' => env('ZOHO_CLIENT_ID'),
        'client_secret' => env('ZOHO_CLIENT_SECRET'),
        'refresh_token' => env('ZOHO_REFRESH_TOKEN'),
        'organization_id' => env('ZOHO_ORGANIZATION_ID'),
        'base_url' => env('ZOHO_BASE_URL', 'https://books.zoho.com/api/v3'),
    ],

    'quickbooks' => [
        'client_id' => env('QUICKBOOKS_CLIENT_ID'),
        'client_secret' => env('QUICKBOOKS_CLIENT_SECRET'),
        'access_token' => env('QUICKBOOKS_ACCESS_TOKEN'),
        'refresh_token' => env('QUICKBOOKS_REFRESH_TOKEN'),
        'realm_id' => env('QUICKBOOKS_REALM_ID'),
        'environment' => env('QUICKBOOKS_ENVIRONMENT', 'sandbox'),
        'deposit_account_id' => env('QUICKBOOKS_DEPOSIT_ACCOUNT_ID'),
    ],

    'xero' => [
        'client_id' => env('XERO_CLIENT_ID'),
        'client_secret' => env('XERO_CLIENT_SECRET'),
        'access_token' => env('XERO_ACCESS_TOKEN'),
        'refresh_token' => env('XERO_REFRESH_TOKEN'),
        'tenant_id' => env('XERO_TENANT_ID'),
        'bank_account_code' => env('XERO_BANK_ACCOUNT_CODE'),
    ],
];
