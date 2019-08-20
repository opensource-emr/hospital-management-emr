import { Component, ChangeDetectorRef } from "@angular/core";

import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Voucher } from "../../transactions/shared/voucher"
import { AccountingBLService } from "../../shared/accounting.bl.service"

@Component({
    selector: 'daywise-voucher-report',
    templateUrl: './daywise-voucher-report.html',
})
export class DaywiseVoucherReportComponent {
    public txnList: Array<{ FiscalYear, TransactionDate, VoucherType, VoucherId }> = [];
    public txnListAll: Array<{ FiscalYear, TransactionDate, VoucherType, VoucherId }> = [];
    public txnGridColumns: Array<any> = null;
    public transactionId: number = null;
    public fromDate: string = null;
    public toDate: string = null;
    public voucherList: Array<Voucher> = new Array<Voucher>();
    public selVoucher: Voucher = new Voucher();
    public voucherNumber: string = null;
    public voucherId: any;
    constructor(public accReportBLService: AccountingReportsBLService, public msgBoxServ: MessageboxService,
        public accountingBLService: AccountingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.txnGridColumns = GridColumnSettings.DaywiseVoucherTransactionList;
        this.fromDate = moment().format("YYYY-MM-DD");
        this.toDate = moment().format("YYYY-MM-DD");
        this.GetVoucher();
    }
    GetVoucher() {
        try {            
            this.accountingBLService.GetVoucher()
                .subscribe(res => {
                    this.voucherList = res.Results;
                    this.selVoucher.VoucherId=-1;                                        
                    //this.selVoucher = Object.assign(this.selVoucher, this.voucherList.find(v => v.VoucherName == "Journal Voucher"));//most used voucher
                    this.AssignVoucher();
                });
        } catch (ex) {
            this.msgBoxServ.showMessage("error", ['error ! console log for details.']);
            console.log(ex);
        }
    }
    public GetTxnList() {
        if (this.checkDateValidation()) {
            this.accReportBLService.GetDayWiseVoucherReport(this.fromDate, this.toDate)
                .subscribe(res => {
                    if (res.Status == "OK" && res.Results.length) {

                        this.txnListAll = res.Results;
                        this.AssignVoucher();                        
                    }
                    else {
                        this.msgBoxServ.showMessage("notice", ["no record found."]);                      
                    }
                });
        } else {
            this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
        }

    }
    checkDateValidation() {
        let flag = true;
        flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
        flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
        flag = (this.toDate >= this.fromDate) == true ? flag : false;        
        return flag;
    }
    TransactionGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "view-detail": {             
                this.voucherNumber = null;
                this.voucherId = null;
                this.changeDetector.detectChanges();
                this.voucherId = $event.Data.VoucherId;    
                this.voucherNumber = $event.Data.VoucherNumber;          
            }
            default:
                break;
        }
    }
    
    AssignVoucher() {
        try {
            this.selVoucher.VoucherName = (this.selVoucher.VoucherId == -1) ? "" : this.voucherList.find(v => v.VoucherId == this.selVoucher.VoucherId).VoucherName;
            this.txnList = [];
            this.txnList = (this.selVoucher.VoucherId == -1) ? this.txnListAll : this.txnListAll.filter(s => s.VoucherType == this.selVoucher.VoucherName);
        } catch (ex) {
            this.msgBoxServ.showMessage("error", ['Please check console']);
            console.log(ex);
        }
    }

    //GetDaywiseVoucherDetailsbyDayVoucherNo
}
