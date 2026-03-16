import { FileText, Twitter, Linkedin, Mail, Github } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const footerLinks = {
  Product: ['Features', 'Templates', 'Pricing', 'API', 'Integrations'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Documentation', 'Help Center', 'Community', 'Tutorials', 'Changelog'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies', 'Compliance'],
};

// Links that scroll to landing page sections
const scrollLinks: Record<string, string> = {
  Features: 'features',
  Templates: 'templates',
  Pricing: 'pricing',
};

// All modal content for every non-scroll link
const pageContent: Record<string, { title: string; content: string }> = {
  Privacy: {
    title: 'Privacy Policy',
    content: `Last updated: March 2026

Universal Document Creator ("we", "us", "our") respects your privacy. This policy explains how we collect, use, and protect your information.

**Information We Collect**
- Account information (name, email) when you register
- Documents you create (stored locally on your device)
- Usage data (generation count, features used)

**How We Use Your Information**
- To provide and improve our services
- To process payments (via Stripe — we never see your card details)
- To send important account notifications

**Data Storage**
- All documents are stored locally on your device
- We do not upload or store your documents on external servers
- API keys are stored locally and encrypted

**Third-Party Services**
- Google Gemini API (for AI generation)
- Anthropic Claude API (for AI generation)
- Stripe (for payment processing)

**Your Rights**
- Access, update, or delete your account at any time
- Export all your data
- Opt out of non-essential communications

**Contact**
For privacy inquiries: privacy@universaldoc.app`
  },
  Terms: {
    title: 'Terms of Service',
    content: `Last updated: March 2026

By using Universal Document Creator, you agree to these terms.

**Service Description**
Universal Document Creator is an AI-powered document generation tool. We provide templates, AI models, and export tools to help you create professional documents.

**User Accounts**
- You must provide accurate registration information
- You are responsible for maintaining account security
- One account per person

**Acceptable Use**
- Do not use the service to generate illegal, harmful, or deceptive content
- Do not attempt to reverse engineer or exploit the service
- Do not share API keys or account credentials

**AI-Generated Content**
- AI outputs may contain errors — always review before use
- You own the documents you create
- We do not claim ownership of your generated content

**Payment & Subscriptions**
- Free tier: 10 generations per month
- Pro tier: $19/month, unlimited generations
- Enterprise tier: $49/month, team features
- Cancel anytime — no long-term contracts

**Limitation of Liability**
- The service is provided "as is"
- We are not liable for AI output accuracy
- Maximum liability is limited to fees paid in the last 12 months

**Changes to Terms**
We may update these terms. Continued use constitutes acceptance.

**Contact**
For legal inquiries: legal@universaldoc.app`
  },
  Security: {
    title: 'Security',
    content: `**Data Security**
- All data is stored locally on your device
- API communications use HTTPS encryption
- Passwords are hashed with PBKDF2-SHA256
- JWT tokens expire after 72 hours

**API Key Security**
- API keys are stored in your local database
- Keys are never transmitted to our servers
- Use environment variables for production deployments

**Reporting Vulnerabilities**
If you discover a security issue, please contact: security@universaldoc.app`
  },
  Cookies: {
    title: 'Cookie Policy',
    content: `Last updated: March 2026

**Cookies We Use**
Universal Document Creator uses minimal cookies for essential functionality only.

**Essential Cookies**
- Authentication token (JWT) — stored in localStorage, not a cookie
- User preferences (theme, language) — stored in localStorage

**We Do NOT Use**
- Third-party tracking cookies
- Advertising cookies
- Analytics cookies (we use our own built-in analytics)
- Social media tracking pixels

**Your Control**
Since we primarily use localStorage rather than cookies, you can clear all stored data by:
- Logging out (clears authentication)
- Clearing browser storage via Developer Tools

**Contact**
For questions about our cookie practices: privacy@universaldoc.app`
  },
  Compliance: {
    title: 'Compliance',
    content: `**Data Protection**
Universal Document Creator is designed with privacy and compliance in mind.

**GDPR Compliance**
- Right to access: Export all your data at any time
- Right to deletion: Delete your account and all associated data
- Data minimization: We only collect what is necessary
- Data portability: Export documents in multiple formats

**CCPA Compliance**
- We do not sell personal information
- Users can request deletion of their data
- We provide transparency about data collection

**Data Processing**
- Documents are processed locally or via encrypted API calls
- AI model providers (Google, Anthropic) may process prompts per their policies
- Payment data is handled exclusively by Stripe (PCI DSS compliant)

**Enterprise Compliance**
For enterprise compliance requirements (SOC 2, HIPAA, custom DPAs), please contact: compliance@universaldoc.app`
  },
  API: {
    title: 'API Documentation',
    content: `**Universal Document Creator API**
Access all features programmatically via our REST API.

**Getting Started**
- Base URL: Your server address (e.g., http://localhost:8001)
- Authentication: Bearer token (JWT) in Authorization header
- Documentation: Visit /docs for interactive Swagger UI

**Key Endpoints**
- POST /api/generate — Generate documents with AI
- POST /api/generate/stream — Real-time streaming generation
- POST /api/generate-image — AI image generation
- POST /api/generate/presentation — PowerPoint generation
- POST /api/export/pdf — Export as PDF
- POST /api/export/docx — Export as Word document
- POST /api/analyze/seo — SEO content analysis

**Rate Limits**
- Free plan: 10 generations/month
- Pro plan: Unlimited
- Enterprise plan: Unlimited + API access

**Full Documentation**
Visit the /docs endpoint on your server for the complete interactive API documentation with all 90+ endpoints.`
  },
  Integrations: {
    title: 'Integrations',
    content: `**Available Integrations**

**AI Models**
- Google Gemini 3 Flash / 2.0 Flash — Cloud AI generation
- Anthropic Claude Sonnet 4 / Haiku 4.5 — Premium AI generation
- Ollama (Qwen, Dolphin) — Local, offline AI generation

**Image Generation**
- Google Imagen 4 — Photorealistic images
- Gemini 3 Pro Image — Smart design generation
- Gemini Flash Image — Fast image generation

**Export Formats**
- PDF, DOCX, HTML, PPTX, Markdown, Plain Text

**Payments**
- Stripe — Subscription billing, checkout, customer portal

**Coming Soon**
- Zapier / Make webhook integration
- Google Drive / OneDrive sync
- Slack notifications
- CRM integrations (Salesforce, HubSpot)`
  },
  About: {
    title: 'About Universal Document Creator',
    content: `**Our Mission**
Empowering professionals to create better documents faster with the power of AI.

**What We Do**
Universal Document Creator is an AI-powered platform that generates professional documents, presentations, and images. We support multiple AI models, 22+ document templates, and export to every major format.

**Key Features**
- Multi-model AI (choose between Gemini, Claude, or local Ollama models)
- 22+ professional document templates
- Real-time streaming generation
- AI-powered image generation
- E-signatures built in
- Team collaboration
- Template marketplace
- SEO analysis tools
- Brand voice training
- 28 language support

**Our Approach**
Unlike other tools that lock you into one AI provider, we give you the choice. Run locally for privacy, use cloud models for power, or mix both. Your documents, your choice.

**Technology**
Built with React, TypeScript, FastAPI, and Python. Runs as a desktop app or web server. Open source and self-hostable.`
  },
  Blog: {
    title: 'Blog',
    content: `**Latest Updates**

**March 2026 — Version 2.0 Launch**
Major release with 33+ features including AI chart generation, admin panel, e-signatures, template marketplace, presentation generation, and more.

**New Features in v2.0**
- AI-generated charts and diagrams in documents
- Full admin panel with user management
- Registration approval flow
- 28 language support
- Bulk batch document generation
- AI workflow pipelines
- Brand voice training

**Coming Next**
- Real-time collaborative editing
- Zapier/Make integrations
- Public API with developer docs
- Mobile PWA app
- SOC 2 compliance program

Stay tuned for more updates as we continue to build the most comprehensive AI document platform.`
  },
  Careers: {
    title: 'Careers',
    content: `**Join Our Team**

We are building the future of AI-powered document creation. If you are passionate about AI, developer tools, and great user experiences, we would love to hear from you.

**Open Positions**
We are currently a small team and growing. We are looking for:
- Full-stack developers (React + Python)
- AI/ML engineers
- Product designers
- Developer advocates

**What We Offer**
- Remote-first culture
- Competitive compensation
- Equity participation
- Work on cutting-edge AI technology
- Ship features that thousands of professionals use daily

**Apply**
Send your resume and a brief intro to: careers@universaldoc.app`
  },
  Press: {
    title: 'Press & Media',
    content: `**Press Kit**

**About Universal Document Creator**
Universal Document Creator is an AI-powered document generation platform supporting multiple AI models, 22+ templates, and 7 export formats. It runs as a desktop app or web server.

**Key Stats**
- 90+ API endpoints
- 6 AI text models + 5 image models
- 22+ document templates
- 7 export formats (PDF, DOCX, HTML, PPTX, MD, Text, Image)
- 28 language support
- Built-in e-signatures
- Template marketplace

**Brand Assets**
For logos, screenshots, and brand guidelines, please contact: press@universaldoc.app

**Media Inquiries**
For interviews, reviews, or partnership opportunities: press@universaldoc.app`
  },
  Contact: {
    title: 'Contact Us',
    content: `**Get in Touch**

**General Inquiries**
Email: hello@universaldoc.app

**Technical Support**
Email: support@universaldoc.app
Documentation: Visit /docs on your server

**Sales & Enterprise**
Email: sales@universaldoc.app

**Security Issues**
Email: security@universaldoc.app

**Legal**
Email: legal@universaldoc.app

**Social Media**
- Twitter: @universaldoc
- LinkedIn: Universal Document Creator
- GitHub: github.com/bobbysunday44-maker/universal-document-creator`
  },
  Documentation: {
    title: 'Documentation',
    content: `**Getting Started**

**Installation**
1. Clone the repository from GitHub
2. Install Python dependencies: pip install -r requirements.txt
3. Install frontend dependencies: npm install
4. Copy .env.example to .env and add your API keys
5. Build the frontend: npm run build
6. Start the server: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001

**Configuration**
- GEMINI_API_KEY — Required for Gemini models (free from Google AI Studio)
- ANTHROPIC_API_KEY — Optional, for Claude models
- STRIPE_SECRET_KEY — Optional, for payment processing
- ADMIN_SECRET — Required for admin promotion
- DATABASE_URL — Optional, for PostgreSQL (default: SQLite)

**API Reference**
Visit /docs on your running server for the full interactive Swagger documentation covering all 90+ endpoints.

**Desktop App**
Run create_shortcut.py to create a desktop shortcut that launches the app with pywebview.

**Need Help?**
Email: support@universaldoc.app`
  },
  'Help Center': {
    title: 'Help Center',
    content: `**Frequently Asked Questions**

**How do I get started?**
Click "Start Creating Free" on the homepage, register an account, and you can start generating documents immediately.

**Which AI model should I use?**
- Gemini 3 Flash: Best all-round, fast, recommended for most uses
- Claude Sonnet 4: Best writing quality, great for proposals and reports
- Ollama models: Run locally, no internet needed, no content restrictions

**How do I export my documents?**
After generating, use the export bar at the bottom of the editor. Choose from PDF, DOCX, HTML, Markdown, or plain text.

**What are the plan limits?**
- Free: 10 generations per month
- Pro ($19/mo): Unlimited generations, all features
- Enterprise ($49/mo): Team features, API access, white-label

**How do I become an admin?**
Use the admin promote endpoint with your ADMIN_SECRET. See the documentation for details.

**Can I use this offline?**
Yes, with Ollama models installed locally. Cloud models (Gemini, Claude) require internet.

**Is my data private?**
Yes. All documents are stored locally on your device. We do not upload or store your content on external servers.`
  },
  Community: {
    title: 'Community',
    content: `**Join the Community**

**GitHub**
Star the repo, report bugs, suggest features, and contribute code.
Repository: github.com/bobbysunday44-maker/universal-document-creator

**Template Marketplace**
Share your custom document templates with other users. Publish, browse, rate, and install templates created by the community.

**How to Contribute**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

**Feature Requests**
Open a GitHub issue with the "feature request" label to suggest new features.

**Bug Reports**
Found a bug? Open a GitHub issue with steps to reproduce.`
  },
  Tutorials: {
    title: 'Tutorials',
    content: `**Getting Started Tutorials**

**1. Create Your First Document**
- Open the app and click "Start Creating Free"
- Select a document type (e.g., Business Proposal)
- Fill in the parameters
- Type your request and click Generate
- Watch the AI create your document in real-time

**2. Generate AI Images**
- Toggle to "Image" mode in the app header
- Choose an image model (Gemini 3 Pro recommended)
- Select aspect ratio and describe what you want
- Click Generate and download the result

**3. Create Presentations**
- Use the /api/generate/presentation endpoint
- Specify your topic and number of slides
- Download the generated .pptx file

**4. Bulk Generate Documents**
- Prepare a CSV with your data columns
- Upload to /api/generate/batch with a prompt template using merge fields
- Download the ZIP file with all generated documents

**5. Brand Voice Training**
- Go to /api/voice/analyze
- Upload 3-5 samples of your writing
- The AI learns your tone and style
- All future documents match your voice

**6. E-Signatures**
- Generate a contract or proposal
- Create a signature request with the recipient's email
- Share the signing link
- Recipient draws their signature on the canvas pad`
  },
  Changelog: {
    title: 'Changelog',
    content: `**Version History**

**v2.0 — March 2026 (Current)**
- AI chart generation (bar, line, pie, area) in documents
- Full admin panel with 4 tabs (Overview, Users, Audit, Branding)
- Registration approval flow (admin approve/reject)
- E-signatures with canvas pad
- Document publishing (public URLs)
- Viewer analytics (opens, duration, scroll depth)
- Version history with restore
- Template marketplace (publish, browse, install, rate)
- AI workflow pipelines (4 pre-built)
- Presentation generation (PPTX export)
- Bulk batch generation (CSV to ZIP)
- Brand voice training
- SEO analysis tools
- Multi-language support (28 languages)
- Stripe payment integration
- In-document payment links
- White-label branding
- Rate limiting with admin bypass
- Comprehensive audit logging
- Mobile responsive layout
- 90+ API endpoints

**v1.0 — March 2026**
- Initial release
- Multi-model AI (Gemini, Claude, Ollama)
- 22+ document templates
- PDF and text export
- Brand style extraction
- Desktop app (pywebview)
- User authentication`
  },
};

