import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  GraduationCap,
  Scale,
  BookOpen,
  PenTool,
  Mail,
  ClipboardList,
  FolderKanban,
  FileText,
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  Megaphone,
  Receipt,
  FileCheck,
  Users,
  Heart,
  Globe,
  Newspaper,
  ShieldCheck,
  Landmark,
  Presentation,
  ScrollText,
  Award,
  Building2,
  type LucideIcon,
} from 'lucide-react';

interface Template {
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  gradient: string;
  skillName: string | null;
  features: string[];
  popular?: boolean;
  isNew?: boolean;
  promptHint: string;
  previewWidths: number[];
}

const categories = [
  { id: 'All', label: 'All Templates', count: 0 },
  { id: 'Business', label: 'Business', count: 0 },
  { id: 'Legal', label: 'Legal', count: 0 },
  { id: 'Academic', label: 'Academic', count: 0 },
  { id: 'Creative', label: 'Creative', count: 0 },
  { id: 'Marketing', label: 'Marketing', count: 0 },
  { id: 'HR', label: 'HR & Recruitment', count: 0 },
  { id: 'Technical', label: 'Technical', count: 0 },
  { id: 'Finance', label: 'Finance', count: 0 },
];

const templates: Template[] = [
  // Business
  {
    name: 'Business Proposal',
    description: 'Win clients with persuasive proposals featuring executive summaries, financials, and clear ROI projections.',
    category: 'Business',
    icon: Briefcase,
    gradient: 'from-orange-500 to-amber-600',
    skillName: 'Business Proposal',
    features: ['Executive Summary', 'Financial Projections', 'ROI Analysis'],
    popular: true,
    promptHint: 'Create a business proposal for [your company] targeting [client/audience]',
    previewWidths: [100, 75, 90, 60, 85, 45],
  },
  {
    name: 'Project Proposal',
    description: 'Comprehensive project proposals with scope, timeline, deliverables, and budget breakdowns.',
    category: 'Business',
    icon: FolderKanban,
    gradient: 'from-rose-500 to-pink-600',
    skillName: 'Project Proposal',
    features: ['Scope & Timeline', 'Risk Assessment', 'Budget'],
    promptHint: 'Create a project proposal for [project name] for [client]',
    previewWidths: [100, 80, 65, 90, 70, 55],
  },
  {
    name: 'Executive Summary',
    description: 'Concise one-page executive summaries that capture the essence of your business or project.',
    category: 'Business',
    icon: Award,
    gradient: 'from-amber-500 to-yellow-600',
    skillName: 'Business Proposal',
    features: ['One-Page Format', 'Key Metrics', 'Action Items'],
    isNew: true,
    promptHint: 'Write an executive summary for [company/project] highlighting [key achievements]',
    previewWidths: [100, 85, 70, 90, 60],
  },
  {
    name: 'Meeting Minutes',
    description: 'Structured meeting notes with agenda tracking, discussion summaries, and action item assignments.',
    category: 'Business',
    icon: ClipboardList,
    gradient: 'from-indigo-500 to-blue-600',
    skillName: 'Meeting Minutes',
    features: ['Action Items', 'Attendance Log', 'Follow-ups'],
    promptHint: 'Create meeting minutes for [meeting title] held on [date]',
    previewWidths: [100, 70, 85, 55, 90, 65],
  },
  {
    name: 'Pitch Deck Script',
    description: 'Compelling pitch deck narratives with slide-by-slide talking points that hook investors.',
    category: 'Business',
    icon: Presentation,
    gradient: 'from-violet-500 to-purple-600',
    skillName: 'Pitch Deck Script',
    features: ['Slide Scripts', 'Investor-Ready', 'Data Points'],
    popular: true,
    promptHint: 'Write a pitch deck script for [startup name] raising [amount] for [product/service]',
    previewWidths: [100, 60, 85, 75, 90],
  },
  {
    name: 'Company Profile',
    description: 'Professional company profiles showcasing mission, services, team, and competitive advantages.',
    category: 'Business',
    icon: Building2,
    gradient: 'from-slate-500 to-gray-600',
    skillName: 'Company Profile',
    features: ['Mission & Vision', 'Team Bios', 'Service Overview'],
    promptHint: 'Create a company profile for [company name] in the [industry] industry',
    previewWidths: [100, 80, 65, 90, 55, 85],
  },

  // Legal
  {
    name: 'Legal Contract',
    description: 'Professionally drafted contracts with comprehensive clauses, obligations, and legal protections.',
    category: 'Legal',
    icon: Scale,
    gradient: 'from-violet-600 to-purple-700',
    skillName: 'Legal Contract',
    features: ['Legally Structured', 'Custom Clauses', 'Jurisdiction'],
    popular: true,
    promptHint: 'Draft a [contract type] between [Party A] and [Party B] under [jurisdiction] law',
    previewWidths: [100, 90, 75, 85, 65, 80],
  },
  {
    name: 'NDA Agreement',
    description: 'Non-disclosure agreements protecting sensitive information with mutual or one-way confidentiality.',
    category: 'Legal',
    icon: ShieldCheck,
    gradient: 'from-emerald-600 to-green-700',
    skillName: 'Legal Contract',
    features: ['Mutual/One-Way', 'Duration Terms', 'Remedies'],
    promptHint: 'Draft an NDA between [your company] and [other party] for [purpose]',
    previewWidths: [100, 85, 70, 95, 60, 80],
  },
  {
    name: 'Terms of Service',
    description: 'Comprehensive Terms of Service for websites and apps with liability limitations and user responsibilities.',
    category: 'Legal',
    icon: ScrollText,
    gradient: 'from-blue-600 to-indigo-700',
    skillName: 'Legal Contract',
    features: ['GDPR Ready', 'Liability Limits', 'User Rights'],
    isNew: true,
    promptHint: 'Write Terms of Service for [website/app name] — a [type of service] platform',
    previewWidths: [100, 80, 90, 65, 85, 75],
  },
  {
    name: 'Privacy Policy',
    description: 'GDPR and CCPA compliant privacy policies covering data collection, usage, and user rights.',
    category: 'Legal',
    icon: ShieldCheck,
    gradient: 'from-teal-600 to-cyan-700',
    skillName: 'Legal Contract',
    features: ['GDPR Compliant', 'CCPA Ready', 'Data Rights'],
    promptHint: 'Create a privacy policy for [company/app] that collects [types of data]',
    previewWidths: [100, 75, 85, 90, 60, 80],
  },

  // Academic
  {
    name: 'Academic Essay',
    description: 'Well-structured essays with thesis statements, evidence-based arguments, and proper citations.',
    category: 'Academic',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
    skillName: 'Academic Essay',
    features: ['APA/MLA/Chicago', 'Citations', 'Thesis-Driven'],
    popular: true,
    promptHint: 'Write an academic essay on [topic] with [word count] words using [APA/MLA] style',
    previewWidths: [100, 85, 70, 90, 65, 80],
  },
  {
    name: 'Research Paper',
    description: 'In-depth research papers with literature reviews, methodology, findings, and discussions.',
    category: 'Academic',
    icon: BookOpen,
    gradient: 'from-cyan-500 to-blue-600',
    skillName: 'Academic Essay',
    features: ['Literature Review', 'Methodology', 'Findings'],
    promptHint: 'Write a research paper on [topic] including literature review and methodology',
    previewWidths: [100, 90, 75, 85, 60, 95],
  },
  {
    name: 'Thesis Outline',
    description: 'Comprehensive thesis outlines with chapter breakdowns, research questions, and methodology frameworks.',
    category: 'Academic',
    icon: GraduationCap,
    gradient: 'from-green-500 to-emerald-600',
    skillName: 'Academic Essay',
    features: ['Chapter Structure', 'Research Questions', 'Framework'],
    isNew: true,
    promptHint: 'Create a thesis outline for [topic] in [field] with [number] chapters',
    previewWidths: [100, 70, 85, 60, 90, 75],
  },
  {
    name: 'Case Study',
    description: 'Detailed case study analyses with problem identification, methodology, and actionable recommendations.',
    category: 'Academic',
    icon: FileCheck,
    gradient: 'from-lime-500 to-green-600',
    skillName: 'Case Study',
    features: ['Problem Analysis', 'Data-Driven', 'Recommendations'],
    promptHint: 'Write a case study about [company/situation] analyzing [specific problem]',
    previewWidths: [100, 80, 65, 90, 75, 85],
  },

  // Creative
  {
    name: 'Creative Story',
    description: 'Engaging fiction with rich characters, compelling plots, vivid world-building, and emotional depth.',
    category: 'Creative',
    icon: PenTool,
    gradient: 'from-pink-500 to-rose-600',
    skillName: 'Creative Story',
    features: ['Character Dev', 'Plot Arcs', 'World-Building'],
    popular: true,
    promptHint: 'Write a [genre] story about [theme] with characters [names/descriptions]',
    previewWidths: [100, 85, 70, 90, 55, 80],
  },
  {
    name: 'Poetry Collection',
    description: 'Original poetry in any style — sonnets, haiku, free verse, spoken word, and more.',
    category: 'Creative',
    icon: Heart,
    gradient: 'from-red-500 to-rose-600',
    skillName: 'Creative Story',
    features: ['Multiple Styles', 'Rhyme Schemes', 'Imagery'],
    promptHint: 'Write a collection of [number] poems about [theme] in [style] style',
    previewWidths: [60, 45, 70, 50, 65, 40],
  },
  {
    name: 'Screenplay',
    description: 'Professional screenplays with proper formatting, dialogue, scene descriptions, and stage directions.',
    category: 'Creative',
    icon: PenTool,
    gradient: 'from-fuchsia-500 to-pink-600',
    skillName: 'Creative Story',
    features: ['Proper Format', 'Dialogue', 'Scene Direction'],
    isNew: true,
    promptHint: 'Write a [genre] screenplay about [premise] — approximately [pages] pages',
    previewWidths: [50, 80, 35, 70, 45, 85],
  },

  // Marketing
  {
    name: 'Marketing Copy',
    description: 'Conversion-focused marketing content with powerful headlines, benefit-driven copy, and irresistible CTAs.',
    category: 'Marketing',
    icon: Megaphone,
    gradient: 'from-orange-500 to-red-600',
    skillName: 'Marketing Copy',
    features: ['Conversion-Focused', 'A/B Headlines', 'CTAs'],
    popular: true,
    promptHint: 'Create marketing copy for [product] targeting [audience] with a [tone] tone',
    previewWidths: [100, 65, 85, 75, 90],
  },
  {
    name: 'Blog Post',
    description: 'SEO-optimized blog posts with engaging hooks, subheadings, and reader-friendly formatting.',
    category: 'Marketing',
    icon: Newspaper,
    gradient: 'from-blue-500 to-cyan-600',
    skillName: 'Marketing Copy',
    features: ['SEO Optimized', 'Meta Tags', 'Internal Links'],
    promptHint: 'Write a blog post about [topic] targeting the keyword [keyword] — [word count] words',
    previewWidths: [100, 80, 90, 65, 85, 70],
  },
  {
    name: 'Press Release',
    description: 'Professional press releases with AP-style formatting, quotes, and media-ready boilerplate.',
    category: 'Marketing',
    icon: Globe,
    gradient: 'from-sky-500 to-blue-600',
    skillName: 'Press Release',
    features: ['AP Style', 'Media-Ready', 'Quote Blocks'],
    promptHint: 'Write a press release announcing [news] for [company] — include quotes from [spokesperson]',
    previewWidths: [100, 85, 70, 90, 60, 80],
  },
  {
    name: 'Social Media Kit',
    description: 'Complete social media content packages with captions, hashtags, and platform-specific formatting.',
    category: 'Marketing',
    icon: TrendingUp,
    gradient: 'from-pink-500 to-orange-500',
    skillName: 'Social Media Kit',
    features: ['Multi-Platform', 'Hashtags', 'Engagement Hooks'],
    isNew: true,
    promptHint: 'Create a social media content kit for [brand] promoting [campaign/product]',
    previewWidths: [80, 60, 90, 50, 75],
  },
  {
    name: 'Newsletter',
    description: 'Engaging email newsletters with compelling subject lines, sections, and subscriber-focused content.',
    category: 'Marketing',
    icon: Mail,
    gradient: 'from-amber-500 to-orange-600',
    skillName: 'Email Template',
    features: ['Subject Lines', 'Sections', 'CTA Buttons'],
    promptHint: 'Write a newsletter for [brand/company] about [topic/updates] for [audience]',
    previewWidths: [100, 70, 85, 60, 90, 75],
  },

  // HR & Recruitment
  {
    name: 'Resume / CV',
    description: 'ATS-optimized resumes that pass automated screening with keyword-rich formatting and clear structure.',
    category: 'HR',
    icon: FileText,
    gradient: 'from-orange-500 to-amber-600',
    skillName: 'Resume Writing',
    features: ['ATS-Friendly', 'Keyword Rich', 'Clean Format'],
    popular: true,
    promptHint: 'Create a resume for [name] targeting a [position] role at [company type]',
    previewWidths: [100, 60, 85, 50, 90, 70],
  },
  {
    name: 'Cover Letter',
    description: 'Personalized cover letters that connect your experience to the job requirements and company culture.',
    category: 'HR',
    icon: Mail,
    gradient: 'from-teal-500 to-emerald-600',
    skillName: 'Resume Writing',
    features: ['Personalized', 'Company-Aligned', 'Story-Driven'],
    promptHint: 'Write a cover letter for [name] applying to [position] at [company]',
    previewWidths: [100, 85, 70, 90, 65, 80],
  },
  {
    name: 'Job Description',
    description: 'Compelling job descriptions that attract top talent with clear responsibilities and growth opportunities.',
    category: 'HR',
    icon: Users,
    gradient: 'from-blue-500 to-indigo-600',
    skillName: 'Job Description',
    features: ['Inclusive Language', 'Clear Requirements', 'Benefits'],
    promptHint: 'Write a job description for a [role] at [company] in the [industry] sector',
    previewWidths: [100, 75, 90, 60, 85, 70],
  },
  {
    name: 'Employee Handbook',
    description: 'Comprehensive employee handbooks covering policies, benefits, code of conduct, and company culture.',
    category: 'HR',
    icon: BookOpen,
    gradient: 'from-purple-500 to-violet-600',
    skillName: 'Employee Handbook',
    features: ['Policy Sections', 'Compliance', 'Culture Guide'],
    isNew: true,
    promptHint: 'Create an employee handbook for [company] with [number] employees in [industry]',
    previewWidths: [100, 80, 65, 90, 75, 85],
  },

  // Technical
  {
    name: 'Technical Documentation',
    description: 'Clear, well-structured technical docs with code examples, diagrams, and step-by-step instructions.',
    category: 'Technical',
    icon: BookOpen,
    gradient: 'from-cyan-500 to-blue-600',
    skillName: 'Technical Documentation',
    features: ['Code Examples', 'Step-by-Step', 'Diagrams'],
    popular: true,
    promptHint: 'Write technical documentation for [topic/API] aimed at [developers/users]',
    previewWidths: [100, 70, 85, 60, 90, 75],
  },
  {
    name: 'API Reference',
    description: 'Complete API documentation with endpoints, parameters, response examples, and authentication guides.',
    category: 'Technical',
    icon: FileText,
    gradient: 'from-green-500 to-teal-600',
    skillName: 'Technical Documentation',
    features: ['Endpoints', 'Auth Guide', 'Response Examples'],
    promptHint: 'Create API documentation for [API name] with endpoints for [operations]',
    previewWidths: [100, 55, 80, 45, 90, 65],
  },
  {
    name: 'SOP Document',
    description: 'Standard Operating Procedures with clear workflows, checklists, and quality control measures.',
    category: 'Technical',
    icon: FileCheck,
    gradient: 'from-yellow-500 to-amber-600',
    skillName: 'Technical Documentation',
    features: ['Workflows', 'Checklists', 'Quality Control'],
    promptHint: 'Create an SOP for [process] at [company/department] — include checklists',
    previewWidths: [100, 80, 65, 90, 55, 85],
  },
  {
    name: 'White Paper',
    description: 'Authoritative white papers that establish thought leadership with data, analysis, and expert insights.',
    category: 'Technical',
    icon: ScrollText,
    gradient: 'from-slate-500 to-zinc-600',
    skillName: 'White Paper',
    features: ['Data-Driven', 'Expert Analysis', 'Thought Leadership'],
    promptHint: 'Write a white paper on [topic] for [industry] audience — include data and analysis',
    previewWidths: [100, 85, 70, 90, 60, 80],
  },

  // Finance
  {
    name: 'Invoice',
    description: 'Professional invoices with itemized billing, payment terms, tax calculations, and brand styling.',
    category: 'Finance',
    icon: Receipt,
    gradient: 'from-green-500 to-emerald-600',
    skillName: 'Invoice Generator',
    features: ['Itemized', 'Tax Calc', 'Payment Terms'],
    popular: true,
    promptHint: 'Create an invoice from [your company] to [client] for [services/products]',
    previewWidths: [100, 60, 80, 60, 80, 90],
  },
  {
    name: 'Financial Report',
    description: 'Detailed financial reports with revenue analysis, expense breakdowns, and performance metrics.',
    category: 'Finance',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-green-600',
    skillName: 'Financial Report',
    features: ['Revenue Analysis', 'KPIs', 'Projections'],
    promptHint: 'Generate a financial report for [company] covering [period] — include revenue and expenses',
    previewWidths: [100, 75, 85, 65, 90, 70],
  },
  {
    name: 'Business Plan',
    description: 'Investor-ready business plans with market analysis, revenue models, and competitive positioning.',
    category: 'Finance',
    icon: Landmark,
    gradient: 'from-blue-600 to-indigo-700',
    skillName: 'Business Proposal',
    features: ['Market Analysis', 'Revenue Model', 'Investor-Ready'],
    isNew: true,
    promptHint: 'Create a business plan for [startup/company] in [industry] seeking [funding amount]',
    previewWidths: [100, 80, 90, 65, 85, 75],
  },

  // Email (cross-category)
  {
    name: 'Email Template',
    description: 'Professional email templates for any scenario — cold outreach, follow-ups, announcements, and more.',
    category: 'Business',
    icon: Mail,
    gradient: 'from-yellow-500 to-orange-600',
    skillName: 'Email Template',
    features: ['Subject Lines', 'Multiple Tones', 'Follow-up Chains'],
    promptHint: 'Write a [type] email to [recipient] about [purpose] in a [formal/casual] tone',
    previewWidths: [100, 75, 85, 60, 90],
  },
];

