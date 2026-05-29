/**
 * Migrated from: CwaController.AddComment() action
 *
 * Handles comment CRUD operations for CWA work items.
 * In the Power Apps target, this uses the Power Platform SQL connector
 * to insert records into the Comments table.
 */
import { Comment, CommentFormData } from "../models";

/**
 * Adds a comment to a work item.
 *
 * Legacy equivalent: CwaController.AddComment(POST)
 *
 * Business logic migrated:
 * - Creates Comment record with current user as author
 * - Creates AuditLog entry for "Comment Added"
 * - Updates WorkItem.LastUpdatedDate
 */
export async function addComment(data: CommentFormData): Promise<Comment> {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
}

/**
 * Fetches comments for a work item, ordered by CreatedAt descending.
 *
 * Legacy equivalent: Model.Comments.OrderByDescending(c => c.CreatedAt)
 */
export async function getComments(workItemId: number): Promise<Comment[]> {
  const response = await fetch(`/api/comments/workitem/${workItemId}`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}
