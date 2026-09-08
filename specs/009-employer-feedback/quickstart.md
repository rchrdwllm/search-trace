# Quickstart & Validation Guide: Employer Feedback

**Feature**: Opportunity Employer Feedback and Provenance Preservation  
**Branch**: `009-employer-feedback`  
**Date**: 2026-09-08  
**Spec**: [spec.md](./spec.md) | **Contracts**: [API Contracts](./contracts/feedback-api.md) | **UI Contracts](./contracts/feedback-ui.md) | **Data Model**: [data-model.md](./data-model.md)

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

All employer feedback functionality is verified by a dedicated, isolated test suite under `tests/009-employer-feedback/`:

```powershell
# Run the complete Employer Feedback test suite
bun run test -- tests/009-employer-feedback/

# Run specific test slices
bun run test -- tests/009-employer-feedback/boundaries/feedback-boundary.test.ts
bun run test -- tests/009-employer-feedback/procedures/feedback-router.test.ts
bun run test -- tests/009-employer-feedback/components/feedback-views.test.tsx
```

### Key Automated Invariants Tested
1. **Schema & Boundary Integrity**: Asserts that `feedback_items` is strictly server-only, enforces foreign key cascading to `opportunities.id` and `user.id`, and leaks zero server-only symbols into browser bundles.
2. **Owner Isolation & Non-Enumeration**: Verifies that any query or mutation targeting another user's feedback item or opportunity returns `unavailableResource()` (404 NOT_FOUND).
3. **Input Validation Strictness**: Asserts that empty text, whitespace-only strings, text exceeding 5,000 characters, invalid dates, or invalid enum values are rejected by Zod schemas.
4. **Default-Off AI Opt-In**: Asserts that newly created feedback entries strictly default `aiOptIn` to `false`.
5. **AI Opt-In Mutation**: Verifies that users can toggle `aiOptIn` between `true` and `false` for their own feedback entries.
6. **Cascade Deletions**: Verifies that deleting an opportunity cleanly deletes all associated feedback items via Postgres cascade foreign key without orphaned records.
7. **Plain-Text XSS Safety**: Verifies that HTML tags or script injection attempts render verbatim as plain text.

---

## 3. Manual End-to-End Validation Scenarios

### Scenario 1: Record Employer Feedback with Provenance & Privacy Notice
1. Navigate to `/dashboard/opportunities/[opportunityId]`.
2. Scroll to the **"Employer Feedback"** section (labeled as "Reported Signal").
3. Click **"Add Feedback"**.
4. Observe the **Privacy Notice**:
   > "Privacy Notice: Please do not paste recruiter email addresses, phone numbers, signatures, or private email headers. Keep feedback focused on role and evaluation content."
5. Fill in the form:
   - Date: `2026-09-08`
   - Source Type: `interview_feedback` (Interview Feedback)
   - Provenance: `exact_quote` (Exact Quote)
   - Feedback Text: `Team appreciated the system design discussion on caching layers, but noted concerns regarding hands-on Kubernetes cluster operations in production.`
6. Click **"Save Feedback"**.
7. **Expected Outcome**:
   - The modal closes.
   - The feedback card appears in the list.
   - The card displays the date, `Interview Feedback` source badge, `Exact Quote` provenance badge, and the verbatim plain text.
   - The AI analysis inclusion switch is rendered and in the **OFF** state.

---

### Scenario 2: Toggle AI Inclusion Opt-In
1. On the newly created feedback card, locate the **"Include in AI analysis"** switch.
2. Toggle the switch to **ON**.
3. **Expected Outcome**: The switch reflects the enabled state immediately. A subsequent query or page refresh shows `aiOptIn: true`.
4. Toggle the switch back to **OFF**.
5. **Expected Outcome**: The switch returns to the disabled state. The feedback item is excluded from any subsequent AI prompt construction.

---

### Scenario 3: Edit Existing Feedback Details
1. On an existing feedback card, click the **"Edit"** action button.
2. Modify the provenance from `exact_quote` to `personal_summary`.
3. Modify the text to: `Recruiter mentioned that they were impressed with architectural depth but needed someone with deeper production Kubernetes experience.`
4. Click **"Save Changes"**.
5. **Expected Outcome**:
   - The modal closes.
   - The card updates in place, showing the `Personal Summary` badge and the updated text.
   - The previously set `aiOptIn` state is preserved.

---

### Scenario 4: Delete Feedback with Confirmation
1. On a feedback card, click the **"Delete"** button.
2. **Expected Outcome**: An alert dialog appears:
   > "Are you sure you want to delete this feedback? This action cannot be undone and will exclude this feedback from all future analyses."
3. Click **"Delete"**.
4. **Expected Outcome**: The card is removed from the feedback section. If no other feedback remains, the section displays the empty state card.

---

### Scenario 5: Cross-User Access Rejection (Non-Enumeration)
1. In another session (User B), attempt to call `trpc.feedback.byId({ id: feedbackIdFromUserA })` or `trpc.feedback.listByOpportunityId({ opportunityId: oppFromUserA })`.
2. **Expected Outcome**: The server responds with `404 NOT_FOUND` (`The requested resource is unavailable.`), revealing no existence information.
