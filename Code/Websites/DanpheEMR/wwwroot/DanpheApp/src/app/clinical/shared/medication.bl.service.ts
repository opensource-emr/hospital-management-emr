import { Injectable, Directive } from '@angular/core';

import { ClinicalDLService } from './clinical.dl.service';

import { HomeMedication } from './home-medication.model';
import { MedicationPrescription } from './medication-prescription.model';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Injectable()
export class MedicationBLService {
 

    constructor(public clinicalDLService: ClinicalDLService) {
    }


    public GetMedicationMasters() {
        return this.clinicalDLService.GetMasterMedicineList()
            .map(res => res);
    }

    //home-medication
    //get list of home medication using PatientId
    public GetHomeMedicationList(patientId: number) {
        return this.clinicalDLService.GetHomeMedicationList(patientId)
            .map(res => res);
    }
    //medication-prescription
    //get list of MedicationPrescription using PatientId.
    public GetMedicationList(patientId: number) {
        return this.clinicalDLService.GetMedicationList(patientId)
            .map(res => res);
    }
    //home-medication
    //post new home medication
    public PostHomeMedication(currentHomeMedication: HomeMedication) {
        var temp = _.omit(currentHomeMedication, ['HomeMedicationValidator']);
        return this.clinicalDLService.PostHomeMedication(temp)
            .map(res => res);
    }
    //medication-prescription
    //post new medication prescription
    public PostPrescription(Medications: Array<MedicationPrescription>) {
       var med: Array<MedicationPrescription> = new Array<MedicationPrescription>();
        for (var i = 0; i < Medications.length; i++) {
            //var temp = _.omit(Medications[i], ['MedicationValidator']);
           med.push({
                MedicationPrescriptionId: Medications[i].MedicationPrescriptionId,
                PatientId: Medications[i].PatientId,
                MedicationId: Medications[i].MedicationId,
                MedicationName: Medications[i].MedicationName,
                ProviderId: Medications[i].ProviderId,
                ProviderName: Medications[i].ProviderName,
                CreatedOn: Medications[i].CreatedOn,
                CreatedBy: Medications[i].CreatedBy,
                ModifiedOn: Medications[i].ModifiedOn,
                ModifiedBy: Medications[i].ModifiedBy,
                Frequency: Medications[i].Frequency,
                Route: Medications[i].Route,
                Duration: Medications[i].Duration,
                DurationType: Medications[i].DurationType,
                Dose: Medications[i].Dose,
                Refill: Medications[i].Refill,
                TypeofMedication: Medications[i].TypeofMedication,
                MedicationValidator:null,
                IsSelected: Medications[i].IsSelected,
                IsDirty: Medications[i].IsDirty,
                IsValid:Medications[i].IsValid,
                IsValidCheck:Medications[i].IsValidCheck
            });    
        }
        return this.clinicalDLService.PostPrescription(med)
            .map(res => res);
    }
    //home-medicaiton
    //update home medication
    public PutHomeMedication(currentHomeMedication: HomeMedication) {
        currentHomeMedication.LastTaken = moment(currentHomeMedication.LastTaken).format('YYYY-MM-DD');

        var temp = _.omit(currentHomeMedication, ['HomeMedicationValidator']);
        let data = JSON.stringify(temp);
        let reqType = 'homemedication';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }
    //medication-prescription
    //update medicaiton-prescription
    public PutPrescription(currentMedication: MedicationPrescription) {
        currentMedication.CreatedOn = moment(currentMedication.CreatedOn).format('YYYY-MM-DD HH:mm');

        var temp = _.omit(currentMedication, ['MedicationValidator']);
        let data = JSON.stringify(temp);
        let reqType = 'medicationprescription';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }
}

