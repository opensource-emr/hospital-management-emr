import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';

@Component({
  selector: 'app-outpatient-main',
  templateUrl: './outpatient-main.component.html',
  styleUrls: ['./outpatient-main.component.css']
})
export class OutpatientMainComponent {

  validRoutes: any[];
  constructor(public securityService: SecurityService, public coreService: CoreService) {
    this.validRoutes = this.securityService.GetChildRoutes("Doctors/OutPatientDoctor");
  }
}
