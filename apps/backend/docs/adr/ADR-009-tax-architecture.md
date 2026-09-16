# ADR-009: Tax Provider Architecture

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Soko-OS operates in multiple African countries, each with different tax authorities and APIs (KRA eTIMS, TRA, URA, ZRA, GRA, FIRS, SARS).

## Decision

**Adapter Pattern with Country-Specific Providers**

### Architecture
```
TaxEngine (Service)
    │
    ├── KenyaTaxProvider → KraEtimsService
    ├── UgandaTaxProvider → URAService
    ├── TanzaniaTaxProvider → TRAService
    ├── RwandaTaxProvider → RRAService
    ├── GhanaTaxProvider → GRAService
    ├── NigeriaTaxProvider → FIRSService
    └── SouthAfricaTaxProvider → SARSService
```

### Provider Interface
```php
interface TaxProvider {
    public function calculate(Sale $sale): TaxCalculation;
    public function fiscalize(Sale $sale): TaxSubmission;
    public function creditNote(ReturnModel $return): TaxSubmission;
    public function cancel(Sale $sale): TaxSubmission;
    public function getStatus(string $submissionId): TaxStatus;
    public function getCountryCode(): string;
}
```

### Configuration-Driven Rates
```php
// config/tax.php
return [
    "default" => "kenya",
    "providers" => [
        "kenya" => \App\Services\Tax\KenyaTaxProvider::class,
        "uganda" => \App\Services\Tax\UgandaTaxProvider::class,
    ],
    "rules" => [
        "KE" => [
            "A" => ["rate" => 0, "label" => "Zero-rated"],
            "B" => ["rate" => 16, "label" => "Standard VAT"],
            "C" => ["rate" => 8, "label" => "Reduced VAT"],
            "E" => ["rate" => 0, "label" => "Exempt"],
        ],
    ],
];
```

### Kenya KRA eTIMS (OSCU/VSCU)
- **OSCU** - Online Sales Control Unit (real-time)
- **VSCU** - Virtual Sales Control Unit (batch/offline)
- **Current Implementation:** Scaffold only, requires credentials/certification
- **Payload Builder:** OSCU-aligned structure with `_meta` disclaimer
- **Submission:** Async job (`FiscalizeSaleJob`) with retry/backoff

### Tax Submission State Machine
```
pending → queued → submitting → accepted
                    ↓
                rejected → failed (retry)
                    ↓
                cancelled
```

## Consequences

### Positive
- **Extensible** - New countries = new provider class
- **Isolation** - Country logic encapsulated
- **Testable** - Mock providers per country
- **Compliance** - Never fake acceptance, honest about credentials

### Negative
- **Fragmentation** - Each country different API quirks
- **Maintenance** - Must track regulatory changes per country
- **Certification** - Production requires per-country approval

## Implementation Status

| Country | Provider | Status |
|---------|----------|--------|
| Kenya | KraEtimsService | Scaffold (needs cert) |
| Uganda | - | Planned |
| Tanzania | - | Planned |
| Rwanda | - | Planned |
| Ghana | - | Planned |
| Nigeria | - | Planned |
| South Africa | - | Planned |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Single KRA Class | Not extensible, hardcodes Kenya logic |
| Config-Only Rates | No fiscalization, compliance gap |
| External Tax SaaS | Vendor lock-in, data sovereignty, cost |
