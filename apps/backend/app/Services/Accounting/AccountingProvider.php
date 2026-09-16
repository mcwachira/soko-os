<?php

namespace App\Services\Accounting;

interface AccountingProvider
{
    public function connect(array $config): bool;

    public function disconnect(): void;

    public function isConnected(): bool;

    public function syncChartOfAccounts(): array;

    public function createCustomer(array $data): string;

    public function updateCustomer(string $externalId, array $data): bool;

    public function createProduct(array $data): string;

    public function updateProduct(string $externalId, array $data): bool;

    public function createInvoice(array $data): string;

    public function createCreditNote(array $data): string;

    public function createPayment(array $data): string;

    public function getInvoiceStatus(string $externalId): string;

    public function getName(): string;
}
