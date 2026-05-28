import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration, PropertyPaneDropdown } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import { ObsListView, IObsListViewProps } from "./components/ObsListView";

/**
 * OBS List View Web Part
 *
 * MIGRATION MAPPING:
 *   Legacy: ObsController.Index() + Views/Obs/Index.cshtml
 *   SPFx:   This web part renders in a SharePoint page or Teams tab
 *
 * This replaces the /Obs route in the legacy .NET application.
 * The filter pattern (Status, Category, Priority, Search) is preserved
 * and exposed via both PropertyPane settings and in-page controls.
 */
export interface IObsListViewWebPartProps {
  defaultStatusFilter: string;
  defaultCategoryFilter: string;
  pageSize: number;
}

export default class ObsListViewWebPart extends BaseClientSideWebPart<IObsListViewWebPartProps> {

  private sp!: ReturnType<typeof spfi>;

  public onInit(): Promise<void> {
    this.sp = spfi().using(SPFx(this.context));
    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement<IObsListViewProps> = React.createElement(
      ObsListView,
      {
        sp: this.sp,
        context: this.context,
        defaultStatusFilter: this.properties.defaultStatusFilter || "",
        defaultCategoryFilter: this.properties.defaultCategoryFilter || "",
        pageSize: this.properties.pageSize || 20
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "OBS List View Settings" },
          groups: [
            {
              groupName: "Filters",
              groupFields: [
                PropertyPaneDropdown("defaultStatusFilter", {
                  label: "Default Status Filter",
                  options: [
                    { key: "", text: "All" },
                    { key: "Draft", text: "Draft" },
                    { key: "Submitted", text: "Submitted" },
                    { key: "Under Review", text: "Under Review" },
                    { key: "In Progress", text: "In Progress" },
                    { key: "Completed", text: "Completed" },
                    { key: "Closed", text: "Closed" }
                  ]
                }),
                PropertyPaneDropdown("defaultCategoryFilter", {
                  label: "Default Category Filter",
                  options: [
                    { key: "", text: "All" },
                    { key: "Infrastructure Review", text: "Infrastructure Review" },
                    { key: "Compliance Audit", text: "Compliance Audit" },
                    { key: "Operational Assessment", text: "Operational Assessment" },
                    { key: "Resource Allocation", text: "Resource Allocation" }
                  ]
                }),
                PropertyPaneDropdown("pageSize", {
                  label: "Items per page",
                  options: [
                    { key: 10, text: "10" },
                    { key: 20, text: "20" },
                    { key: 50, text: "50" }
                  ]
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
