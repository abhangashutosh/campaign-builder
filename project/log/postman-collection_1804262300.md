# Postman Collection — Campaign Builder API

**Status:** DONE
**Date:** 2026-04-18 23:00

## What was created
- `project/postman/campaign-builder.postman_collection.json` — Postman v2.1.0 collection
- `project/postman/campaign-builder.postman_environment.json` — Local environment

## Collection details
- 8 folders: Health, Contacts, Segments, Templates, Campaigns, Journeys, Settings, Overview
- 28 requests total
- Bearer auth at collection level
- x-tenant-id header on all requests
- Automated tests: status codes, success:true, auto-save IDs to collection variables
- Create operations auto-save: contactId, segmentId, templateId, campaignId, journeyId

## How to use
1. Import both files into Postman
2. Select "Campaign Builder — Local" environment
3. Set token variable to a valid JWT
4. Run "Health Check" first to verify API is up
5. Run folders in order: Contacts -> Segments -> Templates -> Campaigns

## Test coverage
Each request verifies:
- HTTP status code is in expected range
- Response body has success:true (where applicable)
- meta.requestId matches UUID regex (where applicable)
- Data fields exist (score, failureBreakdown, total, etc.)
