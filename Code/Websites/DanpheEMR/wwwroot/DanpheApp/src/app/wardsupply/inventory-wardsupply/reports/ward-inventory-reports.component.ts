import { Component, ChangeDetectorRef } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service'


@Component({
  templateUrl: "./ward-inventory-reports.html"
})
export class WardInventoryReportComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Inventory/Reports");
  }
}
