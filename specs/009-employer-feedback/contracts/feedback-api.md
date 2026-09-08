# API Contract: Employer Feedback (`feedbackRouter`)

**Feature**: Opportunity Employer Feedback and Provenance Preservation  
**Branch**: `009-employer-feedback`  
**Date**: 2026-09-08  
**Spec**: [spec.md](../spec.md)

---

## 1. Overview

The `feedbackRouter` is mounted at `feedback` on the root tRPC `appRouter` (`trpc/routers/_app.ts`). All procedures are `protectedProcedure` calls requiring an authenticated user session (`ctx.session` and `ctx.actorId`).

Every procedure strictly enforces user ownership:
1. Verifies that `ctx.actorId` owns the target opportunity.
2. Verifies that `ctx.actorId` owns the target feedback item (for item-level operations).
3. If an item or opportunity does not exist OR belongs to another user, throws `unavailableResource()` (404 NOT_FOUND).

---

## 2. Procedures Inventory

| Procedure | Type | Input Schema | Output Type | Description |
|---|:---:|---|---|---|
| `listByOpportunityId` | Query | `{ opportunityId: string }` | `FeedbackItem[]` | Lists all feedback items for an opportunity, ordered by `feedbackDate DESC`. |
| `byId` | Query | `{ id: string }` | `FeedbackItem` | Retrieves a single feedback item by ID. |
| `create` | Mutation | `CreateFeedbackItemInput` | `FeedbackItem` | Creates a feedback entry scoped to an opportunity (defaults `aiOptIn` to `false`). |
| `update` | Mutation | `UpdateFeedbackItemInput` | `FeedbackItem` | Updates date, text, source type, or provenance of an existing item. |
| `setAiOptIn` | Mutation | `SetFeedbackAiOptInInput` | `FeedbackItem` | Toggles the `aiOptIn` flag for a feedback item. |
| `delete` | Mutation | `DeleteFeedbackItemInput` | `{ success: true, id: string }` | Permanently deletes a feedback item. |

---

## 3. Procedure Specifications

### 3.1 `feedback.listByOpportunityId`

- **Purpose**: Fetch all feedback entries associated with a specific opportunity owned by the caller.
- **Input**:
  ```json
  {
    "opportunityId": "00000000-0000-0000-0000-000000000001"
  }
  ```
- **Authorization**: Caller MUST own the opportunity identified by `opportunityId`.
- **Output**:
  ```json
  [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "opportunityId": "00000000-0000-0000-0000-000000000001",
      "userId": "usr_123456",
      "feedbackDate": "2026-09-08",
      "text": "Team appreciated the clean system architecture presentation but noted lack of experience with Kubernetes production deployments.",
      "sourceType": "interview_feedback",
      "provenance": "exact_quote",
      "aiOptIn": false,
      "createdAt": "2026-09-08T12:00:00.000Z",
      "updatedAt": "2026-09-08T12:00:00.000Z"
    }
  ]
  ```
- **Error Codes**:
  - `BAD_REQUEST`: Invalid `opportunityId`.
  - `NOT_FOUND`: Opportunity does not exist or caller is not owner (`unavailableResource()`).

---

### 3.2 `feedback.byId`

- **Purpose**: Fetch a single feedback item by ID.
- **Input**:
  ```json
  {
    "id": "11111111-1111-1111-1111-111111111111"
  }
  ```
- **Authorization**: Caller MUST own the feedback item (`userId === ctx.actorId`).
- **Output**: `FeedbackItem` object.
- **Error Codes**:
  - `NOT_FOUND`: Item does not exist or belongs to another user (`unavailableResource()`).

---

### 3.3 `feedback.create`

- **Purpose**: Record a new employer feedback item for an opportunity.
- **Input**:
  ```json
  {
    "opportunityId": "00000000-0000-0000-0000-000000000001",
    "feedbackDate": "2026-09-08",
    "text": "Recruiter noted that the team decided to proceed with candidates having more distributed systems experience.",
    "sourceType": "rejection_note",
    "provenance": "personal_summary",
    "aiOptIn": false
  }
  ```
- **Validation**:
  - `opportunityId`: non-empty string.
  - `feedbackDate`: regex `/^\d{4}-\d{2}-\d{2}$/`.
  - `text`: trimmed, length between 1 and 5,000 characters.
  - `sourceType`: one of `recruiter_feedback`, `rejection_note`, `interview_feedback`, `user_summary`.
  - `provenance`: one of `exact_quote`, `personal_summary`.
  - `aiOptIn`: optional boolean, defaults strictly to `false`.
- **Authorization**: Caller MUST own the target opportunity.
- **Output**: Created `FeedbackItem` object.
- **Error Codes**:
  - `BAD_REQUEST`: Validation failure.
  - `NOT_FOUND`: Opportunity does not exist or caller is not owner (`unavailableResource()`).

---

### 3.4 `feedback.update`

- **Purpose**: Edit the details of an existing feedback item.
- **Input**:
  ```json
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "feedbackDate": "2026-09-08",
    "text": "Recruiter noted team decided to proceed with candidates having more distributed systems experience.",
    "sourceType": "rejection_note",
    "provenance": "personal_summary"
  }
  ```
- **Authorization**: Caller MUST own the feedback item.
- **Output**: Updated `FeedbackItem` object (`updatedAt` refreshed).
- **Error Codes**:
  - `BAD_REQUEST`: Validation failure.
  - `NOT_FOUND`: Feedback item does not exist or caller is not owner (`unavailableResource()`).

---

### 3.5 `feedback.setAiOptIn`

- **Purpose**: Toggle explicit AI inclusion for a feedback item.
- **Input**:
  ```json
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "aiOptIn": true
  }
  ```
- **Authorization**: Caller MUST own the feedback item.
- **Output**: Updated `FeedbackItem` object with new `aiOptIn` state.
- **Error Codes**:
  - `NOT_FOUND`: Feedback item does not exist or caller is not owner (`unavailableResource()`).

---

### 3.6 `feedback.delete`

- **Purpose**: Permanently delete a feedback item.
- **Input**:
  ```json
  {
    "id": "11111111-1111-1111-1111-111111111111"
  }
  ```
- **Authorization**: Caller MUST own the feedback item.
- **Output**:
  ```json
  {
    "success": true,
    "id": "11111111-1111-1111-1111-111111111111"
  }
  ```
- **Error Codes**:
  - `NOT_FOUND`: Feedback item does not exist or caller is not owner (`unavailableResource()`).
