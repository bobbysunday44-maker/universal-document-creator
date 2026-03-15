# Universal Document Creator - Skills Library

## Built-in Skills

### Skill: Academic Essay
- **Name**: Academic Essay
- **Description**: Generates structured essays with introduction, body, and conclusion. Supports multiple citation styles.
- **Inputs**: 
  - topic (string): Essay subject
  - word_count (number): Target word count
  - citation_style (string): APA, MLA, or Chicago
  - key_points (array): Main arguments to include
- **Outputs**: Polished essay with proper structure and references
- **Template**: |
    Write an academic essay on "{topic}" with approximately {word_count} words.
    Use {citation_style} citation style.
    Include the following key points: {key_points}.
    Structure: Introduction with thesis, body paragraphs with evidence, conclusion summarizing arguments.

### Skill: Business Proposal
- **Name**: Business Proposal
- **Description**: Creates persuasive proposals for clients or investors with executive summary and financials.
- **Inputs**:
  - company_name (string): Your company name
  - product_service (string): What you're offering
  - target_audience (string): Who the proposal is for
  - goals (string): Objectives to achieve
  - budget (number, optional): Proposed budget
- **Outputs**: Professional proposal with executive summary, problem statement, solution, and financials
- **Template**: |
    Create a business proposal from {company_name} for {target_audience}.
    Product/Service: {product_service}
    Goals: {goals}
    {budget, select, undefined {} other {Budget: ${budget}}}
    Include: Executive Summary, Problem Statement, Proposed Solution, Implementation Timeline, {budget, select, undefined {} other {Financial Projections,}} and Call to Action.

### Skill: Resume Writing
- **Name**: Resume Writing
- **Description**: Produces professional resumes tailored to industry standards, ATS-friendly format.
- **Inputs**:
  - candidate_name (string): Full name
  - experience (array): Work history with company, title, dates, achievements
  - education (array): Degrees and institutions
  - skills (array): Technical and soft skills
  - job_target (string): Target position
- **Outputs**: ATS-friendly resume with clear sections
- **Template**: |
    Create a professional resume for {candidate_name} targeting a {job_target} position.
    Work Experience: {experience}
    Education: {education}
    Skills: {skills}
    Format: Professional summary, work experience (reverse chronological), education, skills section.
    Optimize for ATS screening.

### Skill: Legal Contract
- **Name**: Legal Contract
- **Description**: Drafts legal contracts with proper clauses and professional language.
- **Inputs**:
  - contract_type (string): Type of contract (NDA, Service Agreement, etc.)
  - party_a (string): First party name
  - party_b (string): Second party name
  - jurisdiction (string): Governing law location
  - key_terms (array): Specific terms to include
- **Outputs**: Structured legal contract with all necessary clauses
- **Template**: |
    Draft a {contract_type} between {party_a} (Party A) and {party_b} (Party B).
    Governing Law: {jurisdiction}
    Key Terms: {key_terms}
    Include: Recitals, Definitions, Obligations of Each Party, Payment Terms (if applicable), Term and Termination, Confidentiality, Limitation of Liability, Governing Law, Signature Blocks.

### Skill: Technical Documentation
- **Name**: Technical Documentation
- **Description**: Creates clear technical documentation, API docs, or user manuals.
- **Inputs**:
  - topic (string): Subject of documentation
  - audience (string): Target readers (developers, end users, etc.)
  - complexity (string): Beginner, Intermediate, or Advanced
  - sections (array): Specific sections to include
- **Outputs**: Well-structured technical document
- **Template**: |
    Write technical documentation for "{topic}" aimed at {audience} ({complexity} level).
    Sections to include: {sections}
    Use clear headings, code examples where relevant, and step-by-step instructions.
    Include: Overview, Prerequisites, Main Content, Examples, Troubleshooting (if applicable).

### Skill: Creative Story
- **Name**: Creative Story
- **Description**: Generates creative fiction stories with engaging narratives.
- **Inputs**:
  - genre (string): Story genre
  - theme (string): Central theme
  - characters (array): Main characters
  - word_count (number): Target length
  - tone (string): Writing tone
- **Outputs**: Creative story with engaging plot and characters
- **Template**: |
    Write a {genre} story with a {tone} tone, approximately {word_count} words.
    Theme: {theme}
    Characters: {characters}
    Include: Engaging opening, character development, conflict, resolution.

