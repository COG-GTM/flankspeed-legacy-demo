import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration, PropertyPaneToggle } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import { ObsDetailView, IObsDetailViewProps } from "./components/ObsDetailView";

/**
 * OBS Detail View Web Part
 *
 * MIGRATION MAPPING:
 *   Legacy: ObsController.Details(int id) + Views/Obs/Details.cshtml
 *   SPFx:   This web part renders in a SharePoint page or Teams panel
 *
 * This replaces the /Obs/Details/{id} route in the legacy .NET application.
 * It shows item details, comments, attachments, and audit history.
 */
export interface IObsDetailViewWebPartProps {
  showAuditLog: boolean;
  showAttachments: boolean;
}

export default class ObsDetailViewWebPart extends BaseClientSideWebPart<IObsDetailViewWebPartProps> {

  private sp!: ReturnType<typeof spfi>;

  public onInit(): Promise<void> {
    this.sp = spfi().using(SPFx(this.context));
    return Promise.resolve();
  }

  public render(): void {
    // Get item ID from URL query parameter or page context
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = parseInt(urlParams.get("itemId") || "0", 10);

    const element: React.ReactElement<IObsDetailViewProps> = React.createElement(
      ObsDetailView,
      {
        sp: this.sp,
        context: this.context,
        itemId: itemId,
        showAuditLog: this.properties.showAuditLog !== false,
        showAttachments: this.properties.showAttachments !== false
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
          header: { description: "OBS Detail View Settings" },
          groups: [
            {
              groupName: "Display Options",
              groupFields: [
                PropertyPaneToggle("showAuditLog", {
                  label: "Show Audit History",
                  checked: true
                }),
                PropertyPaneToggle("showAttachments", {
                  label: "Show Attachments Section",
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
