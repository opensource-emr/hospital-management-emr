import { Component } from '@angular/core';
import { DispensaryService } from '../../dispensary/shared/dispensary.service';
import { SecurityService } from '../../security/shared/security.service';
import { PHRMStoreModel } from '../shared/phrm-store.model';

@Component({
  selector: 'app-patient-consumption-main',
  templateUrl: './patient-consumption-main.component.html'
})
export class PatientConsumptionMainComponent {

  validRoutes: any;
  validRoute: Array<any>;
  validinsuranceRoute: any;
  public selectedDispensary: PHRMStoreModel;
  IsCurrentDispensaryInsurace: boolean;
  constructor(private _securityService: SecurityService, private _dispensaryService: DispensaryService) {

    this.selectedDispensary = this._dispensaryService.activeDispensary;
    this.validRoutes = this._securityService.GetChildRoutes("Dispensary/PatientConsumptionMain");

  }
  ngOnInit() {
    this.selectedDispensary = this._dispensaryService.activeDispensary;
  }

}
