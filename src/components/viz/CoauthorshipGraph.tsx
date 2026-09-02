import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { buildCoauthorshipGraph, publicationById } from '@/lib/content'


// Generous canvas. The layout is laid out in this space and then the viewBox is
// fitted to whatever the simulation actually used, so nothing is ever cropped.
const WIDTH = 1500
const HEIGHT = 1000
const PADDING = 60

interface Node extends SimulationNodeDatum {
  id: string
  name: string
  slug?: string
  count: number
  isGroup: boolean
}

interface Link extends SimulationLinkDatum<Node> {
  weight: number
  publications: string[]
}

/** Radius scales with publication count, on a square root so area reads true. */
const radiusOf = (count: number) => 7 + Math.sqrt(count) * 5

/** Surname plus initials, so labels stay short enough not to collide. */
function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  const last = parts.pop() ?? name
  const initials = parts.map((p) => `${p[0]}.`).join('')
  return initials ? `${initials} ${last}` : last
}

export default function CoauthorshipGraph() {
  const navigate = useNavigate()
  const [, setSettled] = useState(0)
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const viewBoxRef = useRef(`0 0 ${WIDTH} ${HEIGHT}`)

  // Built once. The simulation mutates these objects in place.
  const { nodes, links } = useMemo(() => {
    const graph = buildCoauthorshipGraph()
    const nodes: Node[] = graph.nodes.map((n) => ({ ...n }))
    const byId = new Map(nodes.map((n) => [n.id, n]))
    const links: Link[] = graph.links.flatMap((l) => {
      const source = byId.get(l.source)
      const target = byId.get(l.target)
      if (!source || !target) return []
      return [{ source, target, weight: l.weight, publications: l.publications }]
    })
    return { nodes, links }
  }, [])

  useEffect(() => {
    const simulation: Simulation<Node, Link> = forceSimulation<Node>(nodes)
      .force(
        'link',
        forceLink<Node, Link>(links)
          .id((d) => d.id)
          // Heavily co-authored pairs sit closer together, but never on top of
          // each other. The floor keeps dense clusters legible.
          .distance((l) => Math.max(110, 230 / Math.sqrt(l.weight)))
          .strength((l) => Math.min(0.9, 0.18 * l.weight)),
      )
      // Strong repulsion is what buys the separation between clusters.
      .force('charge', forceManyBody<Node>().strength((d) => -900 - d.count * 120))
      // Collision radius includes room for the label under each node.
      .force('collide', forceCollide<Node>().radius((d) => radiusOf(d.count) + 34).iterations(3))
      .force('x', forceX(WIDTH / 2).strength(0.035))
      .force('y', forceY(HEIGHT / 2).strength(0.05))

    // Run the layout to completion up front, then render once. Animating the
    // settle would mean a React render per tick for no real benefit.
    simulation.stop()
    for (let i = 0; i < 600; i++) simulation.tick()
    simulation.stop()

    // Fit the viewBox to the laid-out extent so the graph fills the frame
    // regardless of how far the simulation spread it.
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const n of nodes) {
      const r = radiusOf(n.count) + 26
      minX = Math.min(minX, (n.x ?? 0) - r)
      minY = Math.min(minY, (n.y ?? 0) - r)
      maxX = Math.max(maxX, (n.x ?? 0) + r)
      maxY = Math.max(maxY, (n.y ?? 0) + r)
    }
    if (Number.isFinite(minX)) {
      viewBoxRef.current = [
        minX - PADDING,
        minY - PADDING,
        maxX - minX + PADDING * 2,
        maxY - minY + PADDING * 2,
      ].join(' ')
    }

    setSettled((n) => n + 1)
    return () => {
      simulation.stop()
    }
  }, [nodes, links])

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const l of links) {
      const s = (l.source as Node).id
      const t = (l.target as Node).id
      if (!map.has(s)) map.set(s, new Set())
      if (!map.has(t)) map.set(t, new Set())
      map.get(s)!.add(t)
      map.get(t)!.add(s)
    }
    return map
  }, [links])

  const activeId = hovered ?? selected
  const activeSet = activeId
    ? new Set([activeId, ...(neighbors.get(activeId) ?? [])])
    : null

  const selectedNode = selected ? nodes.find((n) => n.id === selected) : null
  const selectedLinks = selected
    ? links.filter(
        (l) => (l.source as Node).id === selected || (l.target as Node).id === selected,
      )
    : []

  const open = (n: Node) => {
    if (n.slug) navigate(`/people/${n.slug}`)
    else setSelected(n.id === selected ? null : n.id)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="overflow-hidden rounded-xl border border-ink-700/60 bg-ink-900/40">
          <svg
            viewBox={viewBoxRef.current}
            className="h-auto w-full"
            role="img"
            aria-label={`Co-authorship network of ${nodes.length} authors connected by ${links.length} joint publications.`}
          >
            {links.map((l, i) => {
              const s = l.source as Node
              const t = l.target as Node
              const dim =
                activeSet !== null && !(activeSet.has(s.id) && activeSet.has(t.id))
              return (
                <line
                  key={i}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke="var(--color-signal-400)"
                  strokeWidth={Math.min(5, 1 + l.weight * 0.7)}
                  strokeOpacity={dim ? 0.05 : 0.32}
                />
              )
            })}

            {nodes.map((n) => {
              const r = radiusOf(n.count)
              const dim = activeSet !== null && !activeSet.has(n.id)
              const color = n.isGroup ? 'var(--color-signal-400)' : 'var(--viz-neutral)'
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x} ${n.y})`}
                  opacity={dim ? 0.18 : 1}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`${n.name}, ${n.count} publications`}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(n.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => open(n)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return
                    e.preventDefault()
                    open(n)
                  }}
                >
                  <circle
                    r={r}
                    fill={color}
                    fillOpacity={n.isGroup ? 0.85 : 0.16}
                    stroke={color}
                    strokeWidth={n.isGroup ? 2 : 1.4}
                    strokeOpacity={n.isGroup ? 1 : 0.55}
                  />
                  <text
                    y={r + 17}
                    textAnchor="middle"
                    className="pointer-events-none"
                    fill={n.isGroup ? 'var(--color-slate-100)' : 'var(--viz-neutral)'}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                  >
                    {shortName(n.name)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <aside>
          {selectedNode ? (
            <div className="rounded-xl border border-ink-700/60 bg-ink-900/60 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Co-author</p>
                  <h3 className="mt-2 text-base leading-snug font-medium text-slate-100">
                    {selectedNode.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-ink-800 hover:text-slate-200"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <p className="mt-3 font-mono text-xs text-slate-500">
                {selectedNode.count} joint {selectedNode.count === 1 ? 'paper' : 'papers'} with
                the group
              </p>
              <ul className="mt-4 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                {[...new Set(selectedLinks.flatMap((l) => l.publications))].map((id) => {
                  const pub = publicationById.get(id)
                  if (!pub) return null
                  return (
                    <li key={id} className="text-xs leading-snug text-slate-400">
                      {pub.title}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-5">
              <p className="eyebrow">Reading the graph</p>
              <ul className="mt-4 space-y-3 text-xs leading-relaxed text-slate-400">
                <li className="flex items-center gap-2.5">
                  <svg width="16" height="16" aria-hidden="true">
                    <circle cx="8" cy="8" r="6" fill="var(--color-signal-400)" fillOpacity={0.85} stroke="var(--color-signal-400)" />
                  </svg>
                  Group member. Click through to their profile.
                </li>
                <li className="flex items-center gap-2.5">
                  <svg width="16" height="16" aria-hidden="true">
                    <circle cx="8" cy="8" r="6" fill="var(--viz-neutral)" fillOpacity={0.16} stroke="var(--viz-neutral)" strokeOpacity={0.55} />
                  </svg>
                  External co-author. Click to see the shared papers.
                </li>
                <li>
                  Node size is publication count. Line weight is the number of papers two
                  authors share.
                </li>
              </ul>
              <p className="mt-5 border-t border-ink-800 pt-4 font-mono text-xs text-slate-500">
                {nodes.length} authors, {links.length} co-authorship links
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
