import { Component, OnInit } from '@angular/core';
import { DanpheRoute } from '../../../security/shared/danphe-route.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-inv-supplier-report-main',
  templateUrl: './inv-supplier-report-main.component.html',
  styleUrls: ['./inv-supplier-report-main.component.css']
})
export class InvSupplierReportMainComponent implements OnInit {

  validRoutes: DanpheRoute[];
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Inventory/Reports/Supplier");
  }

  ngOnInit() {
  }

}
