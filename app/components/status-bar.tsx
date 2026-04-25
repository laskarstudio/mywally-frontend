interface StatusBarProps {
  variant?: 'light' | 'dark'
}

export default function StatusBar({ variant = 'dark' }: StatusBarProps) {
  const color = variant === 'light' ? 'text-white' : 'text-foreground'

  return (
    <div className={`flex items-center justify-between px-5 h-11 ${color}`}>
      <span className="text-[15px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" />
          <rect x="9" y="3" width="3" height="9" rx="0.5" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <circle cx="8" cy="11" r="1.2" />
          <path d="M5.1 8.1a4 4 0 0 1 5.8 0l1.1-1.1a5.5 5.5 0 0 0-8 0l1.1 1.1z" />
          <path d="M2.5 5.5a7.5 7.5 0 0 1 11 0l1.1-1.1A9 9 0 0 0 1.4 4.4l1.1 1.1z" />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35" />
          <rect x="21" y="4" width="2.5" height="4" rx="1" opacity="0.4" />
          <rect x="2" y="2" width="15" height="8" rx="2" />
        </svg>
      </div>
    </div>
  )
}
