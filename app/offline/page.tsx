'use client'

import StatusBar from '../components/status-bar'

export default function OfflinePage() {
  return (
    <div className="flex flex-col flex-1 bg-surface">
      <StatusBar variant="dark" />
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
          <span className="text-3xl" aria-hidden>
            📶
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          No internet connection
        </h1>
        <p className="text-base text-muted mb-8 max-w-xs">
          Please check your connection and try again. Your information is safe.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full max-w-xs h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:opacity-80 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
