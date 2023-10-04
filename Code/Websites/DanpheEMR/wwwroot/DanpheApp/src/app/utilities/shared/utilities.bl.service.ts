import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CoreDLService } from "../../core/shared/core.dl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ChangeVisitScheme_DTO } from "./DTOs/change-visit-scheme.dto";
import { OrganizationDeposit_DTO } from "./DTOs/organization-deposit.dto";
import { ProcessConfirmationUserCredentials_DTO } from "./DTOs/process-confirmation-userCredentials.dto";
import { SchemeRefund_DTO } from "./DTOs/scheme-refund.dto";
import { UtilitiesDLService } from "./utilities.dl.service";

@Injectable()
export class UtilitiesBLService {
  constructor(public coreDLService: CoreDLService, public utilitiesDLSerivce: UtilitiesDLService) {

  }

  public GetBillingSchmes(): Observable<DanpheHTTPResponse> {
    return this.utilitiesDLSerivce.GetBillingSchemes()
      .map(res => {
        return res;
      });
  }

  public GetPatientsWithVisitsInfo(searchText: string) {
    return this.utilitiesDLSerivce.GetPatientsWithVisitsInfo(searchText)
      .map(res => {
        return res;
      });
  }
  public SearchRegisteredPatient(searchText: string) {
    return this.utilitiesDLSerivce.SearchRegisteredPatient(searchText)
      .map(res => {
        return res;
      });
  }

  public PatientLastVisitContext(patientId: number) {
    return this.utilitiesDLSerivce.PatientLastVisitContext(patientId)
      .map(res => {
        return res;
      });
  }


  public SaveSchemeRefund(schemeRefundDTO: SchemeRefund_DTO): Observable<DanpheHTTPResponse> {
    return this.utilitiesDLSerivce.SaveSchemeRefund(schemeRefundDTO)
      .map(res => {
        return res;
      });
  }
  public SaveChangedVisitScheme(changeVisitScheme_DTO: ChangeVisitScheme_DTO): Observable<DanpheHTTPResponse> {
    return this.utilitiesDLSerivce.SaveChangedVisitScheme(changeVisitScheme_DTO)
      .map(res => {
        return res;
      });
  }

  public GetSchemeRefund(fromDate, toDate): Observable<DanpheHTTPResponse> {
    return this.utilitiesDLSerivce.GetSchemeRefund(fromDate, toDate)
      .map(res => {
        return res;
      });
  }
  public GetSchemeRefundById(receiptNo: number): Observable<DanpheHTTPResponse> {
    return this.utilitiesDLSerivce.GetSchemeRefundById(receiptNo)
      .map(res => {
        return res;
      });
  }
  public GetPriceCategory() {
    return this.utilitiesDLSerivce.GetPriceCategory()
      .map(res => { return res });
  }
  public GetCreditOrganizationList(searchText: string) {
    return this.utilitiesDLSerivce.GetCreditOrganizationList(searchText)
      .map(res => { return res });
  }
  public GetDepositHead() {
    return this.utilitiesDLSerivce.GetDepositHead()
      .map(res => { return res });
  }
  public GetPatientPastBillSummary(patientId: number) {
    return this.utilitiesDLSerivce.GetPatientPastBillSummary(patientId)
      .map((responseData) => {
        return responseData;
      })
  }

  public PostOrganizationDeposit(organizationDeposit: OrganizationDeposit_DTO) {
    return this.utilitiesDLSerivce.PostOrganizationDeposit(organizationDeposit)
      .map((responseData) => {
        return responseData;
      });
  }
  public GetOrganizationDepositBalance(organizationId: number) {
    return this.utilitiesDLSerivce.GetOrganizationDepositBalance(organizationId)
      .map(res => res);
  }
  public GetDepositDetails(depositId: number) {
    return this.utilitiesDLSerivce.GetDepositDetails(depositId)
      .map(res => res);
  }
  public GetPatientSchemeRefunds(patientId): Observable<DanpheHTTPResponse> {
    return this.utilitiesDLSerivce.GetPatientSchemeRefunds(patientId)
      .map(res => {
        return res;
      });
  }
  public ConfirmProcess(processToConfirmUserCredentials: ProcessConfirmationUserCredentials_DTO) {
    return this.utilitiesDLSerivce.ConfirmProcess(processToConfirmUserCredentials)
      .map(res => res);
  }
}
