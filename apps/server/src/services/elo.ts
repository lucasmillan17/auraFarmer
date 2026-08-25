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
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
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

export function calculateDraw(
  eloA: number,
  eloB: number,
  gamesA: number,
  gamesB: number
) {
  const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  const expectedB = 1 - expectedA;
  const kA = getKFactor(gamesA);
  const kB = getKFactor(gamesB);

  return {
    newEloA: Math.round(eloA + kA * (0.5 - expectedA)),
    newEloB: Math.round(eloB + kB * (0.5 - expectedB)),
    deltaA: Math.round(kA * (0.5 - expectedA)),
    deltaB: Math.round(kB * (0.5 - expectedB)),
  };
}
