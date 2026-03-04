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
    knockout: {
      roundOf16: string[]; // 16 advancing team codes
      quarterfinals: string[]; // 8 advancing team codes
      semifinals: string[]; // 4 advancing team codes
      final: string[]; // 2 advancing team codes (finalists)
      champion: string; // Winner
      bronze: {
        finalist1: string; // First semifinal loser
        finalist2: string; // Second semifinal loser
        winner: string; // Bronze medal winner
      };
    };
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
      knockout: {
        roundOf16: { type: [String], required: true },
        quarterfinals: { type: [String], required: true },
        semifinals: { type: [String], required: true },
        final: { type: [String], required: true },
        champion: { type: String, required: true },
        bronze: {
          finalist1: { type: String, required: true },
          finalist2: { type: String, required: true },
          winner: { type: String, required: true },
        },
      },
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
