import { Injectable, Directive } from '@angular/core';
import { AccountingDLService } from './accounting.dl.service';
import { TransactionModel } from './../transactions/shared/transaction.model';
import { TransactionInventoryItem } from './../transactions/shared/transaction-inventory-item.model';
import * as _ from 'lodash';
//import { AccountClosureViewModel } from '../settings/shared/accounting-view-models';
import { LedgerModel } from "./../settings/shared/ledger.model"
import { FiscalYearModel } from '../settings/shared/fiscalyear.model';
import { AccountingInvoiceDataModel } from '../shared/accounting-invoice-data.model';
import { ReverseTransactionModel } from "../settings/shared/reverse-transaction.model";
import { Payment } from '../transactions/payment/account-payment.model';




@Injectable()
export class AccountingBLService {
    constructor(public accountDlService: AccountingDLService) {

    }
    public GetAccountInfoById(accountId: number) {
        try {
            return this.accountDlService.GetAccountInfoById(accountId)
                .map(res => res);
        } catch (ex) {
            throw ex;
        }
    }

    public GetTransactionType() {
        try {
            return this.accountDlService.GetTransactionType()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public GetLedgerFromVoucherId(voucherId: number) {
        try {
            return this.accountDlService.GetLedgerFromVoucherId(voucherId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public GetAccountClosureData() {
        return this.accountDlService.GetAccountClosureData().map(res => {
            return res;
        });
    }
    public GetActiveFiscalYear() {
        return this.accountDlService.GetActiveFiscalYear().map(res => {
            return res;
        });
    }
    public GetLedgers() {
        try {
            return this.accountDlService.GetLedgerList()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }

    public GetLedgerGroup() {
        return this.accountDlService.GetLedgerGroup()
            .map((responseData) => {
                return responseData;
            });
    }
    public GetVoucher() {
        try {
            return this.accountDlService.GetVoucher()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public GetVoucherHead() {
        try {
            return this.accountDlService.GetVoucherHead()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public GetLedgerItem(ledgerId: number) {
        try {
            return this.accountDlService.GetLedgerItem(ledgerId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public GetItemList() {
        try {
            return this.accountDlService.GetItemList()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }


    public GetTransaction(transactionId: number) {
        try {
            return this.accountDlService.GetTransaction(transactionId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public GetTransactionbyVoucher(voucherNumber: string, secId, fsYearId) {
        try {
            return this.accountDlService.GetTransactionbyVoucher(voucherNumber, secId, fsYearId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }

    ///get Voucher detail for manual edit 
    public GetVoucherforedit(voucherNumber: string, secId, FsYId) {
        try {
            return this.accountDlService.GetVoucherforedit(voucherNumber, secId, FsYId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public CheckTransaction(transactionId: number, voucherId: number) {
        try {
            return this.accountDlService.CheckTransaction(transactionId, voucherId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public GetCostCenterList() {
        try {
            return this.accountDlService.GetCostCenterList()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    public GetFiscalYearList() {
        return this.accountDlService.GetFiscalYearList()
            .map((responseData) => {
                return responseData;
            });
    }

    //this function get all transfer rule with details
    public GetACCTransferRule() {
        try {
            return this.accountDlService.GetACCTransferRule()
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }

    public GetAllActiveAccTenants() {
        try {
            return this.accountDlService.GetAllActiveAccTenants()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    //END: GET Report Data


    //public AddTransaction(CurrentTransaction: Array<TransactionModel>) {
    //    //omiting the companyvalidator during post because it causes cyclic error during serialization in server side.
    //    var temp = _.omit(CurrentTransaction, ['TransactionValidator']);
    //    return this.accountDlService.PostTransaction(temp)
    //        .map(res => { return res });
    //}

     //get inventory goods receipts for transfer to accounting
     public GetInventoryItemsForTransferToACC(selectedDate,fiscalyearId) {
        try {
            return this.accountDlService.GetInventoryItemsForTransferToACC(selectedDate,fiscalyearId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }
    //get all bil txn items from billing for transfer to accounting
   // public GetBilTxnItemsForTransferToACC(frmDt: string, toDt: string) {
    public GetBilTxnItemsForTransferToACC(selectedDate,fiscalyearId) {
        try {
            return this.accountDlService.GetBilTxnItemsForTransferToACC(selectedDate,fiscalyearId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }

    //get all pharmacy transactions items from pharm for transfer to accounting
    public GetPharmItemsForTransferToACC(selectedDate,fiscalyearId) {
        try {
            return this.accountDlService.GetPharmItemsForTransferToACC(selectedDate,fiscalyearId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }
    //get all incentive transactions items from incentive module for transfer to accounting
    public GetIncentivesForTransferToACC(selectedDate,fiscalyearId) {
        try {
            return this.accountDlService.GetIncentivesForTransferToACC(selectedDate,fiscalyearId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }
    //get ledger mapping details for  map with phrm supplier or inventory vendor
    GetLedgerMappingDetails() {
        try {
            return this.accountDlService.GetLedgerMappingDetails()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    LoadTxnDates(fromdate, todate, sectionId) {
        try {
            return this.accountDlService.LoadTxnDates(fromdate, todate, sectionId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    //this method for get provisional Voucher number for curernt new created voucher
    GettempVoucherNumber(voucherId: number, sectionId,transactiondate) {
        try {
            return this.accountDlService.GettempVoucherNumber(voucherId, sectionId,transactiondate)
                .map((responseData) => {
                    return responseData;
                });
        }
        catch (ex) {
            throw ex;
        }
    }  

    //Get Provisional Ledger using ledger type and reference id
    GetProvisionalLedger(referenceId, ledgerType) {
        try {
            return this.accountDlService.GetProvisionalLedger(referenceId, ledgerType)
                .map((responseData) => {
                    return responseData;
                });
        }
        catch (ex) {
            throw ex;
        }
    }

    //Get inventory ledgers
    GetInvVendorList(){
        try{
            return this.accountDlService.GetInvVendorList()
                .map((responseData) =>{
                    return responseData;
                });
        }
        catch (ex){
            throw ex;
        }
    }
     //get pharmacy supplier
     GetPharmacySupplier() {
        try {
            return this.accountDlService.GetPharmacySupplier()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    //get good receipt list 
     GetGRList(vendorId: number,sectionId:number,number:any,date:string) {
        try {
            return this.accountDlService.GetGRList(vendorId,sectionId,number,date)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    PostToTransaction(transaction: TransactionModel) {
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
            return this.accountDlService.PostTransaction(data)
                .map(res => { return res })
        } catch (ex) {
            throw ex;
        }
    }
    //post TxnList to accounting Transaction table
    public PostTxnListToACC(txnList: Array<TransactionModel>) {
        try {
            //let newTxnList = Array<TransactionModel>();
            //txnList.forEach(txnItm => {
            //    var newTxn: any = _.omit(txnItm, ['TransactionValidator', 'UpdateValidator', 'dateValidators']);

            //    var newTxnItems: any = newTxn.TransactionItems.map(item => {
            //        return _.omit(item, ['TransactionItemValidator','numberValidator']);
            //    });                

            //    for (var i = 0; i < newTxnItems.length; i++) {
            //        if (newTxnItems[i].Amount == 0) {
            //            newTxnItems.splice(i, 1);
            //            i--;
            //        }
            //    }
            //    newTxnItems.forEach(i => {                    
            //        if (i.TransactionItemDetails.length > 0) {
            //            var newDetails: any = i.TransactionItemDetails.map(itm => {
            //                return _.omit(itm, ['TransactionDetailValidator']);
            //            });
            //            i.TransactionItemDetails = newDetails;
            //        }
            //    });
            //    newTxn.TransactionItems = newTxnItems;
            //    newTxnList.push(newTxn);
            //});
            //var data = JSON.stringify(newTxnList);
            var data = JSON.stringify(txnList);
            return this.accountDlService.PostTxnListToACC(data)
                .map(res => { return res })
        } catch (ex) {
            throw ex;
        }
    }

    // Create Ledgers
    public AddLedgers(ledgList: Array<LedgerModel>) {
        try {
            let NewLedger = Array<LedgerModel>();
            ledgList.forEach(led => {
                var temp: any = _.omit(led, ['LedgerValidator']);
                NewLedger.push(temp);
            });
            var data = JSON.stringify(NewLedger);
            return this.accountDlService.PostLedgers(data)
                .map(res => { return res });
        } catch (ex) {
            throw ex;
        }
    }
    //create single ledger using method
    public AddLedger(CurrentLedger: LedgerModel) {  //for Single Ledger 
        //omiting the LedgerValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentLedger, ['LedgerValidator']);
        return this.accountDlService.AddLedger(temp)
            .map(res => { return res });
    }

    PostAccountClosure(fiscalYear) {
        var temp: any = _.omit(fiscalYear, ['FiscalYearValidator']);

        let data = JSON.stringify(temp);
        return this.accountDlService.PostAccountClosure(data).map(res => {
            return res;
        });
    }

    public PostAccountingInvoiceData(data: AccountingInvoiceDataModel) {
        let temp = JSON.stringify(data);
        return this.accountDlService.PostAccountingInvoiceData(temp).map(res => {
            return res;
        });
    }

    public UndoTransaction(data: ReverseTransactionModel) {
        let temp = JSON.stringify(data);
        return this.accountDlService.UndoTransaction(temp).map(res => {
            return res;
        });
    }

    //START: PUT

    PutToTransaction(transaction: TransactionModel) {
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
            return this.accountDlService.PutTransaction(data)
                .map(res => { return res })
        } catch (ex) {
            throw ex;
        }
    }

    public ActivateAccountingTenant(tenantId: number) {
        return this.accountDlService.ActivateAccountingTenant(tenantId)
            .map(res => {
                return res;
            });
    }

    //END: PUT

    //post payment to accounting Payment table
    public PostPayment(payment:Payment,transaction:TransactionModel) {
        //var temp: any = _.omit(fiscalYear, ['FiscalYearValidator']);
        var temp = _.omit(payment, ['PaymentValidator']);
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
        var txnData = JSON.stringify(newTxn);
        let data = JSON.stringify(temp);
        return this.accountDlService.PostPayment(data,txnData).map(res => {
            return res;
        });
    }

}
