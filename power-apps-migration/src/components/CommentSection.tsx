/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Views/Cwa/Details.cshtml (Comments section)
 *
 * Displays comments for a work item and provides a form to add new comments.
 * In the Power Apps target, this maps to a Gallery control for display and
 * a TextInput + Button for submission.
 *
 * Power Fx equivalent:
 *   Gallery.Items = SortByColumns(Filter(Comments, WorkItemId = ThisItem.Id), "CreatedAt", Descending)
 *   Button.OnSelect = Patch(Comments, Defaults(Comments), {WorkItemId: ThisItem.Id, Text: txtComment.Text})
 */
import { useState } from "react";
import { Comment } from "../models";
import { addComment } from "../services/CommentService";
import { formatDateTime } from "../utils/validation";

interface CommentSectionProps {
  comments: Comment[];
  workItemId: number;
  onCommentAdded: () => void;
}

export function CommentSection({
  comments,
  workItemId,
  onCommentAdded,
}: CommentSectionProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await addComment({ workItemId, text });
      setText("");
      onCommentAdded();
    } finally {
      setSubmitting(false);
    }
  };

  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h3>Comments ({comments.length})</h3>

      {sortedComments.map((comment) => (
        <div key={comment.id} className="comment-card">
          <strong>{comment.authorUser?.displayName}</strong>
          <small className="text-muted"> {formatDateTime(comment.createdAt)}</small>
          <p style={{ marginTop: "5px" }}>{comment.text}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <div className="form-group">
          <textarea
            className="form-control"
            rows={3}
            placeholder="Add a comment..."
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn btn-default btn-sm"
          disabled={submitting}
          style={{ marginTop: "5px" }}
        >
          {submitting ? "Adding..." : "Add Comment"}
        </button>
      </form>
    </div>
  );
}
