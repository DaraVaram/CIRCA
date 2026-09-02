import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { geoEqualEarth, geoPath, geoInterpolate, geoGraticule10 } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry } from 'geojson'
import type { Topology } from 'topojson-specification'
import worldTopo from 'world-atlas/countries-110m.json'
import TrackBadge from '@/components/ui/TrackBadge'

import { collaborators, memberForAuthor, publicationById } from '@/lib/content'
import type { Collaborator } from '@/types/content'

const WIDTH = 900
const HEIGHT = 440
const MIN_ZOOM = 1
const MAX_ZOOM = 14

// The topology ships as TopoJSON. Convert once at module load, not per render.
const world = feature(
  worldTopo as unknown as Topology,
  (worldTopo as unknown as Topology).objects.countries,
) as FeatureCollection<Geometry>

const projection = geoEqualEarth().fitExtent(
  [
    [8, 8],
    [WIDTH - 8, HEIGHT - 8],
  ],
  { type: 'Sphere' },
)
const path = geoPath(projection)
const graticule = path(geoGraticule10()) ?? ''

const home = collaborators.find((c) => c.kind === 'home')!
const partners = collaborators.filter((c) => c.kind !== 'home')

/** Great-circle arc from the home institution to a partner, as an SVG path. */
function arcTo(target: Collaborator): string {
  const interpolate = geoInterpolate(home.coords, target.coords)
  const points = Array.from({ length: 40 }, (_, i) => interpolate(i / 39))
  return path({ type: 'LineString', coordinates: points }) ?? ''
}

const project = (coords: [number, number]) => projection(coords) ?? [0, 0]

interface View {
  x: number
  y: number
  w: number
  h: number
}

const FULL: View = { x: 0, y: 0, w: WIDTH, h: HEIGHT }

/** Keeps the view inside the world bounds at every zoom level. */
function clamp(v: View): View {
  const w = Math.min(WIDTH, Math.max(WIDTH / MAX_ZOOM, v.w))
  const h = w * (HEIGHT / WIDTH)
  return {
    w,
    h,
    x: Math.min(Math.max(0, v.x), WIDTH - w),
    y: Math.min(Math.max(0, v.y), HEIGHT - h),
  }
}

