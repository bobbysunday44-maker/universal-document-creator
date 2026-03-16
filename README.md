<p align="center">
  <img src="public/universaldoc.ico" alt="Universal Document Creator" width="80" height="80" />
</p>

<h1 align="center">Universal Document Creator</h1>

<p align="center">
  <strong>AI-Powered Document Generation Platform</strong><br>
  Create professional documents, presentations, and images in seconds with multiple AI models.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.10%2B-blue?logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/typescript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/fastapi-0.100%2B-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## What Is This?

Universal Document Creator (UDC) is a full-stack AI document generation platform that lets you create professional documents, presentations, and images using multiple AI models. It runs as a desktop app or web server.

Think of it as your own self-hosted alternative to PandaDoc, Jasper, or Gamma — but with multi-model AI support, local/offline capability, and no vendor lock-in.

---

## Architecture

```
+------------------------------------------------------------------+
|                        FRONTEND (React + TypeScript)              |
|                                                                    |
|  +-------------+  +------------------+  +---------------------+   |
|  | Landing Page |  | Document Editor  |  | Image Generator     |   |
|  | - Hero       |  | - AI Generation  |  | - Gemini Pro Image  |   |
|  | - Features   |  | - SSE Streaming  |  | - Imagen 4          |   |
|  | - Templates  |  | - Edit/Preview   |  | - Aspect Ratios     |   |
|  | - Pricing    |  | - Export Bar     |  | - Download          |   |
|  | - Auth Modal |  | - Version History|  +---------------------+   |
|  +-------------+  +------------------+                             |
|                                                                    |
|  +-------------+  +------------------+  +---------------------+   |
|  | Dashboard    |  | Settings Panel   |  | Auth System         |   |
|  | - Usage Stats|  | - AI Models      |  | - Login/Register    |   |
|  | - Plan Info  |  | - API Keys       |  | - Forgot Password   |   |
|  | - Top Skills |  | - Temperature    |  | - Admin Promote     |   |
|  +-------------+  | - Brand Upload   |  +---------------------+   |
|                    +------------------+                             |
+------------------------------------+-------------------------------+
                                     |
                                  REST API
                                  (80 endpoints)
                                     |
+------------------------------------+-------------------------------+
|                        BACKEND (FastAPI + Python)                  |
|                                                                    |
|  +------------------+  +------------------+  +-----------------+  |
|  | AI Engine        |  | Export Engine     |  | Auth & Security |  |
|  | - Gemini 3 Flash |  | - PDF (xhtml2pdf)|  | - JWT Tokens    |  |
|  | - Gemini 2.0     |  | - DOCX (docx)    |  | - Password Hash |  |
|  | - Claude Sonnet 4|  | - HTML (styled)  |  | - Rate Limiting |  |
|  | - Claude Haiku   |  | - Text / Markdown|  | - Admin RBAC    |  |
|  | - Ollama (local) |  | - PPTX (pptx)    |  | - Audit Logging |  |
|  | - SSE Streaming  |  | - Image (PNG)    |  +-----------------+  |
|  +------------------+  +------------------+                        |
|                                                                    |
|  +------------------+  +------------------+  +-----------------+  |
|  | Document System  |  | Team Features    |  | Marketplace     |  |
|  | - CRUD           |  | - Create Teams   |  | - Publish       |  |
|  | - Version History|  | - Add Members    |  | - Browse/Search |  |
|  | - Web Publishing |  | - Shared Tmpls   |  | - Install       |  |
|  | - E-Signatures   |  | - Role-Based     |  | - Rate/Review   |  |
|  | - View Analytics |  +------------------+  +-----------------+  |
|  +------------------+                                              |
|                                                                    |
|  +------------------+  +------------------+  +-----------------+  |
|  | AI Workflows     |  | Analysis Tools   |  | Payments        |  |
|  | - Blog Pipeline  |  | - SEO Score      |  | - Stripe        |  |
|  | - Proposal Flow  |  | - Readability    |  | - Plan Billing  |  |
|  | - Content Reuse  |  | - Brand Voice    |  | - In-Doc Pay    |  |
|  | - Batch Generate |  | - Multi-Language  |  | - Webhooks      |  |
|  +------------------+  +------------------+  +-----------------+  |
|                                                                    |
|                        SQLite (default) / PostgreSQL               |
+------------------------------------------------------------------+
```

---

## Features

### AI Models (6 Text + 5 Image)

