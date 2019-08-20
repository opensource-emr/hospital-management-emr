import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { QrService } from '../shared/qr-code/qr-service';



@Component({
  selector: 'my-app',
  templateUrl: "./billing-main.html" //"/BillingView/Billing"

})

// App Component class
export class BillingMainComponent {

  public showdenomination: boolean = false;

  validRoutes: any;
  
  public primaryNavItems : Array<any> = null;
  public secondaryNavItems:Array<any>=null;

  constructor(public securityService: SecurityService, public qrService: QrService) {
    //get the chld routes of billing from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Billing");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1); 
  }


  OpenQrPage() {
    this.qrService.showBilling = true;
    this.qrService.ModuleName = "billing";
  }

  OpendenominationPage() {
    this.showdenomination = true;
  }
}
