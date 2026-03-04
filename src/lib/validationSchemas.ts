import { z } from "zod";

export const groupStagePredictionSchema = z.object({
  groupName: z.string(),
  matches: z.array(
    z.object({
      matchId: z.string(),
      predictedHomeGoals: z.number().min(0),
      predictedAwayGoals: z.number().min(0),
    }),
  ),
});

export const knockoutProgressionSchema = z.object({
  roundOf16: z
    .array(z.string())
    .length(16, "Must select exactly 16 teams for Round of 16"),
  quarterfinals: z
    .array(z.string())
    .length(8, "Must select exactly 8 teams for Quarterfinals"),
  semifinals: z
    .array(z.string())
    .length(4, "Must select exactly 4 teams for Semifinals"),
  final: z.array(z.string()).length(2, "Must select exactly 2 teams for Final"),
  champion: z.string().min(2, "Champion team code is required"),
  bronze: z.object({
    finalist1: z.string().min(2, "First bronze finalist team code required"),
    finalist2: z.string().min(2, "Second bronze finalist team code required"),
    winner: z.string().min(2, "Bronze medal winner team code required"),
  }),
});

export const betPredictionsSchema = z.object({
  groupStage: z.array(groupStagePredictionSchema),
  knockout: knockoutProgressionSchema,
});

export const betSchema = z.object({
  tournamentId: z.string(),
  predictions: betPredictionsSchema,
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscore",
    ),
  email: z.email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type BetInput = z.infer<typeof betSchema>;
export type BetPredictionsInput = z.infer<typeof betPredictionsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