| Model | Provider | Type | Notes |
|-------|----------|------|-------|
| Gemini 3 Flash | Google | Text | Recommended, fast |
| Gemini 2.0 Flash | Google | Text | Previous gen, stable |
| Claude Sonnet 4 | Anthropic | Text | Premium writing quality |
| Claude Haiku 4.5 | Anthropic | Text | Fast drafts |
| Qwen Vision | Ollama (local) | Text | Unrestricted, offline |
| Dolphin 3 | Ollama (local) | Text | Unrestricted, offline |
| Gemini 3 Pro Image | Google | Image | Best quality |
| Gemini 3.1 Flash Image | Google | Image | Fast + smart |
| Gemini 2.5 Flash Image | Google | Image | Stable |
| Imagen 4 | Google | Image | Photorealistic |
| Imagen 4 Fast | Google | Image | Quick drafts |

### Document Generation
- **22+ document templates** — Business Proposals, Legal Contracts, Resumes, Academic Essays, Marketing Copy, and more
- **Real-time SSE streaming** — Text appears word-by-word like ChatGPT
- **Brand style extraction** — Upload a website screenshot, AI extracts colors/fonts/style
- **Brand voice training** — Upload writing samples, AI learns your tone and style
- **Multi-language** — Generate documents in 28 languages
- **Custom skills** — Upload your own document generation templates

### Export Formats
- **PDF** — Styled with brand colors via xhtml2pdf
- **DOCX** — Word documents via python-docx
- **HTML** — Standalone styled web pages
- **PPTX** — PowerPoint presentations via python-pptx
- **Markdown** — Raw markdown
- **Text** — Plain text
- **Image** — AI-generated PNG images

### Collaboration & Enterprise
- **Team/org management** — Create teams, add members, assign roles (admin/member)
- **Shared templates** — Share document templates within your team
- **E-signatures** — Built-in canvas signature pad with audit trail
- **Document publishing** — One-click publish documents as public web pages
- **Viewer analytics** — Track who opened your documents, time spent, scroll depth
- **Version history** — Every edit is saved, view diffs, restore any version

### Business Features
- **Stripe payments** — Subscription billing (Free/Pro/Enterprise plans)
- **In-document payments** — Embed Stripe payment links in proposals
- **Rate limiting** — Enforce plan limits (10 generations/month free)
- **Admin panel** — Promote users, view audit logs, set branding
- **Template marketplace** — Publish, browse, install, and rate templates
- **AI workflows** — Pre-built multi-step pipelines (Blog, Proposal, Content Repurposing)
- **Bulk batch generation** — Upload CSV, generate personalized documents at scale
- **White label** — Customize app name, colors, logo for your brand

### Security
- **JWT authentication** with refresh tokens
- **Password hashing** with PBKDF2-SHA256
- **Forgot password** flow with time-limited reset tokens
- **Audit logging** — All actions logged (login, generate, export, sign)
- **API 404 protection** — Unknown /api/ routes return JSON errors
- **Rate limiting** per user with monthly reset

### SEO & Analytics
- **SEO analysis** — Flesch-Kincaid readability, keyword density, heading structure, SEO score
- **OpenGraph meta tags** — Social sharing previews
- **Viewer analytics dashboard** — Per-document engagement metrics

---

## Quick Start

### Prerequisites

- **Python 3.10+** (3.10 recommended for desktop app, 3.14 works for web)
- **Node.js 18+** (for building the frontend)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/bobbysunday44-maker/universal-document-creator.git
cd universal-document-creator
```

### 2. Install Backend Dependencies

```bash
pip install fastapi uvicorn aiofiles python-dotenv pyjwt httpx xhtml2pdf reportlab \
  python-docx python-pptx stripe sse-starlette textstat bleach passlib pandas \
  google-genai
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required — get free from https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key

# Optional — for Claude models
ANTHROPIC_API_KEY=your_anthropic_key

# Optional — for payment processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional — for PostgreSQL (leave empty for SQLite)
DATABASE_URL=

# Admin secret for promoting users
ADMIN_SECRET=your-secret-here
```

### 5. Build the Frontend

```bash
npm run build
```

### 6. Start the Server

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

Open **http://localhost:8001** in your browser.

---

## Desktop App (Windows)

UDC also runs as a native desktop application using pywebview:

```bash
# Install pywebview
pip install pywebview

# Run the desktop launcher
python ~/.universaldoc/launcher.pyw
```

Or use the desktop shortcut (created by `python create_shortcut.py`).

---

## API Documentation

The backend auto-generates OpenAPI docs. After starting the server:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Key Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/forgot-password` | Request reset token |
| POST | `/api/auth/reset-password` | Reset with token |

#### Document Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate document |
| POST | `/api/generate/stream` | Generate with SSE streaming |
| POST | `/api/generate-image` | Generate AI image |
| POST | `/api/generate/presentation` | Generate PPTX slides |
| POST | `/api/generate/batch` | Bulk generate from CSV |

