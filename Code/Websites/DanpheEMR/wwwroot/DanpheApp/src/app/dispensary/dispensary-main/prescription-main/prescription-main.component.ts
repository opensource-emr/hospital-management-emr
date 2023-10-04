import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-prescription-main',
  templateUrl: './prescription-main.component.html',
})
export class PrescriptionMainComponent implements OnInit {

  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Prescription");
  }

  ngOnInit() {
  }

}
