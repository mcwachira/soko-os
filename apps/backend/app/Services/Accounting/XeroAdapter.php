<?php

namespace App\Services\Accounting;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XeroAdapter implements AccountingProvider
{
    protected string $clientId;

    protected string $clientSecret;

    protected string $accessToken;

    protected string $refreshToken;

    protected string $tenantId;

    protected string $baseUrl = 'https://api.xero.com/api.xro/2.0';

    protected int $tokenExpiresAt = 0;

    public function __construct()
    {
        $this->clientId = config('accounting.xero.client_id');
        $this->clientSecret = config('accounting.xero.client_secret');
        $this->accessToken = config('accounting.xero.access_token');
        $this->refreshToken = config('accounting.xero.refresh_token');
        $this->tenantId = config('accounting.xero.tenant_id');
    }

    public function hasCredentials(): bool
    {
        return filled($this->clientId)
            && filled($this->clientSecret)
            && filled($this->accessToken)
            && filled($this->refreshToken)
            && filled($this->tenantId)
            && ! str_contains($this->clientId, 'placeholder');
    }

    public function connect(array $config): bool
    {
        $this->clientId = $config['client_id'] ?? $this->clientId;
        $this->clientSecret = $config['client_secret'] ?? $this->clientSecret;
        $this->accessToken = $config['access_token'] ?? $this->accessToken;
        $this->refreshToken = $config['refresh_token'] ?? $this->refreshToken;
        $this->tenantId = $config['tenant_id'] ?? $this->tenantId;

        try {
            $this->getAccessToken();

            return true;
        } catch (\Throwable $e) {
            Log::error('Xero connection failed', ['error' => $e->getMessage()]);

            return false;
        }
    }

