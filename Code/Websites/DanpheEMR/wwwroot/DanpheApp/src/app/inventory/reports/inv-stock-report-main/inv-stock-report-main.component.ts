import { Component, OnInit } from '@angular/core';
import { DanpheRoute } from '../../../security/shared/danphe-route.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-inv-stock-report-main',
  templateUrl: './inv-stock-report-main.component.html',
  styleUrls: ['./inv-stock-report-main.component.css']
})
export class InvStockReportMainComponent implements OnInit {
  validRoutes: DanpheRoute[];
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Inventory/Reports/Stock");
  }
  ngOnInit() {
  }

}
