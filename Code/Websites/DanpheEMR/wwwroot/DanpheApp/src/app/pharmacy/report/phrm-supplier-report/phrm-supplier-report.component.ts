import { Component, OnInit } from '@angular/core';
import { DanpheRoute } from '../../../security/shared/danphe-route.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-phrm-supplier-report',
  templateUrl: './phrm-supplier-report.component.html',
  styles: []
})
export class PHRMSupplierReportComponent implements OnInit {

  validRoutes: DanpheRoute[];

  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Report/Supplier");
  }
  ngOnInit() {
  }

}
