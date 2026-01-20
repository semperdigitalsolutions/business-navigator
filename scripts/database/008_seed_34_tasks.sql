-- Seed 34 Tasks for Business Navigator
-- Week 3: Epic 3 - Complete Task System
-- Phase 1: Ideation & Validation (10 tasks)
-- Phase 2: Legal Foundation (12 tasks)
-- Phase 3: Financial Infrastructure (12 tasks)

-- Clear existing task templates to avoid duplicates
TRUNCATE public.task_templates CASCADE;

-- ============================================
-- PHASE 1: IDEATION & VALIDATION (10 tasks)
-- ============================================

INSERT INTO public.task_templates (id, title, description, category, priority, week_number, estimated_hours, dependencies, weight, phase, task_type, icon) VALUES

-- Task 1.1: Define Your Problem
('11111111-1111-1111-1111-111111111101',
 'Define Your Problem',
 'Clearly articulate the problem your business solves. A well-defined problem is the foundation of every successful business.',
 'ideation', 'high', 1, 1, '[]', 8, 'ideation', 'wizard', '🎯'),

-- Task 1.2: Identify Target Customer
('11111111-1111-1111-1111-111111111102',
 'Identify Your Target Customer',
 'Define who will buy your product or service. Understanding your ideal customer helps focus your efforts and messaging.',
 'ideation', 'high', 1, 2, '["11111111-1111-1111-1111-111111111101"]', 8, 'ideation', 'wizard', '👥'),

-- Task 1.3: Analyze Competition
('11111111-1111-1111-1111-111111111103',
 'Analyze Your Competition',
 'Research existing solutions and competitors. Understanding the landscape helps you differentiate and find opportunities.',
 'ideation', 'medium', 1, 2, '["11111111-1111-1111-1111-111111111101"]', 5, 'ideation', 'checklist', '🔍'),

-- Task 1.4: Define Value Proposition
('11111111-1111-1111-1111-111111111104',
 'Define Your Value Proposition',
 'Articulate why customers should choose you over alternatives. Your value proposition is your competitive advantage.',
 'ideation', 'high', 1, 1, '["11111111-1111-1111-1111-111111111102", "11111111-1111-1111-1111-111111111103"]', 9, 'ideation', 'wizard', '💎'),

-- Task 1.5: Choose Business Model
('11111111-1111-1111-1111-111111111105',
 'Choose Your Business Model',
 'Decide how your business will make money. The right business model aligns your revenue with customer value.',
 'ideation', 'high', 2, 2, '["11111111-1111-1111-1111-111111111104"]', 8, 'ideation', 'wizard', '💼'),

-- Task 1.6: Validate Your Idea
('11111111-1111-1111-1111-111111111106',
 'Validate Your Business Idea',
 'Test your assumptions with real potential customers. Validation reduces risk before investing significant resources.',
 'ideation', 'high', 2, 3, '["11111111-1111-1111-1111-111111111105"]', 9, 'ideation', 'checklist', '✅'),

-- Task 1.7: Create Pricing Strategy
('11111111-1111-1111-1111-111111111107',
 'Create Your Pricing Strategy',
 'Determine how to price your product or service. Good pricing balances value, costs, and market positioning.',
 'ideation', 'medium', 2, 2, '["11111111-1111-1111-1111-111111111105"]', 6, 'ideation', 'tool', '💲'),

-- Task 1.8: Select Business Name
('11111111-1111-1111-1111-111111111108',
 'Select Your Business Name',
 'Choose a memorable, available business name. Check trademark availability and secure matching domains.',
 'ideation', 'high', 2, 2, '["11111111-1111-1111-1111-111111111104"]', 7, 'ideation', 'wizard', '📝'),

-- Task 1.9: Secure Domain & Social
('11111111-1111-1111-1111-111111111109',
 'Secure Domain & Social Handles',
 'Register your domain name and claim social media handles. Consistent branding across platforms builds credibility.',
 'ideation', 'medium', 2, 1, '["11111111-1111-1111-1111-111111111108"]', 4, 'ideation', 'checklist', '🌐'),

-- Task 1.10: Create Business Summary
('11111111-1111-1111-1111-111111111110',
 'Create Your Business Summary',
 'Write a concise summary of your business concept. This becomes the foundation for your business plan.',
 'ideation', 'medium', 2, 2, '["11111111-1111-1111-1111-111111111106"]', 6, 'ideation', 'wizard', '📄'),


-- ============================================
-- PHASE 2: LEGAL FOUNDATION (12 tasks)
-- ============================================

-- Task 2.1: Choose Entity Type
('11111111-1111-1111-1111-111111111201',
 'Choose Your Legal Entity Type',
 'Select the right business structure (LLC, Corporation, etc.) based on your needs for liability protection, taxes, and growth plans.',
 'legal', 'high', 3, 2, '["11111111-1111-1111-1111-111111111110"]', 10, 'legal', 'wizard', '🏢'),

