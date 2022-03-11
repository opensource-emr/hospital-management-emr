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
    public GetBalanceSheetReportData(selectedDate, fiscalYearId) {
        try {
            return this.http.get<any>("/api/AccountingReport?reqType=balanceSheetReportData&selectedDate=" + selectedDate + "&FiscalYearId="+fiscalYearId);
        } catch (exception) {
            throw exception;
        }
    }

    public GetCashFlowReportData(frmDt, toDt,fiscalYearId) {
        try {
            return this.http.get<any>("/api/AccountingReport?reqType=cashflowReportData&FromDate=" + frmDt + "&ToDate=" + toDt + "&FiscalYearId="+fiscalYearId);
        } catch (exception) {
            throw exception;
        }
    }
    public GetTrailBalanceReport(fromDate: string, toDate: string,fiscalYearId) {
        return this.http.get<any>("/api/AccountingReport?reqType=trailBalanceReport&FromDate=" + fromDate + "&ToDate=" + toDate + "&FiscalYearId="+fiscalYearId);
    }
    public GetGroupStatementReport(fromDate: string, toDate: string,fiscalYearId: number, ledgerGroupId:number) {
        return this.http.get<any>("/api/AccountingReport?reqType=groupStatementReport&FromDate=" + fromDate + "&ToDate=" + toDate + "&FiscalYearId="+fiscalYearId + "&LedgerGroupId="+ ledgerGroupId);
    }         
    public GetProfitLossReport(frmDt, toDt,fiscalYearId) {
        return this.http.get<any>("/api/AccountingReport?reqType=profitLossReport&FromDate=" + frmDt + "&ToDate=" + toDt + "&FiscalYearId="+fiscalYearId);
    }
    public GetVoucherReport(fromDate: string, toDate: string, sectionId, fiscalYearId) {
        return this.http.get<any>("/api/AccountingReport?reqType=voucher-report&FromDate=" + fromDate + "&ToDate=" + toDate + "&sectionId=" + sectionId + "&FiscalYearId=" + fiscalYearId);
    }  
    public GetSystemAuditReport(fromDate: string, toDate: string,voucherType:string,sectionId:number) {
        return this.http.get<any>("/api/AccountingReport?reqType=system-aduit-report&FromDate=" + fromDate + "&ToDate=" + toDate +"&voucherReportType="+voucherType+"&sectionId="+sectionId);
    }       
    public GetReverseTransactionDetail(reverseTxnId:number) {    
        return this.http.get<any>("/api/AccountingReport?reqType=reverse-transaction-detail&ReverseTransactionId="+reverseTxnId);
    }   
    public GetDayWiseVoucherReport(fromDate: string, toDate: string,sectionId) {
        return this.http.get<any>("/api/AccountingReport?reqType=daywise-voucher-report&FromDate=" + fromDate + "&ToDate=" + toDate+"&sectionId="+sectionId);
    }
    public GetLedgerReport(ledgerId: number, fromDate: string, toDate: string,fiscalYearId) {
        return this.http.get<response>('/api/AccountingReport?reqType=ledger-report&ledgerId=' + ledgerId + "&FromDate=" + fromDate + "&ToDate=" + toDate + "&FiscalYearId="+fiscalYearId);
    }

    public GetLedgerList() {
        return this.http.get<any>("/api/Accounting?reqType=ledger-list");
    }
    public GetFiscalYearsList() {
        return this.http.get<any>("/api/Accounting?reqType=fiscalYearList");
    }
    public GetDailyTxnReport(frmDt: string, toDt: string,fiscalYearId) {
        return this.http.get<any>("/api/AccountingReport?reqType=daily-txn-report&FromDate=" + frmDt + "&ToDate=" + toDt + "&FiscalYearId="+fiscalYearId);
    }
    public GetTxnOriginDetails(txnId) {
        return this.http.get<any>("/api/AccountingReport?reqType=txn-Origin-details&transactionIds=" + txnId);
    }
    public GetDaywiseVoucherDetailsbyDayVoucherNo(dayVouchernumber: number, voucherId:number,sectionId) {
        try {
            return this.http.get<response>('/api/AccountingReport?reqType=daywise-voucher-detail-by-dayVoucherNO&DayVoucherNumber=' + dayVouchernumber + '&voucherId='+ voucherId+"&sectionId="+sectionId);
        } catch (ex) {
            throw ex;
        }
    }

    //get all ledgergroup list here (included IsActive=false also)
    public GetLedgerGroup() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgerGroups");
    }
    public GetBankReconcillationReport(ledgerId: number, fromDate: string, toDate: string, fiscalYearId) {
        return this.http.get<response>('/api/AccountingReport?reqType=bank-reconcilation-report&ledgerId=' + ledgerId + "&FromDate=" + fromDate + "&ToDate=" + toDate + "&FiscalYearId=" + fiscalYearId);
    }
    public GetReconciliationCategory() {
        return this.http.get<response>('/api/Accounting?reqType=get-bank-reconciliation-category');
    }
    public GetReconciliationHistory(VoucherNumber, secId, fsYearId) {

        return this.http.get<any>(
          "/api/AccountingReport?reqType=Bank-Reconciliation-history&VoucherNumber=" + VoucherNumber + "&sectionId=" + secId + "&FiscalYearId=" + fsYearId,
          this.options
        );
      } 
	 public PostReconciliation(data) {
        try {
            return this.http.post<response>('/api/AccountingReport?reqType=post-reconciliation',data);
        } catch (ex) {
            throw ex;
        }
    }  
}