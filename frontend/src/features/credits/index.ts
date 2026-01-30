/**
 * Credits Feature - Credit balance tracking and display
 * Issue #212: Epic 9 credit system
 */

// Components
export { CreditBalance } from './components/CreditBalance'
export type { CreditBalanceProps, CreditBalanceVariant } from './components/CreditBalance'
export { CreditDetailsModal } from './components/CreditDetailsModal'
export type { CreditDetailsModalProps } from './components/CreditDetailsModal'
export { getStateColors } from './components/credit-utils'
export type { StateColors } from './components/credit-utils'

// Hooks
export { formatTimeUntilReset, useCreditBalance } from './hooks/useCreditBalance'
export type { UseCreditBalanceResult } from './hooks/useCreditBalance'

// Store
export {
  selectCreditsBalance,
  selectCreditsError,
  selectCreditsLoading,
  selectIsCriticalCredits,
  selectIsLowCredits,
  useCreditsStore,
} from './stores/credits.store'

// API
export { creditsApi } from './api/credits.api'
export type {
  CreditBalance as CreditBalanceData,
  CreditBalanceResponse,
  CreditTransaction,
  CreditTransactionsResponse,
} from './api/credits.api'
