import { ConfidenceBadge, ArchetypeChip } from '../components/Badges';
import {
  COMPONENT_META,
  COMPONENT_COLORS,
  CONFIDENCE_META,
  ARCHETYPE_META,
} from '../lib/constants';

export default function Methodology({ data }) {
  const weights = data.meta.weights;
  const flagged = data.games.filter((g) => g.protest.flag);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          How the Acquisition Score works
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
          Every game gets one score from 0 to 100. It is a simple weighted sum of six
          signals — each measured from the reviews, each scaled 0 to 1, each multiplied by
          its weight and added up. No black box: the drill-down shows exactly how many
          points each signal contributes for every game.
        </p>

        {/* the formula as a diagram */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {Object.entries(weights).map(([key, w]) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200/80 p-4"
              style={{ borderTop: `3px solid ${COMPONENT_COLORS[key]}` }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  {COMPONENT_META[key].label}
                </span>
                <span className="text-lg font-bold tabular-nums text-slate-800">
                  {Math.round(w * 100)}%
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {COMPONENT_META[key].tip}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                <span className="font-medium text-slate-500">Why it’s here: </span>
                {COMPONENT_META[key].why}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
          <span>each signal (0–1)</span>
          <span className="text-slate-300">×</span>
          <span>its weight</span>
          <span className="text-slate-300">→</span>
          <span>added across all six</span>
          <span className="text-slate-300">→</span>
          <span>× 100</span>
          <span className="text-slate-300">=</span>
          <span className="rounded-lg bg-pwc/10 px-3 py-1 font-semibold text-pwc">
            Acquisition Score (0–100)
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Review volume is deliberately <span className="font-medium">not</span> part of the
          score — a huge audience doesn’t make a game better. Volume is reported separately
          as the confidence tier below.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Confidence tiers</h2>
        <p className="mt-0.5 text-sm text-slate-400">
          How much review evidence sits behind a game’s score — based purely on review count.
        </p>
        <div className="mt-4 space-y-3">
          {[
            ['High', 'More than 150 reviews — enough evidence to trust the score.'],
            ['Medium', '50 to 150 reviews — directionally reliable, read with some care.'],
            [
              'Low',
              'Fewer than 50 reviews — treat the score as anecdote, not evidence. Low-confidence games are visually muted across this dashboard so they never look as authoritative as well-evidenced ones.',
            ],
          ].map(([tier, text]) => (
            <div key={tier} className="flex items-start gap-3">
              <ConfidenceBadge tier={tier} />
              <p className="text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Archetypes</h2>
        <p className="mt-0.5 text-sm text-slate-400">
          A one-word character sketch of each game’s trajectory, derived from its age,
          momentum and sentiment.
        </p>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {Object.entries(ARCHETYPE_META).map(([name, desc]) => (
            <div key={name} className="flex items-start gap-3">
              <span className="shrink-0">
                <ArchetypeChip archetype={name} />
              </span>
              <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">
          <span aria-hidden className="text-flag">⚠ </span>The protest flag
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Some games show a sudden one-quarter crater in sentiment: a busy quarter (50+
          reviews) where the positive share fell at least 30 points below the game’s own
          typical quarter. Reading those reviews shows the anger is aimed at publisher
          decisions — pricing, policy changes — not at the game itself. The flag keeps a
          temporary protest from being mistaken for a quality problem.
          {flagged.length > 0 && (
            <>
              {' '}
              Flagged on this watchlist:{' '}
              <span className="font-medium text-slate-700">
                {flagged.map((g) => `${g.title} (${g.protest.quarter_label})`).join(' and ')}
              </span>
              .
            </>
          )}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">How it was built</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Analysis in Python (notebooks 01–04 in this repo); ML used to read review text at
          scale; the final score is a transparent weighted formula — deliberately not a
          black box.
        </p>
      </section>
    </div>
  );
}