### Skill: Marketing Copy
- **Name**: Marketing Copy
- **Description**: Creates persuasive marketing content for products or services.
- **Inputs**:
  - product_name (string): Name of product/service
  - target_audience (string): Who you're marketing to
  - key_benefits (array): Main selling points
  - call_to_action (string): Desired action
  - tone (string): Professional, casual, urgent, etc.
- **Outputs**: Compelling marketing copy with hooks and CTAs
- **Template**: |
    Create marketing copy for "{product_name}" targeting {target_audience}.
    Key Benefits: {key_benefits}
    Call to Action: {call_to_action}
    Tone: {tone}
    Include: Attention-grabbing headline, value proposition, benefits, social proof suggestion, strong CTA.

### Skill: Email Template
- **Name**: Email Template
- **Description**: Generates professional emails for various business scenarios.
- **Inputs**:
  - email_type (string): Type of email (cold outreach, follow-up, announcement, etc.)
  - recipient (string): Who it's for
  - purpose (string): Main message
  - tone (string): Formal, friendly, persuasive, etc.
- **Outputs**: Professional email with subject line and body
- **Template**: |
    Write a {email_type} email to {recipient}.
    Purpose: {purpose}
    Tone: {tone}
    Include: Compelling subject line, professional greeting, clear message body, appropriate closing.

### Skill: Meeting Minutes
- **Name**: Meeting Minutes
- **Description**: Creates structured meeting minutes from discussion points.
- **Inputs**:
  - meeting_title (string): Meeting name
  - date (string): Meeting date
  - attendees (array): List of participants
  - agenda_items (array): Topics discussed
  - action_items (array): Tasks assigned
- **Outputs**: Professional meeting minutes document
- **Template**: |
    Create meeting minutes for "{meeting_title}" held on {date}.
    Attendees: {attendees}
    Agenda Items: {agenda_items}
    Action Items: {action_items}
    Format: Header info, attendees list, agenda with discussion summary, action items with owners and deadlines, next meeting date.

### Skill: Project Proposal
- **Name**: Project Proposal
- **Description**: Creates comprehensive project proposals with scope, timeline, and deliverables.
- **Inputs**:
  - project_name (string): Project title
  - client (string): Client or stakeholder name
  - objectives (array): Project goals
  - deliverables (array): Expected outputs
  - timeline (string): Project duration
  - budget (number, optional): Estimated budget
- **Outputs**: Complete project proposal document
- **Template**: |
    Create a project proposal for "{project_name}" for {client}.
    Objectives: {objectives}
    Deliverables: {deliverables}
    Timeline: {timeline}
    {budget, select, undefined {} other {Budget: ${budget}}}
    Include: Executive Summary, Project Background, Objectives, Scope of Work, Methodology, Deliverables, Timeline, {budget, select, undefined {} other {Budget,}} Risk Assessment, Team Qualifications.

### Skill: Invoice Generator
- **Name**: Invoice Generator
- **Description**: Creates professional invoices with itemized billing, tax calculations, and payment terms.
- **Inputs**:
  - company_name (string): Your company/freelancer name
  - client_name (string): Client being billed
  - items (array): Line items with description, quantity, rate
  - tax_rate (number, optional): Tax percentage
  - payment_terms (string): Net 30, Due on receipt, etc.
  - currency (string): USD, EUR, GBP, etc.
- **Outputs**: Professional invoice with totals and payment instructions
- **Template**: |
    Create a professional invoice from {company_name} to {client_name}.
    Line Items: {items}
    {tax_rate, select, undefined {} other {Tax Rate: {tax_rate}%}}
    Payment Terms: {payment_terms}
    Currency: {currency}
    Include: Invoice number, date, billing address, itemized table, subtotal, tax, total, payment instructions.

### Skill: Financial Report
- **Name**: Financial Report
- **Description**: Generates detailed financial reports with revenue analysis, expense breakdowns, and KPIs.
- **Inputs**:
  - company_name (string): Company name
  - period (string): Reporting period (Q1 2024, FY 2024, etc.)
  - revenue (string): Revenue figures or description
  - expenses (string): Expense categories and figures
  - highlights (array): Key financial highlights
