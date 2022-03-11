import { Component } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { RPT_BIL_TotalItemsBillModel } from "../../../reporting/billing/total-items-bill/total-items-bill-report.model";
import { ReportingService } from "../../..//reporting/shared/reporting-service";
import { NepaliDateInGridColumnDetail,NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
  selector: 'gov-ins-total-items-bill',
  templateUrl: "./gov-ins-total-items-bill.html"
})

export class GOVINSTotalItemsBillComponent {

  public CurrentTotalItem: RPT_BIL_TotalItemsBillModel = new RPT_BIL_TotalItemsBillModel();
  public dlService: DLService = null;
  public serDeptList: any;
  public fromDate: string = null;
  public toDate: string = null;
  public billstatus: string = "";
  public servicedepartment: any = "";
  public itemname: string = "";

  public TotalItemsBillReportColumns: Array<any> = null;
  public TotalItemsBillReporttData: Array<any> = new Array<RPT_BIL_TotalItemsBillModel>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public summary: any = {
    tot_SubTotal: 0,
    tot_Quantity: 0,
    tot_Discount: 0,
    tot_TotalAmount: 0,
    tot_PaidAmt: 0,
    tot_UnPaidAmt: 0,
    tot_CancelAmt: 0,
    tot_ReturnAmt: 0,
    tot_ProvisionalAmt: 0
  };

  constructor(_dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("BillingDate", false));
    this.loadDepartments();
  }

  loadDepartments() {
    this.dlService.Read("/Reporting/GetServiceDeptList")
      .map(res => res).subscribe(res => {
        if (res.Status == "OK") {
          this.serDeptList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.serDeptList, "ServiceDepartmentName");//this sorts the empRoleList by EmployeeRoleName.
        }
      });
  }

  Load() {
      this.TotalItemsBillReporttData = new Array<RPT_BIL_TotalItemsBillModel>();
      //IsInsurance=true for Insurance Reports
      this.dlService.Read("/BillingReports/TotalItemsBill?FromDate=" + this.fromDate + "&ToDate=" + this.toDate
        + "&BillStatus=" + this.CurrentTotalItem.billstatus + "&ServiceDepartmentName=" + this.CurrentTotalItem.servicedepartment +
        "&ItemName=" + this.CurrentTotalItem.itemname + "&IsInsurance=true")
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
   
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.TotalItemsBillReportColumns = this.reportServ.reportGridCols.TotalItemsBillReport;
      this.TotalItemsBillReporttData = res.Results;
      this.InitializeVariables();
      this.CalculateSummaryofDifferentColoumnForSum();
    }
    else if (res.Status == "OK" && res.Results.length == 0)
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different']);
    else
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  InitializeVariables() {
    //initializing every variable to zero
    this.summary.tot_CancelAmt = 0;
    this.summary.tot_Discount = 0;
    this.summary.tot_PaidAmt = 0;
    this.summary.tot_ProvisionalAmt = 0;
    this.summary.tot_Quantity = 0;
    this.summary.tot_ReturnAmt = 0;
    this.summary.tot_SubTotal = 0;
    this.summary.tot_TotalAmount = 0;
    this.summary.tot_UnPaidAmt = 0;
  }

  CalculateSummaryofDifferentColoumnForSum() {
    this.TotalItemsBillReporttData.forEach(SumVariable => {
      this.summary.tot_Quantity += SumVariable.Quantity;
      this.summary.tot_SubTotal += SumVariable.SubTotal;
      this.summary.tot_Discount += SumVariable.DiscountAmount;
      this.summary.tot_TotalAmount += SumVariable.TotalAmount;
      if (SumVariable.BillStatus == "paid")
        this.summary.tot_PaidAmt += SumVariable.TotalAmount;
      else if (SumVariable.BillStatus == "unpaid")
        this.summary.tot_UnPaidAmt += SumVariable.TotalAmount;
      else if (SumVariable.BillStatus == "cancel")
        this.summary.tot_CancelAmt += SumVariable.TotalAmount;
      else if (SumVariable.BillStatus == "provisional")
        this.summary.tot_ProvisionalAmt += SumVariable.TotalAmount;
      else if (SumVariable.BillStatus == "return")
        this.summary.tot_ReturnAmt += SumVariable.TotalAmount;
      //this.summary += SumVariable.;
    });
    this.summary.tot_Quantity = CommonFunctions.parseAmount(this.summary.tot_Quantity);
    this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
    this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
    this.summary.tot_TotalAmount = CommonFunctions.parseAmount(this.summary.tot_TotalAmount);
    //this.tot_Total = CommonFunctions.parseAmount(this.tot_Total);
  }

  departmentChanged() {
    this.CurrentTotalItem.servicedepartment = this.servicedepartment ? this.servicedepartment.ServiceDepartmentName : "";
  }

  myListFormatter(data: any): string {
    let html = data["ServiceDepartmentName"];
    return html;
  }

  gridExportOptions = {
    fileName: 'TotalItemBillList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  OnGridExport($event: GridEmitModel) {
    //IsInsurance is true for Ins-Reports.
    let jsonStrSummary = JSON.stringify(this.summary);
    let summaryHeader = "Total Items Bill Report Summary";
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelTotalItemsBill?FromDate="
      + this.fromDate + "&ToDate=" + this.toDate
      + "&BillStatus=" + this.CurrentTotalItem.billstatus + "&ServiceDepartmentName=" + this.CurrentTotalItem.servicedepartment +
      "&ItemName=" + this.CurrentTotalItem.itemname + "&SummaryData=" + jsonStrSummary + "&SummaryHeader=" + summaryHeader + "&IsInsurance=true")
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "TotalItemsBill_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },
        res => this.ErrorMsg(res));
  }

  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  //sud:6June'20--reusable From-ToDate
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
  }

}
