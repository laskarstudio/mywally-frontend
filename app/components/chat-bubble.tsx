interface ChatBubbleProps {
  variant: 'bot' | 'user'
  message: string
  time?: string
  isTyping?: boolean
}

export default function ChatBubble({ variant, message, time, isTyping }: ChatBubbleProps) {
  if (variant === 'bot') {
    return (
      <div className="flex items-end gap-2.5 max-w-[82%]">
        {/* Wally avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mb-4">
          <span className="text-white text-xs font-bold">W</span>
        </div>
        <div>
          <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-border">
            {isTyping ? (
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce" />
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{message}</p>
            )}
          </div>
          {time && <p className="text-xs text-muted mt-1 ml-1">{time}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end self-end max-w-[82%] ml-auto">
      <div className="bg-primary rounded-2xl rounded-br-sm px-4 py-3">
        <p className="text-sm text-white leading-relaxed">{message}</p>
      </div>
      {time && <p className="text-xs text-muted mt-1 mr-1">{time}</p>}
    </div>
  )
}
