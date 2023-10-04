import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient-main.component.html',
  styles: []
})
export class PatientMainComponent implements OnInit {
  validRoutes: any;
  constructor(private _securityService: SecurityService) {
    this.validRoutes = this._securityService.GetChildRoutes("Dispensary/Patient");
  }
  ngOnInit(): void {
  }
}
