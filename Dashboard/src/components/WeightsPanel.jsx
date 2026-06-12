import Tip from './Tip';
import { COMPONENT_META, COMPONENT_COLORS } from '../lib/constants';

// Move one slider, the other five rescale so the six always sum to 100%.
export function renormalize(weights, key, newValue) {
  const v = Math.min(Math.max(newValue, 0), 1);
  const othersSum = 1 - weights[key];
  const next = {};
  for (const k of Object.keys(weights)) {
    if (k === key) next[k] = v;
    else if (othersSum <= 0) next[k] = (1 - v) / (Object.keys(weights).length - 1);
    else next[k] = weights[k] * ((1 - v) / othersSum);
  }
  return next;
}

export default function WeightsPanel({ weights, official, onChange, onClose }) {
  const isCustom = Object.keys(official).some(
    (k) => Math.abs(weights[k] - official[k]) > 0.0005,
  );

  return (
    <section className="rounded-2xl border border-pwc/20 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Adjust the priorities</h2>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-400">
            Our sensitivity analysis showed the top of the ranking barely moves under ±50%
            weight changes — try it.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => onChange(official)}
            disabled={!isCustom}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium
                       text-slate-600 transition-colors hover:bg-slate-50
                       disabled:cursor-default disabled:opacity-40"
          >
            Reset to official weights
          </button>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-lg px-2.5 py-1.5 text-sm text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-x-10 gap-y-4 md:grid-cols-2">
        {Object.keys(weights).map((key) => (
          <div key={key} className="flex items-center gap-3">
            <Tip tip={COMPONENT_META[key].tip} className="w-44 shrink-0">
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: COMPONENT_COLORS[key] }}
                />
                {COMPONENT_META[key].label}
              </span>
            </Tip>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(weights[key] * 100)}
              onChange={(e) => onChange(renormalize(weights, key, e.target.value / 100))}
              className="h-1.5 flex-1 cursor-pointer accent-pwc"
              aria-label={`Weight for ${COMPONENT_META[key].label}`}
            />
            <span className="w-10 text-right text-sm font-semibold tabular-nums text-slate-700">
              {Math.round(weights[key] * 100)}%
            </span>
          </div>
        ))}
      </div>

      {isCustom && (
        <p className="mt-4 text-xs font-medium text-pwc">
          Custom weights active — scores and ranks below are recomputed live. The official
          published weights are{' '}
          {Object.values(official).map((w) => Math.round(w * 100)).join(' / ')}.
        </p>
      )}
    </section>
  );
}
