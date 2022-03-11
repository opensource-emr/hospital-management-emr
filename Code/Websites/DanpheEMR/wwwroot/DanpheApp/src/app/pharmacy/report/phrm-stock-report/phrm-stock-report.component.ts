import { Component, OnInit } from '@angular/core';
import { DanpheRoute } from '../../../security/shared/danphe-route.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-phrm-stock-report',
  templateUrl: './phrm-stock-report.component.html',
  styles: []
})
export class PHRMStockReportComponent {
  validRoutes: DanpheRoute[];

  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Report/Stock");
  }
}
