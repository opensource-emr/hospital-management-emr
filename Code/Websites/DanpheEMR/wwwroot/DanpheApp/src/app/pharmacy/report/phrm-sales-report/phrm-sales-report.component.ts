import { Component, OnInit } from '@angular/core';
import { DanpheRoute } from '../../../security/shared/danphe-route.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-phrm-sales-report',
  templateUrl: './phrm-sales-report.component.html',
  styles: []
})
export class PHRMSalesReportComponent implements OnInit {
  validRoutes: DanpheRoute[];

  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Report/Sales");
  }
  ngOnInit() {
  }

}
