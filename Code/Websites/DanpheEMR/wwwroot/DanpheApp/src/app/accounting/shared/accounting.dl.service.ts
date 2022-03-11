import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { response } from '../../core/response.model'
@Injectable()
export class AccountingDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(public http: HttpClient) {
    }
    //get information of current accounts.
    public GetAccountInfoById(accountId: number) {
        try {
            return this.http.get<any>("/api/Accounting" + "?accountId=" + accountId);
        } catch (ex) {
            throw ex;
        }
    }

    public GetTransactionType() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=VoucherType");
        } catch (ex) {
            throw ex;
        }
    }
    public GetLedgerList() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=ledger-list");
        } catch (ex) {
            throw ex;
        }
    }
    public GetLedgerFromVoucherId(voucherId: number) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=ledgersFrmVoucherId&voucherId=" + voucherId);
        } catch (ex) {
            throw ex;
        }
    }
    public GetAccountClosureData() {
        return this.http.get<any>("/api/Accounting?reqType=account-closure");
    }
    public GetActiveFiscalYear() {
        return this.http.get<any>("/api/Accounting?reqType=active-fiscal-year");
    }
    public GetVoucher() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=Vouchers");
        } catch (ex) {
            throw ex;
        }
    }
    public GetVoucherHead() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=get-voucher-head");
        } catch (ex) {
            throw ex;
        }
    }
    public GetLedgerItem(ledgerId: number) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=ledger-items&ledgerId=" + ledgerId);
        } catch (ex) {
            throw ex;
        }
    }
    public GetItemList() {
        try {
            return this.http.get<response>('/api/Accounting?reqType=ItemList');
        } catch (ex) {
            throw ex;
        }
    }

    public GetLedgerGroup() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgerGroups");
    }

    public GetFiscalYearList() {
        try {
            return this.http.get<response>('/api/Accounting?reqType=fiscalyear-list');
        } catch (ex) {
            throw ex;
        }
    }
    public GetTransaction(transactionId: number) {
        try {
            return this.http.get<response>('/api/Accounting?reqType=transaction&transactionId=' + transactionId);
        } catch (ex) {
            throw ex;
        }
    }
    public GetTransactionbyVoucher(vouchernumber: string, secId, fsYearId) {
        try {
            return this.http.get<response>('/api/Accounting?reqType=transactionbyVoucher&voucherNumber=' + vouchernumber + "&sectionId=" + secId + "&FiscalYearId=" + fsYearId);
        } catch (ex) {
            throw ex;
        }
    }
    ///get Voucher detail for manual edit 
    public GetVoucherforedit(vouchernumber: string, secId, FsYId) {
        try {
            return this.http.get<response>('/api/Accounting?reqType=getVoucherforedit&voucherNumber=' + vouchernumber + "&sectionId=" + secId + "&FiscalYearId=" + FsYId);
        } catch (ex) {
            throw ex;
        }
    }
    public CheckTransaction(transactionId: number, voucherId: number) {
        try {
            return this.http.get<response>('/api/Accounting?reqType=check-reference-txnId&voucherNumber=' + transactionId + '&voucherId=' + voucherId);
        } catch (ex) {
            throw ex;
        }
    }
    public GetCostCenterList() {
        try {
            return this.http.get<response>('/api/Accounting?reqType=costcentric-list');
        } catch (ex) {
            throw ex;
        }
    }
    public GetInventoryItemsForTransferToACC(selectedDate, fiscalyearId) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=inventory-to-accounting&SelectedDate=" + selectedDate + "&FiscalYearId=" + fiscalyearId);
        } catch (exception) {
            throw exception
        };
    }
    //get all bil txn items from billing for transfer to accounting
    public GetBilTxnItemsForTransferToACC(selectedDate, fiscalyearId) {
        try {
            // return this.http.get<any>("/api/Accounting?reqType=billing-to-accounting&FromDate=" + frmDt + "&ToDate=" + toDt);
            return this.http.get<any>("/api/Accounting?reqType=billing-to-accounting&SelectedDate=" + selectedDate + "&FiscalYearId=" + fiscalyearId);
        } catch (exception) {
            throw exception
        };
    }

    //get all pharmacy txn item for transfer to accounting
    public GetPharmItemsForTransferToACC(selectedDate, fiscalyearId) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=pharmacy-to-accounting&SelectedDate=" + selectedDate + "&FiscalYearId=" + fiscalyearId);
        } catch (exception) {
            throw exception
        };
    }
    //get all incentive txn item for transfer to accounting
    public GetIncentivesForTransferToACC(selectedDate, fiscalyearId) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=incentive-to-accounting&SelectedDate=" + selectedDate + "&FiscalYearId=" + fiscalyearId);
        } catch (exception) {
            throw exception
        };
    }
    //get ledger mapping details for  map with phrm supplier or inventory vendor
    GetLedgerMappingDetails() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=ledger-mapping", this.options);
        } catch (ex) {
            throw ex
        }
    }
    LoadTxnDates(fromdate, todate, sectionId) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=acc-get-txn-dates&FromDate=" + fromdate + "&ToDate=" + todate + "&sectionId=" + sectionId, this.options);
        } catch (ex) {
            throw ex
        }
    }
    public GetAllActiveAccTenants() {
        try {
            return this.http.get<response>('/api/Accounting?reqType=getAllActiveTenants');
        } catch (ex) {
            throw ex;
        }
    }
    //START: GET Reporting DATA

    //GET:this function get all transfer rule with details
    public GetACCTransferRule() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=accTransferRule");
        } catch (exception) {
            throw exception;
        }
    }
    //this method for get provisional Voucher number for curernt new created voucher
    public GettempVoucherNumber(voucherId: number, sectionId, transactiondate) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=gettempVoucherNumber&voucherId=" + voucherId + "&sectionId=" + sectionId + "&transactiondate=" + transactiondate);
        }
        catch (exception) {
            throw exception;
        }
    }
    //Get Provisional Ledger using ledger type and reference id
    GetProvisionalLedger(referenceId, ledgerType) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=get-provisional-ledger&ReferenceId=" + referenceId + "&LedgerType=" + ledgerType);
        }
        catch (ex) {
            throw ex;
        }
    }
    //END: GET Reporting DATA

    //get inventory vendors
    GetInvVendorList() {
        try {
          return this.http.get<any>("/api/Accounting?reqType=get-invVendor-list", this.options);
        } catch (ex) {
            throw ex
        }
    }
    //get pharmacy supplier
    GetPharmacySupplier() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=phrm-supplier", this.options);
        } catch (ex) {
            throw ex
        }
    }
    //get good receipt list 
    GetGRList(vendorId: number,sectionId:number,number:any,date:string) {
        try {
            return this.http.get<response>('/api/Accounting?reqType=get-grlist&voucherId='+ vendorId+'&sectionId='+sectionId+'&voucherNumber='+number+'&transactiondate='+date);
        } catch (ex) {
            throw ex;
        }
    }

    //START: POST
    public PostTransaction(TransactionObjString: string) {
        let data = TransactionObjString;
        return this.http.post<any>("/api/Accounting?reqType=postTransaction", data);
    }

    //post TxnList to accounting Transaction table
    PostTxnListToACC(txnListObjString: string) {
        try {
            let data = txnListObjString;
            return this.http.post<any>("/api/Accounting?reqType=postTransactionList", data);
        } catch (ex) {
            throw (ex);
        }
    }

    PostLedgers(ledgList: string) {
        try {
            let data = ledgList;
            return this.http.post<any>("/api/Accounting?reqType=AddLedgersFromAcc", data);
        } catch (ex) {
            throw (ex);
        }
    }
    //create single ledger 
    AddLedger(ledgList: string) {
        try {
            let data = ledgList;
            return this.http.post<any>("/api/Accounting?reqType=create-ledger-shared-component", data);
        } catch (ex) {
            throw (ex);
        }
    }

    //END: POST

    public PostAccountClosure(data: string) {
        return this.http.post<any>("/api/Accounting?reqType=post-account-closure", data);
    }

    public PostAccountingInvoiceData(data: string) {
        return this.http.post<any>("/api/Accounting?reqType=post-accounting-invoice-data", data);
    }

    public UndoTransaction(data: string) {
        return this.http.post<any>("/api/Accounting?reqType=post-reverse-transaction", data);
    }

    //START: PUT

    public PutTransaction(TransactionObjString: string) {
        let data = TransactionObjString;
        return this.http.put<any>("/api/Accounting?reqType=putTransaction", data);
    }

    public ActivateAccountingTenant(hospitalId: number) {
        return this.http.put<any>("/api/Security?reqType=activateAccountingHospital&hospitalId=" + hospitalId, this.options);
    }
    //END: PUT

    //post payment to accounting Payment table
    public PostPayment(data: string,Transactiondata:string) {
        return this.http.post<any>("/api/Accounting?reqType=post-payment&transactionObj="+Transactiondata,data);
    }
}
