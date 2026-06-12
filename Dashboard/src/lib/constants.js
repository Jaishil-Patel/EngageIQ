// Plain-English labels and one-line explanations for everything on screen.
// All numbers come from dashboard_data.json — nothing numeric lives here.

export const INSUFFICIENT = 'Insufficient data';

export const SCORE_TIP =
  '0–100 composite of sentiment, engagement, momentum and stability — higher is a stronger acquisition candidate.';

// Display order matters: it matches the official weight order.
export const COMPONENT_META = {
  overall_positivity: {
    label: 'Overall positivity',
    tip: 'Share of all reviews that recommend the game.',
    why: 'The broadest signal of player satisfaction across the game’s whole life.',
  },
  recent_positivity: {
    label: 'Recent positivity',
    tip: 'Share of reviews from the last 6 months that recommend the game.',
    why: 'How players feel now — catches games getting better or worse.',
  },
  review_velocity: {
    label: 'Review momentum',
    tip: 'How many new reviews arrived in the last 6 months, relative to the catalogue.',
    why: 'A live, growing audience matters for a new platform launch.',
  },
  deep_player_positivity: {
    label: 'Deep-player positivity',
    tip: 'Share of reviews from players with 100+ hours that recommend the game.',
    why: 'The verdict of the people who know the game best.',
  },
  sentiment_stability: {
    label: 'Sentiment stability',
    tip: 'How steady the quarterly positive share has been over time — steadier scores higher.',
    why: 'GameVault is risk-averse: predictable sentiment beats swings.',
  },
  engagement_depth: {
    label: 'Engagement depth',
    tip: 'Typical hours reviewers have played, relative to the catalogue.',
    why: 'Games people sink real time into have durable appeal.',
  },
};

// Calm, distinguishable hues for the six score components (decomposition bar).
export const COMPONENT_COLORS = {
  overall_positivity: '#2a9d8f',
  recent_positivity: '#8ab17d',
  review_velocity: '#e9c46a',
  deep_player_positivity: '#f4a261',
  sentiment_stability: '#577590',
  engagement_depth: '#9c89b8',
};

export const CONFIDENCE_META = {
  High: {
    tip: 'Plenty of reviews behind this score — read it with confidence.',
    badge: 'bg-good/10 text-good border-good/30',
  },
  Medium: {
    tip: 'A moderate number of reviews — directionally reliable.',
    badge: 'bg-pwc-yellow/15 text-pwc-amber border-pwc-yellow/40',
  },
  Low: {
    tip: 'Very few reviews — treat this score as a rough indication only.',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};

export const ARCHETYPE_META = {
  'Evergreen': 'Consistently loved for 2.5+ years — durable, low-risk appeal.',
  'Rising Star': 'Very high positivity with a strong recent surge in new reviews.',
  'New Release (Unproven)': 'Less than 6 months of history — too early to judge durability.',
  'Solid Performer': 'Well-liked and steady, without standout momentum.',
  'Volatile Giant': 'Huge audience but mixed sentiment — popular and contentious at once.',
  'Declining': 'Sentiment and review flow falling versus the game’s own history.',
  'Contested': 'Players are split — a meaningful share do not recommend it.',
  'Insufficient Data': 'Too few reviews to classify with any confidence.',
};

export const PROTEST_LABEL = 'Protest event — see drill-down';

export const HERO_SENTENCE =
  'Scores summarise sentiment, engagement, momentum and stability — click any game for the evidence.';
