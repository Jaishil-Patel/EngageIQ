import Tip from './Tip';
import { CONFIDENCE_META, ARCHETYPE_META, PROTEST_LABEL } from '../lib/constants';

export function ConfidenceBadge({ tier }) {
  const meta = CONFIDENCE_META[tier] ?? CONFIDENCE_META.Low;
  return (
    <Tip tip={`${tier} confidence: ${meta.tip}`}>
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
      >
        {tier}
      </span>
    </Tip>
  );
}

export function ArchetypeChip({ archetype }) {
  return (
    <Tip tip={ARCHETYPE_META[archetype]}>
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        {archetype}
      </span>
    </Tip>
  );
}

export function ProtestBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-flag/10 px-2.5 py-0.5 text-xs font-medium text-flag">
      <span aria-hidden>⚠</span> {PROTEST_LABEL}
    </span>
  );
}
