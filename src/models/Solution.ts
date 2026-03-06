import mongoose, { Schema, Document } from "mongoose";

export interface SolutionDocument extends Document {
  tournamentId: string;
  predictions: {
    groupStage?: Array<{
      groupName: string;
      matches?: Array<{
        matchId: string;
        predictedHomeGoals: number;
        predictedAwayGoals: number;
      }>;
    }>;
    knockout: {
      roundOf16?: string[]; // 16 advancing team codes
      quarterfinals?: string[]; // 8 advancing team codes
      semifinals?: string[]; // 4 advancing team codes
      final?: string[]; // 2 advancing team codes (finalists)
      champion?: string; // Winner
      bronze?: string; // Bronze medal winner team code
    };
  };
  createdAt?: Date;
}

const solutionSchema = new Schema(
  {
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
        roundOf16: { type: [String] },
        quarterfinals: { type: [String] },
        semifinals: { type: [String] },
        final: { type: [String] },
        champion: { type: String },
        bronze: { type: String },
      },
    },
  },
  { timestamps: true },
);

export const Solution =
  mongoose.models.Solution ||
  mongoose.model<SolutionDocument>("Solution", solutionSchema);
