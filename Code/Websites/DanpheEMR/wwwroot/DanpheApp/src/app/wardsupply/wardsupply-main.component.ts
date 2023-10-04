import { Component } from '@angular/core'
import { SecurityService } from "../security/shared/security.service"
import { PHRMStoreModel } from '../pharmacy/shared/phrm-store.model';
import { WardSupplyBLService } from './shared/wardsupply.bl.service';
import { Router } from '@angular/router';
import { RouteFromService } from '../shared/routefrom.service';
import { wardsupplyService } from './shared/wardsupply.service';
@Component({
  templateUrl: "../../app/view/ward-supply-view/WardSupplyMain.html"  //"/WardSupplyView/WardSupplyMain"
})

export class WardSupplyMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;

  public showSubStoreList: boolean = true;
  public showInfo: boolean = false;
  public subStoreList: Array<PHRMStoreModel>;
  public selectedStore: PHRMStoreModel = new PHRMStoreModel();

  constructor(public securityService: SecurityService,
    public wardBLService: WardSupplyBLService,
    public router: Router,
    public routerfromService: RouteFromService, public wardsupplyService:wardsupplyService) {
    //get the child routes of WardSupply from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("WardSupply");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
    this.GetActiveSubStoreList();
    this.getInventoryList();
  }

  GetActiveSubStoreList() {
    this.wardBLService.GetActiveSubStoreList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.subStoreList = res.Results;
          if (this.subStoreList && this.subStoreList.length) {
            this.subStoreList.forEach(st => {
              st["PermissionInfo"] = '{"name":"' + st.Name + '","actionOnInvalid":"remove"}';
            });
          }
          if (this.securityService.getActiveStore().StoreId > 0) {
            this.setGlobalSubStore(this.securityService.getActiveStore().StoreId);
          }
        }
      })
  }
  setGlobalSubStore(storeId: number) {
    this.selectedStore = this.subStoreList.find(a => a.StoreId == storeId);
    this.securityService.setActiveStore(this.selectedStore);
    this.showSubStoreList = false;
    this.router.navigate(['/WardSupply/Inventory/Stock']);
    this.ShowInfo();
  }
  UnsetGlobalSubStore() {
    this.selectedStore = new PHRMStoreModel();
    this.securityService.setActiveStore(this.selectedStore);
    this.showSubStoreList = true;
    this.router.navigate(['/WardSupply']);
  }
  ShowInfo() {
    this.showInfo = true;
    var timer = setInterval(() => { this.CloseInfo(); clearInterval(timer) }, 10000);
  }
  CloseInfo() {
    this.showInfo = false;
  }
  getInventoryList() {   
    this.wardBLService.GetInventoryList()
    .subscribe(res =>{
      if(res.Status == "OK"){                  
          this.wardsupplyService.inventoryList=res.Results;          
      }
      else{
        console.log("failed");
      }
    })
  }
}
