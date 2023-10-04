import { Component, OnInit } from '@angular/core';
import { DanpheRoute } from '../../../security/shared/danphe-route.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-phrm-purchase-report',
  templateUrl: './phrm-purchase-report.component.html',
  styles: []
})
export class PHRMPurchaseReportComponent implements OnInit {
  validRoutes: DanpheRoute[];

  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Report/Purchase");
  }
  ngOnInit() {
  }

}
