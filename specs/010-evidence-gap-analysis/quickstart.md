# Quickstart & Validation Guide: Opportunity Evidence-Gap Analysis

**Feature**: Opportunity Evidence-Gap Analysis  
**Branch**: `010-evidence-gap-analysis`  
**Date**: 2026-09-09  
**Spec**: [spec.md](./spec.md) | **API Contract**: [analysis-api.md](./contracts/analysis-api.md) | **AI Contract**: [ai-analyzer.md](./contracts/ai-analyzer.md) | **UI Contract**: [analysis-ui.md](./contracts/analysis-ui.md) | **Data Model**: [data-model.md](./data-model.md)

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

All Evidence-Gap Analysis functionality is verified by a dedicated test suite under `tests/010-evidence-gap-analysis/`:

```powershell
# Run the complete Evidence-Gap Analysis test suite
bun run test -- tests/010-evidence-gap-analysis/

# Run specific test slices
bun run test -- tests/010-evidence-gap-analysis/boundaries/analysis-boundary.test.ts
bun run test -- tests/010-evidence-gap-analysis/ai/citation-verifier.test.ts
bun run test -- tests/010-evidence-gap-analysis/ai/analyzer.test.ts
bun run test -- tests/010-evidence-gap-analysis/procedures/analysis-router.test.ts
bun run test -- tests/010-evidence-gap-analysis/components/analysis-views.test.tsx
```

### Key Automated Invariants Tested
1. **Verbatim Citation Verification**: Verifies that citations for `supported` and `weak` requirements match authentic substrings in candidate materials (résumé, selected evidence, or opted-in feedback) and that hallucinated citations are caught and rejected.
2. **Owner Isolation & Non-Enumeration**: Verifies that cross-user attempts to run analysis, save assessments, or view summaries return non-enumerating `unavailableResource()` (404 NOT_FOUND).
3. **Draft Separation (Principle II)**: Verifies that running an analysis returns an uncommitted draft without mutating database records until `analysis.save` is invoked.
4. **Authorized Inputs Enforcement**: Verifies that unselected evidence items from the library and un-opted employer feedback are excluded from the AI prompt context.
5. **Bounded Next Action Rules**: Verifies that exactly one next action is produced and that it references a weak or missing requirement.
6. **Daily Quota Enforcement**: Verifies that the server strictly enforces the 5-request daily analysis limit and blocks excess requests.
7. **Failure Resilience**: Verifies that AI errors, timeouts, or quota blocks leave existing opportunity and requirement data completely unmodified.
8. **Offline Resilience**: Asserts that `InMemoryAiAnalyzer` operates cleanly without network calls, API keys, or database dependencies during `bun run check`.

---

## 3. Manual End-to-End Validation Scenarios

### Scenario 1: Pre-Flight Transparency & AI Opt-In Check
1. Navigate to `/dashboard/opportunities/[opportunityId]`.
2. Ensure the opportunity has approved requirements and an uploaded résumé.
3. If résumé AI opt-in is disabled, verify that the "Run Analysis" button alerts the user with an explicit opt-in requirement.
4. Click "Run Analysis" to open the Pre-Flight Dialog.
5. Verify that the dialog displays:
   - Status of the reviewed résumé.
   - Count and titles of attached supporting evidence items.
   - Count of opted-in feedback items.
   - Note confirming unselected library items are excluded.
   - Remaining daily analysis quota (e.g. `5 of 5 remaining`).

---

### Scenario 2: Generating & Reviewing the Analysis Draft
1. In the Pre-Flight Dialog, click "Start Analysis".
2. Observe the loading state displaying status updates.
3. Upon completion, verify that the **Draft Review** workspace opens:
   - Every requirement shows an assigned coverage state (`Supported`, `Weak`, `Missing`, or `Unknown`).
   - `Supported` and `Weak` requirements show authentic verbatim citations with source badges (`Reviewed Résumé` or `Project: ...`).
   - `Missing` requirements show notes on what evidence was searched for but not found.
   - The Next Action card displays exactly one concrete improvement task referencing a weak or missing requirement.
   - Summary counts accurately total the draft states.

---

### Scenario 3: Overriding States & Saving the Assessment
1. In the Draft Review interface, click on a requirement with `Weak` coverage.
2. Override its state to `Supported` and adjust the rationale note.
3. Observe that the live summary counts update dynamically in real time.
4. Click "Save Assessment".
5. Verify that:
   - The saved state transitions out of draft review.
   - The Opportunity page displays the finalized `AnalysisCoverageSummary` with deterministic count cards.
   - The `AnalysisNextActionCard` prominently displays the single bounded next action with its honest AI disclaimer.
   - The opportunity shows an updated "Analyzed: [Date/Time]" timestamp.

---

### Scenario 4: Discarding a Draft & Re-running
1. Click "Re-run Analysis" on a previously analyzed opportunity.
2. Proceed through pre-flight to generate a new draft.
3. Click "Discard Draft".
4. Verify that the previous saved assessment remains completely intact with no modifications.
