export const RANKS = [
  { name: "Cringe", minElo: 0, icon: "\uD83D\uDC80", mono: "#3A3A3A" },
  { name: "Mortal", minElo: 800, icon: "\uD83D\uDE10", mono: "#555555" },
  { name: "Normie", minElo: 1000, icon: "\uD83D\uDE0E", mono: "#777777" },
  { name: "Chadlite", minElo: 1200, icon: "\uD83D\uDCAA", mono: "#999999" },
  { name: "Chad", minElo: 1400, icon: "\uD83E\uDD81", mono: "#BBBBBB" },
  { name: "GigaChad", minElo: 1600, icon: "\uD83D\uDDFF", mono: "#DDDDDD" },
  { name: "Infinite Aura", minElo: 1800, icon: "\uD83D\uDC41\uFE0F", mono: "aura" },
] as const;

export type RankName = (typeof RANKS)[number]["name"];

interface Rank {
  name: string;
  minElo: number;
  icon: string;
  mono: string;
}

export function getRank(elo: number): Rank {
  let rank: Rank = RANKS[0];
  for (const r of RANKS) {
    if (elo >= r.minElo) rank = r;
    else break;
  }
  return rank;
}

export function getDuelDuration(rankName: RankName): number {
  if (rankName === "Cringe" || rankName === "Mortal") return 10;
  if (rankName === "Normie" || rankName === "Chadlite") return 12;
  return 15;
}

export function getKFactor(gamesPlayed: number): number {
  if (gamesPlayed < 10) return 50;
  if (gamesPlayed < 30) return 30;
  return 20;
}

export function calculateElo(
  winnerElo: number,
  loserElo: number,
  winnerGames: number,
  loserGames: number
) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;
  const kW = getKFactor(winnerGames);
  const kL = getKFactor(loserGames);

  return {
    newWinnerElo: Math.round(winnerElo + kW * (1 - expectedWinner)),
    newLoserElo: Math.round(loserElo + kL * (0 - expectedLoser)),
    deltaWinner: Math.round(kW * (1 - expectedWinner)),
    deltaLoser: Math.round(kL * (0 - expectedLoser)),
  };
}

export const GUEST_STARTING_ELO = 1200;
