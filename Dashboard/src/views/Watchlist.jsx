import { useMemo, useState } from 'react';
import Tip from '../components/Tip';
import { ConfidenceBadge, ArchetypeChip, ProtestBadge } from '../components/Badges';
import StatusSelect from '../components/StatusSelect';
import WeightsPanel from '../components/WeightsPanel';
import { STATUSES, useStatus } from '../context/StatusContext';
import { SCORE_TIP, HERO_SENTENCE, INSUFFICIENT } from '../lib/constants';
import { fmtInt, fmtScore } from '../lib/format';

const SORTS = {
  score: { label: 'Acquisition Score', get: (g) => g.liveScore },
  momentum: { label: 'Momentum', get: (g) => g.momentum },
  positivity: { label: 'Positivity', get: (g) => g.pct_positive },
};

export default function Watchlist({ data, weights, onWeightsChange, onOpenGame }) {
  const { statuses, getStatus } = useStatus();
  const [search, setSearch] = useState('');
  const [archetype, setArchetype] = useState('All');
  const [confidence, setConfidence] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('score');
  const [panelOpen, setPanelOpen] = useState(false);

  const archetypes = useMemo(
    () => ['All', ...new Set(data.games.map((g) => g.archetype))],
    [data],
  );

  // Live score under the current slider weights: Σ(weight × component) × 100.
  // With the official weights this reproduces the published score exactly.
  const scored = useMemo(() => {
    const withScores = data.games.map((g) => ({
      ...g,
      liveScore:
        Object.entries(weights).reduce(
          (sum, [k, w]) => sum + w * (g.components[k] ?? 0),
          0,
        ) * 100,
    }));
    const byScore = [...withScores].sort((a, b) => b.liveScore - a.liveScore);
    const rankOf = new Map(byScore.map((g, i) => [g.title, i + 1]));
    return withScores.map((g) => ({ ...g, liveRank: rankOf.get(g.title) }));
  }, [data, weights]);

  const games = useMemo(() => {
    const q = search.trim().toLowerCase();
    const get = SORTS[sortBy].get;
    return scored
      .filter((g) => !q || g.title.toLowerCase().includes(q))
      .filter((g) => archetype === 'All' || g.archetype === archetype)
      .filter((g) => confidence === 'All' || g.confidence === confidence)
      .filter((g) => status === 'All' || getStatus(g.title) === status)
      .sort((a, b) => {
        const va = get(a);
        const vb = get(b);
        if (va === null && vb === null) return a.liveRank - b.liveRank;
        if (va === null) return 1; // games without the metric go last
        if (vb === null) return -1;
        return vb - va;
      });
  }, [scored, search, archetype, confidence, status, sortBy, getStatus]);

  const statusSummary = useMemo(() => {
    const counts = {};
    for (const s of Object.values(statuses)) counts[s] = (counts[s] ?? 0) + 1;
    const parts = ['Shortlisted', 'Evaluated', 'Passed']
      .filter((s) => counts[s])
      .map((s) => `${counts[s]} ${s.toLowerCase()}`);
    return parts.join(' · ');
  }, [statuses]);

  return (
    <div className="space-y-6">
      <HeroStrip meta={data.meta} />

      {panelOpen && (
        <WeightsPanel
          weights={weights}
          official={data.meta.weights}
          onChange={onWeightsChange}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games…"
          className="h-9 w-48 rounded-lg border border-slate-200 bg-white px-3 text-sm
                     placeholder:text-slate-400 focus:border-pwc/50 focus:outline-none
                     focus:ring-2 focus:ring-pwc/20"
        />
        <Select label="Archetype" value={archetype} onChange={setArchetype} options={archetypes} />
        <Select
          label="Confidence"
          value={confidence}
          onChange={setConfidence}
          options={['All', 'High', 'Medium', 'Low']}
        />
        <Select label="Status" value={status} onChange={setStatus} options={['All', ...STATUSES]} />
        <Select
          label="Sort by"
          value={sortBy}
          onChange={setSortBy}
          options={Object.keys(SORTS)}
          render={(k) => SORTS[k].label}
        />
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="h-9 rounded-lg bg-pwc px-3.5 text-sm font-medium text-white
                       transition-colors hover:bg-pwc/90"
          >
            Adjust the priorities
          </button>
        )}
        <span className="ml-auto text-sm text-slate-400">
          {statusSummary && <span>{statusSummary} · </span>}
          {games.length} of {data.games.length} games
        </span>
      </div>

      {/* ranked list */}
      <div className="space-y-2">
        {games.map((g) => (
          <GameRow key={g.title} game={g} onOpen={() => onOpenGame(g.title)} />
        ))}
        {games.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            No games match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}

function HeroStrip({ meta }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
        <Stat value={fmtInt(meta.total_reviews)} label="reviews analysed" />
        <Stat value={meta.n_games} label="games on the watchlist" />
        <Stat value={meta.date_range_label} label="review period" small />
        <p className="max-w-xs text-sm leading-relaxed text-slate-500">{HERO_SENTENCE}</p>
      </div>
    </section>
  );
}

function Stat({ value, label, small = false }) {
  return (
    <div>
      <div
        className={`font-semibold tracking-tight text-slate-800 ${small ? 'text-xl leading-9' : 'text-3xl'}`}
      >
        {value}
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

function Select({ label, value, onChange, options, render = (o) => o }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700
                   focus:border-pwc/50 focus:outline-none focus:ring-2 focus:ring-pwc/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {render(o)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ThemeLabel({ kind, theme }) {
  const negative = kind === 'complaint';
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          theme ? (negative ? 'bg-flag/70' : 'bg-good/70') : 'bg-slate-300'
        }`}
      />
      <span className="text-slate-400">{negative ? 'Top complaint' : 'Top praise'}</span>
      <span className={theme ? 'font-medium text-slate-600' : 'italic text-slate-400'}>
        {theme ?? INSUFFICIENT}
      </span>
    </div>
  );
}

function GameRow({ game: g, onOpen }) {
  const low = g.confidence === 'Low';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      className={`block w-full cursor-pointer rounded-xl border border-slate-200/80 bg-white px-5
                  py-4 text-left shadow-sm transition-all hover:border-pwc/40 hover:shadow-md
                  ${low ? 'opacity-60 saturate-50' : ''}`}
    >
      <div className="flex items-center gap-5">
        <span className="w-7 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-300">
          {g.liveRank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-slate-800">{g.title}</span>
            <ArchetypeChip archetype={g.archetype} />
            {g.protest.flag && <ProtestBadge />}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1">
            <ThemeLabel kind="complaint" theme={g.top_complaint?.theme} />
            <ThemeLabel kind="praise" theme={g.top_praise?.theme} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <StatusSelect title={g.title} />
          <ConfidenceBadge tier={g.confidence} />
          <Tip tip={`Acquisition Score: ${SCORE_TIP}`}>
            <span
              className={`w-14 text-right text-3xl font-bold tabular-nums tracking-tight ${
                low ? 'text-slate-400' : 'text-pwc'
              }`}
            >
              {fmtScore(g.liveScore)}
            </span>
          </Tip>
        </div>
      </div>
    </div>
  );
}
