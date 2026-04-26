'use client'

import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiFetch } from '../client'
import { ChatResponseSchema } from '../types'
import type { ChatAction } from '../types'

export type ChatMessage = {
  id:      string
  role:    'user' | 'assistant'
  text:    string
  actions: ChatAction[]
}

type HistoryEntry = { role: 'user' | 'assistant'; content: string }

export function useChat() {
  const qc     = useQueryClient()
  const router = useRouter()

  const [messages,   setMessages]   = useState<ChatMessage[]>([])
  const [isLoading,  setIsLoading]  = useState(false)
  const [llmOffline, setLlmOffline] = useState(false)

  // Kept as ref-style via state so sendMessage closure always has latest history
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id:      `u-${Date.now()}`,
      role:    'user',
      text:    text.trim(),
      actions: [],
    }

    // Optimistic append
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    const outgoingHistory: HistoryEntry[] = [
      ...history,
      { role: 'user' as const, content: text.trim() },
    ]

    try {
      const raw = await apiFetch<unknown>('/me/chat/messages', {
        method:  'POST',
        body:    JSON.stringify({ text: text.trim(), history }),
        timeout: 60_000,
      })

      const res = ChatResponseSchema.parse(raw)

      if (res.llm && !res.llm.configured) setLlmOffline(true)
      else setLlmOffline(false)

      const assistantMsg: ChatMessage = {
        id:      `a-${Date.now()}`,
        role:    'assistant',
        text:    res.reply.text,
        actions: res.actions ?? [],
      }

      setMessages(prev => [...prev, assistantMsg])

      // Update history (keep last 20 turns = 40 entries)
      const newHistory: HistoryEntry[] = [
        ...outgoingHistory,
        { role: 'assistant' as const, content: res.reply.text },
      ].slice(-40)
      setHistory(newHistory)

      // Handle UI hints
      for (const hint of res.ui ?? []) {
        if (hint.kind === 'toast') {
          const level = (hint.level ?? 'info') as 'success' | 'error' | 'info' | 'warning'
          if (toast[level]) toast[level](hint.message)
          else toast(hint.message)
        } else if (hint.kind === 'refresh') {
          const key = hint.resource.replace(/^\//, '').split('/')
          qc.invalidateQueries({ queryKey: key })
        } else if (hint.kind === 'navigate') {
          router.push(hint.to)
        }
      }
    } catch (err) {
      console.error('[useChat] error:', err)
      setMessages(prev => [...prev, {
        id:      `err-${Date.now()}`,
        role:    'assistant',
        text:    'Sorry, I ran into a problem. Please try again.',
        actions: [],
      }])
    } finally {
      setIsLoading(false)
    }
  }, [history, isLoading, qc, router])

  const reset = useCallback(() => {
    setMessages([])
    setHistory([])
    setLlmOffline(false)
  }, [])

  return { messages, sendMessage, isLoading, llmOffline, reset }
}
