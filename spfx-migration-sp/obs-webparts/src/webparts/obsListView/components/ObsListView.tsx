import * as React from "react";
import { SPFI } from "@pnp/sp";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Dropdown,
  IDropdownOption,
  SearchBox,
  Stack,
  Text,
  Icon,
  Link,
  MessageBar,
  Spinner,
  SpinnerSize,
  mergeStyleSets
} from "@fluentui/react";
import { ObsDataService } from "../../../services/ObsDataService";
import { IWorkItem } from "../../../models/IObsModels";

/**
 * OBS List View Component
 *
 * MIGRATION MAPPING:
 *   Legacy file:  Views/Obs/Index.cshtml
 *   Legacy route: /Obs?statusFilter=...&categoryFilter=...&priorityFilter=...&search=...
 *
 * This React component replaces the Razor table view.
 * The filtering pattern maps directly to Power Fx:
 *
 *   POWER FX: SortByColumns(
 *     Filter(
 *       'OBS Work Items',
 *       (IsBlank(dropdownStatus.Selected.Value) || Status.Value = dropdownStatus.Selected.Value),
 *       (IsBlank(dropdownCategory.Selected.Value) || Category.Value = dropdownCategory.Selected.Value),
 *       (IsBlank(dropdownPriority.Selected.Value) || Priority.Value = dropdownPriority.Selected.Value),
 *       (IsBlank(txtSearch.Text) || Title in txtSearch.Text)
 *     ),
 *     "LastUpdatedDate", SortOrder.Descending
 *   )
 */

export interface IObsListViewProps {
  sp: SPFI;
  context: WebPartContext;
  defaultStatusFilter: string;
  defaultCategoryFilter: string;
  pageSize: number;
}

interface IObsListViewState {
  items: IWorkItem[];
  loading: boolean;
  error: string | null;
  statusFilter: string;
  categoryFilter: string;
  priorityFilter: string;
  searchText: string;
}

const styles = mergeStyleSets({
  container: {
    padding: "16px"
  },
  filterBar: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f3f2f1",
    borderRadius: "4px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "8px"
  },
  priorityBadge: {
    padding: "2px 8px",
    borderRadius: "3px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  }
});

const priorityColors: Record<string, string> = {
  Critical: "#d13438",
  High: "#ca5010",
  Medium: "#8a8886",
  Low: "#107c10"
};

const statusOptions: IDropdownOption[] = [
  { key: "", text: "All Statuses" },
  { key: "Draft", text: "Draft" },
  { key: "Submitted", text: "Submitted" },
  { key: "Under Review", text: "Under Review" },
  { key: "In Progress", text: "In Progress" },
  { key: "Completed", text: "Completed" },
  { key: "Closed", text: "Closed" }
];

const categoryOptions: IDropdownOption[] = [
  { key: "", text: "All Categories" },
  { key: "Infrastructure Review", text: "Infrastructure Review" },
  { key: "Compliance Audit", text: "Compliance Audit" },
  { key: "Operational Assessment", text: "Operational Assessment" },
  { key: "Resource Allocation", text: "Resource Allocation" }
];

const priorityOptions: IDropdownOption[] = [
  { key: "", text: "All Priorities" },
  { key: "Critical", text: "Critical" },
  { key: "High", text: "High" },
  { key: "Medium", text: "Medium" },
  { key: "Low", text: "Low" }
];

export class ObsListView extends React.Component<IObsListViewProps, IObsListViewState> {
  private dataService: ObsDataService;

  constructor(props: IObsListViewProps) {
    super(props);
    this.dataService = new ObsDataService(props.sp);
    this.state = {
      items: [],
      loading: true,
      error: null,
      statusFilter: props.defaultStatusFilter || "",
      categoryFilter: props.defaultCategoryFilter || "",
      priorityFilter: "",
      searchText: ""
    };
  }

  public componentDidMount(): void {
    this.loadItems();
  }

