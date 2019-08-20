import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { response } from '../../core/response.model'
@Injectable()
export class AccountingDLService {
	public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
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
    public GetTransactionbyVoucher(vouchernumber: string) {
        try {
            return this.http.get<response>('/api/Accounting?reqType=transactionbyVoucher&voucherNumber=' + vouchernumber);
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
    public GetInventoryItemsForTransferToACC(frmDt: string, toDt: string) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=inventory-to-accounting&FromDate=" + frmDt + "&ToDate=" + toDt, this.options);
        } catch (exception) {
            throw exception
        };
    }
    //get all bil txn items from billing for transfer to accounting
    public GetBilTxnItemsForTransferToACC(frmDt: string, toDt: string) {
        try {
            //commented sql query for get --> getting it from linq query
            //return this.http.get<response>('/api/Accounting?reqType=bilTXNItemsForACC');

            return this.http.get<any>("/api/Accounting?reqType=billing-to-accounting&FromDate=" + frmDt + "&ToDate=" + toDt);
        } catch (exception) {
            throw exception
        };
    }

        //get all pharmacy txn item for transfer to accounting
    public GetPharmItemsForTransferToACC(frmDt: string, toDt: string) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=pharmacy-to-accounting&FromDate=" + frmDt + "&ToDate=" + toDt);
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

    //START: GET Reporting DATA

    //GET Accounting Balance sheet report data
    public GetBalanceSheetReportData(fromDate, toDate) {
        try {
            return this.http.get<any>("/api/Accounting?reqType=balanceSheetReportData&FromDate=" + fromDate + "&ToDate=" + toDate);
        } catch (exception) {
            throw exception;
        }
    }
    //GET:this function get all transfer rule with details
    public GetACCTransferRule() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=accTransferRule" );
        } catch (exception) {
            throw exception;
        }
    }
    //END: GET Reporting DATA


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

    PostLedgers(ledgList : string) {
        try {
            let data = ledgList;
            return this.http.post<any>("/api/Accounting?reqType=AddLedgersFromAcc", data);
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

    //START: PUT

    //END: PUT

}
