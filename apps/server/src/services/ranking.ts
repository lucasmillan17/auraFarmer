const RANKS = [
  { name: "Cringe", minElo: 0 },
  { name: "Mortal", minElo: 800 },
  { name: "Normie", minElo: 1000 },
  { name: "Chadlite", minElo: 1200 },
  { name: "Chad", minElo: 1400 },
  { name: "GigaChad", minElo: 1600 },
  { name: "Infinite Aura", minElo: 1800 },
] as const;

export function getRankName(elo: number): string {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (elo >= r.minElo) rank = r.name;
    else break;
  }
  return rank;
}

export function getDuelDuration(rankName: string): number {
  if (rankName === "Cringe" || rankName === "Mortal") return 10;
  if (rankName === "Normie" || rankName === "Chadlite") return 12;
  return 15;
}
