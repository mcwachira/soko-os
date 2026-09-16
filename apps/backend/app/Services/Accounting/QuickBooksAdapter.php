<?php

namespace App\Services\Accounting;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuickBooksAdapter implements AccountingProvider
{
    protected string $clientId;

    protected string $clientSecret;

    protected string $accessToken;

    protected string $refreshToken;

    protected string $realmId;

    protected string $environment;

    protected string $baseUrl;

    protected int $tokenExpiresAt = 0;

    public function __construct()
    {
        $this->clientId = config('accounting.quickbooks.client_id');
        $this->clientSecret = config('accounting.quickbooks.client_secret');
        $this->accessToken = config('accounting.quickbooks.access_token');
        $this->refreshToken = config('accounting.quickbooks.refresh_token');
        $this->realmId = config('accounting.quickbooks.realm_id');
        $this->environment = config('accounting.quickbooks.environment', 'sandbox');
        $this->baseUrl = $this->environment === 'production'
            ? 'https://quickbooks.api.intuit.com/v3/company/'
            : 'https://sandbox-quickbooks.api.intuit.com/v3/company/';
    }

    public function hasCredentials(): bool
    {
        return filled($this->clientId)
            && filled($this->clientSecret)
            && filled($this->accessToken)
            && filled($this->refreshToken)
            && filled($this->realmId)
            && ! str_contains($this->clientId, 'placeholder');
    }

    public function connect(array $config): bool
    {
        $this->clientId = $config['client_id'] ?? $this->clientId;
        $this->clientSecret = $config['client_secret'] ?? $this->clientSecret;
        $this->accessToken = $config['access_token'] ?? $this->accessToken;
        $this->refreshToken = $config['refresh_token'] ?? $this->refreshToken;
        $this->realmId = $config['realm_id'] ?? $this->realmId;
        $this->environment = $config['environment'] ?? $this->environment;
        $this->baseUrl = $this->environment === 'production'
            ? 'https://quickbooks.api.intuit.com/v3/company/'
            : 'https://sandbox-quickbooks.api.intuit.com/v3/company/';

        try {
            $this->getAccessToken();

            return true;
        } catch (\Throwable $e) {
            Log::error('QuickBooks connection failed', ['error' => $e->getMessage()]);

            return false;
        }
    }

