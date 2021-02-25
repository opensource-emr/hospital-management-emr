import { Component, ChangeDetectorRef } from "@angular/core";

import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Voucher } from "../../transactions/shared/voucher"
import { AccountingBLService } from "../../shared/accounting.bl.service"
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";

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
    public sectionId: number = 0;
    public sectionList = Array<{ SectionId: number, SectionName: string }>();
    constructor(public accReportBLService: AccountingReportsBLService, public msgBoxServ: MessageboxService,
        public accountingBLService: AccountingBLService,
        public changeDetector: ChangeDetectorRef, public coreService: CoreService,private securityServ:SecurityService) {
        this.txnGridColumns = GridColumnSettings.DaywiseVoucherTransactionList;
        this.fromDate = moment().format("YYYY-MM-DD");
        this.toDate = moment().format("YYYY-MM-DD");
        this.GetSection();
        this.GetVoucher();
        this.LoadCalendarTypes(); 
    }
    public calType: string = ""; 
    //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
    LoadCalendarTypes() {
        let Parameter = this.coreService.Parameters;
        Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
        let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
        this.calType = calendarTypeObject.AccountingModule;
    }
    GetVoucher() {
        try {
            this.accountingBLService.GetVoucher()
                .subscribe(res => {
                    this.voucherList = res.Results;
                    this.selVoucher.VoucherId = -1;
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
            if (this.sectionId > 0) {
                this.accReportBLService.GetDayWiseVoucherReport(this.fromDate, this.toDate,this.sectionId)
                    .subscribe(res => {
                        if (res.Status == "OK" && res.Results.length) {

                            this.txnListAll = res.Results;
                            this.AssignVoucher();
                        }
                        else {
                            this.msgBoxServ.showMessage("notice", ["no record found."]);
                        }
                    });
            }
            else {
                this.msgBoxServ.showMessage("notice",["please select module"]);
            }

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
                this.sectionId = $event.Data.SectionId;
                localStorage.setItem("SectionId", this.sectionId.toString())

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
    public GetSection() {
        try {
           // let sectionListData = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "SectionList");
              let sectionListData = this.securityServ.AccHospitalInfo.SectionList;
           if (sectionListData.length > 0) {
            //    this.sectionList = JSON.parse(sectionListData[0].ParameterValue).SectionList;
            this.sectionList = sectionListData;
                this.sectionId = this.sectionList[1].SectionId;
            } else {
                this.msgBoxServ.showMessage("error", ['Please provide section (Module) name(s) !']);
            }
        } catch (ex) {
            this.msgBoxServ.showMessage("error", ['Please check console']);
            console.log(ex);
        }
    }
    public GetChangedSection() {
        try {
            if (this.txnList.length > 0) {
                this.txnList = [];
            }
            this.sectionId = this.sectionList.find(s => s.SectionId == this.sectionId).SectionId;
            this.msgBoxServ.showMessage("notice", ["click on show details for search records"]);

        }
        catch (ex) {

        }
    }
    //GetDaywiseVoucherDetailsbyDayVoucherNo
}