  private async loadItems(): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      const items = await this.dataService.getWorkItems({
        status: this.state.statusFilter || undefined,
        category: this.state.categoryFilter || undefined,
        priority: this.state.priorityFilter || undefined,
        search: this.state.searchText || undefined
      });
      this.setState({ items, loading: false });
    } catch (err) {
      this.setState({ error: `Failed to load items: ${err}`, loading: false });
    }
  }

  private onFilterChange = (
    field: "statusFilter" | "categoryFilter" | "priorityFilter",
    option?: IDropdownOption
  ): void => {
    if (option) {
      this.setState({ [field]: option.key as string } as Pick<IObsListViewState, typeof field>, () => {
        this.loadItems();
      });
    }
  };

  private onSearchChange = (newValue: string): void => {
    this.setState({ searchText: newValue }, () => {
      this.loadItems();
    });
  };

  private getColumns(): IColumn[] {
    return [
      {
        key: "id",
        name: "ID",
        fieldName: "Id",
        minWidth: 40,
        maxWidth: 60,
        onRender: (item: IWorkItem) => (
          <Link href={`#/obs/details/${item.Id}`}>OBS-{item.Id}</Link>
        )
      },
      {
        key: "title",
        name: "Title",
        fieldName: "Title",
        minWidth: 200,
        maxWidth: 350,
        isResizable: true,
        onRender: (item: IWorkItem) => (
          <Link href={`#/obs/details/${item.Id}`}>{item.Title}</Link>
        )
      },
      {
        key: "status",
        name: "Status",
        minWidth: 100,
        maxWidth: 130,
        onRender: (item: IWorkItem) => (
          <Text>{(item.Status as any)?.Name || "—"}</Text>
        )
      },
      {
        key: "priority",
        name: "Priority",
        minWidth: 80,
        maxWidth: 100,
        onRender: (item: IWorkItem) => (
          <span
            className={styles.priorityBadge}
            style={{
              backgroundColor: priorityColors[item.Priority] || "#8a8886",
              color: "#ffffff"
            }}
          >
            {item.Priority}
          </span>
        )
      },
      {
        key: "category",
        name: "Category",
        minWidth: 140,
        maxWidth: 180,
        onRender: (item: IWorkItem) => (
          <Text>{(item.Category as any)?.Name || "—"}</Text>
        )
      },
      {
        key: "assignedTo",
        name: "Assigned To",
        minWidth: 130,
        maxWidth: 170,
        onRender: (item: IWorkItem) => (
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
            <Icon iconName="Contact" />
            <Text>{(item.AssignedToUser as any)?.Title || "Unassigned"}</Text>
          </Stack>
        )
      },
      {
        key: "team",
        name: "Team",
        fieldName: "TeamOwner",
        minWidth: 100,
        maxWidth: 130
      },
      {
        key: "updated",
        name: "Last Updated",
        minWidth: 110,
        maxWidth: 140,
        onRender: (item: IWorkItem) => (
          <Text>{new Date(item.LastUpdatedDate).toLocaleDateString()}</Text>
        )
      }
    ];
  }

  public render(): React.ReactElement<IObsListViewProps> {
    const { items, loading, error } = this.state;

    return (
      <div className={styles.container}>
        <Text className={styles.title}>
          <Icon iconName="ClipboardList" /> OBS Records
        </Text>

        {/* Filter Bar — replaces the legacy Razor filter form */}
        <div className={styles.filterBar}>
          <Stack horizontal tokens={{ childrenGap: 12 }} wrap>
            <Dropdown
              placeholder="All Statuses"
              options={statusOptions}
              selectedKey={this.state.statusFilter}
              onChange={(_, option) => this.onFilterChange("statusFilter", option)}
              styles={{ dropdown: { width: 160 } }}
            />
            <Dropdown
              placeholder="All Categories"
              options={categoryOptions}
              selectedKey={this.state.categoryFilter}
              onChange={(_, option) => this.onFilterChange("categoryFilter", option)}
              styles={{ dropdown: { width: 180 } }}
            />
            <Dropdown
              placeholder="All Priorities"
              options={priorityOptions}
              selectedKey={this.state.priorityFilter}
              onChange={(_, option) => this.onFilterChange("priorityFilter", option)}
              styles={{ dropdown: { width: 140 } }}
            />
            <SearchBox
              placeholder="Search by title..."
              value={this.state.searchText}
              onChange={(_, newValue) => this.onSearchChange(newValue || "")}
              styles={{ root: { width: 200 } }}
            />
          </Stack>
        </div>

        {error && <MessageBar messageBarType={1}>{error}</MessageBar>}

        {loading ? (
          <Spinner size={SpinnerSize.large} label="Loading OBS records..." />
        ) : (
          <>
            <Text variant="smallPlus" style={{ marginBottom: 8, display: "block", color: "#605e5c" }}>
              Showing {items.length} record{items.length !== 1 ? "s" : ""}
            </Text>
            <DetailsList
              items={items}
              columns={this.getColumns()}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
              isHeaderVisible={true}
            />
          </>
        )}
      </div>
    );
  }
}