    public function disconnect(): void
    {
        $this->accessToken = '';
        $this->refreshToken = '';
        $this->tokenExpiresAt = 0;
        Cache::forget('quickbooks_access_token');
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
            $query = 'SELECT * FROM Account';
            $response = $this->request('GET', '/query', ['query' => $query]);

            return $response['QueryResponse']['Account'] ?? [];
        } catch (\Throwable $e) {
            Log::error('QuickBooks sync chart of accounts failed', ['error' => $e->getMessage()]);

            return ['error' => $e->getMessage()];
        }
    }

    public function createCustomer(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('QuickBooks credentials not configured');
        }

        $payload = [
            'DisplayName' => $data['name'],
            'PrimaryEmailAddr' => ['Address' => $data['email'] ?? ''],
            'PrimaryPhone' => ['FreeFormNumber' => $data['phone'] ?? ''],
            'BillAddr' => [
                'Line1' => $data['address'] ?? '',
                'City' => $data['city'] ?? '',
                'CountrySubDivisionCode' => $data['state'] ?? '',
                'PostalCode' => $data['postal_code'] ?? '',
                'Country' => $data['country'] ?? 'Kenya',
            ],
            'Taxable' => ! empty($data['tax_pin']),
        ];

        $response = $this->request('POST', '/customer', [], $payload);

        return $response['Customer']['Id'] ?? '';
    }

    public function updateCustomer(string $externalId, array $data): bool
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('QuickBooks credentials not configured');
        }

        // First get the current customer to get SyncToken
        $current = $this->request('GET', '/customer/'.$externalId);
        $syncToken = $current['Customer']['SyncToken'] ?? 0;

        $payload = [
            'Id' => $externalId,
            'SyncToken' => $syncToken,
            'DisplayName' => $data['name'] ?? '',
            'PrimaryEmailAddr' => ['Address' => $data['email'] ?? ''],
            'PrimaryPhone' => ['FreeFormNumber' => $data['phone'] ?? ''],
            'BillAddr' => [
                'Line1' => $data['address'] ?? '',
                'City' => $data['city'] ?? '',
                'CountrySubDivisionCode' => $data['state'] ?? '',
                'PostalCode' => $data['postal_code'] ?? '',
                'Country' => $data['country'] ?? 'Kenya',
            ],
            'Taxable' => ! empty($data['tax_pin']),
        ];

        $response = $this->request('POST', '/customer', [], $payload);

        return isset($response['Customer']['Id']);
    }

    public function createProduct(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('QuickBooks credentials not configured');
        }

        $payload = [
            'Name' => $data['name'],
            'Description' => $data['description'] ?? '',
            'UnitPrice' => ($data['selling_price_minor'] ?? 0) / 100,
            'PurchaseCost' => ($data['cost_price_minor'] ?? 0) / 100,
            'Type' => 'Inventory',
            'TrackQtyOnHand' => true,
            'QtyOnHand' => 0,
            'InvStartDate' => now()->format('Y-m-d'),
            'Sku' => $data['sku'] ?? null,
            'Unit' => $data['unit'] ?? 'pcs',
        ];

        $response = $this->request('POST', '/item', [], $payload);

        return $response['Item']['Id'] ?? '';
    }

    public function updateProduct(string $externalId, array $data): bool
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('QuickBooks credentials not configured');
        }

        $current = $this->request('GET', '/item/'.$externalId);
        $syncToken = $current['Item']['SyncToken'] ?? 0;

        $payload = [
            'Id' => $externalId,
            'SyncToken' => $syncToken,
            'Name' => $data['name'] ?? '',
            'Description' => $data['description'] ?? '',
            'UnitPrice' => isset($data['selling_price_minor']) ? $data['selling_price_minor'] / 100 : null,
            'PurchaseCost' => isset($data['cost_price_minor']) ? $data['cost_price_minor'] / 100 : null,
            'Sku' => $data['sku'] ?? null,
            'Unit' => $data['unit'] ?? null,
        ];

        $response = $this->request('POST', '/item', [], $payload);

        return isset($response['Item']['Id']);
    }

    public function createInvoice(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('QuickBooks credentials not configured');
        }

        $lineItems = [];
        foreach ($data['line_items'] ?? [] as $item) {
            $lineItems[] = [
                'DetailType' => 'SalesItemLineDetail',
                'Amount' => ($item['rate'] ?? 0) * ($item['quantity'] ?? 1),
                'SalesItemLineDetail' => [
                    'ItemRef' => ['value' => $item['item_id'], 'name' => $item['name']],
                    'Qty' => $item['quantity'] ?? 1,
                    'UnitPrice' => $item['rate'] ?? 0,
                    'TaxCodeRef' => ['value' => $item['tax_code'] ?? 'TAX'],
                ],
            ];
        }

        $payload = [
            'CustomerRef' => ['value' => $data['customer_id']],
            'TxnDate' => $data['date'] ?? now()->format('Y-m-d'),
            'DueDate' => $data['due_date'] ?? now()->addDays(30)->format('Y-m-d'),
            'Line' => $lineItems,
            'DocNumber' => $data['reference_number'] ?? null,
            'PrivateNote' => $data['notes'] ?? null,
        ];

        $response = $this->request('POST', '/invoice', [], $payload);

        return $response['Invoice']['Id'] ?? '';
    }

    public function createCreditNote(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('QuickBooks credentials not configured');
        }

        // QuickBooks uses CreditMemo for credit notes
        $lineItems = [];
        foreach ($data['line_items'] ?? [] as $item) {
            $lineItems[] = [
                'DetailType' => 'SalesItemLineDetail',
                'Amount' => ($item['rate'] ?? 0) * ($item['quantity'] ?? 1),
                'SalesItemLineDetail' => [
                    'ItemRef' => ['value' => $item['item_id'], 'name' => $item['name']],
                    'Qty' => $item['quantity'] ?? 1,
                    'UnitPrice' => $item['rate'] ?? 0,
                    'TaxCodeRef' => ['value' => $item['tax_code'] ?? 'TAX'],
                ],
            ];
        }

        $payload = [
            'CustomerRef' => ['value' => $data['customer_id']],
            'TxnDate' => $data['date'] ?? now()->format('Y-m-d'),
            'Line' => $lineItems,
            'DocNumber' => $data['reference_number'] ?? null,
            'PrivateNote' => $data['reason'] ?? 'Return/Refund',
        ];

        $response = $this->request('POST', '/creditmemo', [], $payload);

        return $response['CreditMemo']['Id'] ?? '';
    }

    public function createPayment(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('QuickBooks credentials not configured');
        }

        $payload = [
            'CustomerRef' => ['value' => $data['customer_id']],
            'TotalAmt' => $data['amount_minor'] / 100,
            'TxnDate' => $data['date'] ?? now()->format('Y-m-d'),
            'PaymentRefNum' => $data['reference'] ?? null,
            'PrivateNote' => $data['description'] ?? null,
            'PaymentMethodRef' => ['value' => $this->mapPaymentMethod($data['payment_method'] ?? 'cash')],
            'DepositToAccountRef' => ['value' => config('accounting.quickbooks.deposit_account_id')],
            'Line' => $data['invoices'] ?? [],
        ];

        $response = $this->request('POST', '/payment', [], $payload);

        return $response['Payment']['Id'] ?? '';
    }

    public function getInvoiceStatus(string $externalId): string
    {
        if (! $this->hasCredentials()) {
            return 'unknown';
        }

        try {
            $response = $this->request('GET', '/invoice/'.$externalId);

            return $response['Invoice']['Balance'] == 0 ? 'paid' : 'open';
        } catch (\Throwable $e) {
            return 'error';
        }
    }

    public function getName(): string
    {
        return 'quickbooks';
    }

    protected function getAccessToken(): string
    {
        if ($this->accessToken && $this->tokenExpiresAt > time() + 60) {
            return $this->accessToken;
        }

        $cacheKey = 'quickbooks_access_token';

        $adapter = $this;
        $this->accessToken = Cache::remember($cacheKey, 55 * 60, function () use ($adapter) {
            $response = Http::asForm()->withHeaders([
                'Authorization' => 'Basic '.base64_encode($adapter->clientId.':'.$adapter->clientSecret),
                'Accept' => 'application/json',
            ])->post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $adapter->refreshToken,
            ]);

            if (! $response->successful()) {
                throw new \Exception('Failed to get QuickBooks access token: '.$response->body());
            }

            $data = $response->json();
            $adapter->tokenExpiresAt = time() + ($data['expires_in'] ?? 3600);
            $adapter->refreshToken = $data['refresh_token'] ?? $adapter->refreshToken;

            return $data['access_token'] ?? '';
        });

        return $this->accessToken;
    }

    protected function request(string $method, string $endpoint, array $query = [], array $body = []): array
    {
        $accessToken = $this->getAccessToken();

        $url = $this->baseUrl.$this->realmId.$endpoint;
        $query['minorversion'] = '75';

        $request = Http::withToken($accessToken)
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])
            ->timeout(30)
            ->withQueryParameters($query);

        if (in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
            $response = $request->{$method}($url, $body);
        } else {
            $response = $request->{$method}($url);
        }

        if (! $response->successful()) {
            throw new \Exception('QuickBooks API error: '.$response->status().' - '.$response->body());
        }

        return $response->json();
    }

    protected function mapPaymentMethod(string $method): string
    {
        return match ($method) {
            'cash' => 'Cash',
            'card' => 'CreditCard',
            'mpesa' => 'Other',
            'airtel' => 'Other',
            'bank' => 'Check',
            default => 'Other',
        };
    }
}
