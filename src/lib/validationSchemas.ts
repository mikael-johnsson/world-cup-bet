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

export const knockoutPredictionSchema = z.object({
  round: z.enum([
    "roundOf32",
    "roundOf16",
    "quarterfinals",
    "semifinals",
    "final",
  ]),
  matches: z.array(
    z.object({
      matchId: z.string(),
      predictedWinnerCode: z.string(),
    }),
  ),
});

export const betPredictionsSchema = z.object({
  groupStage: z.array(groupStagePredictionSchema),
  knockout: z.array(knockoutPredictionSchema),
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
