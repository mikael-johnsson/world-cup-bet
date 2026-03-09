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
    roundOf32: { type: [String]; default: [] };
    roundOf16: { type: [String]; default: [] };
    quarterfinals: { type: [String]; default: [] };
    semifinals: { type: [String]; default: [] };
    final: { type: [String]; default: [] };
    champion: { type: String; default: "" };
    bronze: { type: String; default: "" };
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
      roundOf32: { type: [String], default: [] },
      roundOf16: { type: [String], default: [] },
      quarterfinals: { type: [String], default: [] },
      semifinals: { type: [String], default: [] },
      final: { type: [String], default: [] },
      champion: { type: String, default: "" },
      bronze: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const Tournament =
  mongoose.models.Tournament ||
  mongoose.model<TournamentDocument>("Tournament", tournamentSchema);
