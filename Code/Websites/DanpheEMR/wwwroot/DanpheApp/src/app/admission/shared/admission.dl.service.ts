import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PatientBedInfo } from './patient-bed-info.model';
import { DischargeDetailBillingVM } from '../../billing/ip-billing/shared/discharge-bill.view.models';
import { AdmissionCancelVM, AdmittingDocInfoVM } from './admission.view.model';
import { DischargeCancel } from './dischage-cancel.model';

@Injectable()
export class AdmissionDLService {
public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) {
    }

    public GetADTList(admissionStatus) {
        return this.http.get<any>("/api/Admission?reqType=getADTList&admissionStatus=" + admissionStatus, this.options);
    }
    //used in nursing module
    public GetAdmittedList() {
        return this.http.get<any>("/api/Admission?reqType=getAdmittedList", this.options);
    }
    public GetPatientList() {
        //return this.http.get<any>("/api/Patient", this.options);
        return this.http.get<any>("/api/Patient?reqType=patient-search-by-text&search=", this.options);
    }
    public GetCheckPatientAdmission(patientId: number) {
        return this.http.get<any>("/api/Admission?reqType=checkPatientAdmission"
            + '&patientId=' + patientId, this.options);
    }
    //public CheckPatProvisionalInfo(patId) {
    //    return this.http.get<any>("/api/Admission?reqType=checkPatProvisionalInfo&patientId=" + patId, this.options);
    //}
    public GetWards() {
        return this.http.get<any>("/api/Admission?reqType=wardList", this.options);
    }
    public GetWardBedFeatures(wardId: number) {
        return this.http.get<any>("/api/Admission?reqType=wardBedFeature&wardId=" + wardId, this.options);
    }

    public GetAdmittedPatInfo(patientVisitId: number) {
        return this.http.get<any>("/api/Admission?reqType=getAdmittedPatientDetails&patientVisitId=" + patientVisitId, this.options);
    }

    public GetSimilarBedFeatures(bedId: number, bedFeatureId: number) {
        return this.http.get<any>("/api/Admission?reqType=similarBedFeatures&bedId=" + bedId + '&bedFeatureId=' + bedFeatureId, this.options);
    }
    public GetAvailableBeds(wardId: number, bedFeatureId: number) {
        return this.http.get<any>("/api/Admission?reqType=availableBeds"
            + '&bedFeatureId=' + bedFeatureId
            + '&wardId=' + wardId, this.options);
    }
    public CheckPatProvisionalInfo(patId) {
        return this.http.get<any>("/api/Admission?reqType=checkPatProvisionalInfo&patientId=" + patId, this.options);
    }
    public GetDischargeType() {
        return this.http.get<any>("/api/Admission?reqType=discharge-type", this.options);
    }
    public GetDischargeSummary(patientVisitId: number) {
        return this.http.get<any>("/api/Admission?reqType=discharge-summary-patientVisit&patientVisitId=" + patientVisitId, this.options);
    }
    public GetAdmittingDocInfo() {
        return this.http.get<any>("/api/Admission?reqType=get-doctor-list", this.options);
    }
    public GetProviderList() {
        return this.http.get<any>("/api/Admission?reqType=provider-list", this.options);
    }
    //get list of employee from Anasthetists dept
    public GetAnasthetistsEmpList() {
        return this.http.get<any>("/api/Admission?reqType=anasthetists-employee-list", this.options);
    }
    public GetAdmissionHistory(patientId: number) {
        return this.http.get<any>("/api/Admission?reqType=admissionHistory&patientId=" + patientId, this.options);
    }
    public GetLatestAdmissionDetail(patientId: number) {
        return this.http.get<any>("/api/Admission?reqType=latest-adt-detail&patientId=" + patientId, this.options);
    }
    public PostAdmission(currentAdmission) {
        let data = JSON.stringify(currentAdmission);
        return this.http.post<any>("/api/Admission?reqType=Admission", data, this.options);
    }

    public PostPatientBedInfo(CurrentPatientBedInfo: PatientBedInfo) {
        let data = JSON.stringify(CurrentPatientBedInfo);
        return this.http.post<any>("/api/Admission?reqType=PatientBedInfo", data, this.options);
    }
    public PostDischargeSummary(dischargeSummary) {
        let data = JSON.stringify(dischargeSummary);
        return this.http.post<any>("/api/Admission?reqType=discharge-summary", data, this.options);
    }
    public PostDischargeCancelBill(dischargeCancel){
        let data = JSON.stringify(dischargeCancel);
       return this.http.post<any>("/api/Admission?reqType=postCancelDischargeBills", data, this.options);
   }

    public PostAdmissionRemark(admission) {
        let data = JSON.stringify(admission);
        return this.http.post<any>("/api/Admission?reqType=post-admission-remark", data, this.options);
    }

    public CheckAdmissionCancelled(cancelAdmission: AdmissionCancelVM) {
        let data = JSON.stringify(cancelAdmission);
        return this.http.put<any>("/api/Admission?reqType=cancel-admission&inpatientVisitId=" + cancelAdmission.PatientVisitId, data, this.options);
    }

    public PutPatientDischarge(admission, bedInfoId: number) {
        let data = JSON.stringify(admission);
        return this.http.put<any>("/api/Admission?&reqType=discharge&bedInfoId=" + bedInfoId, data, this.options);
    }

    public PutPatientBedInfo(newBedInfo, bedInfoId: number) {
        let data = JSON.stringify(newBedInfo);
        return this.http.put<any>("/api/Admission?reqType=transfer-upgrade&bedInfoId=" + bedInfoId, data, this.options);
    }
    public PutDischargeSummary(dischargeSummary) {
        let data = JSON.stringify(dischargeSummary);
        return this.http.put<any>("/api/Admission?reqType=discharge-summary", data, this.options);
    }
    public PutAdmissionClearDue(patVisitId: number) {
        return this.http.put<any>("/api/Admission?&reqType=clear-due&patientVisitId=" + patVisitId, this.options);
    }
    //Hom: 11/15/2018
    public PutAdmissionDates(dataToEdit) {
        let data = JSON.stringify(dataToEdit);
        return this.http.put<any>("/api/Admission?reqType=change-admission-info", data, this.options);
    }
    //Hom: 5 Dec 2018   Update doctor in inpatient billing's change doctor feature 
    public PutAdmittingDoctor(admittingInfo: AdmittingDocInfoVM) {
        let data = JSON.stringify(admittingInfo);
        return this.http.put<any>("/api/Admission?reqType=change-admitting-doctor", data, this.options);
    }
    //sud: 20Jun'18
    public GetDepartments() {
        return this.http.get<any>("/api/Master?type=department&reqType=appointment");
    }

    //used from IP billing.
    public DischargePatient(dischargeDetail: DischargeDetailBillingVM) {
        let data = JSON.stringify(dischargeDetail);
        return this.http.put<any>("/api/Admission?reqType=discharge-frombilling", data, this.options);
    }

    public GetAdmissionBillItems() {
        return this.http.get<any>("/api/Billing?reqType=admission-bill-items", this.options);
    }

    public GetBedChargeBillItem(patId, patVisitId) {
        return this.http.get<any>("/api/Admission?reqType=existing-bed-types-for-patientVisit&patientId=" + patId + "&patientVisitId=" + patVisitId, this.options);
    }


    //sud: 7Jan'19--to send wrist-band html content to server for file creation.
    public PostWristBandStickerHTML(printerName: string, filePath: string, wristBandHtmlContent: string) {
        return this.http.post<any>("/api/Admission?reqType=saveWristBandHTML&PrinterName=" + printerName + "&FilePath=" + filePath, wristBandHtmlContent, this.options);
    }
}








