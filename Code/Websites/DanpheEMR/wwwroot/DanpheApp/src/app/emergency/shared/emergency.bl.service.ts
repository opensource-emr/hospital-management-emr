import { Injectable, Directive } from '@angular/core';
import { EmergencyDLService } from './emergency.dl.service';
import { EmergencyPatientModel } from './emergency-patient.model';
import * as _ from 'lodash';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { InPatientLabTest } from '../../labs/shared/InpatientLabTest';
import { EmergencyDischargeSummary } from './emergency-discharge-summary.model';
import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import { UploadCosentFormModel } from './upload-consent-form.Model';

@Injectable()
export class EmergencyBLService {
  constructor(public emergencyDLService: EmergencyDLService, public patientDLService: PatientsDLService) {

  }

  GetERNumAndModeOfArrData() {
    return this.emergencyDLService.GetERNumAndModeOfArrData().
      map(res => { return res });
  }

  GetAllERPatients(caseId: number) {
    return this.emergencyDLService.GetAllERPatients(caseId).
      map(res => { return res });
  }

  GetAllTriagedPatients(caseId: number) {
    return this.emergencyDLService.GetAllTriagedPatients(caseId).
      map(res => { return res });
  }

  public GetAllExistingPatients() {
    return this.emergencyDLService.GetPatients()
      .map(res => { return res })
  }

  GetAllLamaERPatients(caseId: number) {
    return this.emergencyDLService.GetAllLamaERPatients(caseId).
      map(res => { return res });
  }

  GetAllAdmittedERPatients(caseId: number) {
    return this.emergencyDLService.GetAllAdmittedERPatients(caseId).
      map(res => { return res });
  }

  GetAllDeathERPatients(caseId: number) {
    return this.emergencyDLService.GetAllDeathERPatients(caseId).
      map(res => { return res });
  }


  GetAllTransferredERPatients(caseId: number) {
    return this.emergencyDLService.GetAllTransferredERPatients(caseId).
      map(res => { return res });
  }
  GetAllDischargedERPatients(caseId: number) {
    return this.emergencyDLService.GetAllDischargedERPatients(caseId).
      map(res => { return res });
  }
  GetAllDorERPatients(caseId: number) {
    return this.emergencyDLService.GetAllDorERPatients(caseId).
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

  GetMatchingPatientInER(firstName, lastName, dateOfBirth, phoneNumber) {
    return this.emergencyDLService.GetMatchingPatientInER(firstName, lastName, dateOfBirth, phoneNumber)
      .map(res => { return res });
  }

  public GetPatientById(patientId: number) {
    return this.patientDLService.GetPatientById(patientId)
      .map(res => { return res })
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

  //cancel ER items ordered
  public CancelItemRequest(item: BillingTransactionItem){
    var temp = _.omit(item, ['ItemList', 'BillingTransactionItemValidator', 'Patient']);
    let data = JSON.stringify(temp);
    return this.emergencyDLService.CancelItemRequest(data)
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
  public GetConsentFormUploadList(id: number) {
    return this.emergencyDLService.GetConsentFormUploadList(id).map((res) => {
      return res;
    });
  }
  public UploadConsentForm(filesToUpload, patFile: UploadCosentFormModel) {
    try{
    let formToPost = new FormData();
    var fileName: string;
    var omited = _.omit(patFile, ['FileUploadValidator']);

    var reportDetails = JSON.stringify(omited);//encodeURIComponent();

    for (let i = 0; i < filesToUpload.length; i++) {
      formToPost.append('files', filesToUpload[i],fileName);
    }
    formToPost.append("reportDetails", reportDetails);
    return this.emergencyDLService.PostConsentForm(formToPost).map((res) => {
      return res;
    });
  }
    catch (exception) {
      throw exception;
    }
  
  }
  public DeleteFile(id: number) {
    return this.emergencyDLService.DeleteFile(id).map((res) => {
      return res;
    });
  }
  public GetFileFromServer(id: number) {
    return this.emergencyDLService.GetFileFromServer(id).map((res) => {
      return res;
    });
  }

  public GetPatientsWithVisitsInfo(searchTxt) {
    return this.patientDLService.GetPatientsWithVisitsInfo(searchTxt)
      .map(res => res);
  }
}
