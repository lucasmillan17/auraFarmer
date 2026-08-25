import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nickname: varchar("nickname", { length: 30 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }),
    elo: integer("elo").default(1200).notNull(),
    gamesPlayed: integer("games_played").default(0).notNull(),
    rankName: varchar("rank_name", { length: 20 }).default("Cringe").notNull(),
    isGuest: boolean("is_guest").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    eloIdx: index("idx_users_elo").on(table.elo.desc()),
  })
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    player1Id: uuid("player1_id")
      .notNull()
      .references(() => users.id),
    player2Id: uuid("player2_id")
      .notNull()
      .references(() => users.id),
    player1Score: decimal("player1_score", { precision: 4, scale: 1 }),
    player2Score: decimal("player2_score", { precision: 4, scale: 1 }),
    winnerId: uuid("winner_id").references(() => users.id),
    mode: varchar("mode", { length: 10 }).notNull(),
    player1EloDelta: integer("player1_elo_delta"),
    player2EloDelta: integer("player2_elo_delta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    createdIdx: index("idx_matches_created").on(table.createdAt.desc()),
  })
);
