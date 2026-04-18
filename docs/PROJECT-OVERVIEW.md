# Campaign Builder — Project Overview

## What It Is

A **generic Email + WhatsApp Campaign Builder plugin** — think CleverTap or Customer.io — that embeds into any SaaS product (CRM, LMS, ecommerce, enterprise tools) as a reusable communication engine.

---

## 10 Key Points

**1. Multi-tenant, plug-in architecture**
Every data record is scoped to a `tenant_id`. Any SaaS host can embed this as a white-label engagement module.

**2. Dual-channel messaging (Email + WhatsApp)**
Supports both channels with distinct experiences — rich HTML email via Resend, WhatsApp via Meta Cloud API — with a provider-swappable factory pattern.

**3. 6 campaign types**
One-time, Scheduled, Recurring, Triggered, Transactional (bypasses consent), Journey, and API-triggered — covering every real-world use case.

**4. Visual Journey Builder**
Multi-step automation flows with trigger nodes, wait nodes, condition splits, send nodes, webhooks, and goal nodes — a full visual canvas.

**5. Smart Audience Segmentation**
Rule-based dynamic segments with AND/OR/ANY logic, INCLUDE/EXCLUDE groups, attribute filtering, and live audience estimates with email/WhatsApp consent breakdowns.

**6. 5-Step Campaign Builder Wizard**
Type → Audience → Message → Delivery Rules → Review/Publish — with readiness scoring (0–100), blockers, warnings, and versioned publishing ("Publish v4").

**7. Advanced Delivery Controls**
Frequency capping, quiet hours (fixed UTC or recipient-local timezone), smart-time send, UTM parameter tracking, and A/B test configuration.

**8. Async Queue Architecture (BullMQ)**
Three queues: CAMPAIGN_DISPATCH → EMAIL_SEND / WHATSAPP_SEND. Handles fan-out to thousands of contacts, retry logic, and frequency-cap enforcement.

**9. Full Reporting + Domain Verification**
Delivery funnel (sent → delivered → opened → clicked), failure breakdowns (hard bounce, spam complaints), and SPF/DKIM/DMARC DNS verification with Redis caching.

**10. Enterprise B2B UI**
Next.js 14 App Router + shadcn/ui + TanStack Query — premium, data-dense dashboard with structured panels, not a consumer-app aesthetic.

---

## Tech Stack & Why

| Layer | Technology | Why |
|---|---|---|
| **Backend framework** | NestJS 10 | Decorator-based, modular, TypeScript-first; scales to team ownership by domain |
| **Database** | PostgreSQL + TypeORM | Relational integrity for tenant isolation + JSONB flexibility for segment rules and metadata |
| **Queue** | BullMQ (Redis) | Battle-tested job queue for fan-out, retries, delays (quiet hours), and priority |
| **Email delivery** | Resend + React Email | Modern developer-focused email API; React Email gives type-safe, XSS-safe HTML rendering |
| **Frontend** | Next.js 14 App Router | RSC for fast initial load, client components only where interactive; production-grade routing |
| **UI components** | shadcn/ui + Tailwind CSS | Copy-owned (no vendor lock), fully customizable to design tokens |
| **State management** | Zustand + TanStack Query | Zustand for multi-step form state; TanStack Query for server state with optimistic updates |
| **Schema validation** | Zod (shared package) | Single source of truth for API and UI validation; eliminates schema drift between layers |
| **Testing** | Vitest + Playwright | Fast unit/integration tests; Playwright for E2E campaign flows |
| **Infra** | Docker Compose + GitHub Actions | Isolated dev + test environments; CI runs migrations → type-check → tests on every PR |