// Count templates per category
categories.forEach(cat => {
  cat.count = cat.id === 'All' ? templates.length : templates.filter(t => t.category === cat.id).length;
});

interface TemplatesSectionProps {
  onSelectTemplate?: (skillName: string | null, promptHint: string) => void;
}

export function TemplatesSection({ onSelectTemplate }: TemplatesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const filteredTemplates = activeCategory === 'All'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  const displayedTemplates = showAll ? filteredTemplates : filteredTemplates.slice(0, 12);

  const handleTemplateClick = (template: Template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.skillName, template.promptHint);
    }
  };

  const handleExploreAll = () => {
    if (showAll) {
      if (onSelectTemplate) {
        onSelectTemplate(null, '');
      }
    } else {
      setShowAll(true);
    }
  };

  return (
    <section id="templates" className="py-16 sm:py-20 lg:py-32 relative overflow-hidden bg-background">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Professional Templates
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            {templates.length}+ Templates.{' '}
            <span className="bg-gradient-to-r from-primary via-orange-500 to-rose-500 bg-clip-text text-transparent">
              One Click Away.
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-2 sm:px-0">
            Start with a professionally designed template — powered by AI that understands context,
            formatting, and industry standards. Every document is tailored to your needs.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-8">
            {[
              { label: 'Templates', value: `${templates.length}+` },
              { label: 'Categories', value: `${categories.length - 1}` },
              { label: 'AI Models', value: '3' },
              { label: 'Export Formats', value: '4' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => { setActiveCategory(category.id); setShowAll(false); }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeCategory === category.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {category.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeCategory === category.id ? 'bg-white/20' : 'bg-background/60'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          layout
        >
          <AnimatePresence mode="popLayout">
            {displayedTemplates.map((template, index) => (
              <motion.div
                key={template.name}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
                whileHover={{ y: -6 }}
                onClick={() => handleTemplateClick(template)}
                className="group cursor-pointer"
              >
                <div className="relative h-full rounded-xl bg-card border border-border overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  {/* Document preview header */}
                  <div className={`relative h-28 sm:h-32 bg-gradient-to-br ${template.gradient} p-4 overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -right-2 bottom-2 w-12 h-12 rounded-full bg-white/5" />

                    {/* Mini document preview */}
                    <div className="relative bg-white/95 rounded-lg p-3 shadow-lg w-[85%] mx-auto transform group-hover:scale-[1.02] transition-transform">
                      {template.previewWidths.map((width, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full mb-1.5 last:mb-0 ${
                            i === 0 ? 'bg-gray-700/60' : 'bg-gray-300/80'
                          }`}
                          style={{ width: `${width}%` }}
                        />
                      ))}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {template.popular && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold text-amber-600 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          Popular
                        </span>
                      )}
                      {template.isNew && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold text-emerald-600 shadow-sm">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center shadow-sm`}>
                        <template.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground leading-tight group-hover:text-primary transition-colors">
                          {template.name}
                        </h3>
                        <span className="text-[11px] text-muted-foreground">{template.category}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Hover CTA */}
                    <div className="mt-3 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium text-primary flex items-center gap-1">
                        Use This Template
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10 sm:mt-14"
        >
          {!showAll && filteredTemplates.length > 12 && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing 12 of {filteredTemplates.length} templates
            </p>
          )}
          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 text-sm sm:text-base px-8 shadow-lg shadow-primary/25"
            onClick={handleExploreAll}
          >
            {showAll ? (
              <>
                Start Creating
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                {filteredTemplates.length > 12 ? `View All ${filteredTemplates.length} Templates` : 'Start Creating Documents'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            No credit card required to start. Upgrade anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
