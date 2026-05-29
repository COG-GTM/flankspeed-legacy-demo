/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Models/Category.cs
 * Source: Lookup table partitioned by module ("OBS" or "CWA")
 * Target: Azure SQL [dbo].[Categories] via Power Platform SQL connector
 */
export interface Category {
  id: number;
  name: string;
  /** "OBS" or "CWA" to partition usage */
  module: "OBS" | "CWA";
  description: string | null;
}

/** CWA-specific category names from seed data */
export const CWA_CATEGORIES = [
  "Facility Access Request",
  "Equipment Relocation",
  "Personnel Action",
  "Travel Authorization",
] as const;

export type CwaCategoryName = (typeof CWA_CATEGORIES)[number];
