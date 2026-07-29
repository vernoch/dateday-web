import type { ReactNode } from 'react'

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <button className="absolute inset-0 cursor-default" aria-label="Zavřít" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] bg-white p-5 shadow-xl sm:rounded-[1.75rem]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-chip px-3 py-1.5 text-sm font-medium text-muted"
          >
            Zavřít
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
