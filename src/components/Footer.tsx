import { FileText, Twitter, Linkedin, Mail, Github } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const footerLinks = {
  Product: ['Features', 'Templates', 'Pricing', 'API', 'Integrations'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  Resources: ['Documentation', 'Help Center', 'Community', 'Tutorials', 'Webinars'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies', 'Compliance'],
};

const legalContent: Record<string, { title: string; content: string }> = {
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
};

export function Footer() {
  const [legalPage, setLegalPage] = useState<string | null>(null);

  const handleLinkClick = (link: string) => {
    if (legalContent[link]) {
      setLegalPage(link);
    } else {
      toast.info(`${link} page coming soon!`);
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
              <button 
                onClick={() => toast.info('Twitter coming soon!')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => toast.info('LinkedIn coming soon!')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => toast.info('GitHub coming soon!')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => toast.info('Contact form coming soon!')}
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
            © 2026 Universal Document Creator. All rights reserved.
          </p>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span>Made with ❤️ for professionals worldwide</span>
          </div>
        </div>
      </div>

      <Dialog open={!!legalPage} onOpenChange={() => setLegalPage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{legalPage ? legalContent[legalPage]?.title : ''}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none">
              {legalPage && legalContent[legalPage]?.content.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{paragraph.slice(2, -2)}</h3>;
                } else if (paragraph.startsWith('**')) {
                  const [title, ...rest] = paragraph.split('**').filter(Boolean);
                  return <div key={i}><h3 className="text-base font-semibold mt-4 mb-1">{title}</h3><p className="text-sm text-muted-foreground">{rest.join('')}</p></div>;
                } else if (paragraph.startsWith('- ')) {
                  return <ul key={i} className="list-disc pl-5 space-y-1">{paragraph.split('\n').map((line, j) => <li key={j} className="text-sm text-muted-foreground">{line.replace('- ', '')}</li>)}</ul>;
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
