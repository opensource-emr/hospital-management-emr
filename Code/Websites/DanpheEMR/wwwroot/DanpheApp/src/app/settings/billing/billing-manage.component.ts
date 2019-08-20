import { Component } from "@angular/core";

@Component({
  templateUrl: "../../view/settings-view/BillingManage.html" // "/SettingsView/BillingManage"

})
export class BillingManageComponent {
  public showItemList: boolean = true;
  public showPackageList: boolean = false;
  public showOrganizationList: boolean = false;
  public showMembershipList: boolean = false;

  public updateView(category: number): void {
    this.showItemList = (category == 0);
    this.showPackageList = (category == 1);
    this.showOrganizationList = (category == 2);
    this.showMembershipList = (category == 3);
  }
}
