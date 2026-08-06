# PuffiFlow Workspace Execution Rules

## 1. Code Standards & Architecture
- **Strict TypeScript**: No implicit `any` types. All API requests, responses, Supabase models, and state variables must be fully typed.
- **Zero Missing Environment Variables**: Every module interacting with external services (R2, Supabase, Modal, YouTube) must validate required environment variables at runtime initialization.
- **Modular Monorepo Boundaries**:
  - `/apps/web`: Next.js App Router UI code, hooks, and static components.
  - `/apps/api`: Pure Express.js API handlers, background task queues, and data processing.
  - `/packages/modal-worker`: Isolated Python GPU scripts executed serverless on Modal.com.

## 2. Database & Data Security
- **Token Encryption**: YouTube OAuth refresh tokens must NEVER be stored in plain text. Always encrypt with AES-256 before persisting in Supabase and decrypt only in memory during background publish.
- **Direct S3 Uploads**: Raw video binaries must never flow through `/apps/api`. Web clients must request presigned URLs from `/api/upload/presign` and upload directly to Cloudflare R2.

## 3. Asynchronous Workflow Integrity
- Job lifecycle states must follow strict state transitions:
  `QUEUED` -> `PROCESSING` -> `COMPLETED` -> `PUBLISHED` (or `FAILED`).
- Webhook payloads from Modal must be validated via shared secret token before processing state transitions.