-- Task 2.2: Choose Formation State
('11111111-1111-1111-1111-111111111202',
 'Choose Your Formation State',
 'Decide where to register your business. Your state choice affects taxes, regulations, and annual requirements.',
 'legal', 'high', 3, 1, '["11111111-1111-1111-1111-111111111201"]', 8, 'legal', 'wizard', '📍'),

-- Task 2.3: File Formation Documents
('11111111-1111-1111-1111-111111111203',
 'File Formation Documents',
 'Submit Articles of Organization (LLC) or Incorporation (Corp) with your chosen state. This officially creates your business entity.',
 'legal', 'high', 3, 2, '["11111111-1111-1111-1111-111111111201", "11111111-1111-1111-1111-111111111202", "11111111-1111-1111-1111-111111111108"]', 10, 'legal', 'external', '📑'),

-- Task 2.4: Obtain EIN
('11111111-1111-1111-1111-111111111204',
 'Obtain Your EIN',
 'Apply for an Employer Identification Number from the IRS. Required for taxes, banking, and hiring employees.',
 'legal', 'high', 3, 1, '["11111111-1111-1111-1111-111111111203"]', 9, 'legal', 'external', '🏛️'),

-- Task 2.5: Create Operating Agreement
('11111111-1111-1111-1111-111111111205',
 'Create Operating Agreement / Bylaws',
 'Draft your operating agreement (LLC) or bylaws (Corp). Defines ownership, voting rights, and operational procedures.',
 'legal', 'medium', 4, 3, '["11111111-1111-1111-1111-111111111203"]', 7, 'legal', 'wizard', '📋'),

-- Task 2.6: Register for State Taxes
('11111111-1111-1111-1111-111111111206',
 'Register for State Taxes',
 'Register with your state tax authority. Get state tax IDs for income tax, sales tax, and employment taxes.',
 'legal', 'high', 4, 2, '["11111111-1111-1111-1111-111111111204"]', 8, 'legal', 'external', '💰'),

-- Task 2.7: Obtain Business Licenses
('11111111-1111-1111-1111-111111111207',
 'Obtain Business Licenses & Permits',
 'Research and apply for required federal, state, and local business licenses. Requirements vary by location and industry.',
 'legal', 'high', 4, 3, '["11111111-1111-1111-1111-111111111203"]', 8, 'legal', 'checklist', '📜'),

-- Task 2.8: Get Business Insurance
('11111111-1111-1111-1111-111111111208',
 'Get Business Insurance',
 'Evaluate and purchase necessary business insurance (liability, property, workers comp). Protects your business from risks.',
 'legal', 'medium', 5, 3, '["11111111-1111-1111-1111-111111111203"]', 6, 'legal', 'wizard', '🛡️'),

-- Task 2.9: Set Up Registered Agent
('11111111-1111-1111-1111-111111111209',
 'Set Up Registered Agent',
 'Designate a registered agent to receive official legal documents. Required in most states for LLCs and Corporations.',
 'legal', 'medium', 3, 1, '["11111111-1111-1111-1111-111111111202"]', 5, 'legal', 'wizard', '📬'),

-- Task 2.10: Understand Compliance Requirements
('11111111-1111-1111-1111-111111111210',
 'Understand Ongoing Compliance',
 'Learn your ongoing legal obligations (annual reports, renewals, record-keeping). Staying compliant avoids penalties.',
 'legal', 'medium', 5, 2, '["11111111-1111-1111-1111-111111111203"]', 5, 'legal', 'education', '📚'),

-- Task 2.11: Protect Intellectual Property
('11111111-1111-1111-1111-111111111211',
 'Protect Your Intellectual Property',
 'Consider trademarks, copyrights, or patents for your business assets. IP protection secures your competitive advantage.',
 'legal', 'low', 6, 2, '["11111111-1111-1111-1111-111111111108"]', 4, 'legal', 'education', '™️'),

-- Task 2.12: File Initial Annual Report
('11111111-1111-1111-1111-111111111212',
 'File Initial Annual Report',
 'Submit your first annual report if required by your state. Deadlines and requirements vary by state.',
 'legal', 'medium', 7, 1, '["11111111-1111-1111-1111-111111111203"]', 5, 'legal', 'external', '📊'),


-- ============================================
-- PHASE 3: FINANCIAL INFRASTRUCTURE (12 tasks)
-- ============================================

-- Task 3.1: Open Business Bank Account
('11111111-1111-1111-1111-111111111301',
 'Open Business Bank Account',
 'Establish a dedicated business bank account. Separating finances is essential for liability protection and taxes.',
 'financial', 'high', 4, 2, '["11111111-1111-1111-1111-111111111204"]', 9, 'financial', 'wizard', '🏦'),