    public function disconnect(): void
    {
        $this->accessToken = '';
        $this->refreshToken = '';
        $this->tokenExpiresAt = 0;
        Cache::forget('xero_access_token');
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
            $response = $this->request('GET', '/Accounts');

            return $response['Accounts'] ?? [];
        } catch (\Throwable $e) {
            Log::error('Xero sync chart of accounts failed', ['error' => $e->getMessage()]);

            return ['error' => $e->getMessage()];
        }
    }

    public function createCustomer(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Xero credentials not configured');
        }

        $payload = [
            'Name' => $data['name'],
            'EmailAddress' => $data['email'] ?? '',
            'Phones' => [['PhoneType' => 'DEFAULT', 'PhoneNumber' => $data['phone'] ?? '']],
            'Addresses' => [[
                'AddressType' => 'POBOX',
                'AddressLine1' => $data['address'] ?? '',
                'City' => $data['city'] ?? '',
                'Region' => $data['state'] ?? '',
                'PostalCode' => $data['postal_code'] ?? '',
                'Country' => $data['country'] ?? 'Kenya',
            ]],
            'ContactStatus' => 'ACTIVE',
        ];

        $response = $this->request('POST', '/Contacts', [], $payload);

        return $response['Contacts'][0]['ContactID'] ?? '';
    }

    public function updateCustomer(string $externalId, array $data): bool
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Xero credentials not configured');
        }

        $payload = [
            'ContactID' => $externalId,
            'Name' => $data['name'] ?? '',
            'EmailAddress' => $data['email'] ?? '',
            'Phones' => [['PhoneType' => 'DEFAULT', 'PhoneNumber' => $data['phone'] ?? '']],
            'Addresses' => [[
                'AddressType' => 'POBOX',
                'AddressLine1' => $data['address'] ?? '',
                'City' => $data['city'] ?? '',
                'Region' => $data['state'] ?? '',
                'PostalCode' => $data['postal_code'] ?? '',
                'Country' => $data['country'] ?? 'Kenya',
            ]],
        ];

        $response = $this->request('POST', '/Contacts', [], $payload);

        return isset($response['Contacts'][0]['ContactID']);
    }

    public function createProduct(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Xero credentials not configured');
        }

        $payload = [
            'Name' => $data['name'],
            'Description' => $data['description'] ?? '',
            'UnitPrice' => ($data['selling_price_minor'] ?? 0) / 100,
            'PurchaseUnitPrice' => ($data['cost_price_minor'] ?? 0) / 100,
            'Code' => $data['sku'] ?? '',
            'IsTrackedAsInventory' => true,
            'SalesUnit' => $data['unit'] ?? 'pcs',
            'PurchaseUnit' => $data['unit'] ?? 'pcs',
        ];

        $response = $this->request('POST', '/Items', [], $payload);

        return $response['Items'][0]['ItemID'] ?? '';
    }

    public function updateProduct(string $externalId, array $data): bool
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Xero credentials not configured');
        }

        $payload = [
            'ItemID' => $externalId,
            'Name' => $data['name'] ?? '',
            'Description' => $data['description'] ?? '',
            'UnitPrice' => isset($data['selling_price_minor']) ? $data['selling_price_minor'] / 100 : null,
            'PurchaseUnitPrice' => isset($data['cost_price_minor']) ? $data['cost_price_minor'] / 100 : null,
            'Code' => $data['sku'] ?? '',
        ];

        $response = $this->request('POST', '/Items', [], $payload);

        return isset($response['Items'][0]['ItemID']);
    }

    public function createInvoice(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Xero credentials not configured');
        }

        $lineItems = [];
        foreach ($data['line_items'] ?? [] as $item) {
            $lineItems[] = [
                'ItemCode' => $item['item_code'] ?? '',
                'Description' => $item['description'] ?? '',
                'Quantity' => $item['quantity'] ?? 1,
                'UnitAmount' => $item['rate'] ?? 0,
                'DiscountRate' => $item['discount'] ?? 0,
                'TaxType' => $item['tax_type'] ?? 'OUTPUT',
                'AccountCode' => $item['account_code'] ?? '200',
            ];
        }

        $payload = [
            'Type' => 'ACCREC',
            'Contact' => ['ContactID' => $data['customer_id']],
            'Date' => $data['date'] ?? now()->format('Y-m-d'),
            'DueDate' => $data['due_date'] ?? now()->addDays(30)->format('Y-m-d'),
            'LineItems' => $lineItems,
            'Reference' => $data['reference_number'] ?? null,
            'Status' => 'AUTHORISED',
        ];

        $response = $this->request('POST', '/Invoices', [], $payload);

        return $response['Invoices'][0]['InvoiceID'] ?? '';
    }

    public function createCreditNote(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Xero credentials not configured');
        }

        $lineItems = [];
        foreach ($data['line_items'] ?? [] as $item) {
            $lineItems[] = [
                'ItemCode' => $item['item_code'] ?? '',
                'Description' => $item['description'] ?? '',
                'Quantity' => $item['quantity'] ?? 1,
                'UnitAmount' => $item['rate'] ?? 0,
                'TaxType' => $item['tax_type'] ?? 'OUTPUT',
                'AccountCode' => $item['account_code'] ?? '200',
            ];
        }

        $payload = [
            'Type' => 'ACCRECCREDIT',
            'Contact' => ['ContactID' => $data['customer_id']],
            'Date' => $data['date'] ?? now()->format('Y-m-d'),
            'LineItems' => $lineItems,
            'Reference' => $data['reference_number'] ?? null,
            'Status' => 'AUTHORISED',
        ];

        $response = $this->request('POST', '/CreditNotes', [], $payload);

        return $response['CreditNotes'][0]['CreditNoteID'] ?? '';
    }

    public function createPayment(array $data): string
    {
        if (! $this->hasCredentials()) {
            throw new \Exception('Xero credentials not configured');
        }

        $payload = [
            'Invoice' => ['InvoiceID' => $data['invoice_id'] ?? ''],
            'Account' => ['Code' => config('accounting.xero.bank_account_code')],
            'Date' => $data['date'] ?? now()->format('Y-m-d'),
            'Amount' => $data['amount_minor'] / 100,
            'Reference' => $data['reference'] ?? null,
            'PaymentType' => $this->mapPaymentType($data['payment_method'] ?? 'cash'),
            'Status' => 'AUTHORISED',
        ];

        $response = $this->request('POST', '/Payments', [], $payload);

        return $response['Payments'][0]['PaymentID'] ?? '';
    }

    public function getInvoiceStatus(string $externalId): string
    {
        if (! $this->hasCredentials()) {
            return 'unknown';
        }

        try {
            $response = $this->request('GET', '/Invoices/'.$externalId);
            $invoice = $response['Invoices'][0] ?? null;

            if (! $invoice) {
                return 'not_found';
            }

            return match ($invoice['Status'] ?? '') {
                'PAID' => 'paid',
                'VOIDED' => 'cancelled',
                default => 'open',
            };
        } catch (\Throwable $e) {
            return 'error';
        }
    }

    public function getName(): string
    {
        return 'xero';
    }

    protected function getAccessToken(): string
    {
        if ($this->accessToken && $this->tokenExpiresAt > time() + 60) {
            return $this->accessToken;
        }

        $cacheKey = 'xero_access_token';

        $adapter = $this;
        $this->accessToken = Cache::remember($cacheKey, 25 * 60, function () use ($adapter) {
            $response = Http::asForm()->withHeaders([
                'Authorization' => 'Basic '.base64_encode($adapter->clientId.':'.$adapter->clientSecret),
            ])->post('https://identity.xero.com/connect/token', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $adapter->refreshToken,
            ]);

            if (! $response->successful()) {
                throw new \Exception('Failed to get Xero access token: '.$response->body());
            }

            $data = $response->json();
            $adapter->tokenExpiresAt = time() + ($data['expires_in'] ?? 1800);
            $adapter->refreshToken = $data['refresh_token'] ?? $adapter->refreshToken;

            return $data['access_token'] ?? '';
        });

        return $this->accessToken;
    }

    protected function request(string $method, string $endpoint, array $query = [], array $body = []): array
    {
        $accessToken = $this->getAccessToken();

        $url = $this->baseUrl.$endpoint;

        $request = Http::withToken($accessToken)
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Xero-Tenant-Id' => $this->tenantId,
            ])
            ->timeout(30)
            ->withQueryParameters($query);

        if (in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
            $response = $request->{$method}($url, $body);
        } else {
            $response = $request->{$method}($url);
        }

        if (! $response->successful()) {
            throw new \Exception('Xero API error: '.$response->status().' - '.$response->body());
        }

        return $response->json();
    }

    protected function mapPaymentType(string $method): string
    {
        return match ($method) {
            'cash' => 'CASH',
            'card' => 'CREDITCARD',
            'mpesa' => 'OTHER',
            'airtel' => 'OTHER',
            'bank' => 'DIRECTCREDIT',
            default => 'OTHER',
        };
    }
}
