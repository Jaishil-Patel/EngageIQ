// Hover tooltip: wrap any inline element. Pure CSS, no positioning library.
export default function Tip({ tip, children, className = '' }) {
  if (!tip) return children;
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-max
                   max-w-64 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-normal
                   leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150
                   group-hover/tip:visible group-hover/tip:opacity-100"
      >
        {tip}
      </span>
    </span>
  );
}
