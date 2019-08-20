import { Injectable, Directive } from '@angular/core';
import { EmergencyDLService } from './emergency.dl.service';
import { EmergencyPatientModel } from './emergency-patient.model';
import * as _ from 'lodash';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { InPatientLabTest } from '../../labs/shared/InpatientLabTest';
import { EmergencyDischargeSummary } from './emergency-discharge-summary.model';

@Injectable()
export class EmergencyBLService {
    constructor(public emergencyDLService: EmergencyDLService) {

    }

    GetLatestUniquePatientNumber() {
        return this.emergencyDLService.GetLatestUniquePatientNumber().
            map(res => { return res });
    }

    GetAllERPatients() {
        return this.emergencyDLService.GetAllERPatients().
            map(res => { return res });
    }

    GetAllTriagedPatients() {
        return this.emergencyDLService.GetAllTriagedPatients().
            map(res => { return res });
    }

    public GetAllExistingPatients() {
        return this.emergencyDLService.GetPatients()
            .map(res => { return res })
    }

    GetAllLamaERPatients(){
        return this.emergencyDLService.GetAllLamaERPatients().
            map(res => { return res });
    }

    GetAllAdmittedERPatients() {
        return this.emergencyDLService.GetAllAdmittedERPatients().
            map(res => { return res });
    }

    GetAllDeathERPatients() {
        return this.emergencyDLService.GetAllDeathERPatients().
            map(res => { return res });
    }


    GetAllTransferredERPatients() {
        return this.emergencyDLService.GetAllTransferredERPatients().
            map(res => { return res });
    }
    GetAllDischargedERPatients() {
        return this.emergencyDLService.GetAllDischargedERPatients().
            map(res => { return res });
    }

    GetAllCountries() {
        return this.emergencyDLService.GetAllCountries().
            map(res => { return res });
    }
    public GetDoctorsList() {
        return this.emergencyDLService.GetDoctorsList()
            .map(res => res);
    }
    // getting the CountrySubDivision from dropdown
    public GetCountrySubDivision(countryId: number) {
        return this.emergencyDLService.GetCountrySubDivision(countryId)
            .map(res => { return res });
    }
    public GetDischargeSummaryDetail(patientId: number, visitId: number) {
        return this.emergencyDLService.GetDischargeSummaryDetail(patientId, visitId)
            .map(res => { return res });
    }


    PostERPatient(ERPatient: EmergencyPatientModel, existingPatient: boolean) {
        let patient = _.omit(ERPatient, ['ERPatientValidator']);
        return this.emergencyDLService.PostERPatient(patient, existingPatient)
            .map(res => { return res });
    }

    PostERDischargeSummary(ERDischargeSum: EmergencyDischargeSummary) {
        return this.emergencyDLService.PostERDischargeSummary(ERDischargeSum)
            .map(res => { return res });
    }


    UpdateERDischargeSummary(ERDischargeSum: EmergencyDischargeSummary) {
        return this.emergencyDLService.UpdateERDischargeSummary(ERDischargeSum)
            .map(res => { return res });
    }

    UpdateERPatient(ERPatient: EmergencyPatientModel) {
        let patient = _.omit(ERPatient, ['ERPatientValidator']);
        let data = JSON.stringify(patient);
        return this.emergencyDLService.UpdateERPatient(patient)
            .map(res => { return res });
    }

    PutTriageCode(ERPatient: EmergencyPatientModel) {
        let patient = _.omit(ERPatient, ['ERPatientValidator']);
        let data = JSON.stringify(patient);
        return this.emergencyDLService.PutTriageCode(patient)
            .map(res => { return res });
    } 
    UpdateAssignedToDoctor(ERPatient: EmergencyPatientModel) {
        let patient = _.omit(ERPatient, ['ERPatientValidator']);
        let data = JSON.stringify(patient);
        return this.emergencyDLService.UpdateAssignedToDoctor(patient)
            .map(res => { return res });
    }
    PutLamaOfERPatient(ERPatient: EmergencyPatientModel, action: string) {
        let patient = _.omit(ERPatient, ['ERPatientValidator']);
        let data = JSON.stringify(patient);
        return this.emergencyDLService.UpdateLamaOfERPatient(patient, action)
            .map(res => { return res });
    } 
    UndoTriageOfERPatient(ERPatient: EmergencyPatientModel) {
        let patient = _.omit(ERPatient, ['ERPatientValidator']);
        let data = JSON.stringify(patient);
        return this.emergencyDLService.UndoTriageOfERPatient(patient)
            .map(res => { return res });
    }

    //To Update Tables to cancel the LabTest Request for Inpatient
    CancelInpatientCurrentLabTest(currentInpatientLabTest: InPatientLabTest) {
        let data = JSON.stringify(currentInpatientLabTest);
        return this.emergencyDLService.CancelInpatientCurrentLabTest(data)
            .map(res => { return res });
    }

    public CancelRadRequest(item: BillingTransactionItem) {
        var temp = _.omit(item, ['ItemList', 'BillingTransactionItemValidator', 'Patient']);
        let data = JSON.stringify(temp);
        return this.emergencyDLService.CancelRadRequest(data)
            .map((responseData) => {
                return responseData;
            });
    }
    public CancelBillRequest(item: BillingTransactionItem) {
        var temp = _.omit(item, ['ItemList', 'BillingTransactionItemValidator', 'Patient']);
        let data = JSON.stringify(temp);
        return this.emergencyDLService.CancelBillRequest(data)
            .map((responseData) => {
                return responseData;
            });
    }



}