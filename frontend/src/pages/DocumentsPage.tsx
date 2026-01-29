import { useState } from 'react'
import { AppShell, LeftSidebar } from '@/components/layout'
import { Icon } from '@/components/ui/Icon'
import { DocumentCard } from '@/features/documents/components/DocumentCard'
import { UploadedFileRow } from '@/features/documents/components/UploadedFileRow'
import { DataRoomPanel } from '@/features/documents/components/DataRoomPanel'

const FILTER_TABS = ['All', 'Legal', 'Finance', 'Assets'] as const
type FilterTab = (typeof FILTER_TABS)[number]

const AI_DOCUMENTS = [
  {
    id: '1',
    title: 'Articles of Incorporation',
    subtitle: 'Delaware C-Corp Structure • v2.0',
    icon: 'description',
    status: 'finalized' as const,
  },
  {
    id: '2',
    title: 'Seed Pitch Deck',
    subtitle: '12 Slides • Last edited 2h ago',
    icon: 'slideshow',
    status: 'draft' as const,
  },
  {
    id: '3',
    title: 'Financial Projections',
    subtitle: '3-Year Operating Model • Excel',
    icon: 'table_chart',
    status: 'template' as const,
  },
]

const UPLOADED_FILES = [
  { filename: 'Competitor Analysis Report.pdf', fileSize: '2.4 MB', uploadDate: 'yesterday' },
  { filename: 'Brand_Logo_Assets_v4.zip', fileSize: '14.8 MB', uploadDate: '3 days ago' },
]

const DATA_ROOM_ITEMS = [
  { label: 'Inc. Documents', completed: true },
  { label: 'IP Assignments', completed: false },
  { label: 'Cap Table', completed: false },
]

const UPCOMING_REQUIREMENTS = [
  { title: 'Term Sheet', subtitle: 'Review Template' },
  { title: 'Advisor Agreement', subtitle: 'Generate Draft' },
]

export function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All')

  return (
    <AppShell
      leftSidebar={<LeftSidebar userName="Erica" userPlan="Pro Plan" />}
      rightSidebar={
        <DataRoomPanel
          milestone="Milestone: Seed Round"
          progress={45}
          items={DATA_ROOM_ITEMS}
          upcomingRequirements={UPCOMING_REQUIREMENTS}
          onOpenDataRoom={() => console.warn('Open data room')}
          onScheduleReview={() => console.warn('Schedule review')}
        />
      }
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-100 px-8 py-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-zinc-800">
              <Icon name="psychology" size={18} className="text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Thoughtful Mode
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Document Vault</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Securely manage and generate your business documentation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Icon
                name="search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search files..."
                className="w-48 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-700">
              <Icon name="add" size={18} />
              Upload
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="hide-scrollbar flex-1 overflow-y-auto p-8">
        {/* AI Generated Section */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="auto_awesome" size={18} className="text-primary-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              AI Generated
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_DOCUMENTS.map((doc) => (
              <DocumentCard
                key={doc.id}
                {...doc}
                onOpen={() => console.warn('Open:', doc.id)}
                onEdit={() => console.warn('Edit:', doc.id)}
              />
            ))}
          </div>
        </section>

        {/* Recent Uploads Section */}
        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
            Recent Uploads
          </h2>
          <div className="space-y-3">
            {UPLOADED_FILES.map((file, i) => (
              <UploadedFileRow
                key={i}
                {...file}
                onClick={() => console.warn('Open file:', file.filename)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
