interface StatusBarProps {
  variant?: 'light' | 'dark'
}

// Reserves space for the iOS PWA status bar (overlay mode via
// `apple-mobile-web-app-status-bar-style: black-translucent`).
// The parent container's background color tints behind the system bar.
export default function StatusBar(_props: StatusBarProps) {
  return <div className="h-[env(safe-area-inset-top)] flex-shrink-0" />
}
