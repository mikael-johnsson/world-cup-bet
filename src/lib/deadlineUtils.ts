/**
 * Deadline utility functions for betting deadline management
 * Handles checking if deadline has passed and formatting for display
 */

/**
 * Get the betting deadline date from environment variable
 * @returns Date object representing the betting deadline
 * @throws Error if BETTING_DEADLINE env variable is not set
 */
export function getBettingDeadline(): Date {
  const deadlineStr = process.env.BETTING_DEADLINE;

  if (!deadlineStr) {
    throw new Error("BETTING_DEADLINE environment variable is not set");
  }

  return new Date(deadlineStr);
}

/**
 * Check if the current time is after the betting deadline
 * @returns true if deadline has passed, false otherwise
 */
export function isAfterBettingDeadline(): boolean {
  try {
    const deadline = getBettingDeadline();
    return new Date() > deadline;
  } catch {
    // If deadline is not configured, allow betting to proceed
    return false;
  }
}

/**
 * Get the betting deadline as an ISO string
 * @returns ISO 8601 string representing the deadline
 */
export function getBettingDeadlineISO(): string {
  try {
    const deadline = getBettingDeadline();
    return deadline.toISOString();
  } catch {
    return "";
  }
}

/**
 * Format deadline for user display (e.g., "June 11, 2026 at 21:00 CEST")
 * @returns Formatted deadline string suitable for display to users
 */
export function getFormattedDeadlineDisplay(): string {
  try {
    const deadline = getBettingDeadline();

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Stockholm", // Swedish timezone
      timeZoneName: "short",
    };

    return deadline.toLocaleString("en-US", options);
  } catch {
    return "Deadline not available";
  }
}

/**
 * Get deadline status as an object for API responses
 * @returns Object with deadline ISO string and boolean indicating if passed
 */
export function getDeadlineStatus(): {
  deadline: string;
  isPassed: boolean;
} {
  return {
    deadline: getBettingDeadlineISO(),
    isPassed: isAfterBettingDeadline(),
  };
}
