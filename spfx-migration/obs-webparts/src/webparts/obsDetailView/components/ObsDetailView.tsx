import * as React from "react";
import { SPFI } from "@pnp/sp";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  Stack,
  Text,
  Icon,
  Spinner,
  SpinnerSize,
  MessageBar,
  TextField,
  PrimaryButton,
  Dropdown,
  IDropdownOption,
  Persona,
  PersonaSize,
  Separator,
  Link,
  mergeStyleSets
} from "@fluentui/react";
import { ObsDataService } from "../../../services/ObsDataService";
import { IWorkItem, IComment, IAuditLog, IStatus } from "../../../models/IObsModels";

/**
 * OBS Detail View Component
 *
 * MIGRATION MAPPING:
 *   Legacy file:  Views/Obs/Details.cshtml
 *   Legacy route: /Obs/Details/{id}
 *
 * Replaces the detail page showing:
 *   - Work item metadata (title, status, priority, category, dates)
 *   - Comments section with add comment form
 *   - Audit log history
 *   - Status update dropdown
 *
 * POWER FX EQUIVALENTS:
 *
 *   // Load item details
 *   LookUp('OBS Work Items', ID = paramWorkItemId)
 *
 *   // Load comments
 *   SortByColumns(
 *     Filter(Comments, WorkItemId = paramWorkItemId),
 *     "CreatedAt", SortOrder.Descending
 *   )
 *
 *   // Add a comment
 *   Patch(Comments, Defaults(Comments), {
 *     WorkItemId: paramWorkItemId,
 *     Text: txtComment.Text,
 *     Author: { Value: User().Email }
 *   });
 *   Reset(txtComment)
 *
 *   // Update status
 *   Patch('OBS Work Items', ThisItem, {
 *     Status: { Value: dropdownStatus.Selected.Value },
 *     LastUpdatedDate: Now()
 *   })
 */

export interface IObsDetailViewProps {
  sp: SPFI;
  context: WebPartContext;
  itemId: number;
  showAuditLog: boolean;
  showAttachments: boolean;
}

interface IObsDetailViewState {
  item: IWorkItem | null;
  comments: IComment[];
  auditLogs: IAuditLog[];
  statuses: IStatus[];
  loading: boolean;
  error: string | null;
  newComment: string;
  submittingComment: boolean;
  selectedStatusId: number | null;
  updatingStatus: boolean;
}

const styles = mergeStyleSets({
  container: {
    padding: "16px",
    maxWidth: "960px"
  },
  header: {
    marginBottom: "16px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "600"
  },
  metadataGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#faf9f8",
    borderRadius: "8px",
    marginBottom: "16px"
  },
  metadataItem: {
    display: "flex",
    flexDirection: "column" as const
  },
  metadataLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#605e5c",
    textTransform: "uppercase" as const,
    marginBottom: "4px"
  },
  metadataValue: {
    fontSize: "14px"
  },
  section: {
    marginTop: "24px"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "12px"
  },
  commentCard: {
    padding: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid #edebe9",
    borderRadius: "6px",
    marginBottom: "8px"
  },
  auditRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #edebe9"
  },
  priorityBadge: {
    padding: "2px 8px",
    borderRadius: "3px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#ffffff",
    display: "inline-block"
  },
  description: {
    padding: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid #edebe9",
    borderRadius: "6px",
    whiteSpace: "pre-wrap" as const,
    lineHeight: "1.5"
  }
});

const priorityColors: Record<string, string> = {
  Critical: "#d13438",
  High: "#ca5010",
  Medium: "#8a8886",
  Low: "#107c10"
};

export class ObsDetailView extends React.Component<IObsDetailViewProps, IObsDetailViewState> {
  private dataService: ObsDataService;

  constructor(props: IObsDetailViewProps) {
    super(props);
    this.dataService = new ObsDataService(props.sp);
    this.state = {
      item: null,
      comments: [],
      auditLogs: [],
      statuses: [],
      loading: true,
      error: null,
      newComment: "",
      submittingComment: false,
      selectedStatusId: null,
      updatingStatus: false
    };
  }

