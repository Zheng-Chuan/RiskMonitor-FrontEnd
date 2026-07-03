// store/chat-store.ts

import { create } from 'zustand'
import type { Message } from '../types'

interface ChatState {
  messages: Message[]
  streamingMessageId: string | null
  isStreaming: boolean
  error: string | null

  addMessage: (message: Message) => void
  appendToken: (messageId: string, token: string) => void
  clearMessages: () => void
  setStreaming: (messageId: string | null) => void
  setError: (error: string | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  streamingMessageId: null,
  isStreaming: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  appendToken: (messageId, token) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + token } : m,
      ),
    })),

  clearMessages: () =>
    set({ messages: [], streamingMessageId: null, isStreaming: false, error: null }),

  setStreaming: (messageId) =>
    set({ streamingMessageId: messageId, isStreaming: messageId !== null }),

  setError: (error) => set({ error }),
}))
