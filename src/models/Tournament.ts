import mongoose, { Schema, Document } from "mongoose";

export interface TournamentDocument extends Document {
  year: number;
  groups: Array<{
    name: string;
    teams: Array<{
      code: string;
      name: string;
    }>;
    fixtures: Array<{
      matchId: string;
      homeTeam: {
        code: string;
        name: string;
      };
      awayTeam: {
        code: string;
        name: string;
      };
      matchDate: Date;
      homeGoals?: number;
      awayGoals?: number;
      status: "pending" | "completed";
    }>;
  }>;
  knockout: {
    roundOf32?: Array<{
      matchId: string;
      teamA: {
        code: string;
        name: string;
      };
      teamB: {
        code: string;
        name: string;
      };
      winner?: string;
      matchDate?: Date;
      status: "pending" | "completed";
    }>;
    roundOf16?: Array<{
      matchId: string;
      teamA: {
        code: string;
        name: string;
      };
      teamB: {
        code: string;
        name: string;
      };
      winner?: string;
      matchDate?: Date;
      status: "pending" | "completed";
    }>;
    quarterfinals?: Array<{
      matchId: string;
      teamA: {
        code: string;
        name: string;
      };
      teamB: {
        code: string;
        name: string;
      };
      winner?: string;
      matchDate?: Date;
      status: "pending" | "completed";
    }>;
    semifinals?: Array<{
      matchId: string;
      teamA: {
        code: string;
        name: string;
      };
      teamB: {
        code: string;
        name: string;
      };
      winner?: string;
      matchDate?: Date;
      status: "pending" | "completed";
    }>;
    final?: Array<{
      matchId: string;
      teamA: {
        code: string;
        name: string;
      };
      teamB: {
        code: string;
        name: string;
      };
      winner?: string;
      matchDate?: Date;
      status: "pending" | "completed";
    }>;
  };
  createdAt?: Date;
}

const tournamentSchema = new Schema(
  {
    year: { type: Number, required: true, unique: true },
    groups: [
      {
        name: { type: String, required: true },
        teams: [
          {
            code: { type: String, required: true },
            name: { type: String, required: true },
          },
        ],
        fixtures: [
          {
            matchId: { type: String, required: true },
            homeTeam: {
              code: { type: String, required: true },
              name: { type: String, required: true },
            },
            awayTeam: {
              code: { type: String, required: true },
              name: { type: String, required: true },
            },
            matchDate: { type: Date, required: true },
            homeGoals: Number,
            awayGoals: Number,
            status: {
              type: String,
              enum: ["pending", "completed"],
              default: "pending",
            },
          },
        ],
      },
    ],
    knockout: {
      roundOf32: [
        {
          matchId: { type: String, required: true },
          teamA: {
            code: String,
            name: String,
          },
          teamB: {
            code: String,
            name: String,
          },
          winner: String,
          matchDate: Date,
          status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
          },
        },
      ],
      roundOf16: [
        {
          matchId: { type: String, required: true },
          teamA: {
            code: String,
            name: String,
          },
          teamB: {
            code: String,
            name: String,
          },
          winner: String,
          matchDate: Date,
          status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
          },
        },
      ],
      quarterfinals: [
        {
          matchId: { type: String, required: true },
          teamA: {
            code: String,
            name: String,
          },
          teamB: {
            code: String,
            name: String,
          },
          winner: String,
          matchDate: Date,
          status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
          },
        },
      ],
      semifinals: [
        {
          matchId: { type: String, required: true },
          teamA: {
            code: String,
            name: String,
          },
          teamB: {
            code: String,
            name: String,
          },
          winner: String,
          matchDate: Date,
          status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
          },
        },
      ],
      final: [
        {
          matchId: { type: String, required: true },
          teamA: {
            code: String,
            name: String,
          },
          teamB: {
            code: String,
            name: String,
          },
          winner: String,
          matchDate: Date,
          status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
          },
        },
      ],
    },
  },
  { timestamps: true },
);

export const Tournament =
  mongoose.models.Tournament ||
  mongoose.model<TournamentDocument>("Tournament", tournamentSchema);
