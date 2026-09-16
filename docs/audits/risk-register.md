# Soko-OS Risk Register

**Generated from:** Comprehensive System Audit & Gap Analysis (2026-09-13)  
**Purpose:** Track risks that could impact project success, data integrity, security, or compliance

---

## Risk Scoring Matrix

| Likelihood | Impact | Score | Rating |
|------------|--------|-------|--------|
| Very High (5) | Catastrophic (5) | 25 | **CRITICAL** |
| High (4) | Critical (4) | 16-20 | **HIGH** |
| Medium (3) | Major (3) | 9-12 | **MEDIUM** |
| Low (2) | Minor (2) | 4-6 | **LOW** |
| Very Low (1) | Negligible (1) | 1-3 | **VERY LOW** |

**Risk Score = Likelihood × Impact**

---

## Identified Risks

### RISK-001: Cross-Tenant Data Leakage
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-001, GAP-003, GAP-004 |
| **Description** | Without authentication and tenant isolation middleware, any API caller can access/modify data across organizations by manipulating UUID IDs in requests |
| **Likelihood** | 5 (Very High) — Current code has zero enforcement |
| **Impact** | 5 (Catastrophic) — Complete data breach, regulatory violation, loss of trust |
| **Risk Score** | **25 — CRITICAL** |
| **Current Mitigation** | None |
| **Planned Mitigation** | 1. Implement Sanctum authentication (GAP-004)<br>2. Add `EnsureTenantAccess` middleware (GAP-003)<br>3. Remove hardcoded IDs (GAP-001)<br>4. Add policies for all resources (GAP-023) |
| **Target Date** | Before any multi-tenant testing |
| **Owner** | Backend Lead |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Low (after auth + middleware + policies) |

---

### RISK-002: Inventory Data Corruption
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-002, GAP-006, GAP-018 |
| **Description** | Sales create no inventory movements; stock quantities never decrement; returns/refunds not implemented; concurrent sales on same product cause race conditions |
| **Likelihood** | 5 (Very High) — Zero inventory tracking on sales |
| **Impact** | 4 (Critical) — Financial statements wrong, stockouts/overstock, audit failure |
| **Risk Score** | **20 — HIGH** |
| **Current Mitigation** | Inventory movement table exists with `balance_after` |
| **Planned Mitigation** | 1. Create inventory movements on sale (GAP-002)<br>2. Add row-level locking or optimistic locking for stock decrement<br>3. Implement returns with reverse movements (GAP-018)<br>4. Add stock validation before sale |
| **Target Date** | Before first real sale |
| **Owner** | Backend Lead |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Medium (concurrency edge cases remain) |

---

### RISK-003: KRA Fiscalization Blocks Sales
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-007, GAP-022 |
| **Description** | KRA submission called synchronously inside DB transaction; KRA timeout/failure rolls back completed sale; no async queue for retries |
| **Likelihood** | 4 (High) — External API calls in transaction is anti-pattern |
| **Impact** | 4 (Critical) — Lost sales, customer frustration, revenue loss |
| **Risk Score** | **16 — HIGH** |
| **Current Mitigation** | KRA service queues submission but still called in transaction |
| **Planned Mitigation** | 1. Move fiscalization to async job (GAP-007)<br>2. Implement outbox pattern for reliability (GAP-022)<br>3. Add circuit breaker for KRA API<br>4. Sale completes regardless of KRA status |
| **Target Date** | Before KRA sandbox testing |
| **Owner** | Integration Engineer |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Low (async + outbox + circuit breaker) |

---

### RISK-004: Offline Data Never Reaches Server
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-011, GAP-012, GAP-005, GAP-006 |
| **Description** | POS writes to IndexedDB only; no auto-sync; manual sync button non-functional; sync pull returns all data (fails at scale); only sales.create syncs |
| **Likelihood** | 5 (Very High) — Current architecture is offline-only demo |
| **Impact** | 5 (Catastrophic) — All transaction data lost on browser clear; no server record |
| **Risk Score** | **25 — CRITICAL** |
| **Current Mitigation** | IndexedDB persistence survives reload |
| **Planned Mitigation** | 1. Wire frontend to API client (GAP-011)<br>2. Implement delta sync pull (GAP-005)<br>3. Add auto-sync on online event (GAP-012)<br>4. Complete sync push for all entities (GAP-006) |
| **Target Date** | Before pilot deployment |
| **Owner** | Frontend Lead |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Medium (network edge cases, conflict resolution) |

---

