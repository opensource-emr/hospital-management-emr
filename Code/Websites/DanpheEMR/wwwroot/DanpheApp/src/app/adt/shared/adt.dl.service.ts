import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DischargeDetailBillingVM } from "../../billing/ip-billing/shared/discharge-bill.view.models";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { AdmissionCancelVM, AdmittingDocInfoVM } from "./admission.view.model";
import { PatientBedInfo } from "./patient-bed-info.model";

@Injectable()
export class ADT_DLService {
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  private headerOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient) { }
  public GetADTList(admissionStatus) {
    return this.http.get<any>(
      "/api/Admission/AdmittedPatientsData?admissionStatus=" + admissionStatus,
      this.options
    );
  }

  public GetEmployeeFollowUp() {
    return this.http.get<any>(
      "/api/Admission/FollowUpPreferences",
      this.options
    );
  }
  public GetADTDataByVisitId(admissionStatus, patVisitId) {
    return this.http.get<any>(
      "/api/Admission/AdmittedPatientsData?admissionStatus=" +
      admissionStatus +
      "&patientVisitId=" +
      patVisitId,
      this.options
    );
  }
  public GetDischargedPatientsList(admissionStatus, fromDt, toDt) {
    return this.http.get<any>(
      "/api/Admission/DischargedPatients?admissionStatus=" +
      admissionStatus +
      "&FromDate=" +
      fromDt +
      "&ToDate=" +
      toDt,
      this.options
    );
  }

  public GetDetailsForAdmissionSlip(PatientVisitId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Admission/AdmissionSlipDetails?PatientVisitId=${PatientVisitId}`, this.options);
  }

  public GetDetailsForDischargeSlip(PatientVisitId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Admission/DischargeSlipDetails?PatientVisitId=${PatientVisitId}`, this.options);
  }

  // used for discharge summary of admitted patient
  public GetAdmittedPatientsList(admissionStatus, fromDt, toDt) {
    return this.http.get<any>(
      "/api/Admission/AdmittedPatients?admissionStatus=" +
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
      "/api/Admission/AdmittedPatientForNursing?FromDate=" +
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
      "/api/Admission/TransferredPatientInfo",
      this.options
    );
  }
  public GetPatientList(searchTxt) {
    //return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>(
      "/api/Patient/SearchPatient?search=" + searchTxt,
      this.options
    );
  }

  //sud:29Nov--Needed Separate API to get the patient list quicker.
  public GetPatientListForADT(searchTxt) {
    //return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>(
      "/api/Patient/SearchPatientForNewVisit?search=" + searchTxt,
      this.options
    );
  }
  public GetCheckPatientAdmission(patientId: number) {
    return this.http.get<any>(
      "/api/Admission/PatientAdmissionStatus?" +
      "patientId=" +
      patientId,
      this.options
    );
  }
  //public CheckPatProvisionalInfo(patId) {
  //    return this.http.get<any>("/api/Admission?reqType=checkPatProvisionalInfo&patientId=" + patId, this.options);
  //}
  public GetWards() {
    return this.http.get<any>("/api/Admission/Wards", this.options);
  }
  public GetWardBedFeatures(wardId: number, priceCategoryId: number) {
    return this.http.get<any>(
      `/api/Admission/Ward/BedFeatures?wardId=${wardId}&priceCategoryId=${priceCategoryId}`,
      this.options
    );
  }

  public GetAdmittedPatInfo(patientVisitId: number) {
    return this.http.get<any>(
      "/api/Admission/AdmittedPatientBedInfo?patientVisitId=" +
      patientVisitId,
      this.options
    );
  }

  public GetDischargeType() {
    return this.http.get<any>(
      "/api/Admission/DischargeTypes",
      this.options
    );
  }
  public GetProviderList() {
    return this.http.get<any>(
      "/api/Admission/AppointmentApplicableDoctors",
      this.options
    );
  }
  //get list of employee from Anasthetists dept
  public GetAnasthetistsEmpList() {
    return this.http.get<any>(
      "/api/Admission/Anaesthetists",
      this.options
    );
  }
  public GetDocDptAndWardList(patId: number, visitId: number) {
    return this.http.get<any>(
      "/api/Admission/DoctorDeparmentAndWardInfo?patientId=" +
      patId +
      "&patientVisitId=" +
      visitId,
      this.options
    );
  }
  public GetSimilarBedFeatures(wardId: number, bedFeatureId: number) {
    return this.http.get<any>(
      "/api/Admission/SimilarBedFeatures?wardId=" +
      wardId +
      "&bedFeatureId=" +
      bedFeatureId,
      this.options
    );
  }
  public GetAvailableBeds(wardId: number, bedFeatureId: number) {
    return this.http.get<any>("/api/Admission/AvailableBeds?" + "bedFeatureId=" + bedFeatureId + "&wardId=" + wardId, this.options);
  }
  public CheckPatProvisionalInfo(patId) {
    return this.http.get<any>(
      "/api/Admission/ProvisionalBillStatus?patientId=" + patId,
      this.options
    );
  }
  public GetDischargeSummary(patientVisitId: number) {
    return this.http.get<any>(
      "/api/Admission/DischargeSummary?patientVisitId=" +
      patientVisitId,
      this.options
    );
  }

  public GetPatientPlusBedInfo(patId, patVisitId) {
    return this.http.get<any>(
      "/api/Admission/PatientAndBedInfo?patientId=" +
      patId +
      "&patientVisitId=" +
      patVisitId,
      this.options
    );
  }

  public GetAdmittingDocInfo() {
    return this.http.get<any>(
      "/api/Admission/Doctors",
      this.options
    );
  }
  public GetAdmissionHistory(patientId: number) {
    return this.http.get<any>(
      "/api/Admission/AdmissionHistory?patientId=" + patientId,
      this.options
    );
  }
  public GetLatestAdmissionDetail(patientId: number) {
    return this.http.get<any>(
      "/api/Admission/LatestAdmissionInfo?patientId=" + patientId,
      this.options
    );
  }
  public GetEmployeeFavorites() {
    return this.http.get<any>(
      "/api/Admission/FavouritePatients",
      this.options
    );
  }
  public GetNursingEmployeeFavorites() {
    return this.http.get<any>(
      "/api/Admission/NursingFavouritePatients",
      this.options
    );
  }
  public GetAllWardBedInfo() {
    return this.http.get<any>("/api/Admission/GetAllWardBedInfo", this.options);
  }
  public GetNewClaimCode() {
    return this.http.get<any>("/api/GovInsurance/NewClaimCode", this.options);
  }
  public GetOldClaimCode(patId) {
    return this.http.get<any>("/api/GovInsurance/AdmissionOldClaimCode?patientId=" + patId, this.options);
  }

  // public GetInsVisitList(claimCode: number, patId: number) {
  //   return this.http.get<any>("/api/GovInsurance?&reqType=existingClaimCode-VisitList&claimCode=" + claimCode + "&patientId=" + patId, this.options);
  // }

  public PostAdmission(currentAdmission) {
    let data = JSON.stringify(currentAdmission);
    return this.http.post<any>(
      "/api/Admission/Admission",
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
      "/api/Admission/DischargeSummary",
      data,
      this.options
    );
  }
  public PostDischargeCancelBill(dischargeCancel) {
    let data = JSON.stringify(dischargeCancel);
    return this.http.post<DanpheHTTPResponse>("/api/Admission/CancelDischargeBill", data, this.options);
  }

  public PostAdmissionRemark(admission) {
    let data = JSON.stringify(admission);
    return this.http.post<any>(
      "/api/Admission/AdmissionRemark",
      data,
      this.options
    );
  }

  public PostADTBedReservation(reservation, action) {
    let data = JSON.stringify(reservation);
    return this.http.post<any>(
      "/api/Admission/ReserveAdmission?actionName=" + action,
      data,
      this.options
    );
  }

  public CheckAdmissionCancelled(cancelAdmission: AdmissionCancelVM) {
    let data = JSON.stringify(cancelAdmission);
    return this.http.put<any>(
      "/api/Admission/CancelAdmission?inpatientVisitId=" +
      cancelAdmission.PatientVisitId,
      data,
      this.options
    );
  }

  public UpdateADTBedReservation(reservation, action) {
    let data = JSON.stringify(reservation);
    return this.http.put<any>(
      "/api/Admission/ReserveAdmission?actionName=" +
      action,
      data,
      this.options
    );
  }

  public CancelADTBedReservation(reservationIdToCancel, action) {
    return this.http.put<any>(
      "/api/Admission/CancelReserveAdmission?actionName=" +
      action,
      reservationIdToCancel,
      this.options
    );
  }

  public PutPatientDischarge(admission, bedInfoId: number) {
    let data = JSON.stringify(admission);
    return this.http.put<any>(
      "/api/Admission/Discharge?bedInfoId=" + bedInfoId,
      data,
      this.options
    );
  }

  public PutPatientBedInfo(newBedInfo, bedInfoId: number, transferredFrom: string) {
    let data = JSON.stringify(newBedInfo);
    return this.http.put<any>("/api/Admission/Transfer?bedInfoId=" + bedInfoId + "&transferredFrom=" + transferredFrom, data, this.options);
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
      "/api/Admission/ClearDueAmount?patientVisitId=" + patVisitId,
      this.options
    );
  }
  //Hom: 11/15/2018
  public PutAdmissionDates(dataToEdit) {
    let data = JSON.stringify(dataToEdit);
    return this.http.put<any>(
      "/api/Admission/AdmissionInfo",
      data,
      this.options
    );
  }
  //Hom: 5 Dec 2018   Update doctor in inpatient billing's change doctor feature
  public PutAdmittingDoctor(admittingInfo: AdmittingDocInfoVM) {
    let data = JSON.stringify(admittingInfo);
    return this.http.put<any>(
      "/api/Admission/AdmittingDoctor",
      data,
      this.options
    );
  }
  //sud: 20Jun'18
  public GetDepartments() {
    return this.http.get<any>(
      "/api/Master/AppointmentApplicableDepartments"
    );
  }

  //used from IP billing.
  public DischargePatient(dischargeDetail: DischargeDetailBillingVM) {
    let data = JSON.stringify(dischargeDetail);
    return this.http.put<any>(
      "/api/Admission/BillingDischarge",
      data,
      this.options
    );
  }

  public DischargePatientWithZeroItem(data: string) {
    return this.http.post<any>(
      "/api/Admission/DischargeOnZeroItem", data,
      this.options
    );
  }

  // public GetAdmissionBillItems() {
  //   return this.http.get<any>(
  //     "/api/Billing/AdmissionBillItems",
  //     this.options
  //   );
  // }

  public GetBedChargeBillItem(patId, patVisitId) {
    return this.http.get<any>(
      "/api/Admission/PatientBedInfos?patientId=" +
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
      "/api/Admission/WristBand?PrinterName=" +
      printerName +
      "&FilePath=" +
      filePath,
      wristBandHtmlContent,
      this.options
    );
  }

  public AddToFavorites(itemId: string, preferenceType: string, data) {
    return this.http.post<any>(
      "/api/Orders/EmployeePreference?itemId=" +
      itemId +
      "&preferenceType=" +
      preferenceType,
      data,
      this.options
    );
  }

  public RemoveFromFavorites(itemId, preferenceType: string) {
    return this.http.put<any>(
      "/api/Orders/EmployeePreference/?itemId=" +
      itemId +
      "&preferenceType=" +
      preferenceType,
      this.options
    );
  }

  public GetAdmissionSchemePriceCategoryInfo(patientVisitId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Admission/AdmissionSchemePriceCategoryInfo?patientVisitId=${patientVisitId}`);
  }
  public GetAvailableBedAndBedFeaturePrice(wardId: number, bedFeatureId: number, priceCategoryId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Admission/AvailableBedsAndBedFeaturePrice?wardId=${wardId}&bedFeatureId=${bedFeatureId}&priceCategoryId=${priceCategoryId}`);
  }
  public IsPreviousBedAvailable(patientVisitId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Admission/IsPreviousBedAvailable?patientVisitId=${patientVisitId}`);
  }
  public GetAppointmentApplicableDoctorsInfo() {
    return this.http.get<any>(
      "/api/Admission/AppointmentApplicableDoctorList",
      this.options
    );
  }

}
