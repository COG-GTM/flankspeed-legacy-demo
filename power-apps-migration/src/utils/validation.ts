/**
 * Form validation utilities migrated from server-side .NET validation
 * and client-side cwa-form.js logic.
 *
 * In Power Fx, these would be IsBlank() checks and If() conditions
 * on form field properties.
 */

/**
 * Validates that a required string field is not empty.
 * Power Fx equivalent: IsBlank(TextInput.Text)
 */
export function isRequired(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validates maximum length constraint.
 * Power Fx equivalent: Len(TextInput.Text) <= maxLength
 */
export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Validates date is in the future (for due dates).
 */
export function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return true; // optional field
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Formats a date string for display.
 * Legacy equivalent: @Model.SubmittedDate.ToString("yyyy-MM-dd")
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Formats a datetime string for display.
 * Legacy equivalent: @Model.LastUpdatedDate.ToString("yyyy-MM-dd HH:mm")
 */
export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
