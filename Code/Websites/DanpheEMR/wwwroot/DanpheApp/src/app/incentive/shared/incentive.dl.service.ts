import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DanpheHTTPResponse } from '../../shared/common-models';

@Injectable()
export class IncentiveDLService {

  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  constructor(private http: HttpClient) {
  }

  //                        *** GET ***

  GetIncentiveApplicableDocterList() {
    return this.http.get<any>('/api/Incentive/IncentiveApplicableDoctors', this.options);
  }


  GetProfileList() {
    return this.http.get<any>('/api/Incentive/Profiles', this.options);
  }

  GetCategoryList() {
    return this.http.get<any>('/api/Incentive/Categories', this.options);
  }

  // GetEmpWithProfileMap() {
  //   return this.http.get<any>('/api/Incentive?reqType=empWithProfileMap', this.options);
  // }

  // GetEmpWithoutProfileMap() {
  //   return this.http.get<any>('/api/Incentive?reqType=empWithoutProfileMap', this.options);
  // }

  // GetProfileListforMapping() {
  //   return this.http.get<any>('/api/Incentive?reqType=profileListForMapping', this.options);
  // }

  // GetActiveProfileList() {
  //   return this.http.get<any>('/api/Incentive?reqType=activeProfileList', this.options);
  // }

  GetItemsforProfile() {
    return this.http.get<any>('/api/Incentive/ProfileItems', this.options);
  }

  GetProfileItemsMapping(profileId) {
    return this.http.get<any>(`/api/Incentive/ProfileItemsMapping?profileId=${profileId}`, this.options);
  }

  GetEmployeeIncentiveInfo() {
    return this.http.get<any>('/api/Incentive/EmployeesIncentiveInfo', this.options);
  }

  GetEmployeeBillItemsList(employeeId) {
    return this.http.get<DanpheHTTPResponse>(`/api/Incentive/EmployeeBillItems?employeeId=${employeeId}`, this.options);
  }

  GetItemsForIncentive(priceCategoryId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Incentive/IncentiveItems?priceCategoryId=${priceCategoryId}`, this.options);
  }

  //no reqType found during API segregation
  GetIncentiveSettingByEmpId(empId) {
    return this.http.get<any>('/api/Incentive?reqType=getInctvSettingByEmpId&employeeId=' + empId, this.options);
  }

  //no reqType found during API segregation
  GetEmpProfileMap() {
    return this.http.get<any>('/api/Incentive?reqType=GetEmpProfileMap', this.options);
  }
  GetAllLedgerList() {
    return this.http.get<any>('/api/Accounting/Ledgers', this.options);
  }

  GetLedgerListOfEmployee() {
    return this.http.get<any>('/api/Accounting/EmployeeLedgers', this.options);
  }

  GetEmpIncentiveInfo() {
    return this.http.get<any>('/api/Incentive/EmployeesIncentiveInfo', this.options);
  }

  public GetBillItemList() {
    return this.http.get<any>('/api/billing/BillCfgItems', this.options);
  }

  //                        *** POST ***
  AddProfile(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/Profile', strData, this.options);
  }

  // AddEmpProfileMap(data) {
  //   const strData = JSON.stringify(data);
  //   return this.http.post<any>('/api/Incentive?reqType=addEmpProfileMap', strData, this.options);
  // }

  SaveProfileItemMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/MapProfileItems', strData, this.options);
  }

  SaveEmployeeBillItemsMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/MapEmployeeBillItems', strData, this.options);
  }
  UpdateEmployeeBillItem(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/EmployeeBillItems', strData, this.options);
  }
  UpdateProfileBillItemMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/ProfileBillItemMap', strData, this.options);
  }
  RemoveSelectedBillItem(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/RemoveBillItem', strData, this.options);
  }
  RemoveSelectedBillItemFromProfileMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/RemoveBillItemFromProfileMap', strData, this.options);
  }
  SaveItemGroupDistribution(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/ItemsGroupDistribution', strData, this.options);
  }

  ActivateDeactivateEmployeeSetup(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/ActivateDeactivateEmployeeSetup', strData, this.options);
  }
  ActivateDeactivateProfile(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive/ActivateDeactivateProfile', strData, this.options);
  }
  // public PostPaymentInfo(data: string, idsToUpdate: string) {
  //   return this.http.post<any>('/api/Incentive?reqType=save-payment-info&fractionItenIdsToUpdate=' + idsToUpdate, data, this.options);
  // }

  public PostToIncentiveTransaction(paymentInfoModel: string, TransactionObjString: string) {
    let data = paymentInfoModel;
    return this.http.post<any>("/api/Accounting/IncentivePayment?transactionObj=" + TransactionObjString, data, this.options);
  }

  //                        *** PUT ***
  UpdateProfile(data) {
    const strData = JSON.stringify(data);
    return this.http.put<any>('/api/Incentive/Profile', strData, this.options);
  }
  public PutBillTxnItems(modifiedItems) {
    let data = JSON.stringify(modifiedItems);
    return this.http.put<any>("/api/Incentive/BillTransactionItems", data, this.options);
  }
}
