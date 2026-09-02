import Section from '@/components/ui/Section'
import { siteConfig } from '@/site.config'
import { pi, tracks } from '@/lib/content'
import { impact } from '@/lib/metrics'
import { trackVar } from '@/lib/theme'
import { assetUrl } from '@/lib/assets'

export default function About() {
  return (
    <>
      <Section eyebrow="About" title="What the group is for">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="max-w-3xl space-y-5 text-base leading-relaxed text-slate-400">
            <p>
              Most machine learning research assumes the budget is elastic: more
              parameters, more data, more compute, more spectrum. Almost nothing
              deployed in the world works that way. A sensor has a battery. A radio
              has a band. A microcontroller has kilobytes. A product has objectives
              that genuinely conflict, and no amount of scale resolves the conflict
              for you.
            </p>
            <p>
              {siteConfig.name} works on the systems that hold up anyway. The
              through-line is the constraint itself. Limited bits, limited bandwidth,
              limited memory, competing objectives: each one treated as a first-class
              part of the problem rather than an implementation detail to be handled
              later.
            </p>
            <p>
              That gives the group an unusual shape. The theory end develops
              constrained and hierarchical optimization. The systems end puts models on
              microcontrollers and measures the result in microjoules. Both ends meet in
              the middle, and the applied work in localization, spectrum sensing, and
              medical and environmental deployment is where the next constraint usually
              shows up first.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-6">
              <p className="eyebrow">Track record</p>
              <dl className="mt-4 space-y-3 text-sm">
                <Stat label="Capstone projects" value={impact.capstoneProjects} />
                <Stat label="Award-winning projects" value={impact.awardedProjects} />
                <Stat label="Industry-sponsored" value={impact.industrySponsored} />
                <Stat label="Undergraduates mentored" value={impact.studentsSupervised} />
              </dl>
            </div>
          </aside>
        </div>
      </Section>

      <Section eyebrow="Principal investigator" title={pi.name} className="border-t border-ink-800">
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="aspect-square w-full max-w-64 overflow-hidden rounded-xl border border-ink-700/60 bg-ink-850">
            {pi.photo ? (
              <img src={assetUrl(pi.photo)} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-4xl text-ink-600">
                MA
              </div>
            )}
          </div>

          <div className="max-w-3xl">
            <p className="text-base leading-relaxed text-slate-400">{pi.bio}</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Education</p>
                <ul className="mt-3 space-y-3 text-sm text-slate-400">
                  <li>
                    <span className="text-slate-200">PhD, MIT</span>. Electrical
                    Engineering and Computer Science, minor in Applied Mathematics, 2023
                  </li>
                  <li>
                    <span className="text-slate-200">MSc, MIT</span>. Electrical
                    Engineering and Computer Science, 2018
                  </li>
                  <li>
                    <span className="text-slate-200">BSc, Khalifa University</span>. Electrical
                    Engineering, ranked 1st across the university, 2015
                  </li>
                </ul>
              </div>

              <div>
                <p className="eyebrow">Teaching</p>
                <ul className="mt-3 space-y-3 text-sm text-slate-400">
                  <li>
                    <span className="text-slate-200">MLR 570</span>. Advanced Machine
                    Learning (MSc)
                  </li>
                  <li>
                    <span className="text-slate-200">COE 375</span>. Modeling and
                    Simulation of Stochastic Systems
                  </li>
                  <li>
                    <span className="text-slate-200">COE 221</span>. Digital Systems
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Identity" title="How the tracks fit together" className="border-t border-ink-800">
        <ul className="divide-y divide-ink-800 border-y border-ink-800">
          {tracks.map((track) => (
            <li key={track.id} className="grid gap-4 py-6 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <p
                className="font-mono text-[11px] tracking-[0.18em] uppercase"
                style={{ color: trackVar(track.id) }}
              >
                {track.constraint}
              </p>
              <div>
                <h3 className="font-medium text-slate-100">{track.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{track.blurb}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-ink-800 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-mono text-slate-100 tabular-nums">{value}</dd>
    </div>
  )
}