#### Document Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List documents |
| GET | `/api/documents/{id}` | Get document |
| PUT | `/api/documents/{id}` | Update document |
| DELETE | `/api/documents/{id}` | Delete document |
| GET | `/api/documents/{id}/versions` | Version history |
| POST | `/api/documents/{id}/publish` | Publish to web |
| GET | `/p/{slug}` | View published document |

#### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/export/pdf` | Export as PDF |
| POST | `/api/export/docx` | Export as DOCX |
| POST | `/api/export/html` | Export as HTML |
| POST | `/api/export/text` | Export as plain text |
| POST | `/api/export/markdown` | Export as Markdown |

#### E-Signatures
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/{id}/signature-request` | Request signature |
| GET | `/sign/{token}` | Signing page |
| POST | `/api/signatures/sign` | Submit signature |

#### Teams & Collaboration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams` | Create team |
| GET | `/api/teams` | List teams |
| POST | `/api/teams/{id}/members` | Add member |
| POST | `/api/teams/{id}/templates` | Share template |

#### Marketplace
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketplace` | Browse templates |
| POST | `/api/marketplace/publish` | Publish template |
| POST | `/api/marketplace/{id}/install` | Install template |
| POST | `/api/marketplace/{id}/review` | Rate & review |

#### Analysis & AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze/seo` | SEO analysis |
| POST | `/api/voice/analyze` | Brand voice training |
| GET | `/api/workflows/templates` | Pre-built workflows |
| POST | `/api/workflows/execute` | Execute workflow |

#### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/promote` | Promote to admin |
| GET | `/api/admin/audit-logs` | View audit logs |
| POST | `/api/admin/branding` | Set white-label config |
| GET | `/api/user/dashboard` | Usage dashboard |

---

## User Guide

### Creating Your First Document

```
1. Register an account (or use as guest)
2. Click "Start Creating Free" on the landing page
3. Select a document type from the dropdown (e.g., "Business Proposal")
4. Fill in the parameters (company name, product, etc.)
5. Type your request in the prompt area
6. Click "Generate" — watch text stream in real-time
7. Switch to "Preview" tab to see formatted output
8. Export as PDF, DOCX, HTML, or Markdown
```

### Generating Images

```
1. In the app view, toggle to "Image" mode (top of screen)
2. Select an image model (Gemini 3 Pro recommended)
3. Choose aspect ratio (1:1, 16:9, 9:16, etc.)
4. Describe what you want to generate
5. Click "Generate Image"
6. Download the result as PNG
```

### Creating Presentations

```
POST /api/generate/presentation
{
  "prompt": "Create a pitch deck for an AI startup",
  "slide_count": 10,
  "model": "gemini-3-flash-preview"
}
```

Returns a downloadable .pptx file.

### Bulk Document Generation

```
1. Prepare a CSV file with columns (e.g., name, company, role)
2. Upload to /api/generate/batch with a prompt template:
   "Write a personalized intro email for {{name}} at {{company}}"
3. UDC generates one document per row
4. Download all as a ZIP file
```

### Publishing Documents

```
1. Generate or edit a document
2. Call POST /api/documents/{id}/publish with a custom slug
3. Share the link: http://yourserver.com/p/my-document
4. Track views with /api/documents/{id}/analytics
```

### E-Signatures

```
1. Create a signature request: POST /api/documents/{id}/signature-request
2. Send the sign URL to recipient: /sign/{token}
3. Recipient views document and draws signature on canvas
4. Signature is recorded with timestamp and IP
```

---

## Admin Setup

### Promote Yourself to Admin

```bash
curl -X POST http://localhost:8001/api/admin/promote \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "secret": "universaldoc-admin-2026"}'
```

Admin users get:
- Unlimited generations (bypass rate limits)
- Enterprise plan features
- Access to audit logs
- White-label branding controls

### White-Label Branding

```bash
curl -X POST http://localhost:8001/api/admin/branding \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "Your Brand",
    "app_tagline": "Your Tagline",
    "primary_color": "#ff6600",
    "support_email": "support@yourbrand.com"
  }'
```

---

## Database

### SQLite (Default)

No configuration needed. The database file `udc.db` is created automatically on first run in the `backend/` directory.

### PostgreSQL (Production)

For production deployments with multiple concurrent users:

1. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/universaldoc
   ```

2. Run the migration script:
   ```bash
   cd backend
   python migrate_to_postgres.py
   ```

### Database Schema

```
users                    documents               teams
+-----------------+      +------------------+    +----------------+
| id              |      | id               |    | id             |
| email           |      | user_id (FK)     |    | name           |
| name            |      | title            |    | owner_id (FK)  |
| password_hash   |      | content          |    | plan           |
| plan            |      | html_content     |    | max_members    |
| is_admin        |      | skill_used       |    +----------------+
| generation_count|      | model_used       |
| stripe_customer |      | is_published     |    team_members
+-----------------+      | publish_slug     |    +----------------+
                         +------------------+    | team_id (FK)   |
