/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Models/Status.cs
 * Source: Status lookup table with module partitioning and sort order
 * Target: Azure SQL [dbo].[Statuses] via Power Platform SQL connector
 */
export interface Status {
  id: number;
  name: string;
  /** "OBS", "CWA", or "Shared" */
  module: "OBS" | "CWA" | "Shared";
  sortOrder: number;
}

/** CWA-specific status values */
export const CWA_STATUSES = [
  "Draft",
  "Submitted",
  "Pending Approval",
  "Approved",
  "Rejected",
  "Returned",
] as const;

export type CwaStatusName = (typeof CWA_STATUSES)[number];
