<?php

namespace App\Services\Tax;

use App\Models\Sale;
use App\Models\TaxSubmission;
use Illuminate\Support\Str;

/**
 * Kenya KRA eTIMS fiscalization adapter (architecture scaffold).
 *
 * Status: Requires Credentials / Requires Sandbox / Requires Certification.
 * This service NEVER invents a successful KRA acceptance response.
 * Without configured credentials, submissions remain queued for async retry.
 */
class KraEtimsService
{
    protected string $mode;

    protected ?string $baseUrl;

    protected ?string $clientId;

    protected ?string $clientSecret;

    public function __construct()
    {
        $this->mode = (string) config('tax.kra.mode', 'sandbox');
        $this->baseUrl = config('tax.kra.base_url');
        $this->clientId = config('tax.kra.client_id');
        $this->clientSecret = config('tax.kra.client_secret');
    }

    public function hasCredentials(): bool
    {
        return filled($this->clientId)
            && filled($this->clientSecret)
            && ! str_contains((string) $this->clientId, 'placeholder')
            && ! str_contains((string) $this->clientSecret, 'placeholder');
    }

    /**
     * Queue a tax submission for the sale.
     * Sale remains completed even if tax submission is pending.
     */
    public function fiscalizeSale(Sale $sale): TaxSubmission
    {
        $submission = TaxSubmission::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $sale->organization_id,
            'business_id' => $sale->business_id,
            'sale_id' => $sale->id,
            'country_code' => 'KE',
            'tax_authority' => 'KRA',
            'status' => 'queued',
            'request_payload' => $this->buildPayload($sale),
            'error_message' => $this->hasCredentials()
                ? null
                : 'KRA eTIMS credentials not configured. Submission queued. Requires Credentials / Sandbox / Certification.',
        ]);

        $sale->update(['tax_submission_status' => 'queued']);

        // Live HTTP submission to official eTIMS endpoints is intentionally not
        // implemented here until sandbox credentials and certification are available.
        // Queue workers will retry when credentials and provider approval exist.

        return $submission;
    }

    /**
     * Build a payload shape aligned with eTIMS OSCU concepts.
     * Field mappings must be verified against current official KRA documentation
     * before production use — do not treat this as a certified payload.
     */
    public function buildPayload(Sale $sale): array
    {
        $sale->loadMissing(['items', 'payments']);

        return [
            'tin' => config('tax.kra.pin'),
            'bhfId' => '00',
            'invcNo' => $sale->receipt_number,
            'orgInvcNo' => null,
            'custTin' => null,
            'custNm' => 'Walk-in Customer',
            'salesTyCd' => 'N',
            'rcptTyCd' => 'S',
            'pmtTyCd' => '01',
            'salesSttsCd' => '02',
            'totItemCnt' => $sale->items->count(),
            'taxblAmtA' => 0,
            'taxAmtA' => 0,
            'taxblAmtB' => $sale->subtotal_minor / 100,
            'taxAmtB' => $sale->tax_total_minor / 100,
            'totTaxblAmt' => $sale->subtotal_minor / 100,
            'totTaxAmt' => $sale->tax_total_minor / 100,
            'totAmt' => $sale->grand_total_minor / 100,
            'itemList' => $sale->items->map(function ($item, $index) {
                return [
                    'itemSeq' => $index + 1,
                    'itemCd' => $item->sku,
                    'itemNm' => $item->name,
                    'pkgUnitCd' => 'NT',
                    'qtyUnitCd' => 'U',
                    'qty' => (float) $item->quantity,
                    'prc' => $item->unit_price_minor / 100,
                    'splyAmt' => $item->total_minor / 100,
                    'taxTyCd' => $item->tax_rate_percentage > 0 ? 'B' : 'A',
                    'taxAmt' => $item->tax_amount_minor / 100,
                    'totAmt' => $item->total_minor / 100,
                ];
            })->values()->toArray(),
            '_meta' => [
                'provider' => 'KraEtimsService',
                'mode' => $this->mode,
                'base_url' => $this->baseUrl,
                'status' => 'Requires Credentials',
                'note' => 'Payload is an adapter scaffold. Verify against current official KRA eTIMS docs before production.',
            ],
        ];
    }
}
