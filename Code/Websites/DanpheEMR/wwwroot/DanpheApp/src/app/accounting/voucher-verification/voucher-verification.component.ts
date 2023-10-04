import { ChangeDetectorRef, Component } from "@angular/core";
import * as moment from 'moment/moment';
import { CoreService } from "../../core/shared/core.service";
import { Application } from "../../security/shared/application.model";
import { Permission } from "../../security/shared/permission.model";
import { SecurityService } from "../../security/shared/security.service";
import { SettingsBLService } from "../../settings-new/shared/settings.bl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponseText, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { AccountingReportsBLService } from "../reports/shared/accounting-reports.bl.service";
import { SectionModel } from "../settings/shared/section.model";
import { AccountingBLService } from "../shared/accounting.bl.service";
import { AccountingService } from '../shared/accounting.service';
import { Voucher } from "../transactions/shared/voucher";
@Component({
    selector: 'voucher-verification',
    templateUrl: './voucher-verification.component.html',
})
export class VoucherVerificationComponent {
    public txnList: Array<{ FiscalYear, TransactionDate, VoucherType }> = [];
    public txnListAll: Array<{ FiscalYear, TransactionDate, VoucherType }> = [];
    public txnGridColumns: Array<any> = [];
    public transactionId: number = 0;
    public fromDate: string = "";
    public toDate: string = "";
    public voucherList: Array<Voucher> = new Array<Voucher>();
    public selVoucher: Voucher = new Voucher();
    public voucherNumber: string = "";
    public btndisabled = false;
    public fiscalyearList: any;
    public sectionList: Array<SectionModel> = [];
    public sectionId: number = 0;
    public showExportbtn: boolean = false;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public permissions: Array<Permission> = [];
    public applicationList: Array<Application> = [];
    public fiscalYearId: number = 0;
    public validDate: boolean = true;
    public showVoucherVerification: boolean = false;

    constructor(public accReportBLService: AccountingReportsBLService, public msgBoxServ: MessageboxService,
        public accountingService: AccountingService,
        public accountingBLService: AccountingBLService,
        public changeDetector: ChangeDetectorRef,
        public coreService: CoreService,
        public routeFrom: RouteFromService,
        public securityService: SecurityService,
        public settingsBLService: SettingsBLService) {

        this.GetConfigurationData();
        this.GetSection();
    }

    public GetConfigurationData() {
        this.txnGridColumns = GridColumnSettings.VoucherVerificationList;
        this.fromDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
        this.toDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
        if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {
            this.voucherList = this.accountingService.accCacheData.VoucherType;
            this.selVoucher.VoucherId = -1;
            this.AssignVoucher();
        }

        if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {
            this.fiscalyearList = this.accountingService.accCacheData.FiscalYearList;
        }

        let showExportParam = this.coreService.Parameters.find(a => a.ParameterName == "AllowSingleVoucherExport" && a.ParameterGroupName == "Accounting");
        if (showExportParam) {
            this.showExportbtn = JSON.parse(showExportParam.ParameterValue);
        }
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate', false));
    }

    selectDate(event) {
        if (event) {
            this.fromDate = event.fromDate;
            this.toDate = event.toDate;
            this.fiscalYearId = event.fiscalYearId;
            this.validDate = true;
        }
        else {
            this.validDate = false;
        }
    }

