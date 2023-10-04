import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ChangeVisitScheme_DTO } from "./DTOs/change-visit-scheme.dto";
import { OrganizationDeposit_DTO } from "./DTOs/organization-deposit.dto";
import { ProcessConfirmationUserCredentials_DTO } from "./DTOs/process-confirmation-userCredentials.dto";
import { SchemeRefund_DTO } from "./DTOs/scheme-refund.dto";



@Injectable()
export class UtilitiesDLService {
  public optionsJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) {
  }
  public GetBillingSchemes(): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/BillSettings/BillingSchemes`, this.optionsJson);
  }
  public GetPatientsWithVisitsInfo(searchTxt) {
    return this.http.get<any>(`/api/Patient/PatientWithVisitInfo?search=${searchTxt}&showIpPatinet=${true}`, this.options);
  }
  public SearchRegisteredPatient(searchTxt) {
    return this.http.get<any>(`/api/Patient/SearchRegisteredPatient?search=${searchTxt}&showIpPatinet=${true}`, this.options);
  }
  public PatientLastVisitContext(patientId) {
    return this.http.get<any>(`/api/Patient/PatientLastVisitContext?patientId=` + patientId, this.options);
  }

  public SaveSchemeRefund(schemeRefundDTO: SchemeRefund_DTO): Observable<DanpheHTTPResponse> {
    return this.http.post<DanpheHTTPResponse>(`/api/Utilities/SchemeRefund`, schemeRefundDTO, this.optionsJson);
  }

  public SaveChangedVisitScheme(changeVisitScheme_DTO: ChangeVisitScheme_DTO): Observable<DanpheHTTPResponse> {
    return this.http.post<DanpheHTTPResponse>(`/api/Utilities/ChangeVisitScheme`, changeVisitScheme_DTO, this.optionsJson);
  }

  public GetSchemeRefund(fromDate, toDate): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>("/api/Utilities/SchemeRefund?FromDate=" + fromDate + "&ToDate=" + toDate, this.optionsJson);
  }
  public GetSchemeRefundById(receiptNo: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>("/api/Utilities/SchemeRefundById?receiptNo=" + receiptNo, this.optionsJson);
  }
  public GetPriceCategory() {
    return this.http.get<any>("/api/Settings/PriceCategories");
  }
  public GetCreditOrganizationList(searchTxt) {
    return this.http.get<DanpheHTTPResponse>("/api/BillSettings/CreditOrganizations");
  }
  public GetDepositHead() {
    return this.http.get<DanpheHTTPResponse>("/api/BillingDeposit/GetDepositHead", this.options);
  }
  public GetPatientPastBillSummary(patientId: number) {
    return this.http.get<DanpheHTTPResponse>("/api/Billing/PatientsPastBillSummary?patientId=" + patientId, this.options);
  }
  public PostOrganizationDeposit(organizationDeposit: OrganizationDeposit_DTO): Observable<DanpheHTTPResponse> {
    return this.http.post<DanpheHTTPResponse>("/api/Utilities/OrganizationDeposit", organizationDeposit, this.optionsJson);
  }
  public GetOrganizationDepositBalance(organizationId: number) {
    return this.http.get<any>("/api/Utilities/OrganizationDepositBalance?OrganizationId=" + organizationId, this.optionsJson);
  }
  public GetDepositDetails(depositId: number) {
    return this.http.get<any>("/api/Utilities/OrganizationDepositDetailById?depositId=" + depositId, this.optionsJson);
  }
  public GetPatientSchemeRefunds(patientId): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>("/api/Utilities/PatientSchemeRefunds?patientId=" + patientId, this.optionsJson);
  }
  public ConfirmProcess(processToConfirmUserCredentials: ProcessConfirmationUserCredentials_DTO) {
    return this.http.post<DanpheHTTPResponse>(`/api/ProcessConfirmation/ConfirmProcess`, processToConfirmUserCredentials, this.optionsJson);
  }




}
