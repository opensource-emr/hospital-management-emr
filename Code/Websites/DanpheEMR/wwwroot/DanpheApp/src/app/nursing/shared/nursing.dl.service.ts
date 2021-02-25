import { Injectable, Directive } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";

@Injectable()
export class NursingDLService {
  public http: HttpClient;
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  constructor(_http: HttpClient) {
    this.http = _http;
  }

  //Get Nursing Order detail list by patient iD
  public GetNursingOrderListByPatientId(patientID: number) {
    return this.http.get<any>(
      "/api/Billing?reqType=nursingOrderList" + "&patientId=" + patientID,
      this.options
    );
  }

  public GetNephrologyPatients() {
    return this.http.get<any>(
      "/api/Nursing/getNephrologyPatients",
      this.options
    );
  }

  public GetPastVisits(fromDate, toDate) {
    return this.http.get<any>("/api/Nursing?reqType=nur-opd-list&fromDate=" + fromDate + "&toDate=" + toDate , this.options)
  }

  public GetPastDataVisits(fromDate, toDate) {
    return this.http.get<any>("/api/Nursing?reqType=nur-opd-list-pastDays&fromDate=" + fromDate + "&toDate=" + toDate, this.options)
  }
  //post all the imaging(radiology) requisition items
  public PostImagingItemsRequest(reqItemList: Array<ImagingItemRequisition>) {
    let data = JSON.stringify(reqItemList);
    return this.http.post<any>(
      "/api/Radiology?reqType=postRequestItems",
      data,
      this.options
    );
  }

  //Post Billing Transaction Requisition Items
  public PostBillingReqItems(billReqItems) {
    let data = JSON.stringify(billReqItems);
    return this.http.post<any>(
      "/api/Billing?reqType=billItemsRequisition",
      data,
      this.options
    );
  }

  //Post Lab Nursing order requisition
  public PostLabItemsRequisition(requisitionObjString: string) {
    let data = requisitionObjString;
    return this.http.post<any>(
      "/api/Lab?reqType=FromBillingToRequisition",
      data,
      this.options
    );
  }
  //Post Nursing drug requisition to pharmacy.
  public PostDrugsRequisition(requisitionObjString: string) {
    let data = requisitionObjString;
    return this.http.post<any>(
      "/api/Pharmacy?reqType=drug-requistion",
      data,
      this.options
    );
  }

  public CancelRadRequest(data: string) {
    return this.http.put<any>(
      "/api/Radiology?reqType=cancelInpatientRadRequest",
      data,
      this.options
    );
  }

  //cancel item request from nursing ward billing
  public CancelItemRequest(data: string){
    return this.http.put<any>("/api/Billing?reqType=cancelInpatientItemFromWard", data, this.options);
  }

  public CancelBillRequest(data: string) {
    return this.http.put<any>(
      "/api/Billing?reqType=cancelInpatientBillRequest",
      data,
      this.options
    );
  }

  public SubmitHemoReport(data: string) {
    return this.http.post<any>(
      "/api/Admission?reqType=submitHemoReport",
      data,
      this.options
    );
  }
  public CheckForLastReport(data: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=checkForLastReport" + "&patientId=" + data,
      this.options
    );
  }
  public PreviousReportList(data: number) {
    return this.http.get<any>(
      "/api/Admission?reqType=previousReportList" + "&patientId=" + data,
      this.options
    );
  }

  public PostPatientReceivedStatus(data: string) {
    return this.http.put<any>(
      "/api/Admission?reqType=receive-transfer",
      data,
      this.options
    );
  }

  public UndoPatientTransfer(patVisitId: string, remarks: string) {
    return this.http.put<any>(
      "/api/Admission?reqType=undo-transfer&cancelRemarks=" + remarks,
      patVisitId,
      this.options
    );
  }

  public AddFavouritePatient(patVisitId: string, preferenceType: string, wardId: string) {
    return this.http.post<any>(
      "/api/Nursing?reqType=AddToPreference&itemId=" + patVisitId +
      "&preferenceType=" + preferenceType +
      "&wardId=" + wardId, this.options)
  }

  public RemoveFromFavorites(patVisitId, preferenceType: string, wardId) {
    return this.http.delete<any>(
      "/api/Nursing?reqType=DeleteFromPreference&itemId=" +
      patVisitId +
      "&preferenceType=" +
      preferenceType + "&wardId=" + wardId,
      this.options
    );
  }

  public AddToClinicalInfo(complains) {
    return this.http.post<any>(
      "/api/Nursing?reqType=post-clinical-info", complains, this.options);
  }

  public AddNewComplaint(complains) {
    let data = JSON.stringify(complains);
    return this.http.post<any>(
      "/api/Nursing?reqType=post-complaint", data, this.options);
  }

  public UpdateClinicalInfo(patientId, patientVisitId, complains) {
    let data = JSON.stringify(complains);
    return this.http.put<any>(
      "/api/Nursing?reqType=put-clinical-info&patientId=" + patientId + "&patientVisitId=" + patientVisitId , data, this.options);
  }

  public GetComplaints(patientVisitId) {
    return this.http.get<any>(
      "/api/Nursing?reqType=get-all-complains&patientVisitId="+ patientVisitId, this.options);
  }

  public UpdateComplaint(complaint) {
    let data = JSON.stringify(complaint);
    return this.http.put<any>(
      "/api/Nursing?reqType=update-chief-complaint", data, this.options);
  } 

  
}
