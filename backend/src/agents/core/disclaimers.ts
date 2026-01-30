/**
 * Disclaimer injection utilities for AI responses
 *
 * Detects topic categories and appends appropriate disclaimers to responses
 * to ensure users understand the educational nature of the content.
 */

export type DisclaimerType = 'legal' | 'financial' | 'tax' | 'investment' | 'general'

/**
 * Disclaimers for different topic categories
 */
export const DISCLAIMERS: Record<DisclaimerType, string> = {
  legal: `

---
**Disclaimer:** This information is for educational purposes only and does not constitute legal advice. Every business situation is unique. Please consult with a licensed attorney for advice specific to your circumstances.`,

  financial: `

---
**Disclaimer:** This information is for educational purposes only and does not constitute financial advice. Please consult with a qualified financial advisor or CPA for advice specific to your situation.`,

  tax: `

---
**Disclaimer:** This information is for educational purposes only and does not constitute tax advice. Tax laws vary by jurisdiction and change frequently. Please consult with a licensed CPA or tax professional for advice specific to your situation.`,

  investment: `

---
**Disclaimer:** This information is for educational purposes only and does not constitute investment advice. Please consult with a licensed financial advisor before making any investment decisions.`,

  general: `

---
**Disclaimer:** This information is for educational purposes only. Please consult with appropriate professionals for advice specific to your situation.`,
}

/**
 * Keywords that indicate legal topics
 */
const LEGAL_KEYWORDS = [
  'llc',
  'corporation',
  'incorporate',
  'formation',
  'operating agreement',
  'bylaws',
  'registered agent',
  'articles of',
  'compliance',
  'license',
  'permit',
  'trademark',
  'copyright',
  'patent',
  'contract',
  'liability',
  'sue',
  'lawsuit',
  'legal structure',
  'business entity',
  'sole proprietorship',
  'partnership',
  's-corp',
  'c-corp',
  'ein',
  'employer identification',
]

/**
 * Keywords that indicate financial topics
 */
const FINANCIAL_KEYWORDS = [
  'funding',
  'investment',
  'investor',
  'venture capital',
  'angel investor',
  'loan',
  'financing',
  'budget',
  'revenue',
  'profit',
  'cash flow',
  'financial projection',
  'accounting',
  'bookkeeping',
  'balance sheet',
  'income statement',
  'business bank',
  'credit',
  'capital',
]

/**
 * Keywords that indicate tax topics
 */
const TAX_KEYWORDS = [
  'tax',
  'deduction',
  'write-off',
  'irs',
  'quarterly',
  'estimated tax',
  'self-employment tax',
  'payroll tax',
  'sales tax',
  'income tax',
  'tax return',
  'tax filing',
  'tax strategy',
  'tax obligation',
]

/**
 * Keywords that indicate investment topics
 */
const INVESTMENT_KEYWORDS = [
  'invest',
  'stock',
  'equity',
  'valuation',
  'shares',
  'dividend',
  'return on investment',
  'roi',
  'portfolio',
  'securities',
]

/**
 * Detect the primary topic category from user query and response content
 */
export function detectTopicCategory(
  userQuery: string,
  responseContent: string
): DisclaimerType | null {
  const combinedText = `${userQuery} ${responseContent}`.toLowerCase()

  // Check for specific topics in order of priority
  // Tax is checked before financial since tax is a subset of financial topics
  const hasTaxKeywords = TAX_KEYWORDS.some((keyword) => combinedText.includes(keyword))
  if (hasTaxKeywords) {
    return 'tax'
  }

  const hasInvestmentKeywords = INVESTMENT_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword)
  )
  if (hasInvestmentKeywords) {
    return 'investment'
  }

  const hasLegalKeywords = LEGAL_KEYWORDS.some((keyword) => combinedText.includes(keyword))
  if (hasLegalKeywords) {
    return 'legal'
  }

  const hasFinancialKeywords = FINANCIAL_KEYWORDS.some((keyword) => combinedText.includes(keyword))
  if (hasFinancialKeywords) {
    return 'financial'
  }

  return null
}

/**
 * Determine disclaimer type based on agent type
 */
export function getDisclaimerForAgent(agentType: string): DisclaimerType {
  switch (agentType) {
    case 'legal':
      return 'legal'
    case 'financial':
      return 'financial'
    default:
      return 'general'
  }
}

/**
 * Append appropriate disclaimer to response content
 *
 * @param content - The AI response content
 * @param agentType - The agent that generated the response (legal, financial, tasks, etc.)
 * @param userQuery - The original user query (used for topic detection)
 * @returns The content with an appropriate disclaimer appended
 */
export function appendDisclaimer(content: string, agentType?: string, userQuery?: string): string {
  // Don't add disclaimer if content already has one
  if (content.includes('**Disclaimer:**') || content.includes('Disclaimer:')) {
    return content
  }

  // First, try to detect topic from content
  let disclaimerType: DisclaimerType | null = null

  if (userQuery) {
    disclaimerType = detectTopicCategory(userQuery, content)
  }

  // If no topic detected, use agent type to determine disclaimer
  if (!disclaimerType && agentType) {
    if (agentType === 'legal' || agentType === 'financial') {
      disclaimerType = getDisclaimerForAgent(agentType)
    }
  }

  // If still no disclaimer needed, return original content
  if (!disclaimerType) {
    return content
  }

  return content + DISCLAIMERS[disclaimerType]
}

/**
 * Check if a response should have a disclaimer based on content analysis
 */
export function shouldAddDisclaimer(content: string, agentType?: string): boolean {
  // Tasks agent typically doesn't need disclaimers unless discussing legal/financial tasks
  if (agentType === 'tasks') {
    const topicType = detectTopicCategory('', content)
    return topicType !== null
  }

  // Legal and financial agents always need disclaimers
  if (agentType === 'legal' || agentType === 'financial') {
    return true
  }

  // For general/unknown agents, check content
  const topicType = detectTopicCategory('', content)
  return topicType !== null
}