-- Task 3.2: Set Up Accounting System
('11111111-1111-1111-1111-111111111302',
 'Set Up Accounting System',
 'Choose and configure accounting software. Good bookkeeping is essential for taxes, decisions, and growth.',
 'financial', 'high', 4, 3, '["11111111-1111-1111-1111-111111111301"]', 9, 'financial', 'wizard', '📈'),

-- Task 3.3: Create Financial Projections
('11111111-1111-1111-1111-111111111303',
 'Create Financial Projections',
 'Develop 12-month financial projections. Projections help plan cash flow, set goals, and secure funding.',
 'financial', 'medium', 5, 4, '["11111111-1111-1111-1111-111111111302"]', 7, 'financial', 'tool', '📉'),

-- Task 3.4: Plan Tax Strategy
('11111111-1111-1111-1111-111111111304',
 'Plan Your Tax Strategy',
 'Work with a CPA to optimize your tax structure. Understanding quarterly obligations prevents surprises.',
 'financial', 'high', 5, 3, '["11111111-1111-1111-1111-111111111302", "11111111-1111-1111-1111-111111111206"]', 8, 'financial', 'wizard', '💵'),

-- Task 3.5: Set Up Payment Processing
('11111111-1111-1111-1111-111111111305',
 'Set Up Payment Processing',
 'Choose and configure how you will accept payments. Options include Stripe, Square, PayPal, or traditional merchant accounts.',
 'financial', 'high', 5, 2, '["11111111-1111-1111-1111-111111111301"]', 8, 'financial', 'wizard', '💳'),

-- Task 3.6: Create Pricing & Invoicing
('11111111-1111-1111-1111-111111111306',
 'Set Up Pricing & Invoicing',
 'Configure your pricing structure and invoicing system. Professional invoicing improves cash flow and credibility.',
 'financial', 'medium', 5, 2, '["11111111-1111-1111-1111-111111111302", "11111111-1111-1111-1111-111111111107"]', 6, 'financial', 'wizard', '🧾'),

-- Task 3.7: Understand Startup Costs
('11111111-1111-1111-1111-111111111307',
 'Calculate Startup Costs',
 'Identify all costs needed to launch. Understanding your capital requirements helps plan funding needs.',
 'financial', 'high', 4, 2, '["11111111-1111-1111-1111-111111111105"]', 7, 'financial', 'tool', '🧮'),

-- Task 3.8: Explore Funding Options
('11111111-1111-1111-1111-111111111308',
 'Explore Funding Options',
 'Evaluate funding sources: bootstrapping, loans, investors, or grants. Choose the approach that fits your goals.',
 'financial', 'medium', 5, 2, '["11111111-1111-1111-1111-111111111307", "11111111-1111-1111-1111-111111111303"]', 6, 'financial', 'education', '💰'),

-- Task 3.9: Set Up Record Keeping
('11111111-1111-1111-1111-111111111309',
 'Establish Record-Keeping System',
 'Create systems for maintaining corporate records, contracts, and important documents. Good records protect your business.',
 'financial', 'medium', 6, 2, '["11111111-1111-1111-1111-111111111205"]', 5, 'launch_prep', 'checklist', '📁'),

-- Task 3.10: Create Emergency Fund Plan
('11111111-1111-1111-1111-111111111310',
 'Plan Your Emergency Fund',
 'Determine how much runway you need and build a cash reserve. Financial cushion provides stability during challenges.',
 'financial', 'medium', 6, 1, '["11111111-1111-1111-1111-111111111303"]', 5, 'financial', 'education', '🏧'),

-- Task 3.11: Set Up Payroll (if needed)
('11111111-1111-1111-1111-111111111311',
 'Set Up Payroll System',
 'Configure payroll if you plan to hire employees. Includes tax withholding, benefits, and compliance requirements.',
 'financial', 'low', 7, 3, '["11111111-1111-1111-1111-111111111204", "11111111-1111-1111-1111-111111111302"]', 4, 'financial', 'wizard', '👨‍💼'),

-- Task 3.12: Create Launch Checklist
('11111111-1111-1111-1111-111111111312',
 'Complete Your Launch Checklist',
 'Review all tasks and ensure youre ready to launch. This final review confirms your business foundation is solid.',
 'financial', 'high', 8, 1, '["11111111-1111-1111-1111-111111111203", "11111111-1111-1111-1111-111111111301", "11111111-1111-1111-1111-111111111302"]', 10, 'launch_prep', 'checklist', '🚀');

-- Grant permissions
GRANT SELECT ON public.task_templates TO authenticated;

-- Comments
COMMENT ON TABLE public.task_templates IS '34 predefined tasks for business formation across 3 phases';
