/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Models/User.cs
 * Source: Entity Framework model with roles and team assignments
 * Target: Azure SQL [dbo].[Users] via Power Platform SQL connector
 */
export interface User {
  id: number;
  displayName: string;
  email: string;
  /** e.g., "Admin", "Reviewer", "Submitter", "Approver" */
  role: UserRole;
  /** e.g., "Operations", "IT", "Logistics", "Compliance" */
  team: string;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = "Admin" | "Reviewer" | "Submitter" | "Approver";

export const USER_ROLES: UserRole[] = ["Admin", "Reviewer", "Submitter", "Approver"];

export const TEAMS = ["Operations", "IT", "Logistics", "Compliance"] as const;
export type Team = (typeof TEAMS)[number];
