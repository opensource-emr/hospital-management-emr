import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable()
export class IncentiveDLService {

  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  constructor(private http: HttpClient) {
  }

  //                        *** GET ***

  GetIncentiveApplicableDocterList() {
    return this.http.get<any>('/api/Incentive?reqType=incentive-applicable-docter-list', this.options);
  }


  GetProfileList() {
    return this.http.get<any>('/api/Incentive?reqType=profileList', this.options);
  }

  GetCategoryList() {
    return this.http.get<any>('/api/Incentive?reqType=categoryList', this.options);
  }

  GetEmpWithProfileMap() {
    return this.http.get<any>('/api/Incentive?reqType=empWithProfileMap', this.options);
  }

  GetEmpWithoutProfileMap() {
    return this.http.get<any>('/api/Incentive?reqType=empWithoutProfileMap', this.options);
  }

  GetProfileListforMapping() {
    return this.http.get<any>('/api/Incentive?reqType=profileListForMapping', this.options);
  }

  GetActiveProfileList() {
    return this.http.get<any>('/api/Incentive?reqType=activeProfileList', this.options);
  }

  GetItemsforProfile() {
    return this.http.get<any>('/api/Incentive?reqType=getItemsforProfile', this.options);
  }

  GetProfileItemsMapping(profileId) {
    return this.http.get<any>('/api/Incentive?reqType=getProfileItemsMapping&profileId=' + profileId, this.options);
  }

  GetEmployeeIncentiveInfo() {
    return this.http.get<any>('/api/Incentive?reqType=getEmployeeIncentiveInfo', this.options);
  }

  GetEmployeeBillItemsList(employeeId) {
    return this.http.get<any>('/api/Incentive?reqType=getEmployeeBillItemsList&employeeId=' + employeeId, this.options);
  }

  GetItemsForIncentive() {
    return this.http.get<any>('/api/Incentive?reqType=getItemsForIncentive', this.options);
  }

  GetIncentiveSettingByEmpId(empId) {
    return this.http.get<any>('/api/Incentive?reqType=getInctvSettingByEmpId&employeeId=' + empId, this.options);
  }

  GetEmpProfileMap() {
    return this.http.get<any>('/api/Incentive?reqType=GetEmpProfileMap', this.options);
  }
  GetAllLedgerList() {
    return this.http.get<any>('/api/Accounting?reqType=ledger-list', this.options);
  }

  GetLedgerListOfEmployee() {
    return this.http.get<any>('/api/Accounting?reqType=acc-get-employee-ledger-list', this.options);
  }

  GetEmpIncentiveInfo() {
    return this.http.get<any>('/api/Incentive?reqType=getEmployeeIncentiveInfo', this.options);
  }

  public GetBillItemList() {
    return this.http.get<any>('/api/billing?reqType=billItemList', this.options);
  }

  //                        *** POST ***
  AddProfile(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=addProfile', strData, this.options);
  }

  AddEmpProfileMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=addEmpProfileMap', strData, this.options);
  }

  SaveProfileItemMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=saveProfileItemMap', strData, this.options);
  }

  SaveEmployeeBillItemsMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=saveEmployeeBillItemsMap', strData, this.options);
  }
  UpdateEmployeeBillItem(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=updateEmployeeBillItem', strData, this.options);
  }
  UpdateProfileBillItemMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=updateProfileBillItemMap', strData, this.options);
  }
  RemoveSelectedBillItem(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=removeSelectedBillItem', strData, this.options);
  }
  RemoveSelectedBillItemFromProfileMap(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=removeSelectedBillItemFromProfileMap', strData, this.options);
  }
  SaveItemGroupDistribution(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=saveItemGroupDistribution', strData, this.options);
  }

  ActivateDeactivateEmployeeSetup(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=activateDeactivateEmployeeSetup', strData, this.options);
  }
  ActivateDeactivateProfile(data) {
    const strData = JSON.stringify(data);
    return this.http.post<any>('/api/Incentive?reqType=activateDeactivateProfile', strData, this.options);
  }
  public PostPaymentInfo(data: string, idsToUpdate: string) {
    return this.http.post<any>('/api/Incentive?reqType=save-payment-info&fractionItenIdsToUpdate=' + idsToUpdate, data, this.options);
  }

  public PostToIncentiveTransaction(paymentInfoModel: string, TransactionObjString: string) {
    let data = paymentInfoModel;
    return this.http.post<any>("/api/Accounting?reqType=postIncentivePaymentVoucher&transactionObj=" + TransactionObjString, data, this.options);
  }

  //                        *** PUT ***
  UpdateProfile(data) {
    const strData = JSON.stringify(data);
    return this.http.put<any>('/api/Incentive?reqType=updateProfile', strData, this.options);
  }
  public PutBillTxnItems(modifiedItems) {
    let data = JSON.stringify(modifiedItems);
    return this.http.put<any>("/api/Incentive?reqType=update-billtxnItem", data, this.options);
  }
}
