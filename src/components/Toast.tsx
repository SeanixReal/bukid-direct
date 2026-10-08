import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheckBig } from 'lucide-react'
import { useApp } from '../state/AppState'

/* A short confirmation over the bottom of the screen ("Added to your
   basket"). It sits inside the phone, so it is part of the app - unlike the
   presenter toasts, which sit outside the frame. */
export function Toast() {
  const navigate = useNavigate()
  const { toast, dismissToast } = useApp()

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(dismissToast, 2600)
    return () => window.clearTimeout(id)
  }, [toast, dismissToast])

  if (!toast) return null

  return (
    <div
      key={toast.id}
      role="status"
      className="animate-sheet-up absolute inset-x-4 bottom-[112px] z-50 flex items-center gap-3 rounded-pill bg-ink py-2.5 pl-4 pr-2.5 text-on-dark shadow-float"
    >
      <CircleCheckBig size={19} strokeWidth={2.5} className="shrink-0 text-secondary" />
      <span className="min-w-0 flex-1 truncate text-[14px] font-bold">{toast.text}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            dismissToast()
            navigate(toast.action!.to)
          }}
          className="tappable shrink-0 rounded-pill bg-on-dark/15 px-3.5 py-1.5 text-[13px] font-extrabold text-on-dark"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}
