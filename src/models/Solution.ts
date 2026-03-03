import mongoose, { Schema, Document } from "mongoose";

export interface SolutionDocument extends Document {
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
  },
  { timestamps: true },
);

export const Solution =
  mongoose.models.Solution ||
  mongoose.model<SolutionDocument>("Solution", solutionSchema);
