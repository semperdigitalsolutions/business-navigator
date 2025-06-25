Supabase Planning for Business Setup Navigator
This document outlines the authentication, onboarding, and Supabase-related plans for the Business Setup Navigator project. It includes table structures, column details, and implementation strategies based on discussions as of June 23, 2025.

Authentication
Overview
Supabase authentication is fully implemented, supporting signup, login, and forgot-password functionality.
A mock AuthContext is used in root.tsx to simulate user sessions, toggleable with Ctrl+A for testing.
The plan is to integrate Supabase authentication with dynamic navbar updates and onboarding flows.
Current State
Users can log in and authenticate successfully.
No Supabase tables are set up yet beyond the default auth.users table.
Future Integration
Replace mock AuthContext with real Supabase authentication data.
Dynamically update AppLayout.tsx navbar and sidebar based on AuthContext state from Supabase.
Plan to start Supabase setup after finalizing the frontend structure, now shifted to today (June 23, 2025).
Onboarding
Overview
Onboarding occurs after the first successful login post-signup or if onboarding_completed is false.
The goal is to collect essential user and business information to personalize the Setup Guide and prevent duplicate accounts.
Data is saved to Supabase, setting onboarding_completed to true, and the user is redirected to the /home dashboard.
User Onboarding Flow
Trigger: Detect first login after signup or onboarding_completed: false in the users table.
Goal: Gather comprehensive user and business context.
Process:
Welcome Screen/Modal:
"Welcome, [User's First Name]! Let's get your Business Setup Navigator personalized."
Capture Basic Information (Required Fields):
Field 1: First Name
Input: Text field.
Purpose: Personalization (e.g., welcome message).
Field 2: Last Name
Input: Text field (optional).
Purpose: Personalization (formal use, future features).
Field 3: Location Country
Input: Text or dropdown (e.g., country list).
Purpose: Location-specific guidance (legal, SEO).
Field 4: Location State/Province
Input: Text or dropdown (e.g., state list).
Purpose: Location-specific guidance.
Field 5: Business Name Idea
Input: Text field.
Purpose: Core context, AI input, display.
Field 6: Business Description
Input: Text area.
Purpose: Core context, AI input.
Field 7: Industry
Input: Required dropdown with 15 categories (Retail, Food and Beverage, etc.) and subcategories/examples (see below).
Purpose: AI context, personalization, analytics.
Field 8: Business Stage
Input: Required dropdown with options (e.g., “idea,” “planning,” “pre_launch”).
Purpose: Personalization, analytics.
Field 9: Number of Employees
Input: Required dropdown with options (1, 2-10, 11-50, 50-100).
Purpose: Assess business scale, tailor guidance.
Field 10: Business Location Country
Input: Text or dropdown.
Purpose: Business-specific location guidance.
Field 11: Business Location State/Province
Input: Text or dropdown.
Purpose: Business-specific location guidance.
Confirmation & Next Steps:
"Great! You're all set to start your journey. Click below to go to the Setup Guide."
Supabase Action: Update onboarding_completed to true in the users table.
Navigate to /home (dashboard).
Industry Categories
1. Retail
Description: Businesses selling goods directly to consumers.
Examples: Specialty retail, bookstores, pet stores, online stores, convenience stores.
Subcategories: Apparel, home goods, electronics, health/beauty.
2. Food and Beverage
Description: Preparing/serving food and drinks.
Examples: Cafes, bakeries, food trucks, small restaurants, catering, brewpubs.
Subcategories: Fast casual, fine dining, dessert shops, beverage-focused.
3. Professional Services
Description: Specialized expertise services.
Examples: Accounting, law offices, marketing agencies, consulting, financial planning.
Subcategories: Legal, financial, management, creative services.
4. Healthcare and Wellness
Description: Medical or wellness services.
Examples: Chiropractic, therapy, yoga studios, massage, acupuncture.
Subcategories: Mental health, alternative medicine, fitness, dental/optometry.
5. Personal Services
Description: Individual needs services.
Examples: Hair salons, nail salons, dry cleaning, pet grooming, styling.
Subcategories: Beauty, home organization, errand services, tailoring.
6. Home and Property Services
Description: Property maintenance/improvement.
Examples: Landscaping, cleaning, remodeling, painting, real estate.
Subcategories: Interior design, HVAC, pest control, roofing.
7. Construction and Trades
Description: Building/renovating structures.
Examples: General contractors, electricians, plumbers, carpenters, masonry.
Subcategories: Specialty trades, home builders, renovation.
8. Technology and IT Services
Description: Tech-related services.
Examples: IT support, web design, software dev, cybersecurity, repair.
Subcategories: App dev, cloud services, data recovery, tech training.
9. Education and Training
Description: Instructional services.
Examples: Tutoring, language schools, music lessons, test prep, workshops.
Subcategories: Early childhood, vocational, online courses, hobby classes.
10. Arts, Entertainment, and Recreation
Description: Creative/leisure activities.
Examples: Photography, event planning, dance studios, escape rooms, galleries.
Subcategories: Live entertainment, sports coaching, craft workshops.
11. Manufacturing and Crafts
Description: Small-scale goods production.
Examples: Jewelry, furniture crafting, candle making, custom apparel, 3D printing.
Subcategories: Food production, woodworking, textiles, metalwork.
12. Transportation and Logistics
Description: Moving people/goods.
Examples: Courier, taxi, moving, rentals, freight.
Subcategories: Last-mile, specialty transport, charter, warehousing.
13. Hospitality and Tourism
Description: Accommodation/experiences.
Examples: Bed and breakfasts, rentals, tour guides, hotels, campgrounds.
Subcategories: Eco-tourism, adventure, cultural tours, venues.
14. Agriculture and Farming
Description: Growing/raising products.
Examples: Organic farms, farmers’ markets, beekeeping, nurseries, urban farming.
Subcategories: Horticulture, livestock, aquaculture, agritourism.
15. Nonprofit and Community Services
Description: Social impact organizations.
Examples: Charities, community centers, youth programs, shelters, advocacy.
Subcategories: Social services, cultural, religious, volunteer initiatives.
Returning User Flow
Check Onboarding: If onboarding_completed is false, redirect to onboarding on /home.
Load User Data: If complete, fetch business_name_idea, business_description, industry, business_stage, number_of_employees, location_country, location_state_province, business_location_country, business_location_state_province, and step progress from Supabase.
Navigation: Direct to /home or last visited module.
Supabase Tables
I. User Account & Profile Information
users Table (Managed by Supabase Auth + Custom Fields)
user_id (UUID): Primary key, auto-generated by Supabase Auth. [Core Identifier]
email (Text): User’s login email. [Login, Communication]
encrypted_password (Handled by Supabase Auth): [Security]
created_at (Timestamp): Account creation time. [Auditing, Analytics]
last_sign_in_at (Timestamp): Last login time. [Auditing, User Activity]
email_confirmed_at (Timestamp, Optional): Email verification time. [Security, Trust]
first_name (Text): User’s first name. [Personalization, AI Context]
last_name (Text, Optional): User’s last name. [Personalization, Future Use]
onboarding_completed (Boolean): Flag for initial onboarding. [User Flow Control]
subscription_tier (Text, e.g., 'free', 'premium_monthly', 'premium_yearly'): Current level. [Monetization, Feature Gating]
stripe_customer_id (Text, Optional): Stripe ID for payments. [Monetization]
last_visited_module_id (Text, Optional): Last module ID. [UX - Resume Session]
ip_address (Text, Optional): Signup/login IP. [Security, Duplicate Detection]
device_info (Text, Optional): Browser/OS. [Security, Duplicate Detection]
account_creation_source (Text, Optional): Signup method (e.g., email, social). [Security, Analytics]
Indexes: user_id (primary), email (unique), last_sign_in_at.
user_business_profiles Table (For Multiple Businesses)
business_profile_id (UUID): Primary key. [Unique Identifier]
user_id (UUID, FK to users.user_id): Links to user. [Association]
business_name_idea (Text): Working business name. [Core Context, AI Input]
business_description (Text): Short business description. [Core Context, AI Input]
industry (Text): Required category (e.g., Retail, Food and Beverage). [AI Context, Analytics]
business_stage (Text): Required stage (e.g., “idea,” “planning”). [Personalization, Analytics]
location_country (Text): User’s country. [Context for Guidance]
location_state_province (Text): User’s state/province. [Context for Guidance]
business_location_country (Text): Business country. [Context for Guidance]
business_location_state_province (Text): Business state/province. [Context for Guidance]
number_of_employees (Text): Dropdown (1, 2-10, 11-50, 50-100). [Business Scale]
is_primary (Boolean): True for first business, false for additional (paywalled). [Monetization]
created_at (Timestamp): Profile creation time. [Auditing]
updated_at (Timestamp): Last update time. [Auditing]
Indexes: business_profile_id (primary), user_id, composite index on user_id and is_primary.
Row-Level Security (RLS): Restrict free-tier users to one is_primary: true profile unless subscription_tier is premium.
II. Application Content Structure
modules Table (Optional for MVP, Static Initially)
module_id (Text, e.g., "idea_validation_naming"): Unique identifier. [Internal Linking]
module_title (Text, e.g., "Idea Validation & Naming"): Display name. [UI Display]
module_description (Text): Overview. [UI Display]
display_order (Integer): Module order. [UI Display]
Indexes: module_id (primary).
steps Table (Optional for MVP, Static Initially)
step_id (Text, e.g., "refine_business_idea"): Unique identifier. [Internal Linking]
module_id (Text, FK to modules.module_id): Module association. [Structure]
step_title (Text, e.g., "Refine Your Business Idea"): Display name. [UI Display]
step_guidance_content (Text/HTML): Instructional content. [Core Content]
step_prompt_questions (Text/JSON, Optional): Guidance questions. [User Input]
ai_helper_available (Boolean, Optional): AI tool flag. [Feature Control]
display_order (Integer): Step order. [UI Display]
Indexes: step_id (primary), module_id.
III. User Interaction & Progress Data
user_step_progress Table
id (UUID): Primary key. [Unique Identifier]
user_id (UUID, FK to users.user_id): User link. [Association]
step_id (Text, FK to steps.step_id): Step link. [Association]
is_completed (Boolean): Completion status. [Progress Tracking]
completed_at (Timestamp, Optional): Completion time. [Auditing]
Primary Key: Composite of user_id and step_id.
Indexes: user_id, step_id.
user_step_notes Table
workspace_item_id (UUID): Primary key. [Unique Identifier]
user_id (UUID, FK to users.user_id): User link. [Association]
step_id (Text, FK to steps.step_id): Step link. [Context]
content_type (Text, e.g., 'user_note', 'ai_suggestion'): Content type. [Filtering]
content_text (Text): Note content. [User/AI Data]
ai_prompt_used (Text, Optional): AI prompt. [Debugging]
created_at (Timestamp): Creation time. [Auditing]
updated_at (Timestamp): Last update time. [Auditing]
Indexes: workspace_item_id (primary), user_id, step_id.
IV. AI Usage & Quotas
ai_usage_log Table (Optional for MVP)
ai_usage_log_id (UUID): Primary key. [Unique Identifier]
user_id (UUID, FK to users.user_id): User link. [Association]
ai_feature_used (Text, e.g., 'tagline_generation'): AI tool. [Analytics]
tokens_consumed (Integer, Optional): Token count. [Cost Tracking]
timestamp (Timestamp): Interaction time. [Quota Reset]
Indexes: ai_usage_log_id (primary), user_id.
Alternative: Add ai_interactions_this_period and quota_period_start_date to users for simpler quota tracking.
V. Resource Hub Content
resources Table (Optional for MVP)
resource_id (UUID): Primary key. [Unique Identifier]
title (Text): Resource name. [UI Display]
description (Text): Short description. [UI Display]
url (Text): External link. [Functionality]
category (Text, e.g., 'Legal'): Category. [Filtering]
tags (Array of Text, Optional): Search tags. [Searchability]
Indexes: resource_id (primary).
Security & Duplicate Prevention
Fields: ip_address, device_info, account_creation_source in users to detect duplicates.
RLS Policy: Limit free-tier users to one is_primary: true user_business_profile unless subscription_tier is premium.
Trigger: Log login_attempts (e.g., user_id, ip_address, timestamp) to flag suspicious activity.
Implementation Notes
Start Simple: Hardcode modules and steps for MVP, migrate to tables later.
Flexibility: Use content_type in user_step_notes for future AI outputs.
Indexes: Add to frequently queried columns (e.g., user_id, step_id).
Timestamps: Use Supabase defaults where possible.
Next Steps
Set up users and user_business_profiles tables today.
Implement onboarding form and flow.
Plan modules, steps, user_step_progress, and user_step_notes as you progress.
Next Steps for Our Discussion
Your Input: Confirm the plan or suggest adjustments. For example:
“Focus on users and user_business_profiles tables with duplicate prevention today.”
“The basics are Supabase setup and testing the onboarding form.”
Refined Plan: I’ll summarize if needed.
No Code: I’ll avoid code until requested.
Today’s Focus: Support your Supabase setup starting at 12:05 PM EDT or when you’re ready.
Support for Supabase Setup
I’ll be here to answer questions as you plan onboarding tables. Potential topics (ask as needed):
Designing users and user_business_profiles with new fields.
Setting up Supabase client and RLS policies.
Syncing onboarding_completed with modal logic.
Preventing duplicates with ip_address and device_info.
Troubleshooting schema issues.