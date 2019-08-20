import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
  templateUrl: "../../view/pharmacy-view/Accounting/AccountingMain.html" // "/PharmacyView/AccountingMain"
})
export class AccountingMainComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Accounting");
  }
}