- **Outputs**: Comprehensive financial report with analysis
- **Template**: |
    Create a financial report for {company_name} covering {period}.
    Revenue: {revenue}
    Expenses: {expenses}
    Key Highlights: {highlights}
    Include: Executive Summary, Revenue Analysis, Expense Breakdown, Profit & Loss, Key Performance Indicators, Trends, Outlook and Recommendations.

### Skill: Case Study
- **Name**: Case Study
- **Description**: Creates detailed case studies analyzing specific situations with methodology and recommendations.
- **Inputs**:
  - subject (string): Company or situation being analyzed
  - industry (string): Industry sector
  - problem (string): Problem or challenge faced
  - approach (string): Solution or methodology used
  - results (array): Key outcomes and metrics
- **Outputs**: Professional case study with analysis and takeaways
- **Template**: |
    Write a case study about {subject} in the {industry} industry.
    Problem: {problem}
    Approach: {approach}
    Results: {results}
    Include: Background, Problem Statement, Methodology, Implementation, Results & Metrics, Key Takeaways, Conclusion.

### Skill: Job Description
- **Name**: Job Description
- **Description**: Creates compelling job descriptions that attract top talent with inclusive language.
- **Inputs**:
  - role (string): Job title
  - company_name (string): Company name
  - department (string): Department or team
  - responsibilities (array): Key responsibilities
  - requirements (array): Required qualifications
  - benefits (array, optional): Benefits and perks
- **Outputs**: Professional job description with all sections
- **Template**: |
    Write a job description for a {role} at {company_name} in the {department} department.
    Responsibilities: {responsibilities}
    Requirements: {requirements}
    {benefits, select, undefined {} other {Benefits: {benefits}}}
    Include: About the Company, Role Overview, Responsibilities, Requirements, Nice-to-Haves, Benefits & Perks, How to Apply. Use inclusive, welcoming language.

### Skill: Employee Handbook
- **Name**: Employee Handbook
- **Description**: Creates comprehensive employee handbooks covering policies, benefits, and company culture.
- **Inputs**:
  - company_name (string): Company name
  - industry (string): Industry sector
  - policies (array): Key policies to include
  - benefits (array): Employee benefits
  - values (array): Company values
- **Outputs**: Complete employee handbook
- **Template**: |
    Create an employee handbook for {company_name} in the {industry} industry.
    Key Policies: {policies}
    Benefits: {benefits}
    Company Values: {values}
    Include: Welcome Message, Company Overview & Values, Employment Policies, Code of Conduct, Benefits & Compensation, Leave Policies, IT & Security Policies, Safety, Acknowledgment Form.

### Skill: White Paper
- **Name**: White Paper
- **Description**: Creates authoritative white papers with data-driven analysis and expert insights.
- **Inputs**:
  - topic (string): White paper subject
  - industry (string): Target industry
  - thesis (string): Central argument or thesis
  - data_points (array): Key statistics or data to reference
  - audience (string): Target readers
- **Outputs**: Thought leadership white paper
- **Template**: |
    Write a white paper on "{topic}" for the {industry} industry, targeting {audience}.
    Central Thesis: {thesis}
    Key Data Points: {data_points}
    Include: Abstract, Introduction, Background, Analysis with Data, Findings, Expert Commentary, Conclusion, References section.

### Skill: Pitch Deck Script
- **Name**: Pitch Deck Script
- **Description**: Creates compelling slide-by-slide pitch deck narratives for investors or stakeholders.
- **Inputs**:
  - startup_name (string): Company or startup name
  - product (string): Product or service description
  - problem (string): Problem being solved
  - market_size (string): Target market and size
  - funding_ask (string, optional): Funding amount requested
- **Outputs**: Slide-by-slide pitch deck content
- **Template**: |
    Create a pitch deck script for {startup_name}.
    Product: {product}
    Problem: {problem}
    Market Size: {market_size}
    {funding_ask, select, undefined {} other {Funding Ask: {funding_ask}}}
    Create content for each slide: Title, Problem, Solution, Market Opportunity, Product Demo/Screenshots, Business Model, Traction, Team, Financial Projections, The Ask, Thank You/Contact. Include speaker notes for each slide.

### Skill: Company Profile
- **Name**: Company Profile
- **Description**: Creates professional company profiles showcasing mission, services, team, and competitive advantages.
- **Inputs**:
  - company_name (string): Company name
  - industry (string): Industry or sector
  - founded (string): Year founded or history
  - services (array): Products or services offered
  - mission (string): Mission statement or purpose