### RISK-005: Silent Data Corruption on Concurrent Edits
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-013, GAP-028 |
| **Description** | No conflict detection/resolution in sync; two terminals edit same product/customer → last write wins silently; no version checking on push |
| **Likelihood** | 4 (High) — Multi-terminal branches are standard deployment |
| **Impact** | 4 (Critical) — Price changes lost, customer data overwritten, inventory wrong |
| **Risk Score** | **16 — HIGH** |
| **Current Mitigation** | Product has `version` column (optimistic locking) |
| **Planned Mitigation** | 1. Implement conflict detection on push (compare versions)<br>2. Add conflict resolution strategies (server-wins, merge)<br>3. UI for manual conflict resolution<br>4. Test with 4+ concurrent terminals (GAP-028) |
| **Target Date** | Before multi-terminal pilot |
| **Owner** | Sync Engineer |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Medium (merge conflicts on complex entities) |

---

### RISK-006: Receipt Files Lost on Container Restart
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-014 |
| **Description** | MinIO running but Laravel uses `local` filesystem; uploaded receipts, imports, backups stored in container ephemeral storage |
| **Likelihood** | 4 (High) — Any deploy/restart loses files |
| **Impact** | 3 (Major) — Compliance issue (receipts), data loss for imports |
| **Risk Score** | **12 — MEDIUM** |
| **Current Mitigation** | MinIO infrastructure ready |
| **Planned Mitigation** | 1. Install `league/flysystem-aws-s3-v3` (GAP-014)<br>2. Configure S3 disk in `filesystems.php`<br>3. Set `FILESYSTEM_DISK=s3` in Compose<br>4. Test persistence across restarts |
| **Target Date** | Before file upload features |
| **Owner** | DevOps Engineer |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Very Low (after S3 config) |

---

### RISK-007: M-Pesa Payments Fail Silently
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-020 |
| **Description** | M-Pesa STK provider returns mock `pending`; no real STK push; no callback handling; no status polling; no reconciliation; payment marked complete without verification |
| **Likelihood** | 5 (Very High) — Current implementation is placeholder |
| **Impact** | 4 (Critical) — Customer pays but sale unpaid; reconciliation nightmare; fraud risk |
| **Risk Score** | **20 — HIGH** |
| **Current Mitigation** | None — scaffold only |
| **Planned Mitigation** | 1. Implement Daraja OAuth + STK push<br>2. Add callback endpoint with signature verification<br>3. Implement status polling job<br>4. Add daily reconciliation report<br>5. **Requires Safaricom sandbox credentials** |
| **Target Date** | Before payment pilot |
| **Owner** | Integration Engineer |
| **Status** | 🔴 Open — Blocked on Credentials |
| **Residual Risk** | Medium (network failures, callback delays) |

---

### RISK-008: No Audit Trail for Financial Transactions
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-004, GAP-003 |
| **Description** | No authentication = no user context; `audit_logs` table exists but never written; no record of who created/modified sales, shifts, prices, inventory |
| **Likelihood** | 5 (Very High) — Zero implementation |
| **Impact** | 4 (Critical) — Regulatory non-compliance (Kenya Companies Act, tax law); fraud undetectable |
| **Risk Score** | **20 — HIGH** |
| **Current Mitigation** | Schema ready |
| **Planned Mitigation** | 1. Implement authentication (GAP-004)<br>2. Create `AuditService` writing to `audit_logs`<br>3. Auto-audit on all write operations via model observers<br>4. Include: user_id, action, entity, old/new values, IP, user-agent |
| **Target Date** | Before production |
| **Owner** | Backend Lead |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Low (after implementation) |

---

### RISK-009: External Dependency Delays (KRA, M-Pesa, Accounting)
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-007, GAP-020, GAP-030, GAP-031 |
| **Description** | KRA sandbox access, Safaricom Daraja credentials, Zoho/QBO/Xero OAuth apps require external approval processes with unpredictable timelines |
| **Likelihood** | 4 (High) — Typical for African fintech integrations |
| **Impact** | 3 (Major) — Blocks payment, tax, accounting features; delays launch |
| **Risk Score** | **12 — MEDIUM** |
| **Current Mitigation** | Adapters scaffolded with clear "requires credentials" status |
| **Planned Mitigation** | 1. Apply for all sandboxes immediately (parallel)<br>2. Build against mock/sandbox responses<br>3. Use feature flags to disable blocked features<br>4. Document exact requirements for each provider<br>5. Have fallback manual processes |
| **Target Date** | ASAP (start applications now) |
| **Owner** | Project Lead |
| **Status** | 🟡 In Progress — Applications Not Started |
| **Residual Risk** | Medium (external timeline uncertainty) |

---

