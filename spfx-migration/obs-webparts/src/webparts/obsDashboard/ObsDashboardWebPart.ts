import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration, PropertyPaneToggle } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import { ObsDashboard, IObsDashboardProps } from "./components/ObsDashboard";

/**
 * OBS Dashboard Web Part
 *
 * MIGRATION MAPPING:
 *   Legacy: ObsController.Dashboard() + Views/Obs/Dashboard.cshtml
 *   SPFx:   This web part renders summary counts, charts, and assigned-item queue
 *
 * This replaces the /Obs/Dashboard route in the legacy .NET application.
 */
export interface IObsDashboardWebPartProps {
  showOverdueSection: boolean;
  showTeamBreakdown: boolean;
}

export default class ObsDashboardWebPart extends BaseClientSideWebPart<IObsDashboardWebPartProps> {

  private sp!: ReturnType<typeof spfi>;

  public onInit(): Promise<void> {
    this.sp = spfi().using(SPFx(this.context));
    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement<IObsDashboardProps> = React.createElement(
      ObsDashboard,
      {
        sp: this.sp,
        context: this.context,
        showOverdueSection: this.properties.showOverdueSection !== false,
        showTeamBreakdown: this.properties.showTeamBreakdown !== false
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
          header: { description: "OBS Dashboard Settings" },
          groups: [
            {
              groupName: "Display Options",
              groupFields: [
                PropertyPaneToggle("showOverdueSection", {
                  label: "Show Overdue Items Section",
                  checked: true
                }),
                PropertyPaneToggle("showTeamBreakdown", {
                  label: "Show Team Breakdown",
                  checked: true
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
