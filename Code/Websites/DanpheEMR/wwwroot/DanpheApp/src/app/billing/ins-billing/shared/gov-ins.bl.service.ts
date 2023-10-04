import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';

import { PatientsDLService } from '../../../patients/shared/patients.dl.service';
import { GovInsurancePatientVM } from './gov-ins-patient.view-model';
import { GovInsuranceDLService } from './gov-ins.dl.service';

@Injectable()
export class GovInsuranceBLService {

  constructor(public patientDLService: PatientsDLService,
  public govInsDLService:GovInsuranceDLService) {

  }

  //import { GovInsurancePatientVM } from '../../billing/ins-billing/shared/gov-ins-patient.view-model';

  public PostGovInsPatient(govInsPatientVm: GovInsurancePatientVM) {

    let newPatObject = _.omit(govInsPatientVm, ['GovInsPatientValidator'])

    let patString = JSON.stringify(newPatObject);
    return this.patientDLService.PostGovInsPatient(patString);

  }


  public UpdateGovInsPatient(govInsPatientVm: GovInsurancePatientVM) {
    let newPatObject = _.omit(govInsPatientVm, ['GovInsPatientValidator'])
    let patString = JSON.stringify(newPatObject);
    return this.patientDLService.UpdateGovInsPatient(patString);

  }


  public GetAllPatientsForInsurance(searchText:string) {
    return this.govInsDLService.GetAllPatientsForInsurance(searchText)
      .map(res => res);
  }

  //public GetPatientsByKey(searchKey) {
  //  return this.govInsDLService.GetPatientByKey(searchKey);
  //}

}


