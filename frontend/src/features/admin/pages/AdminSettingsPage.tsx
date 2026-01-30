/**
 * Admin Site Settings Page
 * Allows administrators to configure site-wide settings
 * Epic 9: Admin functionality
 */
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/catalyst-ui-kit/typescript/button'
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from '@/components/catalyst-ui-kit/typescript/fieldset'
import { Input } from '@/components/catalyst-ui-kit/typescript/input'
import { Switch, SwitchField } from '@/components/catalyst-ui-kit/typescript/switch'
import { apiClient } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'

// Setting types
type SettingType = 'string' | 'number' | 'boolean' | 'json'

interface SiteSetting {
  key: string
  value: string | number | boolean | object
  type: SettingType
  label: string
  description: string
  category: string
  defaultValue: string | number | boolean | object
}

interface SettingCategory {
  name: string
  description: string
  settings: SiteSetting[]
}

// Default settings configuration
const DEFAULT_SETTINGS: SiteSetting[] = [
  // General settings
  {
    key: 'site_name',
    value: 'Business Navigator',
    type: 'string',
    label: 'Site Name',
    description: 'The name of the application displayed throughout the site',
    category: 'General',
    defaultValue: 'Business Navigator',
  },
  {
    key: 'support_email',
    value: 'support@businessnavigator.com',
    type: 'string',
    label: 'Support Email',
    description: 'Email address for user support inquiries',
    category: 'General',
    defaultValue: 'support@businessnavigator.com',
  },
  {
    key: 'maintenance_mode',
    value: false,
    type: 'boolean',
    label: 'Maintenance Mode',
    description: 'Enable to show maintenance page to non-admin users',
    category: 'General',
    defaultValue: false,
  },
  // Credits settings
  {
    key: 'default_starting_credits',
    value: 100,
    type: 'number',
    label: 'Default Starting Credits',
    description: 'Number of credits new users receive upon registration',
    category: 'Credits',
    defaultValue: 100,
  },
  {
    key: 'trial_period_days',
    value: 14,
    type: 'number',
    label: 'Trial Period (Days)',
    description: 'Number of days for the free trial period',
    category: 'Credits',
    defaultValue: 14,
  },
  // Limits settings
  {
    key: 'max_requests_per_minute',
    value: 60,
    type: 'number',
    label: 'Max Requests Per Minute',
    description: 'Rate limit for API requests per user per minute',
    category: 'Limits',
    defaultValue: 60,
  },
  {
    key: 'max_tokens_per_request',
    value: 4096,
    type: 'number',
    label: 'Max Tokens Per Request',
    description: 'Maximum number of tokens allowed per AI request',
    category: 'Limits',
    defaultValue: 4096,
  },
]

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SettingInput({
  setting,
  value,
  onChange,
  onBlur,
  error,
}: {
  setting: SiteSetting
  value: string | number | boolean | object
  onChange: (key: string, value: string | number | boolean | object) => void
  onBlur: (key: string) => void
  error?: string
}) {
  const handleChange = useCallback(
    (newValue: string | number | boolean) => {
      onChange(setting.key, newValue)
    },
    [onChange, setting.key]
  )

  const handleBlur = useCallback(() => {
    onBlur(setting.key)
  }, [onBlur, setting.key])

  if (setting.type === 'boolean') {
    return (
      <SwitchField>
        <Label>{setting.label}</Label>
        <Description>{setting.description}</Description>
        <Switch
          color="indigo"
          checked={value as boolean}
          onChange={(checked) => {
            handleChange(checked)
            // Auto-save on toggle
            onBlur(setting.key)
          }}
        />
      </SwitchField>
    )
  }

  if (setting.type === 'number') {
    return (
      <Field>
        <Label>{setting.label}</Label>
        <Input
          type="number"
          value={value as number}
          onChange={(e) => handleChange(Number(e.target.value))}
          onBlur={handleBlur}
          min={0}
        />
        <Description>{setting.description}</Description>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </Field>
    )
  }

  // Default to string input
  return (
    <Field>
      <Label>{setting.label}</Label>
      <Input
        type={setting.key.includes('email') ? 'email' : 'text'}
        value={value as string}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
      />
      <Description>{setting.description}</Description>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </Field>
  )
}

