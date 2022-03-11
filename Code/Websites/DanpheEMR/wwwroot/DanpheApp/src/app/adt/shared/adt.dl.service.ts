import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { PatientBedInfo } from "./patient-bed-info.model";
import { DischargeDetailBillingVM } from "../../billing/ip-billing/shared/discharge-bill.view.models";
import { AdmissionCancelVM, AdmittingDocInfoVM } from "./admission.view.model";
import { DischargeCancel } from "./dischage-cancel.model";

@Injectable()
export class ADT_DLService {
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  constructor(public http: HttpClient) { }
  public GetADTList(admissionStatus) {
    return this.http.get<any>(
      "/api/Admission?reqType=getADTList&admissionStatus=" + admissionStatus,
      this.options
    );
  }
  public GetADTDataByVisitId(admissionStatus, patVisitId) {
    return this.http.get<any>(
      "/api/Admission?reqType=getADTList&admissionStatus=" +
      admissionStatus +
      "&patientVisitId=" +
      patVisitId,
      this.options
    );
  }
  public GetDischargedPatientsList(admissionStatus, fromDt, toDt) {
    return this.http.get<any>(
      "/api/Admission?reqType=DischargedPatientsList&admissionStatus=" +
      admissionStatus +
      "&FromDate=" +
      fromDt +
      "&ToDate=" +
      toDt,
      this.options
    );
  }
  // used for discharge summary of admitted patient
  public GetAdmittedPatientsList(admissionStatus, fromDt, toDt) {
    return this.http.get<any>(
      "/api/Admission?reqType=AdmittedPatientsList&admissionStatus=" +
      admissionStatus +
      "&FromDate=" +
      fromDt +
      "&ToDate=" +
      toDt,
      this.options
    );
  }

