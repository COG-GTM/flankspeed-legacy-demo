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
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  Link,
  mergeStyleSets
} from "@fluentui/react";
import { ObsDataService } from "../../../services/ObsDataService";
import { IDashboardSummary, IWorkItem } from "../../../models/IObsModels";

/**
 * OBS Dashboard Component
 *
 * MIGRATION MAPPING:
 *   Legacy file:  Views/Obs/Dashboard.cshtml
 *   Legacy route: /Obs/Dashboard
 *
 * Replaces the dashboard panels showing status counts, priority counts,
 * team breakdown, assigned items queue, and overdue items.
 *
 * POWER FX EQUIVALENTS for dashboard calculations:
 *
 *   // Total OBS Items
 *   CountRows('OBS Work Items')
 *
 *   // Count by Status
 *   CountRows(Filter('OBS Work Items', Status.Value = "In Progress"))
 *   CountRows(Filter('OBS Work Items', Status.Value = "Under Review"))
 *   CountRows(Filter('OBS Work Items', Status.Value = "Completed"))
 *
 *   // Count by Priority
 *   CountRows(Filter('OBS Work Items', Priority.Value = "Critical"))
 *   CountRows(Filter('OBS Work Items', Priority.Value = "High"))
 *
 *   // My Assigned Items
 *   Filter('OBS Work Items', AssignedTo.Email = User().Email)
 *
 *   // Overdue Items
 *   Filter('OBS Work Items', DueDate < Now(), Status.Value <> "Closed", Status.Value <> "Completed")
 */

export interface IObsDashboardProps {
  sp: SPFI;
  context: WebPartContext;
  showOverdueSection: boolean;
  showTeamBreakdown: boolean;
}

interface IObsDashboardState {
  summary: IDashboardSummary | null;
  loading: boolean;
  error: string | null;
}

