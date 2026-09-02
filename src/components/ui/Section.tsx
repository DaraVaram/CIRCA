import type { ReactNode } from 'react'

interface Props {
  eyebrow?: string
  title?: string
  lead?: string
  children: ReactNode
  className?: string
}

export default function Section({ eyebrow, title, lead, children, className = '' }: Props) {
  return (
    <section className={`mx-auto max-w-7xl px-6 py-20 ${className}`}>
      {(eyebrow || title) && (
        <header className="mb-10 max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && (
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 text-balance sm:text-4xl">
              {title}
            </h2>
          )}
          {lead && <p className="mt-4 text-base leading-relaxed text-slate-400">{lead}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
