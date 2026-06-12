"""
prepare_data.py - builds the single JSON file the dashboard runs on.

Reads the CSVs produced by the analysis notebooks (01-04) from "Data analysis/data/"
and writes Dashboard/src/data/dashboard_data.json. No analysis is performed here:
every number is either copied from a notebook output file or a straight
aggregation (counts, percentages, histogram bin counts) of reviews_prepared.csv
as specified by the dashboard brief.

Run from the repo root:  python Dashboard/prepare_data.py
Re-runnable / idempotent: output depends only on the input CSVs.
Requires: pandas (numpy ships with it).
"""

import json
import math
from pathlib import Path

import numpy as np
import pandas as pd

REPO = Path(__file__).resolve().parent.parent
DATA = REPO / "Data analysis" / "data"
OUT = REPO / "Dashboard" / "src" / "data" / "dashboard_data.json"

# Official component weights from notebook 04 (the published score is
# sum(weight * component) * 100). Order here = display order in the UI.
WEIGHTS = {
    "overall_positivity": 0.30,
    "recent_positivity": 0.20,
    "review_velocity": 0.15,
    "deep_player_positivity": 0.15,
    "sentiment_stability": 0.10,
    "engagement_depth": 0.10,
}

MIN_QUARTER_REVIEWS = 10   # quarterly timeline: only quarters with >= 10 reviews
N_HOURS_BINS = 8           # log-spaced playtime histogram bins
QUOTE_MIN_WORDS, QUOTE_MAX_WORDS = 15, 60
MAX_QUOTES = 3


def clean(value):
    """NaN/NA -> None, numpy scalars -> python scalars, '' -> None."""
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if pd.isna(value):
        return None
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return round(float(value), 6)
    if isinstance(value, (np.bool_,)):
        return bool(value)
    if isinstance(value, str) and value.strip() == "":
        return None
    return value


def quarter_label(q):
    """'2017Q2' -> 'Q2 2017'."""
    year, qn = q.split("Q")
    return f"Q{qn} {year}"


def hours_label(lo, hi):
    def fmt(h):
        if h < 1:
            return f"{h:.1f}"
        if h < 10:
            return f"{h:.0f}"
        return f"{h:,.0f}"
    return f"{fmt(lo)}–{fmt(hi)}h"


def build_timeline(sub):
    """Quarterly sentiment for one game: quarters with >= MIN_QUARTER_REVIEWS reviews."""
    q = sub.groupby("quarter")["rec"].agg(n_reviews="size", pct_positive="mean")
    q = q[q["n_reviews"] >= MIN_QUARTER_REVIEWS].sort_index()
    return [
        {
            "quarter": idx,
            "label": quarter_label(idx),
            "n_reviews": int(row["n_reviews"]),
            "pct_positive": round(float(row["pct_positive"]), 4),
        }
        for idx, row in q.iterrows()
    ]


def build_hours_histogram(sub):
    """8 log-spaced bins of hour_played over rows where use_playtime is true."""
    hours = sub.loc[sub["use_playtime"], "hour_played"].dropna()
    hours = hours[hours > 0]
    if len(hours) == 0:
        return None
    lo, hi = float(hours.min()), float(hours.max())
    if lo == hi:  # degenerate: every reviewer logged the same hours
        return [{"label": hours_label(lo, hi), "min": lo, "max": hi, "count": int(len(hours))}]
    edges = np.logspace(math.log10(lo), math.log10(hi), N_HOURS_BINS + 1)
    counts, edges = np.histogram(hours, bins=edges)
    return [
        {
            "label": hours_label(edges[i], edges[i + 1]),
            "min": round(float(edges[i]), 2),
            "max": round(float(edges[i + 1]), 2),
            "count": int(counts[i]),
        }
        for i in range(len(counts))
    ]


def build_quotes(title, reviews, nlp_scores):
    """Up to 3 'love it, BUT...' reviews: downvoted yet text reads positive, 15-60 words."""
    rows = nlp_scores[
        (nlp_scores["title_clean"] == title) & (nlp_scores["disagree_down_but_positive"])
    ]
    if rows.empty:
        return []
    joined = rows.join(
        reviews[["review_text", "review_len_words", "hour_played"]], on="row_id", how="inner"
    )
    joined = joined[
        joined["review_len_words"].between(QUOTE_MIN_WORDS, QUOTE_MAX_WORDS)
    ].sort_values("text_pos_proba", ascending=False)
    return [
        {
            "text": str(r["review_text"]).strip(),
            "hours": clean(r["hour_played"]),
            "text_positivity": round(float(r["text_pos_proba"]), 4),
        }
        for _, r in joined.head(MAX_QUOTES).iterrows()
    ]


