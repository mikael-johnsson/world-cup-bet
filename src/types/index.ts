export interface Team {
  code: string;
  name: string;
}

export interface GroupFixture {
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string; // ISO 8601 date string from server
  homeGoals?: number;
  awayGoals?: number;
  status: "pending" | "completed";
}

export interface Group {
  name: string;
  teams: Team[];
  fixtures: GroupFixture[];
}

// export interface KnockoutMatch {
//   matchId: string;
//   teamA: Team;
//   teamB: Team;
//   winner?: string; // team code
//   matchDate?: string; // ISO 8601 date string from server
//   status: "pending" | "completed";
// }

// export interface KnockoutRound {
//   roundOf32?: KnockoutMatch[];
//   roundOf16?: KnockoutMatch[];
//   quarterfinals?: KnockoutMatch[];
//   semifinals?: KnockoutMatch[];
//   final?: KnockoutMatch[];
// }

export interface TournamentType {
  _id?: string;
  year: number;
  groups: Group[];
  knockout: KnockoutProgression;
  createdAt?: string; // ISO 8601 date string from server
}

export interface GroupStagePrediction {
  groupName: string;
  matches: {
    matchId: string;
    predictedHomeGoals: number;
    predictedAwayGoals: number;
  }[];
}

export interface KnockoutProgression {
  roundOf16: string[]; // 16 team codes that advance from groups
  quarterfinals: string[]; // 8 teams advance to QF
  semifinals: string[]; // 4 teams advance to SF
  final: string[]; // 2 teams in final
  champion: string; // Winner of the final
  bronze: string; // Bronze medal winner team code
}

export interface BetPredictions {
  groupStage: GroupStagePrediction[];
  knockout: KnockoutProgression;
}

export interface Bet {
  _id?: string;
  userId?: string; // Phase 2
  tournamentId: string;
  predictions: BetPredictions;
  scoring: {
    groupStageScore: number;
    knockoutScore: number;
    totalScore: number;
    lastCalculated?: string; // ISO 8601 date string
  };
  createdAt?: string; // ISO 8601 date string
  submittedAt?: string; // ISO 8601 date string
}

export interface Solution {
  _id?: string;
  tournamentId: string;
  predictions: BetPredictions;
  createdAt?: string; // ISO 8601 date string
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt?: string; // ISO 8601 date string
}

export interface TeamStanding {
  teamCode: string;
  teamName: string;
  played: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface ThirdPlaceStanding extends TeamStanding {
  groupName: string;
}
