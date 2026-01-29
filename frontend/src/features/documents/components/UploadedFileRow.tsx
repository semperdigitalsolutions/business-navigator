import { Icon } from '@/components/ui/Icon'

export interface UploadedFileRowProps {
  filename: string
  fileSize: string
  uploadDate: string
  onClick?: () => void
}

export function UploadedFileRow({ filename, fileSize, uploadDate, onClick }: UploadedFileRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-700">
        <Icon name="description" size={20} className="text-slate-500" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-white">{filename}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {fileSize} • Uploaded {uploadDate}
        </p>
      </div>
    </button>
  )
}
