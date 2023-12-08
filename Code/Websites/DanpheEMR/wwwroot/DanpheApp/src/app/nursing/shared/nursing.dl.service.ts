import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { DietType } from "./diet-type.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ConsultationRequestModel } from "./consultation-request.model";

@Injectable()
export class NursingDLService {
  public http: HttpClient;
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  public optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  public jsonOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(_http: HttpClient) {
    this.http = _http;
  }

  //Get Nursing Order detail list by patient iD
  public GetNursingOrderListByPatientId(patientID: number) {
    return this.http.get<any>(
      "/api/Billing/NursingOrderList?patientId=" + patientID,
      this.options
    );
  }

  public GetNephrologyPatients() {
    return this.http.get<any>(
      "/api/Nursing/getNephrologyPatients",
      this.options
    );
  }

  public GetOpdVisits(fromDate, toDate) {
    return this.http.get<any>("/api/Nursing/OpdVisits?fromDate=" + fromDate + "&toDate=" + toDate, this.options)
  }

  public GetPastDataVisits(fromDate, toDate) {
    return this.http.get<any>("/api/Nursing/PastVisits?fromDate=" + fromDate + "&toDate=" + toDate, this.options)
  }
  //post all the imaging(radiology) requisition items
  public PostImagingItemsRequest(reqItemList: Array<ImagingItemRequisition>) {
    let data = JSON.stringify(reqItemList);
    return this.http.post<any>(
      "/api/Radiology/Requisitions",
      data,
      this.options
    );
  }

  //Post Billing Transaction Requisition Items
  public PostBillingReqItems(billReqItems) {
    let data = JSON.stringify(billReqItems);
    return this.http.post<any>('/api/Billing/SaveBillItemsRequisition', data, this.options);
  }

  //Post Lab Nursing order requisition
  public PostLabItemsRequisition(requisitionObjString: string) {
    let data = requisitionObjString;
    return this.http.post<any>(
      "/api/Lab/LabRequisitionFromBilling",
      data,
      this.options
    );
  }
  //Post Nursing drug requisition to pharmacy.
  public PostDrugsRequisition(requisitionObjString: string) {
    let data = requisitionObjString;
    return this.http.post<any>(
      "/api/PharmacyStock/DrugRequsition",
      data,
      this.options
    );
  }

  public CancelRadRequest(data: string) {
    return this.http.put<any>(
      "/api/Radiology/CancelInpatientRequisitions",
      data,
      this.options
    );
  }

  //cancel item request from nursing ward billing
  public CancelItemRequest(data: string) {
    return this.http.put<any>("/api/Billing/CancelInpatientItemFromWard", data, this.options);
  }

  public CancelBillRequest(data: string) {
    return this.http.put<any>(
      "/api/Billing/CancelOutpatientProvisionalItem",
      data,
      this.options
    );
  }

  public SubmitHemoReport(data: string) {
    return this.http.post<any>(
      "/api/Admission/HemoDialysisReport",
      data,
      this.options
    );
  }
  public CheckForLastReport(data: number) {
    return this.http.get<any>(
      "/api/Admission/LatestHemoDialysisReport?" + "patientId=" + data,
      this.options
    );
  }
  public PreviousReportList(data: number) {
    return this.http.get<any>(
      "/api/Admission/HemoDialysisReports?" + "patientId=" + data,
      this.options
    );
  }

  public PostPatientReceivedStatus(data: string) {
    return this.http.put<any>(
      "/api/Admission/AdmitTransferredPatient",
      data,
      this.options
    );
  }

  public UndoPatientTransfer(patVisitId: string, remarks: string) {
    return this.http.put<any>(
      "/api/Admission/UndoTransfer?cancelRemarks=" + remarks,
      patVisitId,
      this.options
    );
  }

  public AddFavouritePatient(patVisitId: string, preferenceType: string, wardId: string) {
    return this.http.post<any>(
      "/api/Nursing/FavouritePatient?itemId=" + patVisitId +
      "&preferenceType=" + preferenceType +
      "&wardId=" + wardId, this.options)
  }

  public RemoveFromFavorites(patVisitId, preferenceType: string, wardId) {
    return this.http.delete<any>(
      "/api/Nursing/RemoveFromPreference?itemId=" +
      patVisitId +
      "&preferenceType=" +
      preferenceType + "&wardId=" + wardId,
      this.options
    );
  }

  public AddToClinicalInfo(complains) {
    return this.http.post<any>(
      "/api/Nursing/ClinicalInformation", complains, this.options);
  }

