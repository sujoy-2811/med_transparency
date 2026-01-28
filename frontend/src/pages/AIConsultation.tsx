import { useState, useRef, useEffect } from 'react'
import { Send, Stethoscope, AlertCircle, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBubble } from '../components/ai/ChatBubble'
import { StethoscopeAvatar } from '../components/ai/StethoscopeAvatar'
import { ToolCallCard } from '../components/ai/ToolCallCard'
import { Button } from '../components/ui/Button'
import type { AgentItem, ToolCallState } from '../types'

// ── Types ──────────────────────────────────────────────────────────────────────
type ApiMessage = { role: 'user' | 'assistant'; content: string }

// ── Constants ──────────────────────────────────────────────────────────────────
const WELCOME = "Hello! I'm **MedGuide**, your AI healthcare cost advisor — powered by real crowdsourced patient data.\n\nI can look up actual procedure costs, compare hospitals across 8 countries, and pull real patient testimonies from our database.\n\nWhat procedure are you considering, and what's your approximate budget?"

const SUGGESTED_PROMPTS = [
  "I need a hip replacement and have a $12,000 budget. Where should I go?",
  "Compare LASIK eye surgery costs across all regions",
  "Find the best-rated hospitals for knee replacement in Thailand",
  "What do real patients say about IVF treatment in Spain?",
]

// ── SSE parser ─────────────────────────────────────────────────────────────────
function parseSSEBuffer(buffer: string) {
  const events: Array<{ event: string; data: string }> = []
  const parts = buffer.split('\n\n')
  const remaining = parts.pop() ?? ''

  for (const part of parts) {
    if (!part.trim()) continue
    let event = 'message'
    let data = ''
    for (const line of part.split('\n')) {
      if (line.startsWith('event: ')) event = line.slice(7).trim()
      else if (line.startsWith('data: ')) data = line.slice(6).trim()
    }
    if (data) events.push({ event, data })
  }
  return { remaining, events }
}

// ── Loading dots ───────────────────────────────────────────────────────────────
function ThinkingDots({ label }: { label: string }) {
  return (
    <div className="flex gap-3">
      <StethoscopeAvatar size="sm" />
      <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-[#5FA8D3] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <span className="text-xs text-[#9CA3AF]">{label}</span>
      </div>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────
export function AIConsultation() {
  const [items, setItems] = useState<AgentItem[]>([
    { kind: 'chat', role: 'assistant', content: WELCOME },
  ])
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([])
  const [pendingTools, setPendingTools] = useState<ToolCallState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toolsDone, setToolsDone] = useState(false)   // all tools finished, waiting for answer
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items, pendingTools, isLoading])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return
    setError('')

    const userMsg: ApiMessage = { role: 'user', content: content.trim() }
    const nextHistory = [...apiHistory, userMsg]

    setApiHistory(nextHistory)
    setItems(prev => [...prev, { kind: 'chat', role: 'user', content: content.trim() }])
    setInput('')
    setIsLoading(true)
    setToolsDone(false)
    setPendingTools([])

    let liveTools: ToolCallState[] = []

    try {
      const response = await fetch('/api/v1/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextHistory }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const { remaining, events } = parseSSEBuffer(buffer)
        buffer = remaining

        for (const { event, data } of events) {
          let parsed: Record<string, unknown>
          try { parsed = JSON.parse(data) } catch { continue }

          if (event === 'tool_start') {
            const newTool: ToolCallState = {
              id: parsed.id as string,
              name: parsed.name as string,
              args: (parsed.args as Record<string, unknown>) ?? {},
              result: null,
              status: 'running',
            }
            liveTools = [...liveTools, newTool]
            setPendingTools([...liveTools])
          }

          else if (event === 'tool_result') {
            liveTools = liveTools.map(t =>
              t.id === parsed.id
                ? { ...t, result: parsed.result, status: 'done' as const }
                : t
            )
            setPendingTools([...liveTools])
            // Check if all tools are now done
            if (liveTools.every(t => t.status === 'done')) {
              setToolsDone(true)
            }
          }

          else if (event === 'answer') {
            const answerText = (parsed.content as string) ?? ''
            // Commit frozen tool group if tools were called
            if (liveTools.length > 0) {
              setItems(prev => [...prev, { kind: 'tools', calls: [...liveTools] }])
              setPendingTools([])
            }
            setItems(prev => [...prev, { kind: 'chat', role: 'assistant', content: answerText }])
            setApiHistory(prev => [...prev, { role: 'assistant', content: answerText }])
          }

          else if (event === 'done') {
            setIsLoading(false)
            setToolsDone(false)
            setPendingTools([])
          }
        }
      }
    } catch {
      setError('Failed to reach the agent. Make sure the backend is running and OPENROUTER_API_KEY is set.')
      setIsLoading(false)
      setToolsDone(false)
      setPendingTools([])
    }
  }

  const showSuggestions = items.length <= 1 && !isLoading

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="w-14 h-14 bg-[#1B4965] rounded-full flex items-center justify-center mx-auto mb-3">
          <Stethoscope className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-heading font-extrabold text-[#1B4965] text-2xl">AI Healthcare Advisor</h1>
        <p className="text-[#6B7280] mt-1 text-sm">
          Powered by real crowdsourced patient data — not generic internet advice
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2 mb-5">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700" style={{ fontFamily: 'Lora, serif' }}>
          MedGuide provides general information only. Always consult a qualified medical professional before making healthcare decisions.
        </p>
      </div>

      {/* Chat window */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm mb-4">
        <div className="h-[520px] overflow-y-auto p-5 space-y-4">

          {/* Committed items */}
          {items.map((item, i) =>
            item.kind === 'chat' ? (
              <ChatBubble key={i} message={{ role: item.role, content: item.content }} />
            ) : (
              <ToolGroup key={i} calls={item.calls} />
            )
          )}

          {/* Live tool cards */}
          <AnimatePresence>
            {pendingTools.length > 0 && (
              <motion.div
                key="pending-tools"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ToolGroup calls={pendingTools} live />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading dots — initial thinking */}
          {isLoading && pendingTools.length === 0 && !toolsDone && (
            <ThinkingDots label="Analysing your question…" />
          )}

          {/* Loading dots — after all tools done, waiting for final answer */}
          {isLoading && toolsDone && pendingTools.length === 0 && (
            <ThinkingDots label="Composing answer…" />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-[#E5E7EB] p-3">
          {error && <p className="text-xs text-red-500 mb-2 px-1">{error}</p>}
          <div className="flex gap-2">
            <textarea
              rows={2}
              className="flex-1 resize-none border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]/30 focus:border-[#1B4965]"
              placeholder="Describe your situation, procedure, and budget..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              disabled={isLoading}
            />
            <Button
              size="md"
              className="self-end"
              onClick={() => sendMessage(input)}
              loading={isLoading}
              icon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xs font-heading font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
              Try asking
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p)}
                  className="text-left px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1B4965] hover:border-[#1B4965]/40 hover:bg-[#F8F9FA] transition-all"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tool group ─────────────────────────────────────────────────────────────────
function ToolGroup({ calls, live }: { calls: ToolCallState[]; live?: boolean }) {
  return (
    <div className="space-y-2 pl-11">
      <p className="text-[10px] font-heading font-semibold text-[#9CA3AF] uppercase tracking-widest flex items-center gap-1">
        <Bot className="w-3 h-3" />
        {live ? 'Agent is working…' : 'Agent retrieved'}
      </p>
      {calls.map(call => (
        <ToolCallCard key={call.id} call={call} />
      ))}
    </div>
  )
}
