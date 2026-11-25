import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import './code.css'

// Code as the subject: real lines in a monospace block with line numbers,
// quiet syntax color, and diff lines that read at a glance.

export interface CodeLine {
  text: string
  /** add: a green line with a +. del: a red line with a −. */
  kind?: 'add' | 'del'
  /** false leaves this line's number blank (a wrapped continuation, a fold). */
  number?: boolean
}

const KEYWORDS = /^(const|let|var|function|return|if|else|await|async|import|from|export|default|new|true|false|null|undefined|for|of|in|while|try|catch|throw|class|extends|type|interface|def|self|None|True|False)$/

/** Linear single-pass tokenizer: comments, strings, numbers, keywords, function calls. */
function tokens(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let i = 0, plainStart = 0, k = 0
  const flushPlain = (end: number) => {
    if (end > plainStart) out.push(line.slice(plainStart, end))
    plainStart = end
  }
  while (i < line.length) {
    const ch = line[i]
    if ((ch === '/' && line[i + 1] === '/') || ch === '#') {
      flushPlain(i)
      out.push(<span key={k++} className="ss-code__com">{line.slice(i)}</span>)
      return out
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      flushPlain(i)
      let j = i + 1
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue }
        if (line[j] === ch) { j++; break }
        j++
      }
      out.push(<span key={k++} className="ss-code__str">{line.slice(i, j)}</span>)
      i = plainStart = j
      continue
    }
    if (/\d/.test(ch) && (i === 0 || !/[A-Za-z0-9_$]/.test(line[i - 1]))) {
      flushPlain(i)
      let j = i + 1
      while (j < line.length && /[\d._]/.test(line[j])) j++
      out.push(<span key={k++} className="ss-code__num">{line.slice(i, j)}</span>)
      i = plainStart = j
      continue
    }
    if (/[A-Za-z_$]/.test(ch)) {
      flushPlain(i)
      let j = i + 1
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++
      const word = line.slice(i, j)
      let p = j
      while (p < line.length && (line[p] === ' ' || line[p] === '\t')) p++
      const kind = KEYWORDS.test(word) ? 'key' : line[p] === '(' ? 'fn' : null
      out.push(kind ? <span key={k++} className={`ss-code__${kind}`}>{word}</span> : word)
      i = plainStart = j
      continue
    }
    i++
  }
  flushPlain(line.length)
  return out
}

/**
 * Lines of code. `count` shows only the first n lines, the rest laid out but
 * hidden, so a block can stream in (a build log, a generated function) without
 * anything reflowing. Diff lines get a tint and a + or − in the gutter.
 */
export function Code({ lines, start = 1, numbers = true, count, highlight = true, className, style }: { lines: (CodeLine | string)[]; start?: number; numbers?: boolean; count?: number; highlight?: boolean; className?: string; style?: CSSProperties }) {
  let n = start
  // Only lines that really run past the block fade at the edge
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const mark = () =>
      ref.current?.querySelectorAll<HTMLElement>('.ss-code__text').forEach((t) => {
        t.toggleAttribute('data-over', t.scrollWidth > t.clientWidth + 1)
      })
    mark()
    const ro = new ResizeObserver(mark)
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  })
  return (
    <div ref={ref} className={`ss-code${className ? ` ${className}` : ''}`} style={style}>
      {lines.map((raw, i) => {
        const line = typeof raw === 'string' ? { text: raw } : raw
        // A removed line keeps the old number; the line after it reuses it
        const num = line.kind === 'del' || line.number === false ? n : n++
        return (
          <div key={i} className="ss-code__line" data-kind={line.kind} data-on={count === undefined || i < count || undefined}>
            {numbers && <span className="ss-code__num">{line.kind === 'del' || line.number === false ? '' : num}</span>}
            <span className="ss-code__mark">{line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ''}</span>
            <span className="ss-code__text">{highlight ? tokens(line.text) : line.text}</span>
          </div>
        )
      })}
    </div>
  )
}
