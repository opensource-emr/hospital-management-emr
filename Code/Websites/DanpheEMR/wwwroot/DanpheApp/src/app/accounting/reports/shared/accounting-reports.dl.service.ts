import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http'
import { response } from '../../../core/response.model'
@Injectable()
export class AccountingReportsDLService {
public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) {
    }
    //START: GET Reporting DATA

    //GET Accounting Balance sheet report data
    public GetBalanceSheetReportData(frmDt, toDt) {
        try {
            return this.http.get<any>("/api/AccountingReport?reqType=balanceSheetReportData&FromDate=" + frmDt + "&ToDate=" + toDt);
        } catch (exception) {
            throw exception;
        }
    }

    public GetCashFlowReportData(frmDt, toDt) {
        try {
            return this.http.get<any>("/api/AccountingReport?reqType=cashflowReportData&FromDate=" + frmDt + "&ToDate=" + toDt);
        } catch (exception) {
            throw exception;
        }
    }
    public GetTrailBalanceReport(fromDate: string, toDate: string) {
        return this.http.get<any>("/api/AccountingReport?reqType=trailBalanceReport&FromDate=" + fromDate + "&ToDate=" + toDate);
    }
    public GetProfitLossReport(frmDt, toDt) {
        return this.http.get<any>("/api/AccountingReport?reqType=profitLossReport&FromDate=" + frmDt + "&ToDate=" + toDt);
    }
    public GetVoucherReport(fromDate: string, toDate: string) {
        return this.http.get<any>("/api/AccountingReport?reqType=voucher-report&FromDate=" + fromDate + "&ToDate=" + toDate);
    }    
    public GetDayWiseVoucherReport(fromDate: string, toDate: string) {
        return this.http.get<any>("/api/AccountingReport?reqType=daywise-voucher-report&FromDate=" + fromDate + "&ToDate=" + toDate);
    }
    public GetLedgerReport(ledgerId: number, fromDate: string, toDate: string) {
        return this.http.get<response>('/api/AccountingReport?reqType=ledger-report&ledgerId=' + ledgerId + "&FromDate=" + fromDate + "&ToDate=" + toDate);
    }

    public GetLedgerList() {
        return this.http.get<any>("/api/Accounting?reqType=ledger-list");
    }
    public GetFiscalYearsList() {
        return this.http.get<any>("/api/Accounting?reqType=fiscalYearList");
    }
    public GetDailyTxnReport(frmDt: string, toDt: string) {
        return this.http.get<any>("/api/AccountingReport?reqType=daily-txn-report&FromDate=" + frmDt + "&ToDate=" + toDt);
    }
    public GetTxnOriginDetails(txnId) {
        return this.http.get<any>("/api/AccountingReport?reqType=txn-Origin-details&transactionIds=" + txnId);
    }
    public GetDaywiseVoucherDetailsbyDayVoucherNo(dayVouchernumber: number, voucherId:number) {
        try {
            return this.http.get<response>('/api/AccountingReport?reqType=daywise-voucher-detail-by-dayVoucherNO&DayVoucherNumber=' + dayVouchernumber + '&voucherId='+ voucherId);
        } catch (ex) {
            throw ex;
        }
    }
        
}