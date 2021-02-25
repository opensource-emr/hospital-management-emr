import { Component, ChangeDetectorRef, Input } from "@angular/core";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Voucher } from "../../transactions/shared/voucher"
import { AccountingBLService } from "../../shared/accounting.bl.service"
import { CoreService } from "../../../core/shared/core.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { RouteFromService } from "../../../shared/routefrom.service";
import { SecurityService } from "../../../security/shared/security.service";
import { SectionModel } from "../../settings/shared/section.model";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";

@Component({
    selector: 'voucher-report',
    templateUrl: './voucher-report.html',
})
export class VoucherReportComponent {
    public txnList: Array<{ FiscalYear, TransactionDate, VoucherType }> = [];
    public txnListAll: Array<{ FiscalYear, TransactionDate, VoucherType }> = [];
    public txnGridColumns: Array<any> = null;
    public transactionId: number = null;
    public fromDate: string = null;
    public toDate: string = null;
    public voucherList: Array<Voucher> = new Array<Voucher>();
    public selVoucher: Voucher = new Voucher();
    public voucherNumber: string = null;

    public fiscalyearList: any;

    public sectionList: Array<SectionModel> = [];
    public sectionId: number = 0;
    public showExportbtn: boolean = false;

    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();//sud:10Apr'20-this is temporary solution.
    public permissions: Array<any> = new Array<any>();
    public applicationList: Array<any> = new Array<any>();
    constructor(public accReportBLService: AccountingReportsBLService, public msgBoxServ: MessageboxService,
        public accountingBLService: AccountingBLService,
        public changeDetector: ChangeDetectorRef,
        public coreService: CoreService,
        public routeFrom: RouteFromService,
        public securityService: SecurityService,
        public settingsBLService: SettingsBLService

    ) {
        this.txnGridColumns = GridColumnSettings.VoucherTransactionList;
        this.fromDate = moment().format("YYYY-MM-DD");
        this.toDate = moment().format("YYYY-MM-DD");
        this.GetSection();
        this.GetVoucher();
        this.GetFiscalYearList();
        this.showExport();
        //this.LoadCalendarTypes();         
        this.calType = this.coreService.DatePreference;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate', false));//sud:10Apr'20--temporary solution.
    }
    
    public fiscalYearId:number=null; 
    public validDate:boolean=true;
    selectDate(event){
        if (event) {
            this.fromDate = event.fromDate;
            this.toDate = event.toDate;
            this.fiscalYearId = event.fiscalYearId;
            this.validDate = true;
          } 
          else {
            this.validDate =false;
        } 
    }
   
    public calType: string = "";
    //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
    LoadCalendarTypes() {
        let Parameter = this.coreService.Parameters;
        Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
        let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
        this.calType = calendarTypeObject.AccountingModule;
    }
    public GetFiscalYearList() {
        this.fiscalyearList = this.securityService.AccHospitalInfo.FiscalYearList;
    }

    GetVoucher() {
        try {
            this.accountingBLService.GetVoucher()
                .subscribe(res => {
                    this.voucherList = res.Results;
                    // this.selVoucher = Object.assign(this.selVoucher, this.voucherList.find(v => v.VoucherName == "Journal Voucher"));//most used voucher
                    this.selVoucher.VoucherId = -1;
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

                this.accReportBLService.GetVoucherReport(this.fromDate, this.toDate, this.sectionId,this.fiscalYearId)
                    .subscribe(res => {
                        if (res.Status == "OK" && res.Results.length) {
                            this.txnListAll = res.Results;
                            this.AssignVoucher();
                        }
                        else {
                            this.msgBoxServ.showMessage("notice", ["no record found."]);
                            // alert("Failed ! " + res.ErrorMessage);
                        }
                    });
            }
            else {
                this.msgBoxServ.showMessage("notice", ["please select module"]);
            }
        }
        else {
            this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
        }

    }

    checkDateValidation() {
        if(!this.validDate){
            this.msgBoxServ.showMessage("error", ['Select proper date.']);
            return false;
        }
        var frmdate = moment(this.fromDate, "YYYY-MM-DD");
        var tdate = moment(this.toDate, "YYYY-MM-DD");
        var flg = false;
        this.fiscalyearList.forEach(a => {
            if ((moment(a.StartDate, 'YYYY-MM-DD') <= frmdate) && (tdate <= moment(a.EndDate, 'YYYY-MM-DD'))) {
                flg = true;
            }
        });
        if (flg == false) {
            this.msgBoxServ.showMessage("error", ['Selected dates must be with in a fiscal year']);
            return flg;
        }
        let flag = true;
        flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
        flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
        flag = (this.toDate >= this.fromDate) == true ? flag : false;
        //flag = (this.selVoucher.VoucherId > 0) ? flag : false;
        if (!flag) {
            this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
        }
        return flag;
    }
    TransactionGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "view-detail": {
                //this.transactionId = null;
                //this.changeDetector.detectChanges();
                //this.transactionId = $event.Data.TransactionId;
                this.voucherNumber = null;
                this.changeDetector.detectChanges();
                this.voucherNumber = $event.Data.VoucherNumber;
                this.sectionId = $event.Data.SectionId;
                localStorage.setItem("SectionId", this.sectionId.toString())
                this.routeFrom.RouteFrom = "VoucherReport"
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

    //sud-nagesh: 21June'20--reusing sectionlist from current active hospital of security service.
    public GetSection() {
        // this.sectionList = this.securityService.AccHospitalInfo.SectionList;
        // this.sectionId = 4 ; //this is for Manual_Voucher (Default for DanpheEMR) - Manual voucher will always be there.
  
        this.settingsBLService.GetApplicationList()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.applicationList = res.Results;
            let sectionApplication = this.applicationList.filter(a => a.ApplicationCode == "ACC-Section" && a.ApplicationName == "Accounts-Sections")[0];
            if (sectionApplication != null || sectionApplication != undefined) {
              this.permissions = this.securityService.UserPermissions.filter(p => p.ApplicationId == sectionApplication.ApplicationId);
            }
            let sList = this.securityService.AccHospitalInfo.SectionList;//.filter(sec => sec.SectionId != 4); // 4 is Manual_Voucher (FIXED for DanpheEMR)
            sList.forEach(s => {
              let sname = s.SectionName.toLowerCase();
              let pp = this.permissions.filter(f => f.PermissionName.includes(sname))[0];
              if (pp != null || pp != undefined) {
                this.sectionList.push(s);
              }
            })
            let defSection = this.sectionList.find(s => s.IsDefault == true);
            if (defSection) {
              this.sectionId = defSection.SectionId;
            }
            else {
              this.sectionId = this.sectionList[0].SectionId;
            }
          }
  
        });
  
  
    }
    gridExportOptions = {
        fileName: 'VoucherList_' + moment().format('YYYY-MM-DD') + '.xls',
    };

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
    showExport() {

        let exportshow = this.coreService.Parameters.find(a => a.ParameterName == "AllowSingleVoucherExport" && a.ParameterGroupName == "Accounting").ParameterValue;
        if (exportshow == "true") {
            this.showExportbtn = true;
        }
        else {
            this.showExportbtn = false;
        }
    }
}