  //used in nursing module
  public GetAdmittedList(fromDate, toDate, searchTxt, wardId) {
    return this.http.get<any>(
      "/api/Admission?reqType=getAdmittedList&FromDate=" +
      fromDate +
      "&ToDate=" +
      toDate +
      "&search=" +
      searchTxt +
      "&wardId=" +
      wardId,
      this.options
    );
  }
  public GetPendingReceiveTransferredList() {
    return this.http.get<any>(
      "/api/Admission?reqType=pendingAdmissionReceiveList",
      this.options
    );
  }
  public GetPatientList(searchTxt) {
    //return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>(
      "/api/Patient?reqType=patient-search-by-text&search=" + searchTxt,
      this.options
    );
  } 
  
  //sud:29Nov--Needed Separate API to get the patient list quicker.
  public GetPatientListForADT(searchTxt) {
    //return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>(
      "/api/Patient?reqType=patient-search-for-new-visit&search=" + searchTxt,
      this.options
    );
  }
  public GetCheckPatientAdmission(patientId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=checkPatientAdmission" +
      "&patientId=" +
      patientId,
      this.options
    );
  }
  //public CheckPatProvisionalInfo(patId) {
  //    return this.http.get<any>("/api/Admission?reqType=checkPatProvisionalInfo&patientId=" + patId, this.options);
  //}
  public GetWards() {
    return this.http.get<any>("/api/Admission?reqType=wardList", this.options);
  }
  public GetWardBedFeatures(wardId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=wardBedFeature&wardId=" + wardId,
      this.options
    );
  }

  public GetAdmittedPatInfo(patientVisitId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=getAdmittedPatientDetails&patientVisitId=" +
      patientVisitId,
      this.options
    );
  }

  public GetDischargeType() {
    return this.http.get<any>(
      "/api/Admission?reqType=discharge-type",
      this.options
    );
  }
  public GetProviderList() {
    return this.http.get<any>(
      "/api/Admission?reqType=provider-list",
      this.options
    );
  }
  //get list of employee from Anasthetists dept
  public GetAnasthetistsEmpList() {
    return this.http.get<any>(
      "/api/Admission?reqType=anasthetists-employee-list",
      this.options
    );
  }
  public GetDocDptAndWardList(patId: number, visitId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=get-doc-dpt-ward&patientId=" +
      patId +
      "&patientVisitId=" +
      visitId,
      this.options
    );
  }
  public GetSimilarBedFeatures(wardId: number, bedFeatureId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=similarBedFeatures&wardId=" +
      wardId +
      "&bedFeatureId=" +
      bedFeatureId,
      this.options
    );
  }
  public GetAvailableBeds(wardId: number, bedFeatureId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=availableBeds" +
      "&bedFeatureId=" +
      bedFeatureId +
      "&wardId=" +
      wardId,
      this.options
    );
  }
  public CheckPatProvisionalInfo(patId) {
    return this.http.get<any>(
      "/api/Admission?reqType=checkPatProvisionalInfo&patientId=" + patId,
      this.options
    );
  }
  public GetDischargeSummary(patientVisitId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=discharge-summary-patientVisit&patientVisitId=" +
      patientVisitId,
      this.options
    );
  }

  public GetPatientPlusBedInfo(patId, patVisitId) {
    return this.http.get<any>(
      "/api/Admission?reqType=SelectedPatientPlusBedInfo&patientId=" +
      patId +
      "&patientVisitId=" +
      patVisitId,
      this.options
    );
  }

  public GetAdmittingDocInfo() {
    return this.http.get<any>(
      "/api/Admission?reqType=get-doctor-list",
      this.options
    );
  }

  public GetAdmissionHistory(patientId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=admissionHistory&patientId=" + patientId,
      this.options
    );
  }
  public GetLatestAdmissionDetail(patientId: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=latest-adt-detail&patientId=" + patientId,
      this.options
    );
  }
  public GetEmployeeFavorites() {
    return this.http.get<any>(
      "/api/Admission?reqType=get-emp-favorites",
      this.options
    );
  }
  public GetNursingEmployeeFavorites() {
    return this.http.get<any>(
      "/api/Admission?reqType=get-nur-favorites",
      this.options
    );
  }
  public GetAllWardBedInfo() {
    return this.http.get<any>("/api/Admission/GetAllWardBedInfo", this.options);
  }
  public GetNewClaimcode() {
    return this.http.get<any>("/api/insurance?reqType=get-new-claimCode", this.options);
  }
  public GetOldClaimcode(patId) {
    return this.http.get<any>("/api/insurance?reqType=get-patient-old-claimCode-for-admission&patientId="+patId,this.options);
  }
  public GetInsVisitList(claimCode: number, patId:number) {
    return this.http.get<any>("/api/Insurance?&reqType=existingClaimCode-VisitList&claimCode=" + claimCode+"&patientId="+patId, this.options);
  }
  public PostAdmission(currentAdmission) {
    let data = JSON.stringify(currentAdmission);
    return this.http.post<any>(
      "/api/Admission?reqType=Admission",
      data,
      this.options
    );
  }

  public PostPatientBedInfo(CurrentPatientBedInfo: PatientBedInfo) {
    let data = JSON.stringify(CurrentPatientBedInfo);
    return this.http.post<any>(
      "/api/Admission?reqType=PatientBedInfo",
      data,
      this.options
    );
  }
  public PostDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.post<any>(
      "/api/Admission?reqType=discharge-summary",
      data,
      this.options
    );
  }
  public PostDischargeCancelBill(dischargeCancel) {
    let data = JSON.stringify(dischargeCancel);
    return this.http.post<any>(
      "/api/Admission?reqType=postCancelDischargeBills",
      data,
      this.options
    );
  }

  public PostAdmissionRemark(admission) {
    let data = JSON.stringify(admission);
    return this.http.post<any>(
      "/api/Admission?reqType=post-admission-remark",
      data,
      this.options
    );
  }

  public PostADTBedReservation(reservation, action) {
    let data = JSON.stringify(reservation);
    return this.http.post<any>(
      "/api/Admission?reqType=post-admission-reservation&actionName=" + action,
      data,
      this.options
    );
  }

  public CheckAdmissionCancelled(cancelAdmission: AdmissionCancelVM) {
    let data = JSON.stringify(cancelAdmission);
    return this.http.put<any>(
      "/api/Admission?reqType=cancel-admission&inpatientVisitId=" +
      cancelAdmission.PatientVisitId,
      data,
      this.options
    );
  }

  public UpdateADTBedReservation(reservation, action) {
    let data = JSON.stringify(reservation);
    return this.http.put<any>(
      "/api/Admission?reqType=update-admission-reservation&actionName=" +
      action,
      data,
      this.options
    );
  }

  public CancelADTBedReservation(reservationIdToCancel, action) {
    return this.http.put<any>(
      "/api/Admission?reqType=cancel-admission-reservation&actionName=" +
      action,
      reservationIdToCancel,
      this.options
    );
  }

  public PutPatientDischarge(admission, bedInfoId: number) {
    let data = JSON.stringify(admission);
    return this.http.put<any>(
      "/api/Admission?&reqType=discharge&bedInfoId=" + bedInfoId,
      data,
      this.options
    );
  }

  public PutPatientBedInfo(
    newBedInfo,
    bedInfoId: number,
    transferredFrom: string
  ) {
    let data = JSON.stringify(newBedInfo);
    return this.http.put<any>(
      "/api/Admission?reqType=transfer-upgrade&bedInfoId=" +
      bedInfoId +
      "&transferredFrom=" +
      transferredFrom,
      data,
      this.options
    );
  }
  public PutDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.put<any>(
      "/api/Admission?reqType=discharge-summary",
      data,
      this.options
    );
  }
  public PutAdmissionClearDue(patVisitId: number) {
    return this.http.put<any>(
      "/api/Admission?&reqType=clear-due&patientVisitId=" + patVisitId,
      this.options
    );
  }
  //Hom: 11/15/2018
  public PutAdmissionDates(dataToEdit) {
    let data = JSON.stringify(dataToEdit);
    return this.http.put<any>(
      "/api/Admission?reqType=change-admission-info",
      data,
      this.options
    );
  }
  //Hom: 5 Dec 2018   Update doctor in inpatient billing's change doctor feature
  public PutAdmittingDoctor(admittingInfo: AdmittingDocInfoVM) {
    let data = JSON.stringify(admittingInfo);
    return this.http.put<any>(
      "/api/Admission?reqType=change-admitting-doctor",
      data,
      this.options
    );
  }
  //sud: 20Jun'18
  public GetDepartments() {
    return this.http.get<any>(
      "/api/Master?type=department&reqType=appointment"
    );
  }

  //used from IP billing.
  public DischargePatient(dischargeDetail: DischargeDetailBillingVM) {
    let data = JSON.stringify(dischargeDetail);
    return this.http.put<any>(
      "/api/Admission?reqType=discharge-frombilling",
      data,
      this.options
    );
  }

  public DischargePatientWithZeroItem(data: string) {
    return this.http.post<any>(
      "/api/Admission?reqType=discharge-zero-item", data,
      this.options
    );
  }

  public GetAdmissionBillItems() {
    return this.http.get<any>(
      "/api/Billing?reqType=admission-bill-items",
      this.options
    );
  }

  public GetBedChargeBillItem(patId, patVisitId) {
    return this.http.get<any>(
      "/api/Admission?reqType=existing-bed-types-for-patientVisit&patientId=" +
      patId +
      "&patientVisitId=" +
      patVisitId,
      this.options
    );
  }

  //sud: 7Jan'19--to send wrist-band html content to server for file creation.
  public PostWristBandStickerHTML(
    printerName: string,
    filePath: string,
    wristBandHtmlContent: string
  ) {
    return this.http.post<any>(
      "/api/Admission?reqType=saveWristBandHTML&PrinterName=" +
      printerName +
      "&FilePath=" +
      filePath,
      wristBandHtmlContent,
      this.options
    );
  }

  public AddToFavorites(itemId: string, preferenceType: string, data) {
    return this.http.post<any>(
      "/api/Orders?reqType=AddToPreference&itemId=" +
      itemId +
      "&preferenceType=" +
      preferenceType,
      data,
      this.options
    );
  }

  public RemoveFromFavorites(itemId, preferenceType: string) {
    return this.http.delete<any>(
      "/api/Orders?reqType=DeleteFromPreference&itemId=" +
      itemId +
      "&preferenceType=" +
      preferenceType,
      this.options
    );
  }
}
