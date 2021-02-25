import { Injectable, Directive } from '@angular/core';
import { AccountingReportsDLService } from './accounting-reports.dl.service';
import * as _ from 'lodash';



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

    public GetTrailBalanceReport(fromDate: string, toDate: string,fiscalYearId) {
        return this.accountReportDlService.GetTrailBalanceReport(fromDate, toDate,fiscalYearId).map(res => {
            return res;
        });
    }

    public GetProfitLossReport(fromDt, toDt,fiscalYearId) {
        return this.accountReportDlService.GetProfitLossReport(fromDt, toDt,fiscalYearId).map(res => {
            return res;
        });
    }

    public GetFiscalYearsList() {
        return this.accountReportDlService.GetFiscalYearsList().map(res=>
            { return res}
            
            );
    }

    public GetVoucherReport(fromDate: string, toDate: string,sectionId,fiscalYearId) {
        return this.accountReportDlService.GetVoucherReport(fromDate, toDate,sectionId,fiscalYearId)
            .map((responseData) => {
                return responseData;
            });
    }
    
    public GetSystemAuditReport(fromDate: string, toDate: string,voucherType:string,sectionId:number) {
        return this.accountReportDlService.GetSystemAuditReport(fromDate, toDate,voucherType,sectionId)
            .map((responseData) => {
                return responseData;
            });
    }
    
    public GetReverseTransactionDetail(reverseTxnId:number) {
        return this.accountReportDlService.GetReverseTransactionDetail(reverseTxnId)
            .map((responseData) => {
                return responseData;
            });
    }    
    public GetDayWiseVoucherReport(fromDate: string, toDate: string,sectionId) {
        return this.accountReportDlService.GetDayWiseVoucherReport(fromDate, toDate,sectionId)
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
    public GetLedgerReport(ledgerId: number, fromDate: string, toDate: string,fiscalYearId) {
        return this.accountReportDlService.GetLedgerReport(ledgerId, fromDate, toDate,fiscalYearId)
            .map((responseData) => {
                return responseData;
            });
    }
    public GetCashFlowReportData(fromDt, toDt,fiscalYearId) {
        try {
            return this.accountReportDlService.GetCashFlowReportData(fromDt, toDt,fiscalYearId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }
    public GetDailyTxnReport(frmDt: string, toDt: string,fiscalYearId) {
        return this.accountReportDlService.GetDailyTxnReport(frmDt, toDt,fiscalYearId).map(res => {
            return res
        });
    }

    public GetTxnOriginDetails(txnId) {
        return this.accountReportDlService.GetTxnOriginDetails(txnId).map(res => {
            return res;
        });
    }
    public GetDaywiseVoucherDetailsbyDayVoucherNo(dayVoucherNumber: number, voucherId: number,sectionId) {
        try {
            return this.accountReportDlService.GetDaywiseVoucherDetailsbyDayVoucherNo(dayVoucherNumber, voucherId,sectionId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }

    //END: GET Report Data


}
