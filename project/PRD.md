You are helping design a product called **Campaign Builder**.

## What we are building

We are building a **generic Email + WhatsApp campaign builder** that can be used as a **plugin/module inside any application**.

It should not feel tied to only one product type or one industry.

This system should be usable inside:

* CRM products
* LMS platforms
* community platforms
* SaaS admin panels
* internal enterprise tools
* ecommerce backoffices
* support and engagement platforms

The product should feel like a **reusable communication and engagement engine** that any host application can plug into.

## Core purpose

The system allows businesses and product teams to:

* create and manage audience segments
* send Email campaigns
* send WhatsApp campaigns
* create one-time campaigns
* create scheduled campaigns
* create recurring campaigns
* create trigger-based campaigns
* build multi-step automation journeys
* manage templates
* personalize messages with variables
* track engagement and delivery events
* manage consent and unsubscribes
* monitor performance and failures

## Product inspiration

The closest inspiration is tools like:

* CleverTap
* Customer.io
* Braze
* HubSpot Marketing
* other modern campaign automation tools

Important: use these as inspiration for workflow maturity and information architecture, not for copying visuals directly.

## Important product constraint

This must be designed as a **generic plugin**, not as a domain-specific marketing screen.

That means:

* no niche-specific assumptions
* no ecommerce-specific wording
* no LMS-only language
* no community-only language
* no social-media-tool behavior
* no consumer-app style UI

The system should feel modular, configurable, and embeddable.

## How the plugin fits into a host application

A host application may provide:

* users / contacts
* customer attributes
* events
* authentication context
* tenant context
* branding context

Our plugin provides:

* campaign UI
* segmentation UI
* journey builder
* templates
* delivery configuration
* reporting
* channel settings
* validation and readiness checks

## Main user roles

Design for these users:

### 1. Marketing Manager

Wants to:

* create campaigns quickly
* choose audience segments
* use templates
* schedule campaigns
* see performance at a glance

### 2. CRM / Retention Manager

Wants to:

* create more advanced campaigns
* trigger messages from user events
* build journeys
* manage segmentation logic
* optimize engagement

### 3. Admin / Operations User

Wants to:

* configure providers
* manage compliance
* review failures
* monitor channel health
* control permissions and settings

## Core modules in the product

The product contains these major modules:

### 1. Overview Dashboard

Shows:

* active campaigns
* scheduled campaigns
* recent performance
* delivery health
* failures requiring attention
* audience growth
* channel split

### 2. Audience / Segments

Supports:

* contacts
* saved segments
* dynamic segments
* attributes
* event filters
* include/exclude logic
* audience estimates
* imports

### 3. Templates

Supports:

* email templates
* WhatsApp templates
* variable mapping
* reusable blocks
* previews
* template validation

### 4. Campaigns

Supports:

* draft campaigns
* scheduled campaigns
* recurring campaigns
* triggered campaigns
* paused campaigns
* completed campaigns

### 5. Journeys

Supports:

* visual flow builder
* entry trigger
* segment check
* wait node
* condition split
* send email
* send WhatsApp
* webhook/API node
* goal / exit node

### 6. Reports

Supports:

* sent
* delivered
* opened
* clicked
* replied
* unsubscribed
* failed
* channel comparison
* campaign comparison
* trend reporting

### 7. Settings

Supports:

* email provider configuration
* WhatsApp provider configuration
* API keys
* webhooks
* compliance settings
* branding
* permissions
* tenant configuration

## Channel support

The product supports two main channels:

### Email

Should include:

* subject line
* preheader
* sender identity
* rich message body
* CTA buttons
* unsubscribe/footer block
* delivery and open/click tracking

### WhatsApp

Should include:

* approved template selection
* variable mapping
* media preview
* CTA button support
* delivery and reply tracking
* template validation

Important: Email and WhatsApp should feel like distinct channel experiences inside the same system.

## Main workflows

The product must support these workflows:

### Campaign creation workflow

1. choose campaign type
2. choose audience
3. compose message
4. define delivery rules
5. review and publish

### Journey workflow

1. define entry condition
2. set steps and branches
3. configure wait/conditions
4. send across channels
5. track goal or exit

### Reporting workflow

1. open campaign/journey report
2. review delivery
3. review engagement
4. inspect failures
5. optimize next send

## UX expectations

The product should feel:

* enterprise-ready
* workflow-driven
* highly usable
* clear and structured
* realistic to build
* data-dense but scannable
* professional and premium
* modern SaaS dashboard
* modular and configurable

It should not feel:

* overly decorative
* conceptual only
* dribbble-shot style
* playful consumer product
* chatbot-like
* ecommerce-only
* social media scheduler only

## Visual direction

Use a premium B2B SaaS visual language:

* clean layouts
* structured panels
* strong hierarchy
* professional cards
* polished data tables
* refined forms
* clear validation states
* subtle shadows
* restrained styling
* dense but readable information

Avoid:

* glassmorphism
* excessive gradients
* neon colors
* oversized playful UI
* cluttered visual treatment

## Suggested color palette

Use this design direction:

* Primary Navy: #1A3C6B
* Accent Orange: #E85D04
* Accent Teal: #00C9A7
* Background: #F7F9FC
* Surface: #FFFFFF
* Text Primary: #0F172A
* Text Secondary: #475569
* Border: #E2E8F0
* Success: #16A34A
* Warning: #D97706
* Danger: #DC2626

## Product language to use

Use realistic software/product language like:

* Campaign Name
* Audience Segment
* Template
* Personalization Variables
* Delivery Rules
* Quiet Hours
* Frequency Cap
* Entry Trigger
* Audience Estimate
* Consent Status
* Send Readiness
* Validation Checks
* Recent Campaigns
* Active Journeys
* Delivery Health
* Failure Reasons

Use realistic statuses like:

* Draft
* Scheduled
* Running
* Paused
* Completed
* Failed
* Needs Review

## Final expectation

Design this as if it is a real enterprise plugin that will be embedded into multiple products and used by real teams.

The output should feel practical, structured, scalable, and ready for product + engineering discussion.

Do not make assumptions tied to one industry.
Do not make it a visual concept poster.
Design it like a real software product.
