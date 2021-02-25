import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { IncentiveDLService } from './incentive.dl.service';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { TransactionModel } from '../../accounting/transactions/shared/transaction.model';
import { INCTV_TXN_PaymentInfoModel } from '../items/incentive-paymentInfo.model';
import { INCTV_TXN_PaymentInfoVM } from '../reports/transactionsReport/incentive-item-summary-report.component';

@Injectable()
export class IncentiveBLService {
  constructor(
    private incentiveDL: IncentiveDLService) {
  }

  //                        *** GET ***

  GetIncentiveApplicableDocterList() {
    return this.incentiveDL.GetIncentiveApplicableDocterList().map(res => res);
  }


  public GetProfileList() {
    return this.incentiveDL.GetProfileList()
      // .map(res => { return res });
      .map(res => res);
  }

  public GetCategoryList() {
    return this.incentiveDL.GetCategoryList().map(res => res);
  }

  GetEmpWithProfileMap() {
    return this.incentiveDL.GetEmpWithProfileMap().map(res => res);
  }

  GetEmpWithoutProfileMap() {
    return this.incentiveDL.GetEmpWithoutProfileMap().map(res => res);
  }

  GetProfileListForMapping() {
    return this.incentiveDL.GetProfileListforMapping().map(res => res);
  }

  GetActiveProfileList() {
    return this.incentiveDL.GetActiveProfileList().map(res => res);
  }

  getItemsforProfile() {
    return this.incentiveDL.GetItemsforProfile().map(res => res);
  }

  GetProfileItemsMapping(profileId: number) {
    return this.incentiveDL.GetProfileItemsMapping(profileId).map(res => res);
  }

  GetEmployeeIncentiveInfo() {
    return this.incentiveDL.GetEmployeeIncentiveInfo().map(res => res);
  }

  GetEmployeeBillItemsList(employeeId) {
    return this.incentiveDL.GetEmployeeBillItemsList(employeeId).map(res => res);
  }

  GetItemsForIncentive() {
    return this.incentiveDL.GetItemsForIncentive().map(res => res);
  }

  GetIncentiveSettingByEmpId(empId: number) {
    return this.incentiveDL.GetIncentiveSettingByEmpId(empId).map(res => res);
  }

  GetAllLedgerList() {
    return this.incentiveDL.GetAllLedgerList().map(res => res);
  }

  GetLedgerListOfEmployee() {
    return this.incentiveDL.GetLedgerListOfEmployee().map(res => res);
  }


  GetEmpProfileMap() {
    return this.incentiveDL.GetEmpProfileMap().map(res => res);
  }

  GetEmpIncentiveInfo() {
    return this.incentiveDL.GetEmpIncentiveInfo().map(res => res);
  }

  public GetBillItemList() {
    return this.incentiveDL.GetBillItemList()
      .map((responseData) => {
        return responseData;
      });
  }


  //                        *** POST ***
  public AddProfile(profileObj) {
    const data = _.omit(profileObj, ['ProfileValidator']);
    return this.incentiveDL.AddProfile(data).map(res => res);
  }

  AddEmpProfileMap(empProfiles) {
    const data = [];
    empProfiles.forEach(a => {
      const temp = _.omit(a, ['EMPProfileMapValidator']);
      data.push(temp);
    });
    return this.incentiveDL.AddEmpProfileMap(data).map(res => res);
  }

  SaveProfileItemMap(maps) {
    const data = [];
    maps.forEach(el => {
      const temp = _.omit(el, ['ProfileItemMapValidator']);
      data.push(temp);
    });
    return this.incentiveDL.SaveProfileItemMap(data).map(res => res);
  }

  SaveEmployeeBillItemsMap(data) {
    return this.incentiveDL.SaveEmployeeBillItemsMap(data).map(res => res);
  }

  UpdateEmployeeBillItem(data) {
    return this.incentiveDL.UpdateEmployeeBillItem(data).map(res => res);
  }
  UpdateProfileBillItemMap(data) {
    return this.incentiveDL.UpdateProfileBillItemMap(data).map(res => res);
  }
  RemoveSelectedBillItem(data) {
    return this.incentiveDL.RemoveSelectedBillItem(data).map(res => res);
  }
  RemoveSelectedBillItemFromProfileMap(data) {
    return this.incentiveDL.RemoveSelectedBillItemFromProfileMap(data).map(res => res);
  }
  SaveItemGroupDistribution(data) {
    return this.incentiveDL.SaveItemGroupDistribution(data).map(res => res);
  }

  ActivateDeactivateEmployeeSetup(data) {
    return this.incentiveDL.ActivateDeactivateEmployeeSetup(data).map(res => res);
  }
  ActivateDeactivateProfile(data) {
    return this.incentiveDL.ActivateDeactivateProfile(data).map(res => res);
  }
  public UpdateBillTxnItems(modifiedItems: Array<BillingTransactionItem>) {
    let txnItems: Array<any> = modifiedItems.map(bil => {
      return _.omit(bil, ['ItemList', 'BillingTransactionItemValidator', 'Patient', 'ServiceDepartment']);
    });
    let tempBillTxnItems = Object.assign({}, modifiedItems);
    tempBillTxnItems = txnItems;
    return this.incentiveDL.PutBillTxnItems(tempBillTxnItems)
      .map((responseData) => {
        return responseData;
      })
  }

  public PostPaymentInfo(paymentinfo: INCTV_TXN_PaymentInfoVM, idsToUpdate: Array<number>) {
    //PaymentInfoValidator
    let payinfo = _.omit(paymentinfo, ['PaymentInfoValidator']);
    let data = JSON.stringify(payinfo);
    let ids = JSON.stringify(idsToUpdate);
    return this.incentiveDL.PostPaymentInfo(data, ids)
      .map((responseData) => {
        return responseData;
      });

  }

  PostToIncentiveTransaction(paymentInfoDetail: INCTV_TXN_PaymentInfoModel, transaction: TransactionModel) {
    try {
      var newTxn: any = _.omit(transaction, ['TransactionValidator']);
      var newTxnItems: any = newTxn.TransactionItems.map(item => {
        return _.omit(item, ['TransactionItemValidator', 'LedgerList', 'SelectedInvItems', 'SelectedCstCntItems']);
      });
      newTxnItems.forEach(txnItem => {
        if (txnItem.HasInventoryItems) {
          var invItems: any = txnItem.InventoryItems.map(invItm => {
            return _.omit(invItm, ['TxnInvItemValidator']);
          });
          txnItem.InventoryItems = invItems;
        }
        if (txnItem.HasCostCenterItems) {
          var cstItems: any = txnItem.CostCenterItems.map(cstItm => {
            return _.omit(cstItm, ['TxnCstItemValidator']);
          });
          txnItem.CostCenterItems = cstItems;
        }
      });
      newTxn.TransactionItems = newTxnItems;
      var data = JSON.stringify(newTxn);
      var paymentInfDet = _.omit(paymentInfoDetail, ['PaymentInfoValidator']);
      let paymentInfoDetailData = JSON.stringify(paymentInfDet);
      return this.incentiveDL.PostToIncentiveTransaction(paymentInfoDetailData, data)
        .map(res => { return res })
    } catch (ex) {
      throw ex;
    }
  }

  //                        *** PUT ***
  public UpdateProfile(profileObj) {
    const data = _.omit(profileObj, ['ProfileValidator']);
    return this.incentiveDL.UpdateProfile(data).map(res => res);
  }
}
