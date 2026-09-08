# Quickstart & Validation Guide: Supporting Evidence

**Feature**: Supporting Evidence Library and Opportunity Selection  
**Branch**: `008-supporting-evidence`  
**Date**: 2026-09-08  
**Spec**: [spec.md](./spec.md) | **Contracts**: [API Contracts](./contracts/evidence-api.md) | **Data Model**: [data-model.md](./data-model.md)

---

## 1. Prerequisites & Setup

Ensure the repository dependencies are installed and the environment is clean:

```powershell
# Verify frozen lockfile dependencies
bun install --frozen-lockfile

# Verify offline test quality gate
bun run check
```

---

## 2. Automated Test Verification

All supporting evidence functionality is verified by a dedicated, isolated test suite under `tests/008-supporting-evidence/`:

```powershell
# Run the complete Supporting Evidence test suite
bun run test -- tests/008-supporting-evidence/

# Run specific test slices
bun run test -- tests/008-supporting-evidence/boundaries/evidence-boundary.test.ts
bun run test -- tests/008-supporting-evidence/procedures/evidence-router.test.ts
bun run test -- tests/008-supporting-evidence/components/evidence-views.test.tsx
```

### Key Automated Invariants Tested
1. **Schema & Boundary Integrity**: Asserts that `evidence_items` and `opportunity_evidence` are strictly server-only, enforce foreign key cascading, and contain no client leaks.
2. **Owner Isolation**: Verifies that any query or mutation targeting another user's evidence item or opportunity returns `unavailableResource()` (404 NOT_FOUND).
3. **Dual Ownership on Association**: Verifies that associating an evidence item with an opportunity requires ownership of both records.
4. **Validation Strictness**: Asserts that invalid lengths, whitespace-only strings, or non-HTTPS URLs are rejected by Zod schemas.
5. **Cascade & Association Cleanup**: Verifies that deleting an evidence item removes all related `opportunity_evidence` rows while preserving the opportunities, and deleting an opportunity cleans associations while preserving the evidence library item.

---

## 3. Manual End-to-End Validation Scenarios

### Scenario 1: Personal Evidence Library CRUD
1. Sign in as a test user and navigate to `/dashboard/evidence`.
2. Click **"Add Evidence"**.
3. Fill in:
   - Title: `Distributed Task Queue`
   - Type: `project`
   - Description: `Built an in-memory task queue in Go supporting concurrent worker pools and graceful shutdown.`
   - Link: `https://github.com/example/task-queue`
4. Click **"Create Evidence"**.
5. **Expected Outcome**: The modal closes, and the card appears in the library grid displaying the `Project` badge, title, description, and external HTTPS link.
6. Click **"Edit"** on the card, modify the title to `Distributed Task Queue in Go`, and save.
7. **Expected Outcome**: The card updates in place with the modified title.

---

### Scenario 2: Opportunity-Evidence Association
1. Navigate to `/dashboard/opportunities/[opportunityId]`.
2. Scroll to the **"Supporting Evidence"** section.
3. Click **"Attach Evidence"**.
4. In the picker dialog, locate `Distributed Task Queue in Go` and click **"Attach"**.
5. **Expected Outcome**: The item moves to the selected list for this opportunity. The opportunity evidence count increments to 1.
6. Click **"Detach"** on the selected evidence card.
7. **Expected Outcome**: The item is removed from the opportunity's selected list. Navigate back to `/dashboard/evidence` and confirm the item remains intact in the personal library.

---

### Scenario 3: Contextual Evidence Creation from Opportunity
1. On an opportunity detail page (`/dashboard/opportunities/[opportunityId]`), click **"New Evidence"** in the Supporting Evidence section.
2. Fill in:
   - Title: `Prometheus Metrics Exporter`
   - Type: `accomplishment`
   - Description: `Instrumented HTTP services with custom Prometheus counters, reducing p99 latency alerts by 40%.`
   - Link: `https://example.com/blog/metrics`
3. Click **"Create & Attach"**.
4. **Expected Outcome**: The item is immediately saved to the personal evidence library AND automatically attached to the current opportunity. Navigate to `/dashboard/evidence` to confirm it also appears in the global library.

---

### Scenario 4: Cascade Deletion with Opportunity Warning
1. Attach `Distributed Task Queue in Go` to Opportunity A and Opportunity B.
2. Navigate to `/dashboard/evidence`.
3. Click the **Delete** button on `Distributed Task Queue in Go`.
4. **Expected Outcome**: The confirmation dialog opens and prominently warns:
   > "Warning: This item is currently attached to 2 opportunities:
   > - Opportunity A
   > - Opportunity B
   > Deleting this item will remove it from your library and detach it from all associated opportunities."
5. Click **"Delete Evidence"**.
6. **Expected Outcome**: The card disappears from the library. Navigate to Opportunity A and Opportunity B to confirm the item is cleanly detached from both without leaving orphaned associations.

---

### Scenario 5: Cross-User Authorization & Security
1. Using test user A, obtain the ID of an evidence item created by user A (`evidence-A-id`).
2. Log in as test user B.
3. Send a tRPC query for `evidence.byId({ id: "evidence-A-id" })` or attempt to attach it to user B's opportunity via `evidence.attach({ opportunityId: "opp-B-id", evidenceItemId: "evidence-A-id" })`.
4. **Expected Outcome**: The server responds with `404 NOT_FOUND: The requested resource is unavailable.` with zero indication of whether the item exists.