export function Footer() {
  const [activePage, setActivePage] = useState<string | null>(null);

  const handleLinkClick = (link: string) => {
    // If it's a scroll link, scroll to that section
    if (scrollLinks[link]) {
      const element = document.getElementById(scrollLinks[link]);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    // Otherwise open modal with content
    if (pageContent[link]) {
      setActivePage(link);
    }
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-foreground">Universal</span>
                <span className="font-bold text-base sm:text-lg text-primary">Doc</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 max-w-xs">
              AI-powered document creation for professionals. Create better documents faster.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://github.com/bobbysunday44-maker/universal-document-creator"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <button
                onClick={() => setActivePage('Contact')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-foreground">{category}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            &copy; 2026 Universal Document Creator. All rights reserved.
          </p>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span>Made with &hearts; for professionals worldwide</span>
          </div>
        </div>
      </div>

      <Dialog open={!!activePage} onOpenChange={() => setActivePage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{activePage ? pageContent[activePage]?.title : ''}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none">
              {activePage && pageContent[activePage]?.content.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{paragraph.slice(2, -2)}</h3>;
                } else if (paragraph.startsWith('**')) {
                  const parts = paragraph.split('**').filter(Boolean);
                  const title = parts[0];
                  const rest = parts.slice(1).join('');
                  return <div key={i}><h3 className="text-base font-semibold mt-4 mb-1">{title}</h3>{rest && <p className="text-sm text-muted-foreground">{rest}</p>}</div>;
                } else if (paragraph.startsWith('- ')) {
                  return <ul key={i} className="list-disc pl-5 space-y-1">{paragraph.split('\n').filter(l => l.trim()).map((line, j) => <li key={j} className="text-sm text-muted-foreground">{line.replace(/^- /, '')}</li>)}</ul>;
                } else if (/^\d+\./.test(paragraph)) {
                  return <ol key={i} className="list-decimal pl-5 space-y-1">{paragraph.split('\n').filter(l => l.trim()).map((line, j) => <li key={j} className="text-sm text-muted-foreground">{line.replace(/^\d+\.\s*/, '')}</li>)}</ol>;
                }
                return <p key={i} className="text-sm text-muted-foreground">{paragraph}</p>;
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
