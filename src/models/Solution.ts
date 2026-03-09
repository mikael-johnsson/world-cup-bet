import mongoose, { Schema, Document } from "mongoose";

export interface SolutionDocument extends Document {
  tournamentId: string;
  predictions?: {
    groupStage?: Array<{
      groupName?: string;
      matches?: Array<{
        matchId?: string;
        predictedHomeGoals?: number;
        predictedAwayGoals?: number;
      }>;
    }>;
    knockout?: {
      roundOf32?: string[]; // 32 advancing team codes
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
      type: new Schema(
        {
          groupStage: {
            type: [
              new Schema(
                {
                  groupName: { type: String },
                  matches: {
                    type: [
                      new Schema(
                        {
                          matchId: { type: String },
                          predictedHomeGoals: { type: Number },
                          predictedAwayGoals: { type: Number },
                        },
                        { _id: false },
                      ),
                    ],
                  },
                },
                { _id: false },
              ),
            ],
          },
          knockout: {
            type: new Schema(
              {
                roundOf32: { type: [String] },
                roundOf16: { type: [String] },
                quarterfinals: { type: [String] },
                semifinals: { type: [String] },
                final: { type: [String] },
                champion: { type: String },
                bronze: { type: String },
              },
              { _id: false },
            ),
          },
        },
        { _id: false },
      ),
      required: false,
      default: undefined,
    },
  },
  { timestamps: true },
);

export const Solution =
  mongoose.models.Solution ||
  mongoose.model<SolutionDocument>("Solution", solutionSchema);
