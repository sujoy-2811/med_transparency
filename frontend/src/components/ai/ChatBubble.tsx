import type { ReactNode } from 'react'
import { StethoscopeAvatar } from './StethoscopeAvatar'
import type { ChatMessage } from '../../types'

interface Props {
  message: ChatMessage
  streaming?: boolean
}

// ── Inline parser: **bold**, *italic* ──────────────────────────────────────────
function parseInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>
    return <span key={i}>{part}</span>
  })
}

// ── Block-level markdown renderer ─────────────────────────────────────────────
function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n')
  const nodes: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip blank lines (spacing handled by space-y on container)
    if (!line.trim()) {
      i++
      continue
    }

    // ## Heading
    if (line.startsWith('## ')) {
      nodes.push(
        <p key={key++} className="font-heading font-bold text-[#1B4965] mt-3 mb-1 first:mt-0">
          {parseInline(line.slice(3))}
        </p>
      )
      i++
      continue
    }

    // ### Sub-heading
    if (line.startsWith('### ')) {
      nodes.push(
        <p key={key++} className="font-semibold text-[#1B4965] mt-2 mb-0.5">
          {parseInline(line.slice(4))}
        </p>
      )
      i++
      continue
    }

    // Unordered list — consume consecutive - or * lines
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={i}>{parseInline(lines[i].slice(2))}</li>)
        i++
      }
      nodes.push(
        <ul key={key++} className="list-disc pl-4 space-y-0.5 my-1.5">
          {items}
        </ul>
      )
      continue
    }

    // Numbered list — consume consecutive `N. ` lines
    if (/^\d+\.\s/.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i}>{parseInline(lines[i].replace(/^\d+\.\s/, ''))}</li>)
        i++
      }
      nodes.push(
        <ol key={key++} className="list-decimal pl-4 space-y-0.5 my-1.5">
          {items}
        </ol>
      )
      continue
    }

    // Regular paragraph
    nodes.push(
      <p key={key++} className="leading-relaxed">
        {parseInline(line)}
      </p>
    )
    i++
  }

  return <div className="space-y-1">{nodes}</div>
}

// ── Component ──────────────────────────────────────────────────────────────────
export function ChatBubble({ message, streaming }: Props) {
  const isAI = message.role === 'assistant'
  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {isAI && <StethoscopeAvatar size="sm" />}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
          isAI
            ? 'bg-white border border-[#E5E7EB] text-[#1F2937] rounded-tl-sm'
            : 'bg-[#1B4965] text-white rounded-tr-sm leading-relaxed'
        }`}
      >
        {isAI ? (
          <>
            <MarkdownContent text={message.content} />
            {streaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#5FA8D3] animate-pulse rounded-full align-middle" />
            )}
          </>
        ) : (
          message.content
        )}
      </div>
    </div>
  )
}