brand_profiles                                   | user_id (FK)   |
+-----------------+      document_versions       | role           |
| id              |      +------------------+    +----------------+
| user_id (FK)    |      | document_id (FK) |
| primary_color   |      | content          |    signature_requests
| secondary_color |      | version_number   |    +------------------+
| accent_color    |      +------------------+    | document_id (FK) |
| font_family     |                              | recipient_email  |
+-----------------+      voice_profiles          | sign_token       |
                         +------------------+    | status           |
audit_logs               | user_id (FK)     |    | signature_data   |
+-----------------+      | tone             |    +------------------+
| user_id (FK)    |      | formality        |
| action          |      | writing_rules    |    marketplace_templates
| details         |      +------------------+    +------------------+
| ip_address      |                              | author_id (FK)   |
+-----------------+      document_views          | name             |
                         +------------------+    | skill_content    |
                         | document_id (FK) |    | downloads        |
                         | duration_seconds |    | rating_sum       |
                         | scroll_depth     |    +------------------+
                         +------------------+
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI** | Tailwind CSS 3.4, shadcn/ui, Radix UI |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | SQLite (default), PostgreSQL (production) |
| **AI** | Google Gemini, Anthropic Claude, Ollama |
| **PDF** | xhtml2pdf, ReportLab |
| **DOCX** | python-docx |
| **PPTX** | python-pptx |
| **Payments** | Stripe |
| **Auth** | JWT (PyJWT), PBKDF2-SHA256 |
| **Streaming** | SSE (sse-starlette) |
| **SEO Analysis** | textstat |
| **Desktop** | pywebview |

---

## Project Structure

```
universal-document-creator/
+-- backend/
|   +-- main.py                 # FastAPI server (3,878 lines, 80 endpoints)
|   +-- skills.md               # Built-in document templates
|   +-- migrate_to_postgres.py  # PostgreSQL migration script
|   +-- udc.db                  # SQLite database (auto-created)
+-- src/
|   +-- App.tsx                 # Main app component (1,514 lines)
|   +-- components/
|   |   +-- AuthModal.tsx       # Login/Register/Forgot password
|   |   +-- DocumentEditor.tsx  # Editor with Edit/Preview tabs
|   |   +-- PremiumHeader.tsx   # Navigation header
|   |   +-- Footer.tsx          # Footer with legal modals
|   |   +-- SkillSelector.tsx   # Document type picker
|   |   +-- ParameterForm.tsx   # Dynamic parameter inputs
|   |   +-- SkillUploader.tsx   # Custom skill upload
|   |   +-- ui/                 # shadcn/ui components
|   +-- sections/
|   |   +-- HeroSection.tsx     # Landing hero with slideshow
|   |   +-- FeaturesSection.tsx # Feature cards
|   |   +-- TemplatesSection.tsx# Template gallery
|   |   +-- PricingSection.tsx  # Pricing with Stripe integration
|   |   +-- TestimonialsSection.tsx
|   |   +-- CTASection.tsx
|   +-- lib/
|   |   +-- api.ts              # API client (533 lines)
|   +-- contexts/
|   |   +-- AuthContext.tsx      # Auth state management
|   +-- types/
|       +-- index.ts            # TypeScript types
+-- public/                     # Static assets (images, favicon)
+-- dist/                       # Built frontend (production)
+-- .env.example                # Environment template
+-- package.json                # Frontend dependencies
+-- index.html                  # HTML entry with SEO meta tags
+-- vite.config.ts              # Vite configuration
```

---

## Pricing Plans

| Feature | Free | Pro ($19/mo) | Enterprise ($49/mo) |
|---------|------|-------------|-------------------|
| Documents/month | 10 | Unlimited | Unlimited |
| AI generations | 10 | Unlimited | Unlimited |
| Templates | Basic | All 22+ | All 22+ |
| Export formats | Text only | All (PDF, DOCX, HTML, PPTX) | All |
| Image generation | - | Yes | Yes |
| Brand voice | - | Yes | Yes |
| E-signatures | - | Yes | Yes |
| Team collaboration | - | - | Yes |
| Shared templates | - | - | Yes |
| API access | - | - | Yes |
| Custom branding | - | - | Yes |
| Priority support | - | Yes | Dedicated |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- **Google Gemini** — AI text and image generation
- **Anthropic Claude** — Premium AI text generation
- **Ollama** — Local AI model inference
- **shadcn/ui** — Beautiful React components
- **FastAPI** — High-performance Python web framework

---

<p align="center">
  Built with AI assistance from <strong>Claude Opus 4.6</strong>
</p>
