import { Component } from "@angular/core";
import * as moment from "moment";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status, ENUM_TypesOfBillingForReport } from "../../../shared/shared-enums";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { DLService } from "../../../shared/dl.service";
import { SchemeDetailInvoiceReport } from "./scheme-detail-invoice-report.model";
import { ReportingService } from "../../shared/reporting-service";
import { CommonFunctions } from "../../../shared/common.functions";
import { MembershipType } from "../../../patients/shared/membership-type.model";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";
import { BillingBLService } from "../../../billing/shared/billing.bl.service";
import * as _ from 'lodash';


@Component({
    selector: "scheme-detail-invoice-report",
    templateUrl: "./scheme-detail-invoice-report.component.html"
})
export class RPT_BIL_SchemeDetailInvoiceReportComponent {

    public fromDate: string = "";
    public toDate: string = "";
    public dateRange: string = "";

    public SchemeDetailInvoiceReportGridColumns = [];

    public SchemeDetailInvoiceReport = new Array<SchemeDetailInvoiceReport>();
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public footerContent = '';
    public memberships: string = ""; //"7,6,5,9,8,4";
    public ranks: string = "";//"CON,SI,HC,AHC,SHC,ASI";
    public users: string = "";//"1,51,66,45,47,46,44";
    public loading = false;
    public allMemberships = new Array<MembershipType>();
    public preSelectedMemberships = [];
    public allRanks = [];
    public preSelectedRanks = [];
    public allUsers = [];
    public preSelectedUsers = [];

    gridExportOptions = {
        fileName: 'SchemeDetailInvoiceReport' + moment().format('YYYY-MM-DD') + '.xls',
    };

    summary = {
        CashSales: 0,
        CreditSales: 0,
        GrossSales: 0,
        CashDiscount: 0,
        CreditDiscount: 0,
        TotalDiscount: 0,
        ReturnCashSales: 0,
        ReturnCreditSales: 0,
        TotalSalesReturn: 0,
        ReturnCashDiscount: 0,
        ReturnCreditDiscount: 0,
        TotalReturnDiscount: 0,
        NetSales: 0
    }

    constructor(private dlService: DLService, private msgBoxServ: MessageboxService, private reportServ: ReportingService, private settingsBLService: SettingsBLService, private billingBLService: BillingBLService) {
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Date', false));
        this.SchemeDetailInvoiceReportGridColumns = this.reportServ.reportGridCols.SchemeDetailInvoiceReport;
        this.LoadRanks();
        this.LoadMembershipList();
        this.LoadUser();
    }

    ngAfterViewChecked() {
        this.footerContent = document.getElementById("id_div_summary_scheme_detail_invoice_report").innerHTML;
    }

