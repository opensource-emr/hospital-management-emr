import { ChangeDetectorRef, Component } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import {
  ENUM_DanpheHTTPResponses,
  ENUM_MessageBox_Status,
} from "../../../shared/shared-enums";
import { BillingSchemeModel } from "../../shared/bill-scheme.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";

@Component({
  selector: "bill-scheme-list",
  templateUrl: "./bill-scheme-list.component.html",
})
export class BillSchemeListComponent {
  public billSchemeListGridColumns: Array<any> = null;
  public ShowSchemeAddUpdatePage: boolean = false;
  public ShowSchemeItemSettingsPage: boolean = false;
  public update: boolean = false;
  index: number = -1;
  public billScheme: BillingSchemeModel = new BillingSchemeModel();
  public billSchemeList: Array<BillingSchemeModel> =
    new Array<BillingSchemeModel>();
  public loading: boolean;
  public billSchemeToEdit: BillingSchemeModel = new BillingSchemeModel();
  public SchemeId: number = 0;
  public SchemeCode: string = '';
  public SchemeName: string = '';
  public SelectedScheme = {SchemeId: 0, SchemeCode: '', SchemeName: ''}

  constructor(
    public settingsServ: SettingsService,
    public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.billSchemeListGridColumns =
      this.settingsServ.settingsGridCols.billSchemeGridCols;
    this.GetBillingSchemes();
  }

  ShowAddNewPage(): void {
    this.componentMode = "add";
    this.ShowSchemeAddUpdatePage = true;
  }

  CloseItemSettingsPage(): void {
    this.ShowSchemeItemSettingsPage = false;
  }
  GetBillingSchemes() {
    this.settingsBlService.GetBillingSchemes().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.billSchemeList = res.Results;
          this.loading = false;
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
            "Biling Scheme not available",
          ]);
          this.loading = false;
        }
      },
      (err) => {
        this.logError(err);
        this.loading = false;
      }
    );
  }
  logError(err: DanpheHTTPResponse) {
    console.log(err);
  }
  getDataFromAdd($event) {
    this.GetBillingSchemes();
    this.ShowSchemeAddUpdatePage = false;
    this.billSchemeToEdit = null;
  }
  public componentMode: string = "add";
  BillSchemeListGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.componentMode = "edit";
        this.billSchemeToEdit = null;
        this.index = this.billSchemeList.findIndex(
          (b) => b.SchemeId === $event.Data.SchemeId
        );
        this.billSchemeToEdit = $event.Data.SchemeId;
        this.ShowSchemeAddUpdatePage = true;

        break;
      }
      case "ItemSettings": {
        this.SelectedScheme.SchemeId=$event.Data.SchemeId;
        this.SelectedScheme.SchemeCode= $event.Data.SchemeCode;
        this.SelectedScheme.SchemeName=$event.Data.SchemeName;
        this.ShowSchemeItemSettingsPage = true;
        break;
      }
      case "deactivateBillSchemeSetting": {
        this.index = this.billSchemeList.findIndex(
          (b) => b.SchemeId === $event.Data.SchemeId
        );
        $event.Data.IsActive = false;
        this.ActivateBillScheme($event.Data.SchemeId, $event.Data.IsActive);
        break;
      }

      case "activateBillSchemeSetting": {
        this.index = this.billSchemeList.findIndex(
          (b) => b.SchemeId === $event.Data.SchemeId
        );
        $event.Data.IsActive = true;
        this.ActivateBillScheme($event.Data.SchemeId, $event.Data.IsActive);
        break;
      }
      default:
        break;
    }
  }

  // ActivateBillScheme(SchemeId: number, IsActive: boolean) {
  //   this.settingsBlService
  //     .BillSchemeActivation(SchemeId, IsActive)
  //     .subscribe((res: DanpheHTTPResponse) => {
  //       if (res.Status === ENUM_DanpheHTTPResponses.OK) {
  //         this.billSchemeList[this.index].IsActive = res.Results.IsActive;
  //         this.billSchemeList = this.billSchemeList.slice();
  //         this.billScheme = new BillingScheme();
  //         if (IsActive == true) {
  //           this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
  //             " Scheme Activated.",
  //           ]);
  //         } else {
  //           this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
  //             "Scheme Deactivated.",
  //           ]);
  //         }
  //         this.index = -1;
  //       } else {
  //         this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
  //           "failed to Change status",
  //         ]);
  //       }
  //     });
  // }
  ActivateBillScheme(SchemeId: number, IsActive: boolean) {
    const message = IsActive
      ? "Are you sure you want to activate this billing scheme?"
      : "Are you sure you want to deactivate this billing scheme?";

    if (window.confirm(message)) {
      this.settingsBlService
        .BillSchemeActivation(SchemeId, IsActive)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.billSchemeList[this.index].IsActive = res.Results.IsActive;
            this.billSchemeList = this.billSchemeList.slice();
            this.billScheme = new BillingSchemeModel();
            if (IsActive == true) {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
                " Scheme Activated.",
              ]);
            } else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
                "Scheme Deactivated.",
              ]);
            }
            this.index = -1;
          } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
              "failed to Change status",
            ]);
          }
        });
    }
  }
}
