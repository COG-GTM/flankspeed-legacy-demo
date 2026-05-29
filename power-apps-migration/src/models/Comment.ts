/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Models/Comment.cs
 * Source: Comments attached to WorkItems
 * Target: Azure SQL [dbo].[Comments] via Power Platform SQL connector
 */
import { User } from "./User";

export interface Comment {
  id: number;
  workItemId: number;
  authorUserId: number;
  authorUser?: User;
  text: string;
  createdAt: string;
}

export interface CommentFormData {
  workItemId: number;
  text: string;
}