    public LoadRanks(): void {
        this.billingBLService.GetRank().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                let ranks = [];
                ranks = res.Results;
                ranks.forEach(x => {
                    x['Rank'] = x.RankName;
                });
                ranks.forEach(p => {
                    let val = _.cloneDeep(p);
                    this.preSelectedRanks.push(val);
                });
                this.MapPreSelectedRanks(this.preSelectedRanks);
                this.allRanks = ranks;
            }
            else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Couldn't load Ranks"]);
            }
        });
    }

    public LoadMembershipList(): void {
        this.settingsBLService.GetMembershipType()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    let membershipList = [];
                    membershipList = res.Results;
                    membershipList.forEach(p => {
                        let val = _.cloneDeep(p);
                        this.preSelectedMemberships.push(val);
                    });
                    this.MapPreSelectedMemberships(this.preSelectedMemberships);
                    this.allMemberships = membershipList;
                } else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Couldn't load memberships"]);
                }
            });
    }

    LoadUser(): void {
        this.settingsBLService.GetUserList()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    let usersList = [];
                    usersList = res.Results;
                    CommonFunctions.SortArrayOfObjects(usersList, "EmployeeName");
                    usersList.forEach(p => {
                        let val = _.cloneDeep(p);
                        this.preSelectedUsers.push(val);
                    });
                    this.MapPreSelectedUsers(this.preSelectedUsers);
                    this.allUsers = usersList;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't load users"]);
                }

            });
    }

    LoadReport(): void {
        this.loading = true;
        this.SchemeDetailInvoiceReport = [];
        this.dlService.Read(`/BillingReports/BillingSchemeDetailInvoiceReport?fromDate=${this.fromDate}&toDate=${this.toDate}&memberships=${this.memberships}&ranks=${this.ranks}&users=${this.users}`)
            .map((res: DanpheHTTPResponse) => res)
            .finally(() => { this.loading = false })//re-enable button after response comes back.
            .subscribe(res => this.Success(res),
                res => this.Error(res));
    }

    Success(res): void {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length > 0) {
            this.SchemeDetailInvoiceReport = res.Results;
            this.CalculateSummary();
            this.footerContent = document.getElementById("id_div_summary_scheme_detail_invoice_report").innerHTML;
        }
        else if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length === 0)
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Data is Not Available Between Selected Parameters...Try Different']);
        else
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
    }
    Error(err): void {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
    }

    OnFromToDateChange($event): void {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    }

    CalculateSummary(): void {
        //* Here We are resetting the summary object.
        this.summary.CashSales = this.summary.CreditSales = this.summary.GrossSales = this.summary.CashDiscount = this.summary.CreditDiscount
            = this.summary.TotalDiscount = this.summary.ReturnCashSales = this.summary.ReturnCreditSales = this.summary.TotalSalesReturn
            = this.summary.ReturnCashDiscount = this.summary.ReturnCreditDiscount = this.summary.TotalReturnDiscount = this.summary.NetSales = 0;

        if (this.SchemeDetailInvoiceReport && this.SchemeDetailInvoiceReport.length > 0) {
            this.SchemeDetailInvoiceReport.forEach(ele => {
                switch (ele.BillingType) {
                    case ENUM_TypesOfBillingForReport.CashSales: {
                        this.summary.CashSales += ele.SubTotal;
                        this.summary.CashDiscount += ele.Discount;
                        break;
                    }
                    case ENUM_TypesOfBillingForReport.ReturnCashSales: {
                        this.summary.ReturnCashSales += ele.SubTotal;
                        this.summary.ReturnCashDiscount += ele.Discount;
                        break;
                    }
                    case ENUM_TypesOfBillingForReport.CreditSales: {
                        this.summary.CreditSales += ele.SubTotal;
                        this.summary.CreditDiscount += ele.Discount;
                        break;
                    }
                    case ENUM_TypesOfBillingForReport.ReturnCreditSales: {
                        this.summary.ReturnCreditSales += ele.SubTotal;
                        this.summary.ReturnCreditDiscount += ele.Discount;
                        break;
                    }
                    default:
                        break;
                }
            });

            this.summary.GrossSales = this.summary.CashSales + this.summary.CreditSales;
            this.summary.TotalDiscount = this.summary.CashDiscount + this.summary.CreditDiscount;
            this.summary.TotalSalesReturn = this.summary.ReturnCashSales + this.summary.ReturnCreditDiscount;
            this.summary.TotalReturnDiscount = this.summary.ReturnCashDiscount + this.summary.ReturnCreditDiscount;
            this.summary.NetSales = this.summary.GrossSales - this.summary.TotalDiscount - this.summary.TotalSalesReturn + this.summary.TotalReturnDiscount;

            //* parsing the summary amounts
            this.summary.CashSales = CommonFunctions.parseAmount(this.summary.CashSales);
            this.summary.CreditSales = CommonFunctions.parseAmount(this.summary.CreditSales);
            this.summary.GrossSales = CommonFunctions.parseAmount(this.summary.GrossSales);

            this.summary.CashDiscount = CommonFunctions.parseAmount(this.summary.CashDiscount);
            this.summary.CreditDiscount = CommonFunctions.parseAmount(this.summary.CreditDiscount);
            this.summary.TotalDiscount = CommonFunctions.parseAmount(this.summary.TotalDiscount);

            this.summary.ReturnCashSales = CommonFunctions.parseAmount(this.summary.ReturnCashSales);
            this.summary.ReturnCreditSales = CommonFunctions.parseAmount(this.summary.ReturnCreditSales);
            this.summary.TotalSalesReturn = CommonFunctions.parseAmount(this.summary.TotalSalesReturn);

            this.summary.ReturnCashDiscount = CommonFunctions.parseAmount(this.summary.ReturnCashDiscount);
            this.summary.ReturnCreditDiscount = CommonFunctions.parseAmount(this.summary.ReturnCreditDiscount);
            this.summary.TotalReturnDiscount = CommonFunctions.parseAmount(this.summary.TotalReturnDiscount);

            this.summary.NetSales = CommonFunctions.parseAmount(this.summary.NetSales);

        }

    }

    MembershipsChanged($event): void {
        let defMemberships = [];
        $event.forEach(x => {
            defMemberships.push(x.MembershipTypeId);
        });
        let membershipList = defMemberships.join(",");
        this.memberships = membershipList;
    }

    RanksChanged($event): void {
        let defRanks = [];
        $event.forEach(x => {
            defRanks.push(x.RankName);
        });
        let rankList = defRanks.join(",");
        this.ranks = rankList;
    }

    UserChanged($event): void {
        let defUser = [];
        $event.forEach(x => {
            defUser.push(x.EmployeeId);
        });
        let userList = defUser.join(",");
        this.users = userList;
    }

    MapPreSelectedRanks(preSelectedRanks): void{
        let defRanks = [];
        preSelectedRanks.forEach(x => {
            defRanks.push(x.RankName);
        });
        let rankList = defRanks.join(",");
        this.ranks = rankList;
    }

    MapPreSelectedMemberships(preSelectedMemberships): void{
        let defMemberships = [];
        preSelectedMemberships.forEach(x => {
            defMemberships.push(x.MembershipTypeId);
        });
        let membershipList = defMemberships.join(",");
        this.memberships = membershipList;
    }

    MapPreSelectedUsers(preSelectedUsers): void{
        let defUser = [];
        preSelectedUsers.forEach(x => {
            defUser.push(x.EmployeeId);
        });
        let userList = defUser.join(",");
        this.users = userList;
    }
}