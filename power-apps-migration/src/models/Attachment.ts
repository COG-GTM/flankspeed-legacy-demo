/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Models/Attachment.cs
 * Source: File attachment metadata (stub/metadata only in legacy — no actual file storage)
 * Target: Azure SQL [dbo].[Attachments] + SharePoint Document Library for actual files
 *
 * Migration note: In the Power Apps target, file storage should leverage
 * SharePoint document libraries via the SharePoint connector, with metadata
 * stored in Azure SQL for fast querying.
 */
import { User } from "./User";

export interface Attachment {
  id: number;
  workItemId: number;
  fileName: string;
  fileSize: number;
  uploadedByUserId: number;
  uploadedByUser?: User;
  uploadedAt: string;
}