function SettingCategory({
  category,
  onSettingChange,
  onSettingBlur,
  onResetToDefault,
  errors,
}: {
  category: SettingCategory
  onSettingChange: (key: string, value: string | number | boolean | object) => void
  onSettingBlur: (key: string) => void
  onResetToDefault: (key: string) => void
  errors: Record<string, string>
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <Fieldset>
        <Legend>{category.name}</Legend>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{category.description}</p>

        <FieldGroup className="mt-6">
          {category.settings.map((setting) => (
            <div key={setting.key} className="flex items-start gap-4">
              <div className="flex-1">
                <SettingInput
                  setting={setting}
                  value={setting.value}
                  onChange={onSettingChange}
                  onBlur={onSettingBlur}
                  error={errors[setting.key]}
                />
              </div>
              <Button
                plain
                className="mt-6 shrink-0"
                onClick={() => onResetToDefault(setting.key)}
                title="Reset to default"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </Button>
            </div>
          ))}
        </FieldGroup>
      </Fieldset>
    </div>
  )
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/api/admin/settings')
        if (response && typeof response === 'object' && 'settings' in response) {
          const fetchedSettings = response.settings as Array<{
            key: string
            value: string | number | boolean | object
          }>
          // Merge fetched settings with defaults
          setSettings((prev) =>
            prev.map((setting) => {
              const fetched = fetchedSettings.find((s) => s.key === setting.key)
              return fetched ? { ...setting, value: fetched.value } : setting
            })
          )
        }
      } catch {
        // Use default settings if fetch fails
        toast.warning('Could not load settings from server, using defaults')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Validate a setting value
  const validateSetting = useCallback((setting: SiteSetting): string | null => {
    if (setting.type === 'string' && setting.key.includes('email')) {
      if (!EMAIL_REGEX.test(setting.value as string)) {
        return 'Please enter a valid email address'
      }
    }

    if (setting.type === 'number') {
      const numValue = setting.value as number
      if (isNaN(numValue) || numValue < 0) {
        return 'Please enter a valid positive number'
      }
    }

    return null
  }, [])

  // Handle setting change
  const handleSettingChange = useCallback(
    (key: string, value: string | number | boolean | object) => {
      setSettings((prev) =>
        prev.map((setting) => (setting.key === key ? { ...setting, value } : setting))
      )
      // Clear error when user starts typing
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    },
    []
  )

  // Save setting on blur
  const handleSettingBlur = useCallback(
    async (key: string) => {
      const setting = settings.find((s) => s.key === key)
      if (!setting) return

      // Validate
      const error = validateSetting(setting)
      if (error) {
        setErrors((prev) => ({ ...prev, [key]: error }))
        return
      }

      // Save to API
      setIsSaving(key)
      try {
        await apiClient.patch(`/api/admin/settings/${key}`, { value: setting.value })
        toast.success(`${setting.label} saved successfully`)
      } catch {
        toast.error(`Failed to save ${setting.label}`)
      } finally {
        setIsSaving(null)
      }
    },
    [settings, validateSetting]
  )

  // Reset setting to default
  const handleResetToDefault = useCallback(
    async (key: string) => {
      const setting = settings.find((s) => s.key === key)
      if (!setting) return

      setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value: s.defaultValue } : s)))

      // Save default to API
      setIsSaving(key)
      try {
        await apiClient.patch(`/api/admin/settings/${key}`, { value: setting.defaultValue })
        toast.success(`${setting.label} reset to default`)
      } catch {
        toast.error(`Failed to reset ${setting.label}`)
      } finally {
        setIsSaving(null)
      }
    },
    [settings]
  )

  // Group settings by category
  const categories: SettingCategory[] = [
    {
      name: 'General',
      description: 'Basic site configuration options',
      settings: settings.filter((s) => s.category === 'General'),
    },
    {
      name: 'Credits',
      description: 'User credit and trial settings',
      settings: settings.filter((s) => s.category === 'Credits'),
    },
    {
      name: 'Limits',
      description: 'Rate limiting and usage caps',
      settings: settings.filter((s) => s.category === 'Limits'),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Site Settings</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Configure site-wide settings. Changes are saved automatically on blur.
        </p>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Saving...
        </div>
      )}

      {/* Settings Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          <SettingCategory
            key={category.name}
            category={category}
            onSettingChange={handleSettingChange}
            onSettingBlur={handleSettingBlur}
            onResetToDefault={handleResetToDefault}
            errors={errors}
          />
        ))}
      </div>
    </div>
  )
}
