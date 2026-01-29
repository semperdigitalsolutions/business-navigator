import { useState } from 'react'

export interface ProfileData {
  displayName: string
  email: string
  startupName: string
  missionStatement: string
  avatarUrl?: string
}

export interface ProfileFormProps {
  initialData: ProfileData
  onChange?: (data: ProfileData) => void
}

export function ProfileForm({ initialData, onChange }: ProfileFormProps) {
  const [data, setData] = useState(initialData)

  const handleChange = (field: keyof ProfileData, value: string) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    onChange?.(newData)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Profile & Branding</h3>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        How you and your startup appear in the workspace.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-600">
            {data.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Change Photo
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                value={data.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Startup Name
            </label>
            <input
              type="text"
              value={data.startupName}
              onChange={(e) => handleChange('startupName', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Mission Statement (Context for AI)
            </label>
            <textarea
              value={data.missionStatement}
              onChange={(e) => handleChange('missionStatement', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              placeholder="Describe your startup's mission..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
