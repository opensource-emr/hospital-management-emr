import { Component } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styles: []
})
export class ReportsComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("CSSD/Reports");
  }
}
