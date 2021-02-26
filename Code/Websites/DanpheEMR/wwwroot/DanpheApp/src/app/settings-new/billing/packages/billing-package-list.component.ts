import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { BillingPackage } from '../../../billing/shared/billing-package.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
  selector: 'billingPackage-list',
  templateUrl: './billing-package-list.html',
})
export class BillingPackageListComponent {
  public billingPackageList: Array<BillingPackage> = new Array<BillingPackage>();
  public showGrid: boolean = false;
  public billingPackageGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedItem: BillingPackage;
  public selectedID: null;
  public itemId: number = null;
  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, ) {
    this.billingPackageGridColumns = this.settingsServ.settingsGridCols.BillingPackageList;
    this.getBillingPackageList();
  }
  public getBillingPackageList() {
    this.settingsBLService.GetBillingPackageList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.billingPackageList = res.Results;
          this.showGrid = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

      });
  }
  BillingPackageGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.showAddPage = false;
        this.selectedItem = null;
        this.selectedID = $event.Data.BillingPackageId;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddBillingPackage() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    if (this.selectedID != null) {
      let i = this.billingPackageList.findIndex(a => a.BillingPackageId == this.selectedID)

      this.billingPackageList.splice(i, 1);
    }
    this.billingPackageList.push($event.packageItem);
    this.billingPackageList = this.billingPackageList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.itemId = null;
    this.selectedItem = null;
    this.selectedID = null;
  }

}
