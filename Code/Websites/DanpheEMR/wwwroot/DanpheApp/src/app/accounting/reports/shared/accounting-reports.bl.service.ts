import { Injectable, Directive } from '@angular/core';
import { AccountingReportsDLService } from './accounting-reports.dl.service';
import * as _ from 'lodash';



@Injectable()
export class AccountingReportsBLService {
    constructor(public accountReportDlService: AccountingReportsDLService) {

    }


    //START: GET Report Data
    public GetBalanceSheetReportData(fromDt, toDt) {
        try {
            return this.accountReportDlService.GetBalanceSheetReportData(fromDt, toDt)
                .map((responseData) => {
                    return responseData;
                });
        } catch (exception) {
            throw exception;
        }
    }

    public GetTrailBalanceReport(fromDate: string, toDate: string) {
        return this.accountReportDlService.GetTrailBalanceReport(fromDate, toDate).map(res => {
            return res;
        });
    }

    public GetProfitLossReport(fromDt, toDt) {
        return this.accountReportDlService.GetProfitLossReport(fromDt, toDt).map(res => {
            return res;
        });
    }

    public GetFiscalYearsList() {
        return this.accountReportDlService.GetFiscalYearsList().map(res=>
            { return res}
            
            );
    }

    public GetVoucherReport(fromDate: string, toDate: string) {
        return this.accountReportDlService.GetVoucherReport(fromDate, toDate)
            .map((responseData) => {
                return responseData;
            });
    }
    
    public GetDayWiseVoucherReport(fromDate: string, toDate: string) {
        return this.accountReportDlService.GetDayWiseVoucherReport(fromDate, toDate)
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
    public GetLedgerReport(ledgerId: number, fromDate: string, toDate: string) {
        return this.accountReportDlService.GetLedgerReport(ledgerId, fromDate, toDate)
            .map((responseData) => {
                return responseData;
            });
    }
    public GetCashFlowReportData(fromDt, toDt) {
        try {
            return this.accountReportDlService.GetCashFlowReportData(fromDt, toDt)
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
    public GetDaywiseVoucherDetailsbyDayVoucherNo(dayVoucherNumber: number, voucherId: number) {
        try {
            return this.accountReportDlService.GetDaywiseVoucherDetailsbyDayVoucherNo(dayVoucherNumber, voucherId)
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }

    //END: GET Report Data


}