const styles = mergeStyleSets({
  container: {
    padding: "16px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "16px"
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  card: {
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1.6px 3.6px rgba(0,0,0,0.132), 0 0.3px 0.9px rgba(0,0,0,0.108)",
    textAlign: "center" as const
  },
  cardValue: {
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "40px"
  },
  cardLabel: {
    fontSize: "13px",
    color: "#605e5c",
    marginTop: "4px"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    marginTop: "16px"
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderBottom: "1px solid #edebe9"
  },
  overdueCard: {
    backgroundColor: "#fde7e9",
    borderLeft: "4px solid #d13438"
  },
  teamCard: {
    backgroundColor: "#f3f2f1"
  }
});

export class ObsDashboard extends React.Component<IObsDashboardProps, IObsDashboardState> {
  private dataService: ObsDataService;

  constructor(props: IObsDashboardProps) {
    super(props);
    this.dataService = new ObsDataService(props.sp);
    this.state = {
      summary: null,
      loading: true,
      error: null
    };
  }

  public componentDidMount(): void {
    this.loadDashboard();
  }

  private async loadDashboard(): Promise<void> {
    try {
      const userEmail = this.props.context.pageContext.user.email;
      const summary = await this.dataService.getDashboardSummary(userEmail);
      this.setState({ summary, loading: false });
    } catch (err) {
      this.setState({ error: `Failed to load dashboard: ${err}`, loading: false });
    }
  }

  private renderSummaryCards(): React.ReactElement {
    const { summary } = this.state;
    if (!summary) return <></>;

    return (
      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <div className={styles.cardValue} style={{ color: "#0078d4" }}>
            {summary.totalItems}
          </div>
          <div className={styles.cardLabel}>Total OBS Items</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValue} style={{ color: "#ca5010" }}>
            {summary.countByStatus["In Progress"] || 0}
          </div>
          <div className={styles.cardLabel}>In Progress</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValue} style={{ color: "#8764b8" }}>
            {summary.countByStatus["Under Review"] || 0}
          </div>
          <div className={styles.cardLabel}>Under Review</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValue} style={{ color: "#107c10" }}>
            {summary.countByStatus["Completed"] || 0}
          </div>
          <div className={styles.cardLabel}>Completed</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValue} style={{ color: "#d13438" }}>
            {summary.countByPriority["Critical"] || 0}
          </div>
          <div className={styles.cardLabel}>Critical Priority</div>
        </div>
      </div>
    );
  }

  private renderStatusBreakdown(): React.ReactElement {
    const { summary } = this.state;
    if (!summary) return <></>;

    return (
      <div>
        <Text className={styles.sectionTitle}>
          <Icon iconName="BarChart4" /> Status Breakdown
        </Text>
        {Object.entries(summary.countByStatus).map(([status, count]) => (
          <div key={status} className={styles.statusRow}>
            <Text>{status}</Text>
            <Text style={{ fontWeight: "600" }}>{count}</Text>
          </div>
        ))}
      </div>
    );
  }

  private renderPriorityBreakdown(): React.ReactElement {
    const { summary } = this.state;
    if (!summary) return <></>;

    return (
      <div>
        <Text className={styles.sectionTitle}>
          <Icon iconName="Warning" /> Priority Breakdown
        </Text>
        {Object.entries(summary.countByPriority).map(([priority, count]) => (
          <div key={priority} className={styles.statusRow}>
            <Text>{priority}</Text>
            <Text style={{ fontWeight: "600" }}>{count}</Text>
          </div>
        ))}
      </div>
    );
  }

  private renderTeamBreakdown(): React.ReactElement {
    const { summary } = this.state;
    if (!summary) return <></>;

    return (
      <div>
        <Text className={styles.sectionTitle}>
          <Icon iconName="Group" /> Team Breakdown
        </Text>
        {Object.entries(summary.countByTeam).map(([team, count]) => (
          <div key={team} className={styles.statusRow}>
            <Text>{team}</Text>
            <Text style={{ fontWeight: "600" }}>{count}</Text>
          </div>
        ))}
      </div>
    );
  }

  private renderMyAssignedItems(): React.ReactElement {
    const { summary } = this.state;
    if (!summary || summary.myAssignedItems.length === 0) {
      return (
        <div>
          <Text className={styles.sectionTitle}>
            <Icon iconName="ContactCard" /> My Assigned Items
          </Text>
          <Text style={{ color: "#605e5c", fontStyle: "italic" }}>No items assigned to you.</Text>
        </div>
      );
    }

    const columns: IColumn[] = [
      {
        key: "id", name: "ID", minWidth: 60, maxWidth: 80,
        onRender: (item: IWorkItem) => <Link href={`#/obs/details/${item.Id}`}>OBS-{item.Id}</Link>
      },
      { key: "title", name: "Title", fieldName: "Title", minWidth: 200, maxWidth: 300 },
      {
        key: "status", name: "Status", minWidth: 100, maxWidth: 120,
        onRender: (item: IWorkItem) => <Text>{(item.Status as any)?.Name || "—"}</Text>
      },
      { key: "priority", name: "Priority", fieldName: "Priority", minWidth: 80, maxWidth: 100 },
      {
        key: "dueDate", name: "Due Date", minWidth: 100, maxWidth: 120,
        onRender: (item: IWorkItem) => (
          <Text>{item.DueDate ? new Date(item.DueDate).toLocaleDateString() : "—"}</Text>
        )
      }
    ];

    return (
      <div>
        <Text className={styles.sectionTitle}>
          <Icon iconName="ContactCard" /> My Assigned Items ({summary.myAssignedItems.length})
        </Text>
        <DetailsList
          items={summary.myAssignedItems}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          isHeaderVisible={true}
          compact={true}
        />
      </div>
    );
  }

  private renderOverdueItems(): React.ReactElement {
    const { summary } = this.state;
    if (!summary || summary.overdueItems.length === 0) return <></>;

    return (
      <div className={styles.overdueCard} style={{ padding: "12px", borderRadius: "4px", marginTop: "16px" }}>
        <Text className={styles.sectionTitle} style={{ color: "#d13438" }}>
          <Icon iconName="AlertSolid" /> Overdue Items ({summary.overdueItems.length})
        </Text>
        {summary.overdueItems.map(item => (
          <div key={item.Id} className={styles.statusRow}>
            <Link href={`#/obs/details/${item.Id}`}>OBS-{item.Id}: {item.Title}</Link>
            <Text style={{ color: "#d13438" }}>
              Due: {item.DueDate ? new Date(item.DueDate).toLocaleDateString() : "—"}
            </Text>
          </div>
        ))}
      </div>
    );
  }

  public render(): React.ReactElement<IObsDashboardProps> {
    const { loading, error, summary } = this.state;

    return (
      <div className={styles.container}>
        <Text className={styles.title}>
          <Icon iconName="ViewDashboard" /> OBS Operations Dashboard
        </Text>

        {error && <MessageBar messageBarType={1}>{error}</MessageBar>}

        {loading ? (
          <Spinner size={SpinnerSize.large} label="Loading dashboard..." />
        ) : summary ? (
          <Stack tokens={{ childrenGap: 16 }}>
            {this.renderSummaryCards()}

            <Stack horizontal tokens={{ childrenGap: 24 }} wrap>
              <Stack.Item grow={1} styles={{ root: { minWidth: 280 } }}>
                {this.renderStatusBreakdown()}
              </Stack.Item>
              <Stack.Item grow={1} styles={{ root: { minWidth: 280 } }}>
                {this.renderPriorityBreakdown()}
              </Stack.Item>
              {this.props.showTeamBreakdown && (
                <Stack.Item grow={1} styles={{ root: { minWidth: 280 } }}>
                  {this.renderTeamBreakdown()}
                </Stack.Item>
              )}
            </Stack>

            {this.renderMyAssignedItems()}

            {this.props.showOverdueSection && this.renderOverdueItems()}
          </Stack>
        ) : null}
      </div>
    );
  }
}
