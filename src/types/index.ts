export interface Team {
  code: string;
  name: string;
}

export interface GroupFixture {
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: Date;
  homeGoals?: number;
  awayGoals?: number;
  status: "pending" | "completed";
}

export interface Group {
  name: string;
  teams: Team[];
  fixtures: GroupFixture[];
}

export interface KnockoutMatch {
  matchId: string;
  teamA: Team;
  teamB: Team;
  winner?: string; // team code
  matchDate?: Date;
  status: "pending" | "completed";
}

export interface KnockoutRound {
  roundOf32?: KnockoutMatch[];
  roundOf16?: KnockoutMatch[];
  quarterfinals?: KnockoutMatch[];
  semifinals?: KnockoutMatch[];
  final?: KnockoutMatch[];
}

export interface TournamentType {
  _id?: string;
  year: number;
  groups: Group[];
  knockout: KnockoutRound;
  createdAt?: Date;
}

export interface GroupStagePrediction {
  groupName: string;
  matches: {
    matchId: string;
    predictedHomeGoals: number;
    predictedAwayGoals: number;
  }[];
}

export interface KnockoutPrediction {
  round: "roundOf32" | "roundOf16" | "quarterfinals" | "semifinals" | "final";
  matches: {
    matchId: string;
    predictedWinnerCode: string;
  }[];
}

export interface BetPredictions {
  groupStage: GroupStagePrediction[];
  knockout: KnockoutPrediction[];
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
    lastCalculated?: Date;
  };
  createdAt?: Date;
  submittedAt?: Date;
}

export interface Solution {
  _id?: string;
  tournamentId: string;
  predictions: BetPredictions;
  createdAt?: Date;
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt?: Date;
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
