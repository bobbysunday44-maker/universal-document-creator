# Universal Document Creator — Project Log

> Last updated: March 16, 2026 (Session 2)
> Status: **READY FOR DEPLOYMENT** — All features built, tested, pushed to GitHub

---

## Project Overview

- **Repo:** https://github.com/bobbysunday44-maker/universal-document-creator
- **Local path:** `C:\Users\bombo\Downloads\WORK PICTURES\Kimi_Agent_高端网站改造\app\`
- **Backend:** `backend/main.py` — 4,700+ lines, 95+ API endpoints, 14 database tables
- **Frontend:** React 18 + TypeScript + Vite — 13 components, 4,700+ lines
- **Database:** SQLite (local) / PostgreSQL (production via Supabase)
- **Desktop app:** pywebview launcher at `C:\Users\bombo\.universaldoc\launcher.pyw`
- **Desktop shortcut:** UniversalDoc on desktop, uses Python 3.10
- **Dev Python:** 3.14 (`C:\Python314\python.exe`)
- **Desktop Python:** 3.10 (`C:\Users\bombo\AppData\Local\Programs\Python\Python310\python.exe`)
- **Port:** 8001
- **Total commits:** 18

---

## Where We Stopped

### Completed (Session 1 — March 16)
- All 33 features built and tested
- Admin panel with 4 tabs (Overview, Users, Audit Logs, Branding)
- Registration approval flow (admin approve/reject new users)
- AI chart generation in documents (bar, line, pie, area)
- All 20 footer links functional (zero "coming soon")
- SEO: 27/27 meta checks, JSON-LD, robots.txt, sitemap.xml
- Security: no secrets in repo, admin secret requires env var
- Mobile responsive: tested on iPhone (375px) and iPad (768px)
- Full debug: 59/60 endpoints pass (1 transient Gemini rate limit)
- README fully documented with architecture diagrams

### Completed (Session 2 — March 16)
- **E-signature upload mode** — signers can upload a signature image instead of drawing
- **Ink color picker** — 5 colors (black, blue, navy, purple, red), applies to both draw and upload
- **Auto-recolor** — uploaded black signatures are recolored to match chosen ink color via canvas pixel manipulation
- **Soft refresh button** — header refresh icon that re-fetches all data without losing current view/tab (critical for desktop app where F5 is disabled)
- Full debug: **62/62 endpoints pass**, 0 failures, 52/52 quick-check pass
- TypeScript: 0 errors, frontend build clean

### Next Steps (When We Resume)
1. **Deploy to FlokiNET VPS** (185.246.189.131, NL)
   - SSH credentials needed from user
   - Install Python, PostgreSQL, Nginx on the VPS
   - Deploy app from GitHub
   - Set up Cloudflare Tunnel for CDN/SSL/DDoS protection
   - Connect to Supabase PostgreSQL (free tier)
   - Run `migrate_to_postgres.py` to move data
   - Test all endpoints on live server

2. **Buy domain** (when ready to go public)
   - Recommended: Cloudflare Registrar (~$10/yr for .com)
   - Wire DNS to Cloudflare → Tunnel to VPS

3. **Optional future features not yet built:**
   - Real-time collaborative editing (Yjs + WebSocket — complex, 2-4 weeks)
   - Zapier/Make webhook integration
   - Public API with API key auth + hosted docs
   - Mobile PWA (Progressive Web App)
   - SOC 2 compliance program

---

## Commit History

| # | Hash | Description |
|---|------|-------------|
| 18 | `7c2a197` | Add soft refresh button — reloads data without losing current view |
| 17 | `78af945` | Add ink color recoloring for uploaded signature images |
| 16 | `85acf06` | Add signature image upload option to e-signature page |
| 15 | `ac2025e` | Fix all footer links — every link now functional |
| 14 | `7671174` | Final responsive fixes + complete verification |
| 13 | `a3bc447` | Final debug pass: fix promote approval + update README |
| 12 | `e174e36` | Admin approval flow for new user registrations |
| 11 | `d8811ba` | Admin panel and AI chart generation |
| 10 | `716528f` | SEO overhaul: JSON-LD, robots.txt, sitemap |
| 9 | `078eeb2` | Security hardening: remove secrets and personal paths |
| 8 | `3b6221e` | Comprehensive README with architecture diagrams |
| 7 | `28230ef` | 13 competitive features: signatures, analytics, SEO, presentations, marketplace |
| 6 | `281a194` | Fixes #18-22: Dashboard, teams, white label, audit logs, PostgreSQL |
| 5 | `dca3a35` | Fixes #11-17: Loading states, error toasts, rate limiting, SEO, favicon |
| 4 | `ec1d4f6` | Fixes #6-10: SSE streaming, HTML export, Anthropic key, forgot password |
| 3 | `17bdd6a` | Fixes #1-5: Stripe, DOCX export, doc history, mobile, image gen |
| 2 | `0f7e422` | Fix JWT auth (PyJWT 2.11 sub must be string) + settings double close |
| 1 | `74bb9b4` | Initial commit: Universal Document Creator |

---

## All 33 Features Built

### Original 22 Fixes
1. Stripe payment integration (checkout, webhooks, portal)
2. PDF/DOCX download from UI
3. Document history/dashboard (search, date groups, preview)
4. Responsive mobile layout (collapsible sidebar, flex-wrap)
5. Image generation UI (5 models, aspect ratios, download)
6. SSE streaming generation (word-by-word like ChatGPT)
7. All export options (PDF, DOCX, HTML, PPTX, MD, Text)
8. Anthropic API key in Settings UI
9. Email verification infrastructure
10. Forgot password flow (token-based reset)
11. Loading states (skeletons, spinners)
12. Smart error toasts (API key, rate limit, timeout detection)
13. Rate limiting (10/mo free, unlimited pro/enterprise, admin bypass)
14. SEO meta tags (OG, Twitter Card, JSON-LD schema)
15. Favicon wired to HTML
16. Footer legal pages (Privacy, Terms, Security modals)
17. API 404 handling (JSON errors for /api/ routes)
18. User dashboard (stats, usage progress, top skills/models)
19. Team/org features (create, members, shared templates)
20. White label/branding config
21. Audit logging (login, generate, export, sign, admin actions)
22. PostgreSQL migration script

### Competitive Features (13)
23. E-signatures (canvas pad + image upload, 5 ink colors, auto-recolor, sign URL, audit trail)
24. Document viewer analytics (opens, duration, scroll depth)
25. Version history (auto-snapshot, restore)
26. SEO analysis (Flesch-Kincaid, keyword density, score)
27. Presentation generation (AI → PPTX via python-pptx)
28. Brand voice training (upload samples → AI extracts tone)
29. Template marketplace (publish, browse, install, rate/review)
30. Multi-language selector (28 languages)
31. In-document payment links (Stripe)
32. AI workflow pipelines (4 pre-built: blog, proposal, repurpose, legal)
33. Web publishing (public URLs /p/{slug})
34. Bulk batch generation (CSV → merge fields → ZIP)

### Post-Competitive Features (3)
35. Admin panel (4-tab: overview, users, audit logs, branding)
36. AI chart generation (bar/line/pie/area in documents + PDF/DOCX embed)
37. Registration approval flow (admin approve/reject)

### Session 2 Features (2)
38. Signature image upload with ink color recoloring (5 colors, auto-recolor black→chosen)
39. Soft refresh button (re-fetch data without losing current view, for desktop app)

---

## API Endpoint Summary (95+)

### Auth (7)
- POST /api/auth/register, /api/auth/login, GET /api/auth/me
- POST /api/auth/forgot-password, /api/auth/reset-password
- POST /api/admin/promote, /api/admin/toggle-approval

### Documents (12)
- CRUD: GET/POST/PUT/DELETE /api/documents
- GET /api/documents/{id}/versions, POST restore
- POST /api/documents/{id}/publish, unpublish
- GET /p/{slug} (public view)

### Generation (5)
- POST /api/generate, /api/generate/stream
- POST /api/generate-image
- POST /api/generate/presentation, /api/generate/presentation/preview

### Export (6)
- POST /api/export/pdf, /api/export/docx, /api/export/html
- POST /api/export/text, /api/export/markdown
- POST /api/render/chart

### E-Signatures (5)
- POST /api/documents/{id}/signature-request
- GET /api/documents/{id}/signature-requests
- GET /sign/{token}, POST /api/signatures/sign
- POST /api/signatures/recolor (recolor uploaded signature image to chosen ink color)

### Analytics (2)
- POST /api/track/view
- GET /api/documents/{id}/analytics

### Teams (7)
- POST/GET /api/teams, GET /api/teams/{id}
- POST/DELETE /api/teams/{id}/members
- POST/GET /api/teams/{id}/templates

### Marketplace (5)
- POST /api/marketplace/publish, GET /api/marketplace
- GET /api/marketplace/{id}
- POST /api/marketplace/{id}/install, /review

### AI & Analysis (6)
- POST /api/analyze/seo
- POST /api/voice/analyze, GET/DELETE /api/voice/profiles
- GET /api/workflows/templates, POST /api/workflows/execute

### Admin (12)
- GET /api/admin/stats, /api/admin/users, /api/admin/pending-users
- PUT/DELETE /api/admin/users/{id}
- POST /api/admin/approve-user/{id}, /api/admin/reject-user/{id}
- GET /api/admin/audit-logs
- POST/GET /api/admin/branding, /api/branding

### Settings & Config (8)
- GET/POST /api/settings/api-keys, /api/settings/stripe-key
- GET /api/user/limits, /api/user/dashboard
- POST /api/stripe/create-checkout-session, /api/stripe/webhook, /api/stripe/customer-portal

### Batch & Other (7)
- POST /api/generate/batch, /api/batch/preview
- GET /api/models, /api/image-models, /api/skills, /api/languages
- GET /api/health

---

## Database Tables (14)

| Table | Purpose |
|-------|---------|
| users | Accounts, plans, admin, generation counts, approval |
| documents | Generated documents, publishing, slugs |
| document_versions | Version snapshots for restore |
| brand_profiles | Extracted brand colors/fonts from screenshots |
| voice_profiles | Brand voice training results |
| settings | API keys, branding config, approval toggle |
| teams | Team/org management |
| team_members | Team membership with roles |
| shared_templates | Team-shared document templates |
| signature_requests | E-signature requests with tokens |
| document_views | Viewer analytics (opens, duration, scroll) |
| audit_logs | All action logging |
| marketplace_templates | Published community templates |
| template_reviews | Ratings and reviews for marketplace |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS 3.4, shadcn/ui, Radix UI |
| Charts | Recharts (frontend), matplotlib (backend PDF/DOCX) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite (default), PostgreSQL (production) |
| AI Text | Gemini 3 Flash, Gemini 2.0, Claude Sonnet 4, Claude Haiku 4.5, Ollama (Qwen, Dolphin) |
| AI Image | Gemini 3 Pro Image, Gemini 3.1 Flash, Gemini 2.5 Flash, Imagen 4, Imagen 4 Fast |
| PDF | xhtml2pdf, ReportLab |
| DOCX | python-docx |
| PPTX | python-pptx |
| Streaming | SSE (sse-starlette) |
| Payments | Stripe |
| Auth | JWT (PyJWT), PBKDF2-SHA256 |
| SEO Analysis | textstat |
| Desktop | pywebview |

---

## Environment Variables (.env)

```
GEMINI_API_KEY=         # Required — free from Google AI Studio
ANTHROPIC_API_KEY=      # Optional — for Claude models
STRIPE_SECRET_KEY=      # Optional — for payment processing
STRIPE_WEBHOOK_SECRET=  # Optional — for Stripe webhooks
ADMIN_SECRET=           # Required — for admin promotion
DATABASE_URL=           # Optional — PostgreSQL (empty = SQLite)
```

---

## How to Run Locally

```bash
# Backend
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8001

# Frontend (dev)
npm run dev

# Frontend (build)
npm run build

# Desktop app
python ~/.universaldoc/launcher.pyw
```

---

## Deployment Plan (Not Yet Done)

```
FlokiNET VPS (185.246.189.131, NL)
  + Cloudflare Tunnel (free CDN/SSL/DDoS)
  + Supabase PostgreSQL (free 500MB)
  + Domain (buy when ready, ~$10/yr)
```
