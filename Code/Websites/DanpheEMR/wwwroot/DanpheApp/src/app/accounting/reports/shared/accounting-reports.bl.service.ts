import { Injectable } from '@angular/core';
import { LedgerReportRequest_DTO } from './DTOs/ledger-report-request.dto';
import { SubLedgerReportRequest_DTO } from './DTOs/subledger-report-request.dot';
import { AccountingReportsDLService } from './accounting-reports.dl.service';



@Injectable()
export class AccountingReportsBLService {
    constructor(public accountReportDlService: AccountingReportsDLService) {

    }


    //START: GET Report Data
    public GetBalanceSheetReportData(selectedDate, fiscalYearId) {
        try {
            return this.accountReportDlService.GetBalanceSheetReportData(selectedDate, fiscalYearId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }

    public GetTrailBalanceReport(fromDate: string, toDate: string, fiscalYearId) {
        return this.accountReportDlService.GetTrailBalanceReport(fromDate, toDate, fiscalYearId).map(res => {
            return res;
        });
    }

    public GetGroupStatementReport(fromDate: string, toDate: string, fiscalYearId: number, ledgerGroupId: number) {
        return this.accountReportDlService.GetGroupStatementReport(fromDate, toDate, fiscalYearId, ledgerGroupId).map(res => {
            return res;
        });
    }

    public GetProfitLossReport(fromDt, toDt, fiscalYearId) {
        return this.accountReportDlService.GetProfitLossReport(fromDt, toDt, fiscalYearId).map(res => {
            return res;
        });
    }

    // public GetFiscalYearsList() {
    //     return this.accountReportDlService.GetFiscalYearsList().map(res=>
    //         { return res}

    //         );
    // }

    public GetVoucherReport(fromDate: string, toDate: string, sectionId, fiscalYearId) {
        return this.accountReportDlService.GetVoucherReport(fromDate, toDate, sectionId, fiscalYearId)
            .map((responseData) => {
                return responseData;
            });
    }

    public GetSystemAuditReport(fromDate: string, toDate: string, voucherType: string, sectionId: number) {
        return this.accountReportDlService.GetSystemAuditReport(fromDate, toDate, voucherType, sectionId)
            .map((responseData) => {
                return responseData;
            });
    }

    public GetReverseTransactionDetail(reverseTxnId: number) {
        return this.accountReportDlService.GetReverseTransactionDetail(reverseTxnId)
            .map((responseData) => {
                return responseData;
            });
    }
    public GetDayWiseVoucherReport(fromDate: string, toDate: string, sectionId) {
        return this.accountReportDlService.GetDayWiseVoucherReport(fromDate, toDate, sectionId)
            .map((responseData) => {
                return responseData;
            });
    }

    public GetLedgers() {

        return this.accountReportDlService.GetLedgerList()
            .map((responseData) => {
                return responseData;
            });
    }
    public GetLedgerReport(ledgerId: number, fromDate: string, toDate: string, fiscalYearId) {
        return this.accountReportDlService.GetLedgerReport(ledgerId, fromDate, toDate, fiscalYearId)
            .map((responseData) => {
                return responseData;
            });
    }

    public GetLedgerListReport(data: LedgerReportRequest_DTO) {
        return this.accountReportDlService.GetLedgerListReport(data)
            .map(res => {
                return res;
            })
    }
    public GetCashFlowReportData(fromDt, toDt, fiscalYearId) {
        try {
            return this.accountReportDlService.GetCashFlowReportData(fromDt, toDt, fiscalYearId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }
    public GetDailyTxnReport(frmDt: string, toDt: string) {
        return this.accountReportDlService.GetDailyTxnReport(frmDt, toDt).map(res => {
            return res
        });
    }

    public GetTxnOriginDetails(txnId) {
        return this.accountReportDlService.GetTxnOriginDetails(txnId).map(res => {
            return res;
        });
    }
    public GetDaywiseVoucherDetailsbyDayVoucherNo(dayVoucherNumber: number, voucherId: number, sectionId) {
        try {
            return this.accountReportDlService.GetDaywiseVoucherDetailsbyDayVoucherNo(dayVoucherNumber, voucherId, sectionId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }

    //Get LedgerGroup data list
    public GetLedgerGroup() {
        return this.accountReportDlService.GetLedgerGroup()
            .map((responseData) => {
                return responseData;
            });
    }

    //END: GET Report Data
    public GetBankReconcillationReport(ledgerId: number, fromDate: string, toDate: string, fiscalYearId, voucherTypeId: number, status: number) {
        return this.accountReportDlService.GetBankReconcillationReport(ledgerId, fromDate, toDate, fiscalYearId, voucherTypeId, status)
            .map((responseData) => {
                return responseData;
            });
    }

    public GetReconciliationCategory() {
        return this.accountReportDlService.GetReconciliationCategory()
            .map((responseData) => {
                return responseData;
            });
    }
    public GetReconciliationHistory(VoucherNumber: String, secId, fsYearId) {

        return this.accountReportDlService.GetReconciliationHistory(VoucherNumber, secId, fsYearId).map((res) => res);
    }

    public PostReconciliation(bankrecobj) {
        var data = JSON.stringify(bankrecobj);
        return this.accountReportDlService.PostReconciliation(data)
            .map((responseData) => {
                return responseData;
            });
    }

    public GetCashBankBookReport(fromDate: string, toDate: string, fiscalYearId, lederIds: Array<Number>) {
        return this.accountReportDlService.GetCashBankBookReport(fromDate, toDate, fiscalYearId, lederIds.toString())
            .map(res => {
                return res;
            })
    }

    public GetDayBookReport(fromDate: string, toDate: string, fiscalYearId, ledgerId: number) {
        return this.accountReportDlService.GetDayBookReport(fromDate, toDate, fiscalYearId, ledgerId)
            .map(res => {
                return res;
            })
    }

    public GetSubLedgerReport(data: SubLedgerReportRequest_DTO) {
        return this.accountReportDlService.GetSubLedgerReport(data)
            .map(res => {
                return res;
            })
    }

    public GetVoucherForVerification(fromDate: string, toDate: string, sectionId) {
        return this.accountReportDlService.GetVoucherForVerification(fromDate, toDate, sectionId)
            .map((responseData) => {
                return responseData;
            });
    }
    public GetAccountHeadDetailReport() {
        return this.accountReportDlService.GetAccountHeadDetailReport()
            .map(res => { return res });
    }
}