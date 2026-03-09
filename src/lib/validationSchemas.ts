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

// Optional group stage schema for solutions (matches can be empty, groups can be omitted)
export const optionalGroupStageGroupSchema = z.object({
  groupName: z.string(),
  matches: z
    .array(
      z.object({
        matchId: z.string(),
        predictedHomeGoals: z.number().min(0),
        predictedAwayGoals: z.number().min(0),
      }),
    )
    .optional(),
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
  bronze: z.string().min(2, "Bronze medal winner team code is required"),
});

// Optional knockout schema for partial solutions (admin can submit incremental results)
export const optionalKnockoutProgressionSchema = z.object({
  roundOf32: z
    .array(z.string())
    .length(32, "Must select exactly 32 teams for Round of 32")
    .optional(),
  roundOf16: z
    .array(z.string())
    .length(16, "Must select exactly 16 teams for Round of 16")
    .optional(),
  quarterfinals: z
    .array(z.string())
    .length(8, "Must select exactly 8 teams for Quarterfinals")
    .optional(),
  semifinals: z
    .array(z.string())
    .length(4, "Must select exactly 4 teams for Semifinals")
    .optional(),
  final: z
    .array(z.string())
    .length(2, "Must select exactly 2 teams for Final")
    .optional(),
  champion: z.string().min(2, "Champion team code is required").optional(),
  bronze: z
    .string()
    .min(2, "Bronze medal winner team code is required")
    .optional(),
});

export const betPredictionsSchema = z.object({
  groupStage: z.array(groupStagePredictionSchema),
  knockout: knockoutProgressionSchema,
});

// Solution predictions allow partial data: groups can be omitted, matches within groups can be empty, and knockout can be partial
export const solutionPredictionsSchema = z.object({
  groupStage: z.array(optionalGroupStageGroupSchema).optional(),
  knockout: optionalKnockoutProgressionSchema.optional(),
});

export const betSchema = z.object({
  tournamentId: z.string(),
  predictions: betPredictionsSchema,
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be at most 15 characters")
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
