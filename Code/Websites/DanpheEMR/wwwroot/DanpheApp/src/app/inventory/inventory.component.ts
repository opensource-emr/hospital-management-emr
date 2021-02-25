import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { DanpheCache, MasterType } from '../shared/danphe-cache-service-utility/cache-services';
import { InventoryService } from './shared/inventory.service';
import { InventoryBLService } from './shared/inventory.bl.service';
import { DanpheHTTPResponse } from '../shared/common-models';
import { SecurityBLService } from '../security/shared/security.bl.service';

@Component({

  templateUrl: "../../app/view/inventory-view/InventoryMain.html" //"/InventoryView/InventoryMain"

})
export class InventoryComponent {
  loading: boolean = true;
  flagList: Array<boolean> = new Array<boolean>();
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  constructor(public securityService: SecurityService,
    public inventoryService: InventoryService,
    public inventoryBLService: InventoryBLService,public securityBlService:SecurityBLService) {
    DanpheCache.GetData(MasterType.AllMasters, null);
    //get the chld routes of Inventory from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Inventory");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
    this.LoadINVHospitalInfo();//NageshBB-10 Sep 2020 this function will loa fiscal year, today date, current fiscal year
    this.LoadAllVendors();
    this.LoadAllInventoryItems();
    this.LoadItemPriceHistory();
    this.LoadGRVendorBillHistory();
    this.LoadAllFiscalYears();
  }
  //NageshBB- 10 Sep 2020- This function will load basic info for inventory module like fiscal Year list, today date, current fiscal year, etc
  LoadINVHospitalInfo(){
    this.securityService.SetModuleName('inventory');
    if(!(this.securityService.INVHospitalInfo.CurrFiscalYear.FiscalYearId >0)){//if information not there then get and set
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

  //we have to load all billing items into service variable, which will be used across this module. 
  public LoadAllVendors() {
    this.inventoryBLService.GetVendorList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("vendor list is loaded successfully (inventory-main).");
          this.inventoryService.LoadAllVendorList(res.Results);
          this.AddFlag(true);
        }
        else {
          console.log("Couldn't load vendor list. (inventory-main)");
        }
      });
  }
  public LoadAllInventoryItems() {
    this.inventoryBLService.GetItemList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("item list is loaded successfully (inventory-main).");
          this.inventoryService.LoadAllItemList(res.Results);
          this.AddFlag(true);
        }
        else {
          console.log("Couldn't load item list. (inventory-main)");
        }
      });
  }
  public LoadItemPriceHistory(){
    this.inventoryBLService.GetItemPriceHistory()
    .subscribe(res =>{
      if(res.Status == "OK"){
        console.log("item price history is loaded succesfully (inventory-main).");
        this.inventoryService.LoadItemPriceHistory(res.Results);
        //this.AddFlag(true); //this is not necessary as it can be loaded in background.
      }
    },err=>{
      console.log(err.error.ErrorMessage);
    })
  }
  AddFlag(booleanValue: boolean) {
    this.flagList.push(booleanValue);
    if (this.flagList.length == 2  /*2 is the number of functions to be loaded right when inventory is clicked */ && this.flagList.every(a => a == true)) {
      this.loading = false;
    }
  }
  public LoadGRVendorBillHistory() {
    this.inventoryBLService.GetGRVendorBillHistory().subscribe(res => {
      if (res.Status == "OK") {
        this.inventoryService.SetGRVendorBillingHistory(res.Results);
      }
    });
  }
  public LoadAllFiscalYears() {
    this.inventoryBLService.GetAllInventoryFiscalYears()
      .subscribe(res => {
        if (res.Status == "OK") {
          console.log("fiscal year list is loaded successfully (inventory-main).");
          this.inventoryService.LoadAllFiscalYearList(res.Results);
        }
        else {
          console.log("Couldn't load fiscal years. (inventory-main)");
        }
      });
  }
}
