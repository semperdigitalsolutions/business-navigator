/**
 * FAQ Section - Common questions about Business Navigator
 */
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What is Business Navigator?',
    answer:
      'Business Navigator is an AI-powered platform that guides first-time founders through launching a US business. It provides specialized AI agents for legal, financial, and operational guidance.',
  },
  {
    question: 'Is this legal advice?',
    answer:
      'No. Business Navigator provides educational guidance and general information about business formation. We always recommend consulting with a licensed attorney or accountant for your specific situation.',
  },
  {
    question: 'What states do you support?',
    answer:
      'We support all 50 US states. Our AI agents are trained on formation requirements, state-specific compliance rules, and filing procedures across the country.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'Business Navigator is free during the beta period. Early adopters will receive special pricing when we launch publicly.',
  },
  {
    question: 'When will the beta launch?',
    answer:
      'We are currently in development and will begin rolling out beta access soon. Join the waitlist to be among the first to get access.',
  },
]

function FAQItemRow({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-zinc-950 dark:text-white">{item.question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && (
        <p className="pb-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.answer}</p>
      )}
    </div>
  )
}

export function FAQSection() {
  return (
    <section className="bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
          Frequently asked questions
        </h2>
        <div className="mt-12">
          {faqs.map((faq) => (
            <FAQItemRow key={faq.question} item={faq} />
          ))}
        </div>
      </div>
    </section>
  )
}
