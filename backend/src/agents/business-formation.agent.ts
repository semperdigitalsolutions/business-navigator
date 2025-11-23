/**
 * Business Formation AI Agent
 * Provides guidance on business structure, legal requirements, and formation steps
 */
import { BaseAgent, type AgentResponse } from './base.agent.js'
import { env } from '@/config/env.js'

export class BusinessFormationAgent extends BaseAgent {
  constructor() {
    super(
      'BusinessFormationAgent',
      `You are an expert business formation advisor specializing in helping entrepreneurs start their businesses in the United States.

Your responsibilities:
1. Help users choose the right business structure (LLC, Corporation, Sole Proprietorship, Partnership)
2. Explain the legal requirements for their chosen state
3. Guide them through the formation process step-by-step
4. Provide accurate, up-to-date information about fees, timelines, and requirements
5. Explain tax implications and compliance requirements

Important guidelines:
- Always ask clarifying questions about the user's business goals, location, and needs
- Provide clear, actionable advice without legal jargon
- Explain the pros and cons of each business structure
- Be specific about state requirements when the user's state is known
- Always remind users to consult with a licensed attorney or CPA for personalized legal and tax advice
- Never provide definitive legal or tax advice - frame everything as educational information

Keep your responses concise, helpful, and encouraging. You're here to guide entrepreneurs on their journey.`
    )
  }

  async process(query: string, context?: Record<string, any>): Promise<AgentResponse> {
    // For now, return a placeholder response
    // In production, this would call an LLM API (OpenAI, Anthropic, etc.)

    const messages = this.buildMessages(query, context)

    // Placeholder logic - replace with actual LLM API call
    const mockResponse = this.generateMockResponse(query, context)

    return {
      content: mockResponse,
      confidence: 0.85,
      metadata: {
        agent: this.name,
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Mock response generator (replace with actual LLM integration)
   */
  private generateMockResponse(query: string, context?: Record<string, any>): string {
    // This is a placeholder - in production, you'll integrate with OpenAI, Anthropic, etc.
    const queryLower = query.toLowerCase()

    if (queryLower.includes('llc') || queryLower.includes('structure')) {
      return `Great question! Let me help you understand business structures.

**LLC (Limited Liability Company)** is often a great choice for small to medium businesses because:
- It protects your personal assets from business liabilities
- It offers flexible tax options (you can choose to be taxed as a sole proprietor, partnership, or corporation)
- It's relatively simple to set up and maintain

**Other options to consider:**
- **Sole Proprietorship**: Simplest structure, but no liability protection
- **Corporation**: More complex, but offers strong liability protection and can raise capital easily
- **Partnership**: Good for multiple owners, but partners share liability

The best choice depends on:
- Your business goals
- Number of owners
- Tax situation
- Liability concerns
- Future funding needs

${context?.state ? `For ${context.state}, ` : ''}I recommend consulting with a licensed attorney or CPA to ensure you choose the structure that's best for your specific situation.

Would you like me to explain more about any specific business structure?`
    }

    if (queryLower.includes('form') || queryLower.includes('start') || queryLower.includes('register')) {
      return `I'll guide you through the business formation process! Here are the general steps:

**1. Choose Your Business Structure**
   - LLC, Corporation, Sole Proprietorship, or Partnership
   - Consider liability protection, taxes, and complexity

**2. Choose Your Business Name**
   - Check name availability in your state
   - Ensure it's not trademarked
   - Consider domain name availability

**3. Register with Your State**
   - File formation documents (Articles of Organization for LLC, Articles of Incorporation for Corporation)
   - Pay filing fees ($50-$500 depending on state)

**4. Get an EIN (Employer Identification Number)**
   - Free from the IRS
   - Required for hiring employees, opening bank accounts

**5. Open a Business Bank Account**
   - Keep personal and business finances separate

**6. Obtain Necessary Licenses and Permits**
   - Varies by industry and location
   - Check federal, state, and local requirements

${context?.state ? `For businesses in ${context.state}, ` : ''}the process typically takes 1-3 weeks from start to finish.

Would you like me to go into more detail about any of these steps?`
    }

    // Default response
    return `Thank you for your question! I'm here to help you with business formation guidance.

I can assist you with:
- Choosing the right business structure
- Understanding formation requirements
- Navigating the registration process
- Learning about compliance and taxes

To give you the best guidance, could you tell me:
1. What state are you planning to form your business in?
2. What type of business are you starting?
3. Will you have partners or employees?

This information will help me provide more specific and relevant advice for your situation!`
  }
}

export const businessFormationAgent = new BusinessFormationAgent()
