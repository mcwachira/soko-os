<?php

namespace App\Services\Accounting;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZohoBooksAdapter implements AccountingProvider
{
    protected string $clientId;

    protected string $clientSecret;

    protected string $refreshToken;

    protected string $organizationId;

    protected string $baseUrl;

    protected ?string $accessToken = null;

    protected int $tokenExpiresAt = 0;

    public function __construct()
    {
        $this->clientId = (string) config('accounting.zoho.client_id', '');
        $this->clientSecret = (string) config('accounting.zoho.client_secret', '');
        $this->refreshToken = (string) config('accounting.zoho.refresh_token', '');
        $this->organizationId = (string) config('accounting.zoho.organization_id', '');
        $this->baseUrl = (string) config('accounting.zoho.base_url', 'https://books.zoho.com/api/v3');
    }

    public function hasCredentials(): bool
    {
        return filled($this->clientId)
            && filled($this->clientSecret)
            && filled($this->refreshToken)
            && filled($this->organizationId)
            && ! str_contains($this->clientId, 'placeholder');
    }

    public function connect(array $config): bool
    {
        $this->clientId = $config['client_id'] ?? $this->clientId;
        $this->clientSecret = $config['client_secret'] ?? $this->clientSecret;
        $this->refreshToken = $config['refresh_token'] ?? $this->refreshToken;
        $this->organizationId = $config['organization_id'] ?? $this->organizationId;
        $this->baseUrl = $config['base_url'] ?? $this->baseUrl;

        try {
            $this->getAccessToken();

            return true;
        } catch (\Throwable $e) {
            Log::error('Zoho Books connection failed', ['error' => $e->getMessage()]);

            return false;
        }
    }

    public function disconnect(): void
    {
        $this->accessToken = null;
        $this->tokenExpiresAt = 0;
        Cache::forget('zoho_books_access_token');
    }

    public function isConnected(): bool
    {
        if (! $this->hasCredentials()) {
            return false;
        }

        try {
            $this->getAccessToken();

            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function syncChartOfAccounts(): array
    {
        if (! $this->hasCredentials()) {
            return ['error' => 'Credentials not configured'];
        }

        try {
            $response = $this->request('GET', '/chartofaccounts', [
                'organization_id' => $this->organizationId,
            ]);

            return $response['chartofaccounts'] ?? [];
        } catch (\Throwable $e) {
            Log::error('Zoho Books sync chart of accounts failed', ['error' => $e->getMessage()]);

            return ['error' => $e->getMessage()];
        }
    }

    public function createCustomer(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Zoho Books credentials not configured');
        }

        $payload = [
            'contact_name' => $data['name'],
            'contact_type' => 'customer',
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'gst_treatment' => $data['tax_pin'] ? 'gst_registered' : 'consumer',
            'gst_no' => $data['tax_pin'] ?? null,
            'billing_address' => [
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'zip' => $data['postal_code'] ?? null,
                'country' => $data['country'] ?? 'Kenya',
            ],
        ];

        $response = $this->request('POST', '/contacts', [
            'organization_id' => $this->organizationId,
        ], $payload);

        return $response['contact']['contact_id'] ?? '';
    }

    public function updateCustomer(string $externalId, array $data): bool
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Zoho Books credentials not configured');
        }

        $payload = [
            'contact_name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'gst_treatment' => $data['tax_pin'] ? 'gst_registered' : 'consumer',
            'gst_no' => $data['tax_pin'] ?? null,
            'billing_address' => [
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'zip' => $data['postal_code'] ?? null,
                'country' => $data['country'] ?? 'Kenya',
            ],
        ];

        $response = $this->request('PUT', '/contacts/'.$externalId, [
            'organization_id' => $this->organizationId,
        ], $payload);

