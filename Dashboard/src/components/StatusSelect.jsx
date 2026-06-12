import { STATUSES, useStatus } from '../context/StatusContext';

const STYLES = {
  'Not reviewed': 'border-slate-200 bg-white text-slate-400',
  Evaluated: 'border-[#577590]/40 bg-[#577590]/10 text-[#577590]',
  Passed: 'border-slate-300 bg-slate-100 text-slate-500',
  Shortlisted: 'border-pwc/40 bg-pwc/10 text-pwc',
};

export default function StatusSelect({ title }) {
  const { getStatus, setStatus } = useStatus();
  const value = getStatus(title);
  return (
    <select
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setStatus(title, e.target.value)}
      title="Your team's verdict on this game — saved on this device"
      className={`h-7 cursor-pointer rounded-full border px-2 text-xs font-medium
                  focus:outline-none focus:ring-2 focus:ring-pwc/20 ${STYLES[value]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