  public AddNewComplaint(complains) {
    let data = JSON.stringify(complains);
    return this.http.post<any>(
      "/api/Nursing/Complaint", data, this.options);
  }

  public UpdateClinicalInfo(patientId, patientVisitId, complains) {
    let data = JSON.stringify(complains);
    return this.http.put<any>(
      "/api/Nursing/ClinicalInformation?patientId=" + patientId + "&patientVisitId=" + patientVisitId, data, this.options);
  }

  public GetComplaints(patientVisitId) {
    return this.http.get<any>(
      "/api/Nursing/Complains?patientVisitId=" + patientVisitId, this.options);
  }

  public UpdateComplaint(complaint) {
    let data = JSON.stringify(complaint);
    return this.http.put<any>(
      "/api/Nursing/Complaint", data, this.options);
  }

  public GetAllDepartments() {
    return this.http.get("/api/Nursing/GetAllDepartments");
  }
  GetBillingSummaryForPatient(patientId: number, patientVisitId: number) {
    return this.http.get("/api/Nursing/GetBillingDetails/" + patientId + "/" + patientVisitId)
  }

  public PostNursingCheckinDetails(checkInDetails) {
    return this.http.post<any>(
      "/api/Nursing/CheckInDetails", checkInDetails, this.jsonOptions);
  }

  public PostfreeReferalDetails(referDoctorDepartment) {
    return this.http.post<any>(
      "/api/Nursing/VisitForFreeReferral", referDoctorDepartment, this.jsonOptions);
  }
  public PostNursingCheckOutDetails(nursingOpdCheckout) {
    return this.http.post<any>(
      "/api/Nursing/CheckOutDetails", nursingOpdCheckout, this.jsonOptions);
  }

  public UpdateExchangedDoctorDepartmentDetails(exchangedDoctorDepartment) {
    return this.http.put<any>(
      "/api/Nursing/ExchangeDoctorDepartment", exchangedDoctorDepartment, this.jsonOptions);
  }
  public GetAllDietTypes() {
    return this.http.get<any>(
      "/api/Clinical/DietTypes"
    )
  }
  public GetAllInpatientListWithDietDetail(wardId: number) {
    return this.http.get<any>(
      `/api/Clinical/InpatientListWithDietDetail?WardId=${wardId}`, this.options);
  }

  public GetPatientDietHistory(PatientVisitId: number) {
    return this.http.get<any>(
      `/api/Clinical/PatientDietHistory?PatientVisitId=${PatientVisitId}`, this.options);
  }
  public AddPatientDietType(diet: DietType) {
    return this.http.post<any>("/api/Clinical/AddPatientDietType", diet, this.jsonOptions);
    }

    public GetConsultationRequestsByPatientVisitId(PatientVisitId: number): Observable<DanpheHTTPResponse> {
        return this.http.get<DanpheHTTPResponse>(`/api/Clinical/ConsultationRequestsByPatientVisitId?PatientVisitId=${PatientVisitId}`, this.options);
    }

    public GetPatientDetailsByPatientVisitIdForConsultationRequest(PatientVisitId: number): Observable<DanpheHTTPResponse> {
        return this.http.get<DanpheHTTPResponse>(`/api/Clinical/PatientDetailsByPatientVisitIdForConsultationRequest?PatientVisitId=${PatientVisitId}`, this.options);
    }

    public GetAllApptDepartment(): Observable<DanpheHTTPResponse> {
        return this.http.get<DanpheHTTPResponse>(`/api/Clinical/GetAllApptDepartment`);
    }

    public GetAllAppointmentApplicableDoctor(): Observable<DanpheHTTPResponse> {
        return this.http.get<DanpheHTTPResponse>(`/api/Clinical/GetAllAppointmentApplicableDoctor`);
    }

    public AddNewConsultationRequest(newConsultationRequest: ConsultationRequestModel): Observable<DanpheHTTPResponse> {
        return this.http.post<DanpheHTTPResponse>(`/api/Clinical/AddNewConsultationRequest`, newConsultationRequest, this.optionJson);
    }

    public ResponseConsultationRequest(responseConsultationRequest: ConsultationRequestModel): Observable<DanpheHTTPResponse> {
        return this.http.put<DanpheHTTPResponse>(`/api/Clinical/ResponseConsultationRequest`, responseConsultationRequest, this.optionJson);
    }
  public GetInvestigationResults(FromDate, ToDate, patientId, patientVisitId) {
    return this.http.get<any>(`/api/Nursing/InvestigationResults?fromDate=${FromDate}&toDate=${ToDate}&patientId=${patientId}&patientVisitId=${patientVisitId}`, this.options)
  }
}