        return $response['code'] === 0;
    }

    public function createProduct(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Zoho Books credentials not configured');
        }

        $payload = [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'rate' => ($data['selling_price_minor'] ?? 0) / 100,
            'purchase_rate' => ($data['cost_price_minor'] ?? 0) / 100,
            'unit' => $data['unit'] ?? 'pcs',
            'tax_id' => $data['tax_id'] ?? null,
            'sku' => $data['sku'] ?? null,
            'product_type' => 'goods',
        ];

        $response = $this->request('POST', '/items', [
            'organization_id' => $this->organizationId,
        ], $payload);

        return $response['item']['item_id'] ?? '';
    }

    public function updateProduct(string $externalId, array $data): bool
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Zoho Books credentials not configured');
        }

        $payload = [
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            'rate' => isset($data['selling_price_minor']) ? $data['selling_price_minor'] / 100 : null,
            'purchase_rate' => isset($data['cost_price_minor']) ? $data['cost_price_minor'] / 100 : null,
            'unit' => $data['unit'] ?? null,
            'tax_id' => $data['tax_id'] ?? null,
            'sku' => $data['sku'] ?? null,
        ];

        $response = $this->request('PUT', '/items/'.$externalId, [
            'organization_id' => $this->organizationId,
        ], $payload);

        return $response['code'] === 0;
    }

    public function createInvoice(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Zoho Books credentials not configured');
        }

        $lineItems = [];
        foreach ($data['line_items'] ?? [] as $item) {
            $lineItems[] = [
                'item_id' => $item['item_id'] ?? null,
                'name' => $item['name'],
                'description' => $item['description'] ?? null,
                'rate' => $item['rate'] ?? 0,
                'quantity' => $item['quantity'] ?? 1,
                'discount' => $item['discount'] ?? 0,
                'tax_id' => $item['tax_id'] ?? null,
            ];
        }

        $payload = [
            'customer_id' => $data['customer_id'],
            'date' => $data['date'] ?? now()->format('Y-m-d'),
            'due_date' => $data['due_date'] ?? now()->addDays(30)->format('Y-m-d'),
            'line_items' => $lineItems,
            'reference_number' => $data['reference_number'] ?? null,
            'notes' => $data['notes'] ?? null,
            'terms' => $data['terms'] ?? null,
        ];

        $response = $this->request('POST', '/invoices', [
            'organization_id' => $this->organizationId,
        ], $payload);

        return $response['invoice']['invoice_id'] ?? '';
    }

    public function createCreditNote(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Zoho Books credentials not configured');
        }

        $lineItems = [];
        foreach ($data['line_items'] ?? [] as $item) {
            $lineItems[] = [
                'item_id' => $item['item_id'] ?? null,
                'name' => $item['name'],
                'description' => $item['description'] ?? null,
                'rate' => $item['rate'] ?? 0,
                'quantity' => $item['quantity'] ?? 1,
                'tax_id' => $item['tax_id'] ?? null,
            ];
        }

        $payload = [
            'customer_id' => $data['customer_id'],
            'date' => $data['date'] ?? now()->format('Y-m-d'),
            'line_items' => $lineItems,
            'reference_number' => $data['reference_number'] ?? null,
            'reason' => $data['reason'] ?? 'Return/Refund',
        ];

        $response = $this->request('POST', '/creditnotes', [
            'organization_id' => $this->organizationId,
        ], $payload);

        return $response['creditnote']['creditnote_id'] ?? '';
    }

    public function createPayment(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Zoho Books credentials not configured');
        }

        $payload = [
            'customer_id' => $data['customer_id'],
            'payment_mode' => $this->mapPaymentMethod($data['payment_method'] ?? 'cash'),
            'amount' => $data['amount_minor'] / 100,
            'date' => $data['date'] ?? now()->format('Y-m-d'),
            'reference_number' => $data['reference'] ?? null,
            'description' => $data['description'] ?? null,
            'invoices' => $data['invoices'] ?? [],
        ];

        $response = $this->request('POST', '/customerpayments', [
            'organization_id' => $this->organizationId,
        ], $payload);

        return $response['payment']['payment_id'] ?? '';
    }

    public function getInvoiceStatus(string $externalId): string
    {
        if (! $this->hasCredentials()) {
            return 'unknown';
        }

        try {
            $response = $this->request('GET', '/invoices/'.$externalId, [
                'organization_id' => $this->organizationId,
            ]);

            return $response['invoice']['status'] ?? 'unknown';
        } catch (\Throwable $e) {
            return 'error';
        }
    }

    public function getName(): string
    {
        return 'zoho_books';
    }

    protected function getAccessToken(): string
    {
        if ($this->accessToken && $this->tokenExpiresAt > time() + 60) {
            return $this->accessToken;
        }

        $cacheKey = 'zoho_books_access_token';

        $adapter = $this;
        $this->accessToken = Cache::remember($cacheKey, 55 * 60, function () use ($adapter) {
            $response = Http::asForm()->post('https://accounts.zoho.com/oauth/v2/token', [
                'refresh_token' => $adapter->refreshToken,
                'client_id' => $adapter->clientId,
                'client_secret' => $adapter->clientSecret,
                'grant_type' => 'refresh_token',
            ]);

            if (! $response->successful()) {
                throw new \Exception('Failed to get Zoho Books access token: '.$response->body());
            }

            $data = $response->json();
            $adapter->tokenExpiresAt = time() + ($data['expires_in'] ?? 3600);

            return $data['access_token'] ?? '';
        });

        return $this->accessToken;
    }

    protected function request(string $method, string $endpoint, array $query = [], array $body = []): array
    {
        $accessToken = $this->getAccessToken();

        $url = $this->baseUrl.$endpoint;
        $query['organization_id'] = $this->organizationId;

        $request = Http::withToken($accessToken)
            ->timeout(30)
            ->withQueryParameters($query);

        if (in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
            $response = $request->withHeaders(['Content-Type' => 'application/json'])
                ->{$method}($url, $body);
        } else {
            $response = $request->{$method}($url);
        }

        if (! $response->successful()) {
            throw new \Exception('Zoho Books API error: '.$response->status().' - '.$response->body());
        }

        return $response->json();
    }

    protected function mapPaymentMethod(string $method): string
    {
        return match ($method) {
            'cash' => 'cash',
            'card' => 'card',
            'mpesa' => 'mpesa',
            'airtel' => 'airtel_money',
            'bank' => 'bank_transfer',
            default => 'other',
        };
    }
}
