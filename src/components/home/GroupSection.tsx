import { Link } from 'react-router-dom'
import { alumni, currentMembers, piProfile } from '@/lib/content'
import { impact } from '@/lib/metrics'
import { assetUrl } from '@/lib/assets'

/**
 * A face for the group. The PI portrait and the group photograph do more for a
 * prospective student than any of the numbers above them, so this sits between
 * the work and the news rather than at the bottom of the page.
 */
export default function GroupSection() {
  // The PI first, then everyone with a photograph. Members without one are
  // still on the People page, they just cannot carry an avatar row.
  const faces = [piProfile.photo, ...currentMembers.map((m) => m.photo), ...alumni.map((m) => m.photo)]
    .filter((p): p is string => Boolean(p))
    .slice(0, 8)

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow">The group</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 text-balance sm:text-4xl">
            Small team. Unusually large output.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
            A PhD researcher, five MSc researchers, and a stream of undergraduates who take
            their projects to global competition finals. Two alumni have gone on to the MIT
            Senseable City Lab and to a PhD at EPFL.
          </p>

          <div className="mt-8 flex items-center">
            {faces.map((photo, i) => (
              <img
                key={photo}
                src={assetUrl(photo)}
                alt=""
                loading="lazy"
                className="h-11 w-11 rounded-full border-2 border-ink-950 object-cover"
                style={{ marginLeft: i === 0 ? 0 : '-10px', zIndex: faces.length - i }}
              />
            ))}
            <span className="ml-4 text-xs text-slate-500">
              {impact.gradStudents} graduate researchers, {impact.studentsSupervised} undergraduates
            </span>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/people"
              className="inline-flex items-center gap-2 rounded-xl bg-signal-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-signal-500/20 transition-all hover:-translate-y-0.5 hover:bg-signal-600"
            >
              Meet the group <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link
              to="/students"
              className="inline-flex items-center gap-2 rounded-xl border border-ink-700 px-5 py-3 text-sm text-slate-300 transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:text-slate-100"
            >
              Undergraduate research
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <figure>
            <img
              src={assetUrl('/images/group/team-shaheen.jpg')}
              alt="The Shaheen team with Dr. Mohamed AlHajri"
              loading="lazy"
              className="w-full rounded-2xl border border-ink-700/60 object-cover shadow-xl shadow-ink-950/10"
            />
            <figcaption className="mt-3 text-xs leading-relaxed text-slate-500">
              The Shaheen team with Dr. Mohamed AlHajri, second worldwide at Dell Technologies'
              Envision the Future 2025, out of 259 teams from 14 countries.
            </figcaption>
          </figure>

          <Link
            to="/pi"
            className="group flex items-center gap-4 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-4 transition-colors hover:border-ink-600"
          >
            <img
              src={assetUrl(piProfile.photo)}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.16em] text-signal-400 uppercase">
                Principal Investigator
              </p>
              <p className="mt-1 text-sm text-slate-200">{piProfile.name}</p>
              <p className="text-xs text-slate-500">
                {piProfile.title}, {piProfile.department}
              </p>
            </div>
            <span className="ml-auto shrink-0 text-sm text-slate-500 transition-colors group-hover:text-signal-400">
              <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
