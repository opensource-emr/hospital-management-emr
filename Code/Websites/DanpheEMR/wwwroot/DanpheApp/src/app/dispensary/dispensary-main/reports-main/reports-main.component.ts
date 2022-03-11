import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-reports-main',
  templateUrl: './reports-main.component.html',
  styleUrls: ['./reports-main.component.css']
})
export class ReportsMainComponent implements OnInit {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Dispensary/Reports");
  }

  ngOnInit() {
  }

}
