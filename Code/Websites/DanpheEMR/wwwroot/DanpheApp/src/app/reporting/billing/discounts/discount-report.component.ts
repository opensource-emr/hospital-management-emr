import { Component } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { CommonFunctions } from '../../../shared/common.functions';
import { RPT_BIL_DiscountReportModel } from "./discount-report.model";

import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from '../../../security/shared/security.service';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
@Component({
  templateUrl: "./discount-report.html"

})
export class RPT_BIL_DiscountReportComponent {

  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "";

  public CounterId: number = null;
  public CreatedBy: string = "";
  // public tot_Subtotal: number = 0;
  // public tot_DiscountAmt: number = 0;
  // public tot_Tax: number = 0;
  // public tot_TotalAmt: number = 0;
  DiscountReportColumns: Array<any> = null;
  DiscountReportData = new Array<RPT_BIL_DiscountReportModel>();
  dynamicColumns: Array<string> = new Array<string>();
  public currentDiscount: RPT_BIL_DiscountReportModel = new RPT_BIL_DiscountReportModel();
  dlService: DLService = null;
  public counterList: any;
  public gridExportOptions: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public UserName: any = null;
  public EmployeeList: Array<any> = [];

  public loading: boolean = false;
  public UserId: number = null;

  public summaryTotals: any = {
    totalBillSubTotal: 0,
    totalBillDiscount: 0,
    totalBillTotal: 0,
    totalCreditNoteSubTotal: 0,
    totalCreditDiscount: 0,
    totalCreditTotal: 0,
    totalAmount: 0,
  }
  public footerContent: string = "";
  public datePreference: string = "np";
  public Header: string = '';
  public CurrentUser = '';