### RISK-010: Scalability Failure at 10k+ Products
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-005, GAP-015 |
| **Description** | Sync pull returns all products unpaginated; no search API; frontend loads all into memory; IndexedDB write performance untested at scale |
| **Likelihood** | 3 (Medium) — Supermarkets have 10k-100k SKUs |
| **Impact** | 4 (Critical) — POS crashes, sync times out, OOM errors |
| **Risk Score** | **12 — MEDIUM** |
| **Current Mitigation** | None |
| **Planned Mitigation** | 1. Implement cursor-based pagination (GAP-005)<br>2. Add server-side search/filter API<br>3. Implement virtualized product grid<br>4. Add IndexedDB bulk operations<br>5. Load test with 10k/50k/100k products |
| **Target Date** | Before supermarket pilot |
| **Owner** | Frontend + Backend Leads |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Low (after pagination + virtualization) |

---

### RISK-011: Financial Rounding Errors
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-002, GAP-021 |
| **Description** | Tax calculation uses `round()` in PHP and `Math.round()` in JS; split payments, discounts, refunds may cause cent discrepancies; journal entries must balance exactly |
| **Likelihood** | 3 (Medium) — Known issue in financial systems |
| **Impact** | 4 (Critical) — Books don't balance; tax filing errors; audit findings |
| **Risk Score** | **12 — MEDIUM** |
| **Current Mitigation** | Minor units (integers) used throughout |
| **Planned Mitigation** | 1. Centralize all money math in `@soko/utils` (single source of truth)<br>2. Use banker's rounding consistently<br>3. Add rounding adjustment line in journal entries<br>4. Test: sale + refund = zero net; split payments sum = total |
| **Target Date** | Before financial pilot |
| **Owner** | Backend Lead |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Low (with centralized math library) |

---

### RISK-012: Security Vulnerabilities in Dependencies
| Field | Value |
|-------|-------|
| **Related Gaps** | — |
| **Description** | npm/composer dependencies may have CVEs; no automated scanning in CI; no dependabot/renovate configured |
| **Likelihood** | 3 (Medium) — Common in JS/PHP ecosystems |
| **Impact** | 4 (Critical) — Supply chain attack, data breach |
| **Risk Score** | **12 — MEDIUM** |
| **Current Mitigation** | Lockfiles committed |
| **Planned Mitigation** | 1. Enable GitHub Dependabot for npm and composer<br>2. Add `npm audit` / `composer audit` to CI<br>3. Schedule monthly dependency updates<br>4. Pin critical versions |
| **Target Date** | Before CI/CD pipeline |
| **Owner** | DevOps Engineer |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Low (with automated scanning) |

---

### RISK-013: Database Migration Failures in Production
| Field | Value |
|-------|-------|
| **Related Gaps** | — |
| **Description** | Single large migration; no rollback testing; future schema changes need careful migration strategy; no zero-downtime migration plan |
| **Likelihood** | 2 (Low) — Single migration currently |
| **Impact** | 5 (Catastrophic) — Data loss, downtime, rollback impossible |
| **Risk Score** | **10 — MEDIUM** |
| **Current Mitigation** | Migration tested in Docker |
| **Planned Mitigation** | 1. Split future migrations into small, reversible steps<br>2. Test `migrate:fresh` and rollback in staging<br>3. Use blue-green deployment for schema changes<br>4. Backup before every migration<br>5. Document rollback procedures |
| **Target Date** | Before production deploy |
| **Owner** | DevOps Engineer |
| **Status** | 🟡 In Progress — Documentation Needed |
| **Residual Risk** | Low (with proper process) |

---

### RISK-014: Insufficient Test Coverage for Critical Paths
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-032 |
| **Description** | Only 2 backend tests, 1 frontend test; no integration tests; no E2E tests; no sync tests; no concurrency tests |
| **Likelihood** | 4 (High) — Current coverage < 5% |
| **Impact** | 3 (Major) — Regressions undetected; refactoring dangerous; no confidence in releases |
| **Risk Score** | **12 — MEDIUM** |
| **Current Mitigation** | Package unit tests exist |
| **Planned Mitigation** | 1. Add feature tests for all API endpoints<br>2. Add integration tests for sync flow<br>3. Add E2E tests for critical POS flows (Playwright)<br>4. Add concurrency tests for inventory<br>5. Target 80% coverage on business logic |
| **Target Date** | Ongoing |
| **Owner** | QA Engineer |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Medium (tests lag implementation) |

---

### RISK-015: Regulatory Non-Compliance (Kenya)
| Field | Value |
|-------|-------|
| **Related Gaps** | GAP-007, GAP-008, GAP-031 |
| **Description** | KRA eTIMS requires certified OSCU/VSCU; tax invoices must have specific format; credit notes must reference original; data retention 5 years |
| **Likelihood** | 3 (Medium) — If certification not obtained |
| **Impact** | 5 (Catastrophic) — Fines, business license revocation, illegal operation |
| **Risk Score** | **15 — HIGH** |
| **Current Mitigation** | Adapter documents requirements; no fake compliance |
| **Planned Mitigation** | 1. Engage KRA certification process early<br>2. Implement exact OSCU payload per spec<br>3. Add credit/debit note support<br>4. Implement 5-year data retention policy<br>5. Legal review of all tax documents |
| **Target Date** | Before Kenya production |
| **Owner** | Compliance Lead |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Medium (certification outcome uncertain) |