- **Outputs**: Professional company profile document
- **Template**: |
    Create a professional company profile for {company_name} in the {industry} industry.
    Founded: {founded}
    Services: {services}
    Mission: {mission}
    Include: Company Overview, Mission & Vision, History & Milestones, Products/Services, Leadership Team, Market Position, Competitive Advantages, Client Testimonials placeholder, Contact Information.

### Skill: Press Release
- **Name**: Press Release
- **Description**: Creates professional press releases in AP style with quotes and media-ready formatting.
- **Inputs**:
  - company_name (string): Company name
  - headline (string): News headline
  - details (string): Full details of the announcement
  - spokesperson (string): Name and title of spokesperson
  - date (string): Release date
- **Outputs**: AP-style press release
- **Template**: |
    Write a press release for {company_name}.
    Headline: {headline}
    Details: {details}
    Spokesperson: {spokesperson}
    Date: {date}
    Use AP style. Include: Dateline, headline, subheadline, lead paragraph (who/what/when/where/why), body with quotes from {spokesperson}, boilerplate "About {company_name}" section, media contact info placeholder.

### Skill: Social Media Kit
- **Name**: Social Media Kit
- **Description**: Creates complete social media content packages with platform-specific formatting.
- **Inputs**:
  - brand_name (string): Brand or company name
  - campaign (string): Campaign or product being promoted
  - platforms (array): Target platforms (Twitter, LinkedIn, Instagram, etc.)
  - tone (string): Brand voice/tone
  - hashtags (array, optional): Suggested hashtags
- **Outputs**: Multi-platform social media content kit
- **Template**: |
    Create a social media content kit for {brand_name} promoting {campaign}.
    Platforms: {platforms}
    Tone: {tone}
    {hashtags, select, undefined {} other {Suggested Hashtags: {hashtags}}}
    For each platform, create: 3-5 post variations, captions, hashtag sets, best posting times suggestion, engagement hooks, and call-to-action. Optimize format for each platform's best practices.

### Skill: Receipt Generator
- **Name**: Receipt Generator
- **Description**: Creates professional payment receipts with transaction details, itemized charges, and payment confirmation.
- **Inputs**:
  - business_name (string): Business or store name
  - customer_name (string): Customer name
  - items (array): Purchased items with description, quantity, price
  - payment_method (string): Cash, Credit Card, PayPal, etc.
  - tax_rate (number, optional): Tax percentage
  - receipt_number (string, optional): Custom receipt number
- **Outputs**: Professional receipt with itemized charges, tax, total, and payment confirmation
- **Template**: |
    Create a professional payment receipt from {business_name} for {customer_name}.
    Items Purchased: {items}
    Payment Method: {payment_method}
    {tax_rate, select, undefined {} other {Tax Rate: {tax_rate}%}}
    {receipt_number, select, undefined {} other {Receipt Number: {receipt_number}}}
    Include: Receipt number, date/time, business address, itemized table with quantities and unit prices, subtotal, tax amount, grand total, payment method confirmation, and a thank you note.

### Skill: Business Card
- **Name**: Business Card
- **Description**: Designs professional business card layouts with contact information, branding, and modern styling.
- **Inputs**:
  - full_name (string): Person's full name
  - job_title (string): Professional title
  - company_name (string): Company or business name
  - email (string): Email address
  - phone (string): Phone number
  - website (string, optional): Website URL
  - tagline (string, optional): Company tagline or slogan
- **Outputs**: Business card layout in HTML format with front and back design
- **Template**: |
    Design a professional business card for {full_name}, {job_title} at {company_name}.
    Email: {email}
    Phone: {phone}
    {website, select, undefined {} other {Website: {website}}}
    {tagline, select, undefined {} other {Tagline: {tagline}}}
    Create both FRONT and BACK of the card. Use clean, modern design with proper spacing. The front should feature the name, title, and company prominently. The back should include all contact details. Use professional typography and layout. Output as styled HTML that represents a standard 3.5 x 2 inch business card.

## Skill Chaining Examples

### Chain: Business Proposal → Pitch Deck
First use "Business Proposal" skill, then transform output into presentation format.

### Chain: Resume → Cover Letter
Generate resume, then create tailored cover letter referencing resume highlights.

### Chain: Technical Doc → FAQ
Create technical documentation, then generate FAQ section from the content.
