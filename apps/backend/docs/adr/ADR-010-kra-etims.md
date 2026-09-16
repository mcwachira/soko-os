# ADR-010: Kenya KRA eTIMS Integration

**Date:** 2026-09-13  
**Status:** Accepted (Scaffold Only - Requires Certification)

## Context

Kenya Revenue Authority (KRA) mandates eTIMS (electronic Tax Invoice Management System) for all VAT-registered businesses. Two architectures: OSCU (Online) and VSCU (Virtual).

## Decision

**Implement Architecture Scaffold Only - No Live Calls Without Certification**

### Current Implementation

```php
class KraEtimsService {
    public function fiscalizeSale(Sale $sale): TaxSubmission {
        $submission = TaxSubmission::create([
            "status" => "queued",
            "request_payload" => $this->buildPayload($sale),
            "error_message" => $this->hasCredentials() 
                ? null 
                : "Requires Credentials / Sandbox / Certification",
        ]);
        
        FiscalizeSaleJob::dispatch($sale->id);
        return $submission;
    }
}
```

### Payload Structure (OSCU-Aligned)
```json
{
  "tin": "P051234567Z",
  "bhfId": "00",
  "invcNo": "REC-NRB01-20260913-ABC123",
  "custTin": null,
  "custNm": "Walk-in Customer",
  "salesTyCd": "N",
  "rcptTyCd": "S",
  "pmtTyCd": "01",
  "salesSttsCd": "02",
  "totItemCnt": 2,
  "taxblAmtA": 0,
  "taxAmtA": 0,
  "taxblAmtB": 1000.00,
  "taxAmtB": 160.00,
  "totTaxblAmt": 1000.00,
  "totTaxAmt": 160.00,
  "totAmt": 1160.00,
  "itemList": [...],
  "_meta": {
    "provider": "KraEtimsService",
    "mode": "sandbox",
    "status": "Requires Credentials"
  }
}
```

### State Machine
```
pending → queued → submitting → accepted (control_code + qr_code + fiscal_signature)
                    ↓
                rejected (error_code + error_message)
                    ↓
                retry (max 3, exponential backoff)
                    ↓
                failed (manual intervention)
```

### Credentials Required
| Environment | Variables |
|-------------|-----------|
| Sandbox | `KRA_CLIENT_ID`, `KRA_CLIENT_SECRET`, `KRA_PIN`, `KRA_PASSKEY`, `KRA_SHORT_CODE` |
| Production | Above + Certification + OSCU/VSCU device registration |

### Certification Path
1. **KRA Portal Registration** - Business registration, PIN verification
2. **OSCU Device Registration** - Hardware/Virtual SCU registration
3. **Sandbox Testing** - End-to-end payload validation
4. **Production Certification** - KRA audit, go-live approval

## Consequences

### Positive
- **Honest Architecture** - Never fakes KRA acceptance
- **Production Ready** - Scaffold complete, only credentials missing
- **Audit Trail** - Every submission logged with payload/response
- **Retry Logic** - Exponential backoff handles transient failures

### Negative
- **Blocked by External** - Cannot test end-to-end without KRA sandbox
- **Certification Timeline** - Unknown, depends on KRA process
- **OSCU vs VSCU** - Architecture supports both, but certification differs

## Implementation Checklist

- [x] Payload builder (OSCU structure)
- [x] TaxSubmission model + migration
- [x] Async job with retry/backoff
- [x] Status tracking (pending/queued/accepted/rejected/failed)
- [x] Error logging with context
- [ ] Sandbox credentials configuration
- [ ] HTTP client with OAuth2 token management
- [ ] Response parsing (control_code, qr_code, fiscal_signature)
- [ ] Credit note / debit note support
- [ ] Cancellation support
- [ ] Production certification

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Direct HTTP in Controller | Blocks request, no retry, poor UX |
| Fake Acceptance | Fraud risk, audit failure, legal liability |
| Third-Party SaaS | Data sovereignty, cost, vendor lock-in |