  constructor(
    private _dlService: DLService,
    private _messageBoxService: MessageboxService,
    private _reportService: ReportingService,
    private _coreService: CoreService,
    private _nepCalendarService: NepaliCalendarService,
    private _securityService: SecurityService,
    private _settingsBLService: SettingsBLService
  ) {
    this.dlService = _dlService;
    this.currentDiscount.fromDate = moment().format('YYYY-MM-DD');
    this.currentDiscount.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("DischargeDate", false));
    this.LoadExportOptions();
    this.LoadCounter();
    this.LoadUser();
    this.GetHeaderParameter();
  }

  ngAfterViewChecked() {
    if (document.getElementById("id_discount_report_summary") !== null)
      this.footerContent = document.getElementById("id_discount_report_summary").innerHTML;
  }

  public Load(): void {
    // this.tot_Subtotal = this.tot_DiscountAmt = this.tot_Tax = this.tot_TotalAmt = 0;
    this.summaryTotals.totalAmount = this.summaryTotals.totalBillSubTotal = this.summaryTotals.totalBillDiscount = this.summaryTotals.totalBillTotal = this.summaryTotals.totalCreditNoteSubTotal = this.summaryTotals.totalCreditDiscount = this.summaryTotals.totalCreditTotal = 0;

    if (this.currentDiscount.fromDate !== null && this.currentDiscount.toDate !== null) {
      this.dlService.Read("/BillingReports/DiscountReport?FromDate="
        + this.currentDiscount.fromDate + "&ToDate=" + this.currentDiscount.toDate
        + "&CounterId=" + this.currentDiscount.CounterId + "&CreatedBy=" + this.UserId)
        .map(res => res)
        .finally(() => { this.loading = false; })
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this._messageBoxService.showMessage("error", ['Dates Provided is not Proper']);
    }
  }

  public LoadCounter(): void {
    this.counterList = DanpheCache.GetData(MasterType.BillingCounter, null);
    // this.coreBlService.GetCounter()
    //     .subscribe(res => {
    //         if (res.Status == "OK") {
    //             this.counterlist = res.Results;
    //         }
    //         else {
    //             this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //             console.log(res.ErrorMessage);
    //         }

    //     });
  }

  public Success(res): void {
    if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
      this.DiscountReportColumns = this._reportService.reportGridCols.DiscountReport;
      this.DiscountReportData = res.Results;
      //load export options to set fromDate and to date as custom headers..
      this.CurrentUser = this._securityService.loggedInUser.Employee.FullName;
      this.LoadExportOptions();
      this.CalculateSummaryOfDifferentColumnForSum();
    }
    else if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length === 0) {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['No Data is Available Between Selected Parameters...'])
      this.DiscountReportColumns = this._reportService.reportGridCols.DiscountReport;
      this.DiscountReportData = res.Results;
    }
    else {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
    }
  }

  public Error(err): void {
    this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [err]);
  }

  public LoadExportOptions(): void {

    this.gridExportOptions = {
      fileName: 'DiscountReportList_' + moment().format('YYYY-MM-DD') + '.xls',
      customHeader: "FromDate: " + this.currentDiscount.fromDate + "--ToDate:" + this.currentDiscount.toDate

    };
  }

  //on click grid export button we are catching in component an event..
  //and in that event we are calling the server excel export....
  public OnGridExport($event: GridEmitModel): void {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDiscountReport?FromDate="
      + this.currentDiscount.fromDate + "&ToDate=" + this.currentDiscount.toDate
      + "&CounterId=" + this.currentDiscount.CounterId + "&CreatedBy=" + this.currentDiscount.CreatedBy)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DiscountReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },
        res => this.ErrorMsg(res));
  }

  public ErrorMsg(err): void {
    this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  public CalculateSummaryOfDifferentColumnForSum(): void {
    let invoices = this.DiscountReportData.filter(a => a.ReferenceReceipt === "N/A");
    let creditNotes = this.DiscountReportData.filter(a => a.ReferenceReceipt !== "N/A");
    if (invoices && invoices.length) {
      this.summaryTotals.totalBillSubTotal = invoices.reduce((acc, curr) => acc + curr.SubTotal, 0);
      this.summaryTotals.totalBillDiscount = invoices.reduce((acc, curr) => acc + curr.DiscountAmount, 0);
      this.summaryTotals.totalBillTotal = invoices.reduce((acc, curr) => acc + curr.TotalAmount, 0);
    }
    if (creditNotes && creditNotes.length) {
      this.summaryTotals.totalCreditNoteSubTotal = creditNotes.reduce((acc, curr) => acc + curr.SubTotal, 0);
      this.summaryTotals.totalCreditDiscount = creditNotes.reduce((acc, curr) => acc + curr.DiscountAmount, 0);
      this.summaryTotals.totalCreditTotal = creditNotes.reduce((acc, curr) => acc + curr.TotalAmount, 0);
    }

    this.summaryTotals.totalAmount = (this.summaryTotals.totalBillSubTotal - this.summaryTotals.totalBillDiscount) - (this.summaryTotals.totalCreditNoteSubTotal - this.summaryTotals.totalCreditDiscount);

    this.summaryTotals.totalBillSubTotal = CommonFunctions.parseAmount(this.summaryTotals.totalBillSubTotal, 3);
    this.summaryTotals.totalBillDiscount = CommonFunctions.parseAmount(this.summaryTotals.totalBillDiscount, 3);
    this.summaryTotals.totalBillTotal = CommonFunctions.parseAmount(this.summaryTotals.totalBillTotal, 3);
    this.summaryTotals.totalCreditNoteSubTotal = CommonFunctions.parseAmount(this.summaryTotals.totalCreditNoteSubTotal, 3);
    this.summaryTotals.totalCreditDiscount = CommonFunctions.parseAmount(this.summaryTotals.totalCreditDiscount, 3);
    this.summaryTotals.totalCreditTotal = CommonFunctions.parseAmount(this.summaryTotals.totalCreditTotal, 3);
    this.summaryTotals.totalAmount = CommonFunctions.parseAmount(this.summaryTotals.totalAmount, 3);

  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  public OnFromToDateChange($event): void {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentDiscount.fromDate = this.fromDate;
    this.currentDiscount.toDate = this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

  public UserListFormatter(data: any): string {
    return data["EmployeeName"];
  }

  public LoadUser(): void {
    this._settingsBLService.GetUserList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.EmployeeList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.EmployeeList, "EmployeeName");
          this.CurrentUser = this._securityService.loggedInUser.Employee.FullName;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }
      });
  }

  public UserChanged(): void {
    this.UserId = this.UserName ? this.UserName.EmployeeId : null;
  }

  public GetHeaderParameter(): void {
    let customerHeaderParam = this._coreService.Parameters.find(a => a.ParameterGroupName === "Common" && a.ParameterName === "CustomerHeader");
    if (customerHeaderParam !== null) {
      let customerHeaderParamValue = customerHeaderParam.ParameterValue;
      if (customerHeaderParamValue) {
        let headerDetail = JSON.parse(customerHeaderParamValue);

        this.Header = `
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="4" style="text-align:center;font-size:large;"><strong>${headerDetail.hospitalName}</strong></td>
      </tr><br/>
       <tr>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="4" style="text-align:center;font-size:small;"><strong>${headerDetail.address}</strong></td>
      </tr>`;

      }
    }
  }

  public Print(printId: string): void {

    this.datePreference = this._coreService.DatePreference;
    let fromDate_string: string = "";
    let toDate_string: string = "";
    let printedDate: any = moment().format("YYYY-MM-DD HH:mm");
    let printedDate_string: string = "";
    let calendarType: string = "BS";
    if (this.datePreference === "en") {
      fromDate_string = moment(this.fromDate).format("YYYY-MM-DD");
      toDate_string = moment(this.toDate).format("YYYY-MM-DD");
      printedDate_string = printedDate;
      calendarType = "(AD)";
    }
    else {
      fromDate_string = this._nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
      toDate_string = this._nepCalendarService.ConvertEngToNepaliFormatted(this.toDate, "YYYY-MM-DD");
      printedDate_string = this._nepCalendarService.ConvertEngToNepaliFormatted(printedDate, "YYYY-MM-DD HH:mm");
      calendarType = "(BS)";
    }

    let popupWindow;
    var printContents = '<div style="text-align: center">' + this.Header + ' </div>' + '<br>';
    printContents += '<div style="text-align: center">Discount Report(Summary)</div>' + '<br>';
    printContents += '<b style="float: left">Date Range' + calendarType + ':  From:' + fromDate_string + '  To:' + toDate_string + '</b>' + '<b style="float: right"> Printed By :' + this.CurrentUser + '</b><br>';
    printContents += '<b style="float: right"> Printed On :' + printedDate_string + '</b>';
    printContents += document.getElementById(printId).innerHTML;
    popupWindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWindow.document.write(documentContent);
    popupWindow.document.close();
  }

}
