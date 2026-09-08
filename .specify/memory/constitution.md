<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - Placeholder Principle 1 -> I. Evidence Before Inference
  - Placeholder Principle 2 -> II. Human Review and Control
  - Placeholder Principle 3 -> III. Privacy, Isolation, and Explicit Consent
  - Placeholder Principle 4 -> IV. Bounded and Honest AI
  - Placeholder Principle 5 -> V. Lean, Testable Delivery
- Added sections:
  - Product and Technical Constraints
  - Development Workflow and Quality Gates
- Modified governance guidance:
  - V. Lean, Testable Delivery -> adds a mandatory spec-named test directory convention
- Removed sections: none
- Follow-up TODOs: none
-->
# SearchTrace Constitution

## Core Principles

### I. Evidence Before Inference
Every extracted requirement MUST cite an exact excerpt from the supplied job description.
Every `supported` or `weak` coverage decision MUST cite an excerpt from the reviewed résumé
or user-entered evidence. A `missing` decision MUST identify the evidence that was searched but
not found, and insufficient or ambiguous input MUST result in `unknown`. The product MUST keep
source material visibly distinct from AI interpretation and MUST NOT invent evidence. This makes
every assessment inspectable and prevents plausible language from being mistaken for fact.

### II. Human Review and Control
AI output MUST begin as a draft. Users MUST be able to review, edit, add, delete, accept, or
reject requirements and change every coverage state before an assessment is saved. Source
records MUST remain unchanged when analysis runs or fails, and SearchTrace MUST NOT rewrite a
résumé, submit an application, send a message, or fetch a job URL. User-confirmed records are the
system of record because the product assists judgment rather than replacing it.

### III. Privacy, Isolation, and Explicit Consent
All user data MUST be private by default and scoped to its owner. Every user-owned database row
MUST carry ownership information and be protected by row-level security; server operations MUST
also verify opportunity ownership. Résumé files MUST use user-scoped private storage and
short-lived authenticated download links. Résumé content and optional employer feedback MUST NOT
be sent to an AI provider without explicit, source-specific opt-in, and operational logs MUST NOT
contain raw résumés, job descriptions, feedback, prompts, or model output. Cross-user
authorization tests are a release gate because job-search evidence is sensitive personal data.

### IV. Bounded and Honest AI
The AI MAY extract draft requirements, assess only the user-supplied evidence authorized for the
current opportunity, and propose exactly one practical action tied to a weak or missing
requirement. It MUST NOT browse, use tools, infer a rejection cause, calculate an ATS score or
hiring probability, promise an outcome, or invent a substitute after an error. AI responses MUST
use structured output validated server-side before display or persistence. Provider, quota,
timeout, and validation failures MUST be explicit and retryable. These limits preserve honest
uncertainty and keep recommendations proportional to the evidence.

### V. Lean, Testable Delivery
The MVP MUST analyze one opportunity at a time and MUST exclude the PRD's non-goals unless this
constitution and the product specification are deliberately amended. Implementations MUST favor
the simplest design that satisfies the current acceptance criteria. Security boundaries,
structured AI contracts, extraction states, citation integrity, and the primary user journey MUST
have automated or fixture-based verification proportionate to their risk. A feature is not
complete merely because its happy path renders; its authorization, validation, failure, and user
review behavior MUST also meet the governing requirements. Automated tests MUST live in the
repository's `tests/` directory. Each immediate child directory of `tests/` MUST be named after
the specification whose behavior it tests, using the specification identifier as the directory
name (for example, `tests/001-project-foundation/`). Tests that do not map to a single feature
specification MAY live directly under `tests/`.

## Product and Technical Constraints

- The deployed product MUST remain a private web application built around the architecture in
  `docs/prd/prd.md`: Next.js and TypeScript, server-side validation with Zod, Supabase Auth,
  Postgres with row-level security, private object storage, server-side PDF/DOCX extraction, and
  one structured-output AI provider.
- Each analysis MUST be scoped to one opportunity and only its pasted job description, reviewed
  current résumé, manually entered evidence, and explicitly opted-in feedback.
- Résumé uploads MUST be PDF or DOCX, no larger than 10 MB, and limited to one current résumé per
  opportunity. Extracted text MUST be reviewable and editable before analysis.
- A successful draft MUST contain 5–12 requirements, a valid coverage state for each requirement,
  traceable citations, stated limitations, and exactly one bounded next action.
- All form inputs and AI responses MUST be validated on the server, and user-authored content MUST
  be rendered as plain text.
- The server MUST enforce a configurable per-user analysis limit; the initial default is five
  requests per day.
- Public résumé URLs, public user data, hidden model reasoning, unreviewed AI persistence, and
  features named as MVP non-goals in `docs/prd/prd.md` are prohibited.

## Development Workflow and Quality Gates

1. Each change MUST trace to a specification requirement, user story, acceptance criterion, or an
   approved defect. Any scope expansion MUST update the governing specification before
   implementation.
2. Designs and reviews MUST explicitly check the evidence boundary, ownership boundary, consent
   state, server-validation boundary, and user-review boundary affected by the change.
3. Tests MUST cover changed behavior at the lowest useful level. Database or storage access
   changes MUST include cross-user denial coverage; AI contract changes MUST include schema and
   malformed-response coverage; primary-flow changes MUST include failure and retry behavior.
4. Before release, the five PRD fixtures—clear match, partial match, no relevant evidence,
   feedback present, and malformed or oversized input—MUST be exercised. Every displayed citation
   and the relationship between the next action and a weak or missing requirement MUST be checked.
5. Reviewers MUST reject changes that conceal uncertainty, bypass confirmation, weaken private
   access controls, log sensitive content, or introduce a non-goal without an approved amendment.
6. The implementation MUST follow the installed Next.js version's repository-local guidance; any
   deviation from its current APIs or conventions MUST be justified in the change record.

## Governance

This constitution is the highest-authority engineering and product-governance document for
SearchTrace. When it conflicts with a plan, task list, implementation, or informal convention,
this constitution prevails. `docs/prd/prd.md` supplies the current product architecture and scope
within these principles; it cannot waive a constitutional requirement.

Amendments MUST be proposed as an explicit constitution change, state the reason and impact,
identify affected specifications or implementation, include a migration or remediation plan when
existing behavior becomes non-compliant, and receive project-owner approval before dependent work
is accepted. Ratified amendments MUST update the Sync Impact Report, version, and amendment date.

Versions follow semantic versioning: MAJOR for removal or incompatible redefinition of a
principle or governance rule, MINOR for a new principle or materially expanded obligation, and
PATCH for non-semantic clarification. Compliance MUST be reviewed during specification, planning,
implementation review, and release readiness. Any exception MUST be documented with scope,
rationale, risk, owner, and expiry date; silent exceptions are prohibited.

**Version**: 1.1.0 | **Ratified**: 2026-09-08 | **Last Amended**: 2026-09-08
