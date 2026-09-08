# Quickstart & Verification Guide: Opportunity Management

This document provides runnable verification instructions and test scenarios to validate the Opportunity Management feature end-to-end.

---

## 1. Prerequisites

- Bun `1.4.2` installed.
- Local repository setup with frozen dependencies:
  ```powershell
  bun install --frozen-lockfile
  ```
- Environment variables configured (or default offline mocks active):
  ```powershell
  cp .env.example .env.local
  ```

---

## 2. Automated Quality Gates

Run the offline zero-credential verification suite:

```powershell
# Run full repository quality gate (lint, strict typecheck, Jest suite)
bun run check

# Run opportunity management test suites specifically
bun run test -- tests/005-opportunity-management

# Run individual verification suites
bun run test -- tests/005-opportunity-management/procedures/opportunity-router.test.ts
bun run test -- tests/005-opportunity-management/db/schema.test.ts
bun run test -- tests/005-opportunity-management/components/opportunity-forms.test.ts
bun run test -- tests/005-opportunity-management/boundaries/opportunity-boundary.test.ts
```

---

## 3. Database Migration Workflow

When schema definitions in `lib/db/schema.ts` are ready:

```powershell
# Generate versioned migration
bun run db:generate -- --name add_opportunities_table

# Apply migration to target Postgres instance (if running local Supabase)
bun run db:migrate
```

---

## 4. Manual Verification Walkthrough

Start the local development server:

```powershell
bun run dev
```

Navigate to `http://localhost:3000` in an evergreen browser.

### Scenario A: Empty State & Opportunity Creation
1. Sign in with test credentials (e.g., `test@example.com` / `ValidPass123!`).
2. Land on `/dashboard`. Verify that the empty state is displayed:
   - "You haven't saved any opportunities yet."
   - Click "Create Your First Opportunity".
3. Arrive at `/dashboard/opportunities/new`.
4. Test validation: Submit the form empty. Verify that company, role, and job description show field-level error messages.
5. Fill valid data:
   - **Company**: `Acme Corp`
   - **Role**: `Senior Frontend Engineer`
   - **Source URL**: `https://example.com/jobs/senior-frontend`
   - **Status**: `applied`
   - **Job Description**: Paste a multi-paragraph job description.
6. Click "Create Opportunity".
7. Verify immediate redirection to `/dashboard/opportunities/[new-id]`.

### Scenario B: Opportunity Detail & Plain Text Rendering
1. On the detail view (`/dashboard/opportunities/[opportunityId]`):
   - Confirm company and role header: `Senior Frontend Engineer at Acme Corp`.
   - Confirm status badge displays `Applied`.
   - Confirm the source link opens `https://example.com/jobs/senior-frontend` in a new tab with `rel="noopener noreferrer"`.
   - Confirm the job description text preserves line breaks and renders as safe plain text.

### Scenario C: Edit Opportunity
1. Click the "Edit" action on the detail page.
2. Arrive at `/dashboard/opportunities/[opportunityId]/edit`.
3. Change role title to `Staff Frontend Engineer` and status to `interviewing`.
4. Click "Save Changes".
5. Verify redirection back to the detail page with the updated title and status reflected.
6. Navigate back to `/dashboard`. Verify the opportunity card appears with `Staff Frontend Engineer`, `Acme Corp`, and the `interviewing` badge.

### Scenario D: Deletion Flow
1. Click into the opportunity from `/dashboard`.
2. Click the "Delete" button.
3. Verify that an accessible confirmation modal opens ("Delete this opportunity?").
4. Click "Cancel". Verify that the modal closes and the opportunity is still present.
5. Click "Delete" again, then click "Delete permanently".
6. Verify redirection to `/dashboard`. Confirm the opportunity is no longer present in the list and the empty state returns.

### Scenario E: Ownership & Non-Enumeration Isolation
1. Sign out and sign in with a different user account.
2. Attempt to open `/dashboard/opportunities/[prior-user-opportunity-id]`.
3. Verify that the application returns a generic 404 / unavailable resource screen without confirming that the opportunity exists.