def theme_list(row, prefix):
    """Theme shares from nlp_game_signals; None when the notebook declined (<20 reviews)."""
    cols = [c for c in row.index if c.startswith(prefix)]
    if row[cols].isna().all():
        return None
    items = [
        {"theme": c.replace(prefix, ""), "share": round(float(row[c]), 4)}
        for c in cols
        if not pd.isna(row[c])
    ]
    return sorted(items, key=lambda d: d["share"], reverse=True)


def main():
    scorecard = pd.read_csv(DATA / "acquisition_scorecard.csv")
    signals = pd.read_csv(DATA / "nlp_game_signals.csv", index_col="title_clean")
    reviews = pd.read_csv(
        DATA / "reviews_prepared.csv",
        usecols=["title_clean", "rec", "quarter", "hour_played", "use_playtime",
                 "review_text", "review_len_words", "date"],
        parse_dates=["date"],
    )
    nlp_scores = pd.read_csv(
        DATA / "nlp_review_scores.csv",
        usecols=["row_id", "title_clean", "text_pos_proba", "disagree_down_but_positive"],
    )

    assert len(scorecard) == 23, f"expected 23 games, got {len(scorecard)}"
    by_game = dict(tuple(reviews.groupby("title_clean")))

    games = []
    for _, row in scorecard.sort_values("rank").iterrows():
        title = row["title_clean"]
        sub = by_game[title]
        sig = signals.loc[title]

        protest_flag = bool(row["protest_flag"])
        top_complaint = clean(row["top_complaint"])
        top_praise = clean(row["top_praise"])
        praise_cols = [c for c in sig.index if c.startswith("praise: ")]
        top_praise_share = clean(sig[praise_cols].max()) if top_praise else None

        games.append({
            "title": title,
            "rank": int(row["rank"]),
            "score": round(float(row["score"]), 2),
            "confidence": row["conf"],
            "archetype": row["archetype"],
            "n_reviews": int(row["n"]),
            "pct_positive": clean(row["pos"]),
            "recent_n": int(row["recent_n"]),
            "recent_positivity": clean(row["recent_pos_adj"]),
            "momentum": clean(row["momentum"]),
            "deep_positivity": clean(row["deep_pos_adj"]),
            "median_hours": clean(row["median_hours"]),
            "sentiment_volatility": clean(row["q_pos_std"]),
            "stability_unmeasured": bool(row["stability_unmeasured"]),
            "text_positivity": clean(row["text_pos_mean"]),
            "components": {name: clean(row[f"c_{name}"]) for name in WEIGHTS},
            "protest": {
                "flag": protest_flag,
                "quarter": clean(row["protest_quarter"]) if protest_flag else None,
                "quarter_label": quarter_label(str(row["protest_quarter"]))
                                 if protest_flag and clean(row["protest_quarter"]) else None,
                "publisher_conduct_share": clean(row["publisher_conduct_share"])
                                           if protest_flag else None,
            },
            "top_complaint": {"theme": top_complaint,
                              "share": clean(row["top_complaint_share"])}
                             if top_complaint else None,
            "top_praise": {"theme": top_praise, "share": top_praise_share}
                          if top_praise else None,
            "themes": {
                "complaints": theme_list(sig, "complaint: "),
                "praises": theme_list(sig, "praise: "),
            },
            "timeline": build_timeline(sub),
            "hours_histogram": build_hours_histogram(sub),
            "quotes": build_quotes(title, reviews, nlp_scores),
        })

    payload = {
        "meta": {
            "total_reviews": int(len(reviews)),
            "n_games": int(len(games)),
            "date_min": reviews["date"].min().strftime("%Y-%m-%d"),
            "date_max": reviews["date"].max().strftime("%Y-%m-%d"),
            "date_range_label": (
                f"{reviews['date'].min().strftime('%b %Y')} – "
                f"{reviews['date'].max().strftime('%b %Y')}"
            ),
            "weights": WEIGHTS,
        },
        "games": games,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False, allow_nan=False),
                   encoding="utf-8")
    print(f"wrote {OUT.relative_to(REPO)}  "
          f"({OUT.stat().st_size / 1024:.0f} KB, {len(games)} games)")


if __name__ == "__main__":
    main()
