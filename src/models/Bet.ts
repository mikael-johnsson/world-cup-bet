import mongoose, { Schema, Document } from "mongoose";

export interface BetDocument extends Document {
  userId?: string;
  tournamentId: string;
  predictions: {
    groupStage: Array<{
      groupName: string;
      matches: Array<{
        matchId: string;
        predictedHomeGoals: number;
        predictedAwayGoals: number;
      }>;
    }>;
    knockout: Array<{
      round:
        | "roundOf32"
        | "roundOf16"
        | "quarterfinals"
        | "semifinals"
        | "final";
      matches: Array<{
        matchId: string;
        predictedWinnerCode: string;
      }>;
    }>;
  };
  scoring: {
    groupStageScore: number;
    knockoutScore: number;
    totalScore: number;
    lastCalculated?: Date;
  };
  createdAt?: Date;
  submittedAt?: Date;
}

const betSchema = new Schema(
  {
    userId: String, // Phase 2: will be required
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    predictions: {
      groupStage: [
        {
          groupName: { type: String, required: true },
          matches: [
            {
              matchId: { type: String, required: true },
              predictedHomeGoals: { type: Number, required: true },
              predictedAwayGoals: { type: Number, required: true },
            },
          ],
        },
      ],
      knockout: [
        {
          round: {
            type: String,
            enum: [
              "roundOf32",
              "roundOf16",
              "quarterfinals",
              "semifinals",
              "final",
            ],
            required: true,
          },
          matches: [
            {
              matchId: { type: String, required: true },
              predictedWinnerCode: { type: String, required: true },
            },
          ],
        },
      ],
    },
    scoring: {
      groupStageScore: { type: Number, default: 0 },
      knockoutScore: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      lastCalculated: Date,
    },
    submittedAt: Date,
  },
  { timestamps: true },
);

// Unique index on (userId, tournamentId) to ensure one bet per user per tournament
// Using sparse: true to allow legacy bets without userId to coexist
betSchema.index({ userId: 1, tournamentId: 1 }, { unique: true, sparse: true });

export const Bet =
  mongoose.models.Bet || mongoose.model<BetDocument>("Bet", betSchema);
