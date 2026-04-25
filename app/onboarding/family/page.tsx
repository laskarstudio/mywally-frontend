'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAddFamilyMember, useCompleteOnboarding } from '@/app/lib/hooks/useOnboarding'

type Step =
  | 'ask_family'
  | 'ask_phone'
  | 'ask_relation'
  | 'ask_consent'
  | 'done_added'
  | 'done_skipped'

type Message = {
  id: string
  variant: 'bot' | 'user'
  text: string
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function WallyAvatar() {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface">
      <Image src="/assets/my-wally-chat-profile.png" alt="Wally" width={40} height={40} />
    </div>
  )
}

export default function FamilyPage() {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const { mutate: addFamilyMember } = useAddFamilyMember()
  const { mutate: completeOnboarding } = useCompleteOnboarding()

  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('ask_family')
  const [isTyping, setIsTyping] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [selectedRelation, setSelectedRelation] = useState('')

  const addMsg = useCallback((variant: 'bot' | 'user', text: string) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, variant, text }])
  }, [])

  const addBotMsg = useCallback((text: string) => addMsg('bot', text), [addMsg])

  useEffect(() => {
    const t = setTimeout(() => addBotMsg('Do you want to add your family members to help you?'), 400)
    return () => clearTimeout(t)
  }, [addBotMsg])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function botReply(text: string, nextStep: Step, delay = 900) {
    setIsTyping(true)
    setTimeout(() => { setIsTyping(false); addBotMsg(text); setStep(nextStep) }, delay)
  }

  function handleYes() {
    addMsg('user', 'Yes')
    botReply('What is their phone number?', 'ask_phone')
  }
  function handleNo() {
    addMsg('user', 'No')
    botReply("No problem. You can add family members later from your profile.", 'done_skipped')
  }
  function handlePhoneSubmit() {
    const phone = phoneInput.trim()
    if (!phone) return
    addMsg('user', phone)
    botReply('What is your relationship with them?', 'ask_relation')
  }
  function handleRelation(rel: string) {
    setSelectedRelation(rel)
    addMsg('user', rel)
    botReply('Do you consent to share your data with them?', 'ask_consent')
  }
  function handleAgree() {
    addMsg('user', 'I agree')
    botReply('Alright! We have sent an invitation to them ✅', 'done_added')
  }
  function handleDisagree() {
    addMsg('user', "I don't agree")
    botReply('No problem. You can update this later from your profile.', 'done_skipped')
  }
  function handleProceed() {
    const finish = () => {
      completeOnboarding(undefined, { onSuccess: () => router.push('/dashboard') })
    }
    if (selectedRelation && phoneInput) {
      addFamilyMember({ phone: phoneInput, relationship: selectedRelation }, { onSuccess: finish })
    } else {
      finish()
    }
  }

  const isDone = step === 'done_added' || step === 'done_skipped'

  return (
    <div className="flex flex-col flex-1 bg-surface">

      {/* Scrollable chat area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.variant === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}>
            {msg.variant === 'bot' && <WallyAvatar />}
            <div
              className={
                msg.variant === 'bot'
                  ? 'bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[80%]'
                  : 'bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[70%]'
              }
            >
              <p className={`text-sm leading-relaxed font-medium ${msg.variant === 'user' ? 'text-white' : 'text-foreground'}`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5">
            <WallyAvatar />
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-muted animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {/* Step-specific UI */}
        {!isTyping && step === 'ask_family' && messages.length > 0 && (
          <div className="flex justify-end gap-2">
            <button onClick={handleYes} className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold active:bg-primary-dark">Yes</button>
            <button onClick={handleNo} className="px-6 py-2.5 rounded-full border-2 border-primary text-primary text-sm font-semibold bg-white">No</button>
          </div>
        )}

        {!isTyping && step === 'ask_relation' && (
          <div className="flex flex-wrap gap-2 pl-12">
            {['Children', 'Sibling', 'Spouse', 'Other'].map(rel => (
              <button key={rel} onClick={() => handleRelation(rel)} className="px-5 py-2 rounded-full border border-border bg-white text-foreground text-sm font-medium active:bg-surface">
                {rel}
              </button>
            ))}
          </div>
        )}

        {!isTyping && step === 'ask_consent' && (
          <div className="pl-12">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-sm text-foreground font-medium leading-relaxed">
                I agree to share selected financial data with this person.
              </p>
              <button onClick={handleAgree} className="w-full h-11 rounded-xl bg-success text-white font-semibold text-sm">
                I agree
              </button>
              <button onClick={handleDisagree} className="w-full h-11 rounded-xl bg-danger text-white font-semibold text-sm">
                I don&apos;t agree
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom action area */}
      <div className="bg-white border-t border-border p-4 flex-shrink-0">
        {isDone ? (
          <button onClick={handleProceed} className="w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:bg-primary-dark transition-colors">
            Proceed to Dashboard
          </button>
        ) : step === 'ask_phone' && !isTyping ? (
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
              placeholder="e.g. 012-234 5678"
              autoFocus
              className="flex-1 border border-primary rounded-full px-4 py-2.5 text-sm bg-white outline-none"
            />
            <button onClick={handlePhoneSubmit} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 active:bg-primary-dark">
              <SendIcon />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              disabled
              className="flex-1 border border-border rounded-full px-4 py-2.5 text-sm bg-surface text-muted cursor-not-allowed outline-none"
            />
            <button disabled className="w-10 h-10 rounded-full bg-primary/30 text-white flex items-center justify-center flex-shrink-0 cursor-not-allowed">
              <SendIcon />
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
