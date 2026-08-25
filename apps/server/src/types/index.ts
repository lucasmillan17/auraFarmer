export interface UserRecord {
  id: string;
  nickname: string;
  countryCode: string | null;
  elo: number;
  gamesPlayed: number;
  rankName: string;
  isGuest: boolean;
}

export interface MatchRecord {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  winnerId: string | null;
  mode: "face" | "body";
  player1EloDelta: number;
  player2EloDelta: number;
}

export interface MatchmakingEntry {
  userId: string;
  socketId: string;
  elo: number;
  mode: "face" | "body";
  joinedAt: number;
}

export interface SocketUser {
  userId: string;
  nickname: string;
  elo: number;
  rankName: string;
  countryCode: string;
}
