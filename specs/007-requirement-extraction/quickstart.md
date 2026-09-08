# Quickstart & Verification Guide: Requirement Extraction

**Feature**: Requirement Extraction from Job Description  
**Branch**: `007-requirement-extraction`  
**Date**: 2026-09-08  
**Spec**: [spec.md](./spec.md)

---

## 1. Prerequisites & Environment Setup

1. Install project dependencies and AI SDK packages:
   ```powershell
   bun install --frozen-lockfile
   # Required packages for Vercel AI SDK integration:
   bun add ai @ai-sdk/google
   ```

2. Configure local environment variables in `.env.local`:
   ```ini
   # Google Gemini API key for Vercel AI SDK (@ai-sdk/google)
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.6-flash

   # Storage and AI provider overrides ('memory' for zero-credential offline tests)
   STORAGE_PROVIDER=memory
   AI_PROVIDER=memory
   ```

3. Ensure the AI SDK skill is installed:
   ```powershell
   bunx skills add https://github.com/vercel/ai --skill ai-sdk
   ```

---

## 2. Automated Test Verification

Run the dedicated test suite for feature 007:

```powershell
# Run the complete test suite for requirement extraction
bun run test -- tests/007-requirement-extraction/

# Run individual test layers
bun run test -- tests/007-requirement-extraction/boundaries/requirement-boundary.test.ts
bun run test -- tests/007-requirement-extraction/extraction/citation-verifier.test.ts
bun run test -- tests/007-requirement-extraction/ai/gemini-extractor.test.ts
bun run test -- tests/007-requirement-extraction/procedures/requirement-router.test.ts
bun run test -- tests/007-requirement-extraction/components/requirement-section.test.tsx

# Run repository-wide quality gate (must pass with zero credentials)
bun run check
```

---

## 3. Manual Verification Scenarios

### Scenario 1: Automated Requirement Extraction from Job Description
1. Start the local development server:
   ```powershell
   bun run dev
   ```
2. Navigate to `http://localhost:3000/dashboard` and open an existing opportunity with a detailed job description (or create a new opportunity pasting a sample 500-word software engineer job description).
3. Scroll to the **Requirements** section below the Résumé section.
4. Click **"Extract Requirements from Job Description"**.
5. Observe loading indicator (`"Analyzing job description with Gemini 3.6 Flash..."`).
6. Verify that 5 to 12 draft requirements are generated across categories (`technical_skill`, `experience`, etc.) using Vercel AI SDK `generateObject()`.
7. Inspect the cited excerpts on each card and verify they are exact verbatim quotes from the opportunity's job description.
8. Verify that the **"Reviewing Draft Requirements (Unsaved)"** banner is displayed.

### Scenario 2: Human Review, Editing, and Saving
1. On one of the draft requirement cards, click **"Edit"**.
2. Modify the title and select a different category. Click **"Save Changes"**.
3. Click **"+ Add Requirement"** to create a custom requirement manually.
4. Click **"Delete"** on one irrelevant draft requirement.
5. Click **"Save Requirements"** in the draft banner.
6. Verify the draft banner disappears, and the requirements are now displayed in the confirmed saved state.
7. Refresh the page to confirm requirements persist in the database.

### Scenario 3: Quota Enforcement & Rate Limiting
1. Trigger extraction multiple times until 5 extractions have been executed within the current calendar day.
2. On the 6th attempt, observe the user-friendly notification indicating the daily limit of 5 requests has been reached, with the time until reset (midnight UTC).
3. Verify existing saved requirements remain completely intact.

### Scenario 4: Re-extraction Confirmation
1. On an opportunity with saved requirements, click **"Re-extract"**.
2. Verify an alert dialog appears warning that existing requirements will be replaced.
3. Click **"Cancel"** $\to$ observe saved requirements are untouched.
4. Click **"Re-extract"** $\to$ confirm dialog $\to$ observe fresh draft requirements generated for review.