export default function CollaborationMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [view, setView] = useState<View>(FULL)
  const [panning, setPanning] = useState(false)
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(null)

  const countries = useMemo(() => path(world) ?? '', [])
  const arcs = useMemo(() => partners.map((p) => ({ id: p.id, d: arcTo(p) })), [])

  const selected = selectedId ? collaborators.find((c) => c.id === selectedId) : null
  const activeId = hoveredId ?? selectedId
  const countryCount = new Set(partners.map((p) => p.country)).size

  // Pins and strokes are drawn in world units, so divide by the zoom factor to
  // keep them a constant size on screen as the user zooms in.
  const k = WIDTH / view.w
  const inv = 1 / k

  /** Converts a pointer event to a point in the map's own coordinate space. */
  const toWorld = useCallback(
    (e: { clientX: number; clientY: number }, v: View) => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return null
      return {
        x: v.x + ((e.clientX - rect.left) / rect.width) * v.w,
        y: v.y + ((e.clientY - rect.top) / rect.height) * v.h,
      }
    },
    [],
  )

  const zoomAbout = useCallback((factor: number, at?: { x: number; y: number }) => {
    setView((v) => {
      const w = v.w / factor
      const h = v.h / factor
      const cx = at?.x ?? v.x + v.w / 2
      const cy = at?.y ?? v.y + v.h / 2
      // Keep the anchor point fixed on screen while scaling around it.
      return clamp({
        x: cx - ((cx - v.x) / v.w) * w,
        y: cy - ((cy - v.y) / v.h) * h,
        w,
        h,
      })
    })
  }, [])

  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const at = toWorld(e, view)
    zoomAbout(e.deltaY < 0 ? 1.18 : 1 / 1.18, at ?? undefined)
  }

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toWorld(e, view)
    if (!p) return
    drag.current = { x: p.x, y: p.y, view, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const start = drag.current
    if (!start) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    // Measure against the view the drag began from, so panning does not feed
    // back into itself as the view updates.
    const px = start.view.x + ((e.clientX - rect.left) / rect.width) * start.view.w
    const py = start.view.y + ((e.clientY - rect.top) / rect.height) * start.view.h
    const dx = px - start.x
    const dy = py - start.y
    if (!start.moved && Math.abs(dx) + Math.abs(dy) > start.view.w * 0.004) {
      start.moved = true
      setPanning(true)
    }
    if (!start.moved) return
    setView(clamp({ ...start.view, x: start.view.x - dx, y: start.view.y - dy }))
  }

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = null
    setPanning(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  /** Centers and zooms on one institution, used by the sidebar list. */
  const focus = (c: Collaborator) => {
    const [x, y] = project(c.coords)
    const w = WIDTH / 6
    const h = w * (HEIGHT / WIDTH)
    setView(clamp({ x: x - w / 2, y: y - h / 2, w, h }))
    setSelectedId(c.id)
  }

  /** A click that followed a pan should not also select a pin. */
  const selectIfNotPanning = (id: string) => {
    if (drag.current?.moved) return
    setSelectedId(id === selectedId ? null : id)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="relative overflow-hidden rounded-xl border border-ink-700/60 bg-ink-900/40">
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          className="h-auto w-full touch-none select-none"
          style={{ cursor: panning ? 'grabbing' : 'grab' }}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="img"
          aria-label={`World map showing ${partners.length} collaborating institutions across ${countryCount} countries. Scroll to zoom, drag to pan.`}
        >
          <path d={graticule} fill="none" stroke="var(--viz-graticule)" strokeWidth={0.4 * inv} />
          <path
            d={countries}
            fill="var(--viz-land)"
            stroke="var(--viz-land-stroke)"
            strokeWidth={0.5 * inv}
          />

          {arcs.map((arc) => {
            const active = activeId === arc.id
            return (
              <path
                key={arc.id}
                d={arc.d}
                fill="none"
                stroke="var(--color-signal-400)"
                strokeWidth={(active ? 1.8 : 0.9) * inv}
                strokeOpacity={active ? 0.95 : 0.42}
                className="pointer-events-none"
              />
            )
          })}

          {/* Home institution. Its label yields once another pin is active,
              because three of the partners are also in the UAE and would collide. */}
          <Pin
            collaborator={home}
            active={activeId === null || activeId === home.id}
            scale={inv}
            onSelect={() => selectIfNotPanning(home.id)}
            onHover={setHoveredId}
          />

          {partners.map((c) => (
            <Pin
              key={c.id}
              collaborator={c}
              active={activeId === c.id}
              scale={inv}
              onSelect={() => selectIfNotPanning(c.id)}
              onHover={setHoveredId}
            />
          ))}
        </svg>

        <div className="absolute right-3 bottom-3 flex flex-col gap-1 rounded-lg border border-ink-700/60 bg-ink-950/80 p-1 backdrop-blur">
          <ZoomButton label="Zoom in" onClick={() => zoomAbout(1.5)} disabled={k >= MAX_ZOOM - 0.01}>
            <path d="M12 5v14M5 12h14" />
          </ZoomButton>
          <ZoomButton
            label="Zoom out"
            onClick={() => zoomAbout(1 / 1.5)}
            disabled={k <= MIN_ZOOM + 0.01}
          >
            <path d="M5 12h14" />
          </ZoomButton>
          <ZoomButton label="Reset view" onClick={() => setView(FULL)} disabled={k <= MIN_ZOOM + 0.01}>
            <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" />
          </ZoomButton>
        </div>

        <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] text-slate-600">
          scroll to zoom, drag to pan
        </p>
      </div>

      <aside className="flex flex-col">
        {selected ? (
          <Detail collaborator={selected} onClose={() => setSelectedId(null)} />
        ) : (
          <div className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-5">
            <p className="eyebrow">Collaboration network</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {partners.length} institutions across {countryCount} countries. Select one to
              zoom in and see the people and the papers behind it.
            </p>
            <ul className="mt-5 max-h-72 space-y-1 overflow-y-auto pr-1">
              {partners.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredId(c.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(c.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => focus(c)}
                    className="flex w-full items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-ink-800/70"
                  >
                    <span className="truncate text-slate-300">{c.institution}</span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-600">
                      {c.publications.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}

function ZoomButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-ink-800 hover:text-slate-100 disabled:pointer-events-none disabled:opacity-30"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        {children}
      </svg>
    </button>
  )
}

function Pin({
  collaborator,
  active,
  scale,
  onSelect,
  onHover,
}: {
  collaborator: Collaborator
  active: boolean
  scale: number
  onSelect: () => void
  onHover: (id: string | null) => void
}) {
  const [x, y] = project(collaborator.coords)
  const isHome = collaborator.kind === 'home'
  const color = isHome ? 'var(--color-track-efficient-ml)' : 'var(--color-signal-400)'

  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseEnter={() => onHover(collaborator.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(collaborator.id)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      role="button"
      aria-label={`${collaborator.institution}, ${collaborator.country}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      {/* Generous invisible hit area, since the visible dot is only a few pixels. */}
      <circle r={11} fill="transparent" />
      <circle
        r={active ? 8 : 5}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeOpacity={active ? 0.95 : 0.6}
        strokeWidth={active ? 1.2 : 0.8}
      />
      <circle r={isHome ? 3.4 : 2.6} fill={color} />
      {active && (
        <text
          y={-13}
          textAnchor="middle"
          className="pointer-events-none"
          fill="var(--color-slate-50)"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}
        >
          {collaborator.institution}
        </text>
      )}
    </g>
  )
}

function Detail({
  collaborator,
  onClose,
}: {
  collaborator: Collaborator
  onClose: () => void
}) {
  const pubs = collaborator.publications
    .map((id) => publicationById.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .sort((a, b) => (b.year ?? 9999) - (a.year ?? 9999))

  return (
    <div className="rounded-xl border border-ink-700/60 bg-ink-900/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{collaborator.country}</p>
          <h3 className="mt-2 leading-snug font-medium text-slate-100">
            {collaborator.institution}
          </h3>
          {collaborator.department && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {collaborator.department}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-ink-800 hover:text-slate-200"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {collaborator.people.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">People</p>
          <ul className="mt-2 space-y-1">
            {collaborator.people.map((person) => {
              const member = memberForAuthor(person)
              return (
                <li key={person} className="text-sm">
                  {member ? (
                    <Link
                      to={`/people/${member.slug}`}
                      className="text-signal-400 hover:text-signal-300"
                    >
                      {person}
                    </Link>
                  ) : (
                    <span className="text-slate-400">{person}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {pubs.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
            {pubs.length} joint {pubs.length === 1 ? 'publication' : 'publications'}
          </p>
          <ul className="mt-2 max-h-64 space-y-3 overflow-y-auto pr-1">
            {pubs.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/publications#${p.id}`}
                  className="block text-xs leading-snug text-slate-300 hover:text-signal-300"
                >
                  {p.title}
                </Link>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {p.tracks.map((t) => (
                    <TrackBadge key={t} id={t} static />
                  ))}
                  <span className="font-mono text-[10px] text-slate-600">
                    {p.year ?? 'under review'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
