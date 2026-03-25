import connectDB from "@/lib/db";
import { Group, GroupDocument } from "@/models/Group";

export const DEFAULT_GROUP_NAME = "default";

interface EnsureDefaultGroupOptions {
  defaultPasswordHash?: string;
}

/**
 * Ensures the built-in default group exists and returns it.
 *
 * This helper is idempotent:
 * - If the default group already exists, it returns that document.
 * - If it does not exist, it creates it using the provided password hash.
 */
export async function ensureDefaultGroup(
  options: EnsureDefaultGroupOptions = {},
): Promise<GroupDocument> {
  await connectDB();

  const existingDefaultGroup = await Group.findOne({
    name: DEFAULT_GROUP_NAME,
  });
  if (existingDefaultGroup) {
    return existingDefaultGroup;
  }

  if (!options.defaultPasswordHash) {
    throw new Error(
      "Missing defaultPasswordHash when creating default group for the first time",
    );
  }

  const createdDefaultGroup = await Group.create({
    name: DEFAULT_GROUP_NAME,
    passwordHash: options.defaultPasswordHash,
    users: [],
  });

  return createdDefaultGroup;
}
