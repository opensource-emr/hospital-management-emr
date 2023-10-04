import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import { CoreService } from "../../../core/shared/core.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";


@Component({
  templateUrl: './bill-item-summary-report.html'
})
export class RPT_BIL_ItemSummaryReportComponent {

  public billing: string = "billing";
  public FromDate: string = "";
  public ToDate: string = "";
  public dateRange: string = "";
  public showReport: boolean = false;
  public allReportData: Array<any> = [];
  public currentDate: string = "";
  public IsDateValid: boolean = true;
  public reportHeaderHtml: string = '';
  public hdr: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };

  public loading: boolean = false;

  public summary = {
    tot_BilAmt: 0, tot_DiscountAmount: 0, tot_SubTotal: 0, total_Qty: 0
  };

  public ItemSummaryReportGridCol: Array<any> = null;
  public footerContent = '';

  constructor(
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public coreService: CoreService) {
    this.currentDate = this.FromDate = this.ToDate = moment().format('YYYY-MM-DD');

    this.ItemSummaryReportGridCol = GridColumnSettings.ItemSummaryReportGridCol;

    //this.LoadBillItemSummary();

    this.reportHeaderHtml = this.coreService.GetReportHeaderParameterHTML(moment(this.FromDate).format('YYYY-MM-DD'),
      moment(this.ToDate).format('YYYY-MM-DD'),
      this.coreService.GetReportHeaderTextForProperty('BillItemSummaryReportHeader')
    );
  }

  ngOnInit() {
    // if(document.getElementById("calc-summary")!=null)
    // this.footerContent=document.getElementById("calc-summary").innerHTML;
  }

  ngAfterViewChecked() {
    if (document.getElementById("calc-summary") != null)
      this.footerContent = document.getElementById("calc-summary").innerHTML;
  }

  LoadBillItemSummary() {
    if (this.IsDateValid) {
      //let srvDept = this.ServDeptName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
      this.dlService.Read("/BillingReports/RPT_Bil_ItemSummaryReport?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate)
        .map(res => res)
        .finally(() => { this.loading = false; })
        .subscribe(res => {
          if (res.Status == "OK") {
            let data = JSON.parse(res.Results.JsonData);
            if (data && data.Table1 && data.Table1[0]) {
              this.allReportData = data.Table1;

              this.summary.total_Qty = this.summary.tot_BilAmt = this.summary.tot_SubTotal = this.summary.tot_DiscountAmount = 0
              this.allReportData.forEach(a => {
                a.SubTotal = CommonFunctions.parseAmount(a.SubTotal);
                a.DiscountAmount = CommonFunctions.parseAmount(a.DiscountAmount);
                a.TotalAmount = CommonFunctions.parseAmount(a.TotalAmount);

                this.summary.total_Qty += a.TotalQty;
                this.summary.tot_BilAmt += a.TotalAmount;
                this.summary.tot_SubTotal += a.SubTotal;
                this.summary.tot_DiscountAmount += a.DiscountAmount;

              });



              this.showReport = true;

            }
            else {
              this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
            }
          }
        });
    }
  }

  //ExportToExcel(tableId) {
  //  if (tableId) {
  //    let workSheetName = 'Items Summary Report';
  //    let Heading = 'Items Summary Report';
  //    let filename = 'itemsSummaryReport';
  //    //NBB-send all parameters for now 
  //    //need enhancement in this function 
  //    //here from date and todate for show date range for excel sheet data
  //    CommonFunctions.ConvertHTMLTableToExcel(tableId, this.FromDate, this.ToDate, workSheetName,
  //      Heading, filename);
  //  }
  //}

  //public ErrorMsg(err) {
  //  this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
  //  console.log(err.ErrorMessage);
  //}

  DateValidCheck() {
    if (this.ToDate && this.FromDate) {
      //get current date, month and time
      var currDate = moment().format('YYYY-MM-DD');

      if ((moment(this.ToDate).diff(currDate) > 0) ||
        (moment(this.ToDate) < moment(this.FromDate))) {
        this.IsDateValid = false;
      }
      else {
        this.IsDateValid = true;
      }
    }
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'itemsSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
    customHeader: this.GetHeaderText()
  };

  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'itemsSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
      customHeader: this.GetHeaderText()
    };
    return gridExportOptions;
  }
  //Get customer Header Parameter from Core Service (Database) assign to local variable
  GetHeaderText(): string {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'BillingHeader').ParameterValue;
    var hdrTxt = "";
    if (paramValue) {
      this.hdr = JSON.parse(paramValue);
      hdrTxt = this.hdr.CustomerName + " \n ";
      hdrTxt += this.hdr.Address.toString().replace(",", " ") + " \n ";
      hdrTxt += this.hdr.CustomerRegLabel + "\n"; // + this.hdr.CustomerRegNo + " \n ";
      hdrTxt += "Items Summary Report" + "\n";
      hdrTxt += "Invoice details From:" + this.FromDate + "  To:" + this.ToDate;

    }
    return hdrTxt;
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.FromDate = $event ? $event.fromDate : this.FromDate;
    this.ToDate = $event ? $event.toDate : this.ToDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
    //this.allReportData.FromDate = this.FromDate;
    //this.allReportData.ToDate = this.ToDate;
  }
}

