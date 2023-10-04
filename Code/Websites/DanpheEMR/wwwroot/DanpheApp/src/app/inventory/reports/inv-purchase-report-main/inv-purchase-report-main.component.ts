import { Component, OnInit } from '@angular/core';
import { DanpheRoute } from '../../../security/shared/danphe-route.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-inv-purchase-report-main',
  templateUrl: './inv-purchase-report-main.component.html',
  styleUrls: ['./inv-purchase-report-main.component.css']
})
export class InvPurchaseReportMainComponent implements OnInit {

  validRoutes: DanpheRoute[];
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Inventory/Reports/Purchase");
  }

  ngOnInit() {
  }

}
