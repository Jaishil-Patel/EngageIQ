import { useEffect, useState } from 'react';
import data from './data/dashboard_data.json';
import { StatusProvider } from './context/StatusContext';
import Watchlist from './views/Watchlist';
import GameDrilldown from './views/GameDrilldown';
import Methodology from './views/Methodology';

// view: { name: 'watchlist' } | { name: 'game', title } | { name: 'methodology' }
export default function App() {
  const [view, setView] = useState({ name: 'watchlist' });
  // Slider weights live here so they survive navigating into a game and back.
  const [weights, setWeights] = useState(data.meta.weights);

  useEffect(() => {
    window.scrollTo(0, 0); // each view starts at the top
  }, [view]);

  const navBtn = (label, target, active) => (
    <button
      onClick={() => setView({ name: target })}
      className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-pwc/10 text-pwc'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <StatusProvider>
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <button
              onClick={() => setView({ name: 'watchlist' })}
              className="flex items-baseline gap-2 text-left"
            >
              <span className="text-base font-semibold tracking-tight text-slate-800">
                EngageIQ
              </span>
              <span className="hidden text-sm text-slate-400 sm:inline">
                Game Acquisition Intelligence
              </span>
            </button>
            <nav className="flex items-center gap-1">
              {navBtn('Watchlist', 'watchlist', view.name !== 'methodology')}
              {navBtn('Methodology', 'methodology', view.name === 'methodology')}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          {view.name === 'watchlist' && (
            <Watchlist
              data={data}
              weights={weights}
              onWeightsChange={setWeights}
              onOpenGame={(title) => setView({ name: 'game', title })}
            />
          )}
          {view.name === 'game' && (
            <GameDrilldown
              data={data}
              title={view.title}
              onBack={() => setView({ name: 'watchlist' })}
            />
          )}
          {view.name === 'methodology' && <Methodology data={data} />}
        </main>
      </div>
    </StatusProvider>
  );
}
