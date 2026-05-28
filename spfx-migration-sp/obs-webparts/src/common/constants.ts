/** SharePoint List names used in the OBS module */
export const SP_LISTS = {
  WORK_ITEMS: "OBS Work Items",
  COMMENTS: "Comments",
  AUDIT_LOG: "Audit Log",
  CATEGORIES: "Categories",
  STATUSES: "Statuses"
} as const;

/** Priority levels and their display colors (Fluent UI palette) */
export const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#d13438",
  High: "#ca5010",
  Medium: "#8a8886",
  Low: "#107c10"
};

/** Status names used in OBS module */
export const OBS_STATUSES = [
  "Draft",
  "Submitted",
  "Under Review",
  "In Progress",
  "Completed",
  "Closed"
] as const;

/** Category names used in OBS module */
export const OBS_CATEGORIES = [
  "Infrastructure Review",
  "Compliance Audit",
  "Operational Assessment",
  "Resource Allocation"
] as const;

/** Team names */
export const TEAMS = [
  "Operations",
  "IT",
  "Logistics",
  "Compliance"
] as const;

/** Default page size for list views */
export const DEFAULT_PAGE_SIZE = 20;
