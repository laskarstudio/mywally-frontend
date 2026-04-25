interface ConsentCheckItemProps {
  label: string
}

export default function ConsentCheckItem({ label }: ConsentCheckItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </div>
  )
}
