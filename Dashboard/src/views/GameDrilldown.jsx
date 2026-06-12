import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceDot,
  LabelList,
} from 'recharts';
import { ConfidenceBadge, ArchetypeChip, ProtestBadge } from '../components/Badges';
import StatusSelect from '../components/StatusSelect';
import Tip from '../components/Tip';
import {
  COMPONENT_META,
  COMPONENT_COLORS,
  SCORE_TIP,
  INSUFFICIENT,
} from '../lib/constants';
import { fmtPct, fmtScore, fmtHours, fmtInt } from '../lib/format';

export default function GameDrilldown({ data, title, onBack }) {
  const game = data.games.find((g) => g.title === title);
  if (!game) {
    return (
      <div className="space-y-4">
        <BackButton onBack={onBack} />
        <Card title={INSUFFICIENT} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <BackButton onBack={onBack} />
      <Header game={game} weights={data.meta.weights} />
      <SentimentSection game={game} />
      <ThemesSection game={game} />
      <EngagementSection game={game} />
      <QuotesSection game={game} />
    </div>
  );
}

function BackButton({ onBack }) {
  return (
    <button onClick={onBack} className="text-sm font-medium text-pwc hover:underline">
      ← Back to watchlist
    </button>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {title && <h2 className="text-base font-semibold text-slate-800">{title}</h2>}
      {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}

function Insufficient({ note }) {
  return (
    <div className="flex h-28 items-center justify-center rounded-lg bg-slate-50 text-sm italic text-slate-400">
      {INSUFFICIENT}
      {note ? ` — ${note}` : ''}
    </div>
  );
}

/* ------------------------------ header ------------------------------ */

function Header({ game: g, weights }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            {g.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ConfidenceBadge tier={g.confidence} />
            <ArchetypeChip archetype={g.archetype} />
            {g.protest.flag && <ProtestBadge />}
            <span className="text-xs text-slate-400">
              Rank #{g.rank} · {fmtInt(g.n_reviews)} reviews
            </span>
            <StatusSelect title={g.title} />
          </div>
        </div>
        <div className="text-right">
          <Tip tip={SCORE_TIP}>
            <span
              className={`text-5xl font-bold tabular-nums tracking-tight ${
                g.confidence === 'Low' ? 'text-slate-400' : 'text-pwc'
              }`}
            >
              {fmtScore(g.score)}
            </span>
          </Tip>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Acquisition Score
          </div>
        </div>
      </div>
      <ScoreDecomposition game={g} weights={weights} />
    </section>
  );
}

function ScoreDecomposition({ game: g, weights }) {
  const parts = Object.entries(weights).map(([key, w]) => ({
    key,
    label: COMPONENT_META[key].label,
    tip: COMPONENT_META[key].tip,
    points: (g.components[key] ?? 0) * w * 100,
    weight: w,
  }));

  return (
    <div className="mt-6">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        How the score is built (out of 100 points)
      </div>
      <div className="flex h-8 w-full rounded-lg bg-slate-100">
        {parts.map((p) => (
          <div
            key={p.key}
            style={{ width: `${p.points}%`, backgroundColor: COMPONENT_COLORS[p.key] }}
            className="group/seg relative h-full first:rounded-l-lg"
          >
            <span
              className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-max
                         max-w-64 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-snug
                         text-white opacity-0 shadow-lg transition-opacity group-hover/seg:visible
                         group-hover/seg:opacity-100"
            >
              {p.label}: {p.points.toFixed(1)} points (weight {Math.round(p.weight * 100)}%).{' '}
              {p.tip}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {parts.map((p) => (
          <span key={p.key} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: COMPONENT_COLORS[p.key] }}
            />
            {p.label}
            <span className="font-semibold tabular-nums text-slate-700">
              {p.points.toFixed(1)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------- sentiment chart -------------------------- */

function SentimentTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-semibold">{d.label}</div>
      <div>{fmtPct(d.pct_positive)} of reviews positive</div>
      <div>{fmtInt(d.n_reviews)} reviews</div>
    </div>
  );
}

function SentimentSection({ game: g }) {
  const timeline = g.timeline;
  const protestPoint = g.protest.flag
    ? timeline.find((t) => t.quarter === g.protest.quarter)
    : null;

  return (
    <Card
      title="Sentiment over time"
      subtitle="Quarterly share of positive reviews (line) and number of reviews written (bars). Only quarters with 10+ reviews are shown."
    >
      {timeline.length === 0 ? (
        <Insufficient note="no quarter reached 10 reviews" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={timeline} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                minTickGap={24}
              />
              <YAxis
                yAxisId="pct"
                domain={[0, 1]}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={42}
              />
              <YAxis
                yAxisId="n"
                orientation="right"
                tick={{ fontSize: 11, fill: '#cbd5e1' }}
                tickLine={false}
                axisLine={false}
                width={42}
              />
              <RechartsTooltip content={<SentimentTooltip />} />
              <Bar
                yAxisId="n"
                dataKey="n_reviews"
                fill="#e2e8f0"
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
              />
              <Line
                yAxisId="pct"
                dataKey="pct_positive"
                stroke="#2a9d8f"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2a9d8f', strokeWidth: 0 }}
              />
              {protestPoint && (
                <ReferenceDot
                  yAxisId="pct"
                  x={protestPoint.label}
                  y={protestPoint.pct_positive}
                  r={7}
                  fill="#e0301e"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-1 flex gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-good" /> % of reviews positive
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-200" /> reviews per quarter
            </span>
          </div>
          {protestPoint && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-flag/20 bg-flag/5 px-4 py-3 text-sm leading-relaxed text-slate-700">
              <span aria-hidden className="text-flag">
                ⚠
              </span>
              <span>
                <span className="font-semibold text-flag">{g.protest.quarter_label}: </span>
                Protest event — anger at publisher decisions, not game quality (
                {Math.round(g.protest.publisher_conduct_share * 100)}% of that period’s
                complaints target publisher conduct).
              </span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ----------------------------- NLP themes ---------------------------- */

function ThemeTooltip({ active, payload, polarity }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
      {fmtPct(d.share)} of this game’s {polarity} reviews mention {d.theme}
    </div>
  );
}

function ThemeBars({ heading, subtitle, items, color, polarity }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{heading}</h3>
      <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
      {!items ? (
        <Insufficient note={`fewer than 20 ${polarity} reviews`} />
      ) : (
        <ResponsiveContainer width="100%" height={items.length * 38 + 16}>
          <BarChart
            data={items}
            layout="vertical"
            margin={{ top: 10, right: 44, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="theme"
              width={160}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <RechartsTooltip
              content={<ThemeTooltip polarity={polarity} />}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="share" fill={color} radius={[0, 4, 4, 0]} barSize={16}>
              <LabelList
                dataKey="share"
                position="right"
                formatter={(v) => fmtPct(v)}
                style={{ fontSize: 11, fill: '#64748b' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function ThemesSection({ game: g }) {
  return (
    <Card
      title="What players say"
      subtitle="Themes detected by reading every review with machine learning — shares of this game’s negative and positive reviews mentioning each theme."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <ThemeBars
          heading="Complaints"
          subtitle="% of this game’s negative reviews mentioning…"
          items={g.themes.complaints}
          color="#e0301e"
          polarity="negative"
        />
        <ThemeBars
          heading="Praise"
          subtitle="% of this game’s positive reviews mentioning…"
          items={g.themes.praises}
          color="#2a9d8f"
          polarity="positive"
        />
      </div>
    </Card>
  );
}

/* ----------------------------- engagement ---------------------------- */

function HoursTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
      {fmtInt(d.count)} reviewers played {d.label}
    </div>
  );
}

function EngagementSection({ game: g }) {
  return (
    <Card
      title="Engagement"
      subtitle="How long reviewers actually played before writing their review."
    >
      <div className="grid items-center gap-8 md:grid-cols-[200px_1fr]">
        <div className="rounded-xl bg-slate-50 p-5 text-center">
          {g.median_hours === null ? (
            <div className="text-sm italic text-slate-400">{INSUFFICIENT}</div>
          ) : (
            <>
              <div className="text-3xl font-bold tabular-nums tracking-tight text-slate-800">
                {fmtHours(g.median_hours)}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-slate-400">
                typical reviewer played this long (median)
              </div>
            </>
          )}
        </div>
        {!g.hours_histogram ? (
          <Insufficient note="no usable playtime records" />
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={g.hours_histogram}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={36}
                allowDecimals={false}
              />
              <RechartsTooltip content={<HoursTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill="#eb8c00" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------- quotes ------------------------------ */

function QuotesSection({ game: g }) {
  return (
    <Card
      title="Reviews worth reading"
      subtitle="Players who praise the game but voted it down — usually one fixable dealbreaker."
    >
      {g.quotes.length === 0 ? (
        <p className="text-sm italic text-slate-400">
          No qualifying reviews for this game.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {g.quotes.map((q, i) => (
            <figure
              key={i}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4"
            >
              <blockquote className="text-sm leading-relaxed text-slate-600">
                “{q.text}”
              </blockquote>
              <figcaption className="mt-3 text-xs font-medium text-slate-400">
                {q.hours === null ? INSUFFICIENT : `played ${fmtHours(q.hours)}`}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Card>
  );
}
