import { Injectable, Directive } from '@angular/core';

import { ClinicalDLService } from './clinical.dl.service';

import { ActiveMedical } from './active-medical.model';
import { PastMedical } from './past-medical.model';

import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Injectable()
export class ProblemsBLService {

    constructor(public clinicalDLService: ClinicalDLService) {}
    //active-medical
    public GetPatientActiveMedicalList(patientId: number) {
        return this.clinicalDLService.GetPatientActiveMedicalList(patientId)
            .map(res => res);
    }
    
    //past-medical
    public GetPatientPastMedicalList(patientId: number) {
        return this.clinicalDLService.GetPatientPastMedicalList(patientId)
            .map(res => res);
    }
    //  public GetICDList() {
    //      return this.clinicalDLService.GetMasterICDList()
    //          .map(res => res);
    //  }
    //active-medical
    public PostActiveMedical(currentActiveMedical: ActiveMedical) {
        var temp = _.omit(currentActiveMedical, ['ActiveMedicalValidator']);
        return this.clinicalDLService.PostActiveMedical(temp)
            .map(res => res);
    }

    //past-medical
    public PostPastMedical(pastMedical: PastMedical) {
        var temp = _.omit(pastMedical, ['PastMedicalValidator']);
        return this.clinicalDLService.PostPastMedical(temp)
            .map(res => res);
    }
    public Resolved(activeMedical: ActiveMedical) {
        return this.clinicalDLService.DeleteActiveMedical(activeMedical)
            .map(res => res);
    }

    //past-medical
    public SetAsActive(pastMedical: PastMedical) {
        var activeMedical: ActiveMedical = new ActiveMedical();
        activeMedical.ICD10Code = pastMedical.ICD10Code;
        activeMedical.ICD10Description = pastMedical.ICD10Description;
        activeMedical.OnSetDate = moment().format("YYYY-MM-DD");
        activeMedical.PatientId = pastMedical.PatientId;
        activeMedical.CurrentStatus = pastMedical.CurrentStatus;
        activeMedical.Note = pastMedical.Note;
        var temp = _.omit(activeMedical, ['ActiveMedicalValidator']);
        return this.clinicalDLService.PostActiveMedical(temp)
            .map(res => res);
    }


    //active-medical
    public PutActiveMedical(currentActiveMedical: ActiveMedical) {
        var temp = _.omit(currentActiveMedical, ['ActiveMedicalValidator']);
        let data = JSON.stringify(temp);
        let reqType = 'activemedical';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }

    //past-medical
    public PutPastMedical(pastMedical: PastMedical) {
        pastMedical.CreatedOn =null;
        pastMedical.OnSetDate = moment(pastMedical.OnSetDate).format('YYYY-MM-DD');
        pastMedical.ResolvedDate = moment(pastMedical.ResolvedDate).format('YYYY-MM-DD');
        var temp = _.omit(pastMedical, ['PastMedicalValidator']);
        let data = JSON.stringify(temp);
        let reqType = 'pastmedical';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }
}
