import { ChangeDetectorRef, Component } from "@angular/core";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { SettingsService } from '../../shared/settings-service';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { BillingPackageForGrid_DTO } from "../shared/dto/bill-package-for-grid.dto";

@Component({
  selector: 'billingPackage-list',
  templateUrl: './billing-package-list.html',
})
export class BillingPackageListComponent {
  public billingPackageList = new Array<BillingPackageForGrid_DTO>();
  public showGrid: boolean = false;
  public billingPackageGridColumns: Array<any> = null;
  public showAddPage: boolean = false;
  public isUpdate: boolean = false;
  public selectedItem = new BillingPackageForGrid_DTO();
  public selectedID: null;
  public itemId: number = null;

  constructor(public settingsBLService: SettingsBLService,
    private _settingsService: SettingsService,
    private _changeDetector: ChangeDetectorRef,
    private _messageBoxService: MessageboxService
  ) {
    this.billingPackageGridColumns = this._settingsService.settingsGridCols.BillingPackageList;
    this.GetBillingPackageList();
  }

  public GetBillingPackageList(): void {
    this.settingsBLService.GetBillingPackageList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.billingPackageList = res.Results;
          this.showGrid = true;
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
        }
      });
  }

  public BillingPackageGridActions($event: GridEmitModel): void {

    switch ($event.Action) {
      case "edit": {
        this.showAddPage = false;
        this.selectedItem = null;
        this.selectedID = $event.Data.BillingPackageId;
        this._changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.isUpdate = true;
        this.showAddPage = true;
        break;
      }

      case "activateDeactivateBasedOnStatus": {
        this._changeDetector.detectChanges();
        this.selectedID = $event.Data.BillingPackageId;
        this.ActivateDeactivateBillingPackage(this.selectedID);
        this.selectedItem = $event.Data;
        break;
      }

      default:
        break;
    }
  }

  public logError(err: any): void {
    console.log(err);
  }

  public ActivateDeactivateBillingPackage(BillingPackageId: number): void {
    this.settingsBLService.ActivateDeactivateBillingPackage(BillingPackageId)
      .subscribe(
        res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            let isActive: boolean = res.Results;
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [isActive ? "Activated Successfully" : "Deactivated Successfully"]);
            this.GetBillingPackageList();
          }
          else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Something wrong' + res.ErrorMessage]);
          }
        },
        err => {
          this.logError(err);
        });
  }

  public AddBillingPackage(): void {
    this.showAddPage = false;
    this._changeDetector.detectChanges();
    this.isUpdate = false;
    this.showAddPage = true;
  }

  public CallBackAdd($event): void {
    if (this.selectedID !== null) {
      let i = this.billingPackageList.findIndex(a => a.BillingPackageId === this.selectedID);
      this.billingPackageList.splice(i, 1);
    }
    this.billingPackageList.push($event.packageItem);
    this.billingPackageList = this.billingPackageList.slice();
    this._changeDetector.detectChanges();
    this.showAddPage = false;
    this.isUpdate = false;
    this.GetBillingPackageList();
    this.itemId = null;
    this.selectedItem = null;
    this.selectedID = null;
  }

}
