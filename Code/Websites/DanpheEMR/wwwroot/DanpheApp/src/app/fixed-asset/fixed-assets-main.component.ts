import { Component } from '@angular/core'
import { Router } from '@angular/router';
import { PHRMStoreModel } from '../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../security/shared/security.service';
import { ActivateInventoryService } from '../shared/activate-inventory/activate-inventory.service';
import { DanpheHTTPResponse } from '../shared/common-models';
import { FixedAssetBLService } from './shared/fixed-asset.bl.service';
import { FixedAssetService } from './shared/fixed-asset.service';
import { SecurityBLService } from '../security/shared/security.bl.service';

@Component({
  selector: 'my-app',
  templateUrl: "./fixed-assets-main.html"
})
export class FixedAssetsMainComponent {
  validRoutes: any;
  selectedInventory: any;
  showInventoryInfo: boolean;
  constructor(public securityService: SecurityService,
    public securityBlService: SecurityBLService,
    public fixedAssetService: FixedAssetService,
    public fixedAssetBlService: FixedAssetBLService,
    private _activateInventoryService: ActivateInventoryService,
    public router:Router) {
    this.validRoutes = this.securityService.GetChildRoutes("FixedAssets");
    this.LoadAllFiscalYears();
    this.LoadINVHospitalInfo();
  }

  LoadINVHospitalInfo() {
    this.securityService.SetModuleName('inventory');
    if (!(this.securityService.INVHospitalInfo.CurrFiscalYear.FiscalYearId > 0)) {//if information not there then get and set
      this.securityBlService.GetINVHospitalInfo()
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == 'OK') {
            this.securityService.SetINVHospitalInfo(res.Results);
          }
        },
          err => {
            alert('failed to get inventory hospsital info. Please try again.');
          });
    }
  }

  public LoadAllFiscalYears() {
    this.fixedAssetBlService.GetAllInventoryFiscalYears()
      .subscribe(res => {
        if (res.Status == "OK") {
          console.log("fiscal year list is loaded successfully (inventory-main).");
          this.fixedAssetService.LoadAllFiscalYearList(res.Results);
        }
        else {
          console.log("Couldn't load fiscal years. (inventory-main)");
        }
      });
  }
  ngOnInit() {
    this.selectedInventory = this._activateInventoryService.activeInventory;
  }
  UnsetGlobalInventory() {
    this.selectedInventory = new PHRMStoreModel();
    this._activateInventoryService.activeInventory = this.selectedInventory;
    this.router.navigate(['/ActivateInventory']);
  }
  ShowInfo() {
    this.showInventoryInfo = true;
    var timer = setInterval(() => { this.CloseInfo(); clearInterval(timer) }, 10000);
  }
  CloseInfo() {
    this.showInventoryInfo = false;
  }
}
