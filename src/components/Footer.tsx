import { FileText, Twitter, Linkedin, Mail, Github } from 'lucide-react';
import { toast } from 'sonner';

const footerLinks = {
  Product: ['Features', 'Templates', 'Pricing', 'API', 'Integrations'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  Resources: ['Documentation', 'Help Center', 'Community', 'Tutorials', 'Webinars'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies', 'Compliance'],
};

export function Footer() {
  const handleLinkClick = (link: string) => {
    toast.info(`${link} page coming soon!`);
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
            © 2024 Universal Document Creator. All rights reserved.
          </p>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span>Made with ❤️ for professionals worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
