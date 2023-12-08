import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from '../../../core/response.model';
import { LedgerReportRequest_DTO } from './DTOs/ledger-report-request.dto';
import { SubLedgerReportRequest_DTO } from './DTOs/subledger-report-request.dot';
@Injectable()
export class AccountingReportsDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    public optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

    constructor(public http: HttpClient) {
    }
    //START: GET Reporting DATA

    //GET Accounting Balance sheet report data
    public GetBalanceSheetReportData(selectedDate, fiscalYearId) {
        try {
            return this.http.get<any>("/api/AccountingReport/BalanceSheetReport?selectedDate=" + selectedDate + "&FiscalYearId=" + fiscalYearId);
        } catch (exception) {
            throw exception;
        }
    }

    public GetCashFlowReportData(frmDt, toDt, fiscalYearId) {
        try {
            return this.http.get<any>("/api/AccountingReport/CashFlowReport?FromDate=" + frmDt + "&ToDate=" + toDt + "&FiscalYearId=" + fiscalYearId);
        } catch (exception) {
            throw exception;
        }
    }
    public GetTrailBalanceReport(fromDate: string, toDate: string, fiscalYearId) {
        return this.http.get<any>("/api/AccountingReport/TrailBalanceReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&FiscalYearId=" + fiscalYearId);
    }
    public GetGroupStatementReport(fromDate: string, toDate: string, fiscalYearId: number, ledgerGroupId: number) {
        return this.http.get<any>("/api/AccountingReport/GroupStatementReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&FiscalYearId=" + fiscalYearId + "&LedgerGroupId=" + ledgerGroupId);
    }
    public GetProfitLossReport(frmDt, toDt, fiscalYearId) {
        return this.http.get<any>("/api/AccountingReport/ProfitAndLossReport?FromDate=" + frmDt + "&ToDate=" + toDt + "&FiscalYearId=" + fiscalYearId);
    }
    public GetVoucherReport(fromDate: string, toDate: string, sectionId, fiscalYearId) {
        return this.http.get<any>("/api/AccountingReport/VoucherReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&sectionId=" + sectionId);
    }
    public GetSystemAuditReport(fromDate: string, toDate: string, voucherType: string, sectionId: number) {
        return this.http.get<any>("/api/AccountingReport/SystemAuditReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&voucherReportType=" + voucherType + "&sectionId=" + sectionId);
    }
    public GetReverseTransactionDetail(reverseTxnId: number) {
        return this.http.get<any>("/api/AccountingReport/ReverseTransactionDetail?ReverseTransactionId=" + reverseTxnId);
    }
    public GetDayWiseVoucherReport(fromDate: string, toDate: string, sectionId) {
        return this.http.get<any>("/api/AccountingReport/DayWiseVoucherReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&sectionId=" + sectionId);
    }
    public GetLedgerReport(ledgerId: number, fromDate: string, toDate: string, fiscalYearId) {
        return this.http.get<response>('/api/AccountingReport/LedgerReport?ledgerId=' + ledgerId + "&FromDate=" + fromDate + "&ToDate=" + toDate + "&FiscalYearId=" + fiscalYearId);
    }

    public GetLedgerListReport(data: LedgerReportRequest_DTO) {
        return this.http.post<response>(`/api/AccountingReport/LedgerListReport`, data, this.optionJson);
    }

    public GetLedgerList() {
        return this.http.get<any>("/api/Accounting/Ledgers");
    }
    // public GetFiscalYearsList() {
    //     return this.http.get<any>("/api/Accounting?reqType=fiscalYearList");
    // }
    public GetDailyTxnReport(frmDt: string, toDt: string) {
        return this.http.get<any>("/api/AccountingReport/DailyTransactionReport?FromDate=" + frmDt + "&ToDate=" + toDt);
    }
    public GetTxnOriginDetails(txnId) {
        return this.http.get<any>("/api/AccountingReport/TransactionOriginDetail?transactionIds=" + txnId);
    }
    public GetDaywiseVoucherDetailsbyDayVoucherNo(dayVouchernumber: number, voucherId: number, sectionId) {
        try {
            return this.http.get<response>('/api/AccountingReport/DayWiseVoucherDetailsByVoucherNo?DayVoucherNumber=' + dayVouchernumber + '&voucherId=' + voucherId + "&sectionId=" + sectionId);
        } catch (ex) {
            throw ex;
        }
    }

    //get all ledgergroup list here (included IsActive=false also)
    public GetLedgerGroup() {
        return this.http.get<any>("/api/AccountingSettings/LedgerGroups");
    }
    public GetBankReconcillationReport(ledgerId: number, fromDate: string, toDate: string, fiscalYearId, voucherTypeId: number, status: number) {
        return this.http.get<response>(`/api/AccountingReport/BankReconciliationReport?ledgerId=${ledgerId}&fromDate=${fromDate}&toDate= ${toDate}&fiscalYearId=${fiscalYearId}&voucherTypeId=${voucherTypeId}&status=${status}`);
    }
    public GetReconciliationCategory() {
        return this.http.get<response>('/api/Accounting/BankReconciliationCategories');
    }
    public GetReconciliationHistory(VoucherNumber, secId, fsYearId) {

        return this.http.get<any>(
            "/api/AccountingReport/BankReconciliationHistory?VoucherNumber=" + VoucherNumber + "&sectionId=" + secId + "&FiscalYearId=" + fsYearId,
            this.options
        );
    }
    public PostReconciliation(data) {
        try {
            return this.http.post<response>('/api/AccountingReport/PostReconciliation', data);
        } catch (ex) {
            throw ex;
        }
    }
    public GetCashBankBookReport(fromDate: string, toDate: string, fiscalYearId, lederIds: string) {
        return this.http.get<response>('/api/AccountingReport/CashBankBookReport?fromDate=' + fromDate + "&toDate=" + toDate + "&fiscalYearId=" + fiscalYearId + "&ledgerIds=" + lederIds);
    }

    public GetDayBookReport(fromDate: string, toDate: string, fiscalYearId: number, lederId: number) {
        return this.http.get<response>('/api/AccountingReport/DayBookReport?fromDate=' + fromDate + "&toDate=" + toDate + "&fiscalYearId=" + fiscalYearId + "&ledgerId=" + lederId);
    }

    public GetSubLedgerReport(data: SubLedgerReportRequest_DTO) {
        return this.http.post<response>(`/api/AccountingReport/SubLedgerReport`, data, this.optionJson);
    }

    public GetVoucherForVerification(fromDate: string, toDate: string, sectionId) {
        return this.http.get<response>(`/api/AccountingReport/VoucherVerification?FromDate=${fromDate}&ToDate=${toDate}&sectionId=${sectionId}`);
    }
    public GetAccountHeadDetailReport() {
        return this.http.get<response>(`/api/AccountingReport/AccountHeadDetailReport`, this.options);
    }
}