---

### RISK-016: Offline Data Security on Device
| Field | Value |
|-------|-------|
| **Related Gaps** | — |
| **Description** | IndexedDB stores sales, customers, products in plaintext; device theft exposes all business data; no encryption at rest in browser |
| **Likelihood** | 3 (Medium) — POS devices in public spaces |
| **Impact** | 3 (Major) — Customer PII, sales data, pricing exposed |
| **Risk Score** | **9 — MEDIUM** |
| **Current Mitigation** | None |
| **Planned Mitigation** | 1. Evaluate encrypted IndexedDB (e.g., `dexie-encrypted`)<br>2. Add device PIN/biometric lock in PWA<br>3. Implement remote wipe via device revocation<br>4. Minimize PII stored offline |
| **Target Date** | Before field deployment |
| **Owner** | Security Engineer |
| **Status** | 🔴 Open — Not Started |
| **Residual Risk** | Medium (browser encryption limitations) |

---

## Risk Summary Dashboard

| Risk ID | Title | Score | Rating | Status | Target |
|---------|-------|-------|--------|--------|--------|
| RISK-001 | Cross-Tenant Data Leakage | 25 | 🔴 CRITICAL | Open | Week 1 |
| RISK-004 | Offline Data Never Reaches Server | 25 | 🔴 CRITICAL | Open | Week 3 |
| RISK-002 | Inventory Data Corruption | 20 | 🟠 HIGH | Open | Week 2 |
| RISK-003 | KRA Fiscalization Blocks Sales | 16 | 🟠 HIGH | Open | Week 2 |
| RISK-005 | Silent Data Corruption on Concurrent Edits | 16 | 🟠 HIGH | Open | Week 3 |
| RISK-007 | M-Pesa Payments Fail Silently | 20 | 🟠 HIGH | Blocked | TBD |
| RISK-008 | No Audit Trail for Financial Transactions | 20 | 🟠 HIGH | Open | Week 4 |
| RISK-009 | External Dependency Delays | 12 | 🟡 MEDIUM | In Progress | ASAP |
| RISK-010 | Scalability Failure at 10k+ Products | 12 | 🟡 MEDIUM | Open | Week 4 |
| RISK-011 | Financial Rounding Errors | 12 | 🟡 MEDIUM | Open | Week 3 |
| RISK-012 | Security Vulnerabilities in Dependencies | 12 | 🟡 MEDIUM | Open | Week 2 |
| RISK-013 | Database Migration Failures | 10 | 🟡 MEDIUM | In Progress | Pre-Prod |
| RISK-014 | Insufficient Test Coverage | 12 | 🟡 MEDIUM | Open | Ongoing |
| RISK-015 | Regulatory Non-Compliance (Kenya) | 15 | 🟠 HIGH | Open | Pre-Prod |
| RISK-016 | Offline Data Security on Device | 9 | 🟡 MEDIUM | Open | Pre-Deploy |

---

## Risk Treatment Priority

### Immediate (This Week)
1. **RISK-001** → Implement Auth + Tenant Middleware (GAP-004, GAP-003)
2. **RISK-004** → Wire Frontend API + Auto-Sync (GAP-011, GAP-012)
3. **RISK-009** → Submit all sandbox applications (KRA, M-Pesa, Zoho, QBO, Xero)

### Week 2
4. **RISK-002** → Inventory Movements (GAP-002)
5. **RISK-003** → Async KRA + Outbox (GAP-007, GAP-022)
6. **RISK-012** → Enable Dependabot + CI audits

### Week 3
7. **RISK-005** → Conflict Resolution (GAP-013)
8. **RISK-011** → Centralized Money Math + Rounding Tests
9. **RISK-010** → Pagination + Virtualization

### Week 4+
10. **RISK-008** → Audit Logging
11. **RISK-015** → KRA Certification Process
12. **RISK-014** → Test Coverage Expansion
13. **RISK-016** → Offline Encryption Evaluation

---

## Risk Monitoring

| Cadence | Activity | Owner |
|---------|----------|-------|
| Daily | Standup: risk blockers review | Project Lead |
| Weekly | Risk register review, update scores | Project Lead |
| Sprint | Retrospective: new risks identified | Team |
| Monthly | Dependency vulnerability scan | DevOps |
| Pre-Release | Full risk assessment sign-off | Tech Lead + Compliance |

---

*End of Risk Register*