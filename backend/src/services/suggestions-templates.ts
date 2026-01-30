/**
 * Suggestions Templates
 * Question templates for context-aware suggestions
 */

export interface SuggestedQuestion {
  id: string
  text: string
  category: 'legal' | 'financial' | 'tasks' | 'general'
  priority: number
}

// Question templates by category and phase
export const QUESTION_TEMPLATES: Record<string, SuggestedQuestion[]> = {
  // Pre-onboarding questions
  pre_onboarding: [
    {
      id: 'pre-1',
      text: 'What business structure is best for my startup?',
      category: 'legal',
      priority: 1,
    },
    {
      id: 'pre-2',
      text: 'How do I decide which state to incorporate in?',
      category: 'legal',
      priority: 2,
    },
    {
      id: 'pre-3',
      text: 'What are the first steps to starting a business?',
      category: 'general',
      priority: 3,
    },
  ],

  // Ideation phase questions
  ideation: [
    {
      id: 'ideation-1',
      text: 'How do I validate my business idea?',
      category: 'general',
      priority: 1,
    },
    {
      id: 'ideation-2',
      text: 'What market research should I do before launching?',
      category: 'general',
      priority: 2,
    },
    {
      id: 'ideation-3',
      text: 'How do I identify my target customer?',
      category: 'general',
      priority: 3,
    },
  ],

  // Legal phase questions
  legal: [
    {
      id: 'legal-1',
      text: 'What documents do I need to form an LLC in {state}?',
      category: 'legal',
      priority: 1,
    },
    {
      id: 'legal-2',
      text: 'How do I get an EIN for {businessName}?',
      category: 'legal',
      priority: 2,
    },
    {
      id: 'legal-3',
      text: 'Do I need a registered agent in {state}?',
      category: 'legal',
      priority: 3,
    },
    { id: 'legal-4', text: 'What licenses and permits do I need?', category: 'legal', priority: 4 },
    { id: 'legal-5', text: 'How do I protect my business name?', category: 'legal', priority: 5 },
  ],

  // Financial phase questions
  financial: [
    {
      id: 'financial-1',
      text: 'What are the tax implications of my entity choice?',
      category: 'financial',
      priority: 1,
    },
    {
      id: 'financial-2',
      text: 'How do I set up business banking for {businessName}?',
      category: 'financial',
      priority: 2,
    },
    {
      id: 'financial-3',
      text: 'What accounting software should I use?',
      category: 'financial',
      priority: 3,
    },
    {
      id: 'financial-4',
      text: 'How do I create financial projections for my business?',
      category: 'financial',
      priority: 4,
    },
  ],

  // Launch prep phase questions
  launch_prep: [
    {
      id: 'launch-1',
      text: 'What should I include in my launch checklist?',
      category: 'tasks',
      priority: 1,
    },
    {
      id: 'launch-2',
      text: 'How do I set up my business website?',
      category: 'general',
      priority: 2,
    },
    {
      id: 'launch-3',
      text: 'What insurance does {businessName} need?',
      category: 'legal',
      priority: 3,
    },
  ],

  // Task-related questions
  tasks: [
    { id: 'tasks-1', text: "What's my next priority task?", category: 'tasks', priority: 1 },
    {
      id: 'tasks-2',
      text: 'How do I complete the {taskTitle} task?',
      category: 'tasks',
      priority: 2,
    },
    { id: 'tasks-3', text: 'What tasks are blocking my progress?', category: 'tasks', priority: 3 },
  ],

  // Funding-specific questions
  funding_investment: [
    {
      id: 'funding-inv-1',
      text: 'How do I prepare for investor meetings?',
      category: 'financial',
      priority: 1,
    },
    {
      id: 'funding-inv-2',
      text: 'What equity should I offer to investors?',
      category: 'financial',
      priority: 2,
    },
  ],

  funding_loan: [
    {
      id: 'funding-loan-1',
      text: 'What are my small business loan options?',
      category: 'financial',
      priority: 1,
    },
    {
      id: 'funding-loan-2',
      text: 'How do I improve my chances of loan approval?',
      category: 'financial',
      priority: 2,
    },
  ],

  // Category-specific questions
  tech_saas: [
    { id: 'tech-1', text: 'How do I protect my software IP?', category: 'legal', priority: 1 },
    {
      id: 'tech-2',
      text: 'What compliance requirements apply to SaaS?',
      category: 'legal',
      priority: 2,
    },
  ],

  ecommerce: [
    {
      id: 'ecom-1',
      text: 'Do I need to collect sales tax for online sales?',
      category: 'financial',
      priority: 1,
    },
    {
      id: 'ecom-2',
      text: 'What e-commerce platform should I use?',
      category: 'general',
      priority: 2,
    },
  ],

  service: [
    {
      id: 'service-1',
      text: 'Do I need professional liability insurance?',
      category: 'legal',
      priority: 1,
    },
    { id: 'service-2', text: 'How do I create service contracts?', category: 'legal', priority: 2 },
  ],

  local: [
    {
      id: 'local-1',
      text: 'What local permits do I need in {state}?',
      category: 'legal',
      priority: 1,
    },
    {
      id: 'local-2',
      text: 'How do I set up a physical business location?',
      category: 'general',
      priority: 2,
    },
  ],
}