  public componentDidMount(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [item, comments, auditLogs, statuses] = await Promise.all([
        this.dataService.getWorkItemById(this.props.itemId),
        this.dataService.getComments(this.props.itemId),
        this.dataService.getAuditLogs(this.props.itemId),
        this.dataService.getStatuses()
      ]);

      this.setState({
        item,
        comments,
        auditLogs,
        statuses,
        selectedStatusId: item?.StatusId || null,
        loading: false
      });
    } catch (err) {
      this.setState({ error: `Failed to load item: ${err}`, loading: false });
    }
  }

  private async handleAddComment(): Promise<void> {
    if (!this.state.newComment.trim()) return;

    this.setState({ submittingComment: true });
    try {
      await this.dataService.addComment(this.props.itemId, this.state.newComment);
      const comments = await this.dataService.getComments(this.props.itemId);
      this.setState({ comments, newComment: "", submittingComment: false });
    } catch (err) {
      this.setState({ error: `Failed to add comment: ${err}`, submittingComment: false });
    }
  }

  private async handleStatusUpdate(): Promise<void> {
    if (!this.state.selectedStatusId) return;

    this.setState({ updatingStatus: true });
    try {
      await this.dataService.updateStatus(this.props.itemId, this.state.selectedStatusId);
      const item = await this.dataService.getWorkItemById(this.props.itemId);
      const auditLogs = await this.dataService.getAuditLogs(this.props.itemId);
      this.setState({ item, auditLogs, updatingStatus: false });
    } catch (err) {
      this.setState({ error: `Failed to update status: ${err}`, updatingStatus: false });
    }
  }

  private renderMetadata(): React.ReactElement {
    const { item } = this.state;
    if (!item) return <></>;

    return (
      <div className={styles.metadataGrid}>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Status</span>
          <span className={styles.metadataValue}>{(item.Status as any)?.Name || "—"}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Priority</span>
          <span
            className={styles.priorityBadge}
            style={{ backgroundColor: priorityColors[item.Priority] || "#8a8886" }}
          >
            {item.Priority}
          </span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Category</span>
          <span className={styles.metadataValue}>{(item.Category as any)?.Name || "—"}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Assigned To</span>
          <Persona
            text={(item.AssignedToUser as any)?.Title || "Unassigned"}
            size={PersonaSize.size24}
          />
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Submitted By</span>
          <Persona
            text={(item.SubmittedByUser as any)?.Title || "—"}
            size={PersonaSize.size24}
          />
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Team</span>
          <span className={styles.metadataValue}>{item.TeamOwner || "—"}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Submitted</span>
          <span className={styles.metadataValue}>
            {new Date(item.SubmittedDate).toLocaleDateString()}
          </span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Due Date</span>
          <span className={styles.metadataValue}>
            {item.DueDate ? new Date(item.DueDate).toLocaleDateString() : "—"}
          </span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Last Updated</span>
          <span className={styles.metadataValue}>
            {new Date(item.LastUpdatedDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  }

  private renderStatusUpdate(): React.ReactElement {
    const statusOptions: IDropdownOption[] = this.state.statuses.map(s => ({
      key: s.Id,
      text: s.Name
    }));

    return (
      <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="end">
        <Dropdown
          label="Update Status"
          options={statusOptions}
          selectedKey={this.state.selectedStatusId || undefined}
          onChange={(_, option) => this.setState({ selectedStatusId: option?.key as number })}
          styles={{ dropdown: { width: 200 } }}
        />
        <PrimaryButton
          text="Update"
          onClick={() => this.handleStatusUpdate()}
          disabled={this.state.updatingStatus}
        />
      </Stack>
    );
  }

  private renderComments(): React.ReactElement {
    const { comments } = this.state;

    return (
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Icon iconName="Comment" /> Comments ({comments.length})
        </Text>

        {/* Add Comment Form */}
        <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginBottom: 16 }}>
          <Stack.Item grow>
            <TextField
              placeholder="Add a comment..."
              multiline
              rows={2}
              value={this.state.newComment}
              onChange={(_, val) => this.setState({ newComment: val || "" })}
            />
          </Stack.Item>
          <PrimaryButton
            text="Post"
            iconProps={{ iconName: "Send" }}
            onClick={() => this.handleAddComment()}
            disabled={this.state.submittingComment || !this.state.newComment.trim()}
          />
        </Stack>

        {/* Comment List */}
        {comments.map(comment => (
          <div key={comment.Id} className={styles.commentCard}>
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
              <Persona
                text={(comment.AuthorUser as any)?.Title || "Unknown"}
                size={PersonaSize.size24}
              />
              <Text variant="small" style={{ color: "#605e5c" }}>
                {new Date(comment.CreatedAt).toLocaleString()}
              </Text>
            </Stack>
            <Text style={{ marginTop: 8, display: "block" }}>{comment.Text}</Text>
          </div>
        ))}

        {comments.length === 0 && (
          <Text style={{ color: "#605e5c", fontStyle: "italic" }}>No comments yet.</Text>
        )}
      </div>
    );
  }

  private renderAuditLog(): React.ReactElement {
    const { auditLogs } = this.state;

    return (
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Icon iconName="History" /> Audit History ({auditLogs.length})
        </Text>

        {auditLogs.map(log => (
          <div key={log.Id} className={styles.auditRow}>
            <Stack>
              <Text style={{ fontWeight: "600" }}>{log.Action}</Text>
              <Text variant="small" style={{ color: "#605e5c" }}>
                by {(log.PerformedByUser as any)?.Title || "System"}
                {log.OldValue && log.NewValue && (
                  <> — changed from "{log.OldValue}" to "{log.NewValue}"</>
                )}
              </Text>
            </Stack>
            <Text variant="small" style={{ color: "#605e5c", whiteSpace: "nowrap" }}>
              {new Date(log.Timestamp).toLocaleString()}
            </Text>
          </div>
        ))}

        {auditLogs.length === 0 && (
          <Text style={{ color: "#605e5c", fontStyle: "italic" }}>No audit history.</Text>
        )}
      </div>
    );
  }

  public render(): React.ReactElement<IObsDetailViewProps> {
    const { item, loading, error } = this.state;

    if (loading) {
      return <Spinner size={SpinnerSize.large} label="Loading item details..." />;
    }

    if (error) {
      return <MessageBar messageBarType={1}>{error}</MessageBar>;
    }

    if (!item) {
      return <MessageBar messageBarType={2}>Item not found.</MessageBar>;
    }

    return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="#/obs">← Back to OBS Records</Link>
          <Text className={styles.title} block>
            <Icon iconName="TextDocument" /> OBS-{item.Id}: {item.Title}
          </Text>
        </div>

        {/* Metadata Grid */}
        {this.renderMetadata()}

        {/* Description */}
        {item.Description && (
          <div>
            <Text className={styles.sectionTitle}>Description</Text>
            <div className={styles.description}>{item.Description}</div>
          </div>
        )}

        {/* Status Update */}
        <Separator />
        {this.renderStatusUpdate()}

        {/* Comments */}
        {this.renderComments()}

        {/* Audit Log */}
        {this.props.showAuditLog && (
          <>
            <Separator />
            {this.renderAuditLog()}
          </>
        )}
      </div>
    );
  }
}