    public GetTxnList() {
        this.btndisabled = true;
        if (this.checkDateValidation()) {

            if (this.sectionId > 0) {
                this.accReportBLService.GetVoucherForVerification(this.fromDate, this.toDate, this.sectionId)
                    .finally(() => { this.btndisabled = false; })
                    .subscribe((res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length) {
                            this.txnListAll = res.Results;
                            this.AssignVoucher();
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["No data available between the selected date range."]);
                        }
                    });
            }
            else {
                this.btndisabled = false;
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Please select any one modulename."]);
            }
        }
        else {
            this.btndisabled = false;
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['select proper date(FromDate <= ToDate)']);
        }

    }

    checkDateValidation() {
        if (!this.validDate) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Select proper date.']);
            return false;
        }
        let frmdate = moment(this.fromDate, ENUM_DateTimeFormat.Year_Month_Day);
        let tdate = moment(this.toDate, ENUM_DateTimeFormat.Year_Month_Day);
        let dateFallsWithInFisclaYear = false;
        this.fiscalyearList.forEach(a => {
            if ((moment(a.StartDate, ENUM_DateTimeFormat.Year_Month_Day) <= frmdate) && (tdate <= moment(a.EndDate, ENUM_DateTimeFormat.Year_Month_Day))) {
                dateFallsWithInFisclaYear = true;
            }
        });
        if (!dateFallsWithInFisclaYear) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Selected dates must be with in a fiscal year']);
            return dateFallsWithInFisclaYear;
        }
        let flag = true;
        flag = moment(this.fromDate, ENUM_DateTimeFormat.Year_Month_Day).isValid() == true ? flag : false;
        flag = moment(this.toDate, ENUM_DateTimeFormat.Year_Month_Day).isValid() == true ? flag : false;
        flag = (this.toDate >= this.fromDate) == true ? flag : false;
        if (!flag) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['select proper date(FromDate <= ToDate)']);
        }
        return flag;
    }

    TransactionGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "view-detail": {
                this.voucherNumber = "";
                this.changeDetector.detectChanges();
                this.voucherNumber = $event.Data.VoucherNumber;
                this.sectionId = $event.Data.SectionId;
                localStorage.setItem("SectionId", this.sectionId.toString());
                this.accountingService.selectedSectionId = this.sectionId;
                this.routeFrom.RouteFrom = "VoucherVerification";
            }
            default:
                break;
        }
    }

    AssignVoucher() {
        try {
            this.selVoucher.VoucherName = (this.selVoucher.VoucherId == -1) ? "" : this.voucherList.find(v => v.VoucherId == this.selVoucher.VoucherId).VoucherName;
            this.txnList = [];
            this.txnList = (this.selVoucher.VoucherId == -1) ? this.txnListAll : this.txnListAll.filter(s => s.VoucherType === this.selVoucher.VoucherName);
        } catch (ex) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Unable to assign selected voucher.']);
        }
    }

    public GetSection() {
        this.settingsBLService.GetApplicationList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.applicationList = res.Results;
                    let sectionApplication = this.applicationList.filter(a => a.ApplicationCode == "ACC-Section" && a.ApplicationName == "Accounts-Sections")[0];
                    if (sectionApplication != null || sectionApplication != undefined) {
                        this.permissions = this.securityService.UserPermissions.filter(p => p.ApplicationId == sectionApplication.ApplicationId);
                    }
                    let sectionList = this.accountingService.accCacheData.Sections;
                    sectionList.forEach(s => {
                        let sname = s.SectionName.toLowerCase();
                        let pp = this.permissions.filter(f => f.PermissionName.includes(sname))[0];
                        if (pp != null || pp != undefined) {
                            this.sectionList.push(s);
                            this.sectionList = this.sectionList.slice();
                        }
                    })
                    let defSection = this.sectionList.find(s => s.IsDefault == true);
                    if (defSection) {
                        this.sectionId = defSection.SectionId;
                    }
                    else {
                        this.sectionId = this.sectionList[0].SectionId;
                    }
                    let sectionId = this.accountingService.selectedSectionId;
                    if (sectionId > 0) {
                        this.sectionId = sectionId
                    }
                    this.GetTxnList();
                }
            });
    }
    gridExportOptions = {
        fileName: 'VoucherVerificationList_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    public GetChangedSection() {
        if (this.txnList.length > 0) {
            this.txnList = [];
        }
        let section = this.sectionList.find(s => s.SectionId == this.sectionId);
        if (section) {
            this.sectionId = section.SectionId;
        }
    }

    public CallBackTransactionClose($event) {
        if ($event) {
            this.voucherNumber = "";
            this.changeDetector.detectChanges();
            this.voucherNumber = $event.VoucherNumber;
            this.fiscalYearId = $event.FiscalyearId;
        }
    }

    public ngOnInit() {
        let txnData = this.accountingService.voucherTxnData;
        if (txnData.VoucherNumber) {
            this.voucherNumber = "";
            this.showVoucherVerification = false;
            this.changeDetector.detectChanges();
            this.voucherNumber = txnData.VoucherNumber;
            this.fiscalYearId = txnData.FiscalyearId;
        }
        else {
            this.showVoucherVerification = true;
        }
    }

    public CloseTransaction() {
        this.accountingService.voucherTxnData.VoucherNumber = null;
        this.accountingService.voucherTxnData.FiscalyearId = 0;
        this.changeDetector.detectChanges();
        this.GetTxnList();
    }
}
