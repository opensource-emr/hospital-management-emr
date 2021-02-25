import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import { CoreService } from "../../../core/shared/core.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { DanpheHTTPResponse } from "../../../shared/common-models";

@Component({
  selector: 'incentive-report-summary',
  templateUrl: './incentive-report-summary.html'
})
export class RPT_BIL_IncentiveReportSummaryComponent {
  @Input("fromDate")
  public FromDate: string = "";
  @Input("toDate")
  public ToDate: string = "";


  public reportData: Array<any> = [];
  public selDoctorId: number = null;
  public showBillDocSummary: boolean = false;
  public showItemSummary: boolean = false;

  //public TDS = { "TDSEnabled": true, "TDSPercent": 15 };
  public summary = {
     tot_TDS: 0,
    tot_RefAmount: 0, tot_AssignAmount: 0, tot_TotIncome: 0,
    tot_TDSAmount: 0, tot_NetIncome: 0
  };
  public currentDate: string = "";

  constructor(
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public coreservice: CoreService,
    public changeDetector: ChangeDetectorRef) {
    this.currentDate = moment().format('YYYY-MM-DD');

    //this.LoadTDSRate();
  }

  //@Input("showDocSummary")
  //public set value(val: boolean) {
  //  if (val) {
  //    this.loadDocSummary();
  //  }
  //  else
  //    this.showBillDocSummary = false;
  //}

  ngOnInit() {
    this.loadDocSummary();
  }

  public loadDocSummary() {
    this.dlService.Read("/BillingReports/INCTV_DocterSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate)
      .map(res => res)
      .subscribe((res:DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          if (data.length > 0) {
            this.reportData = data;
            //parsing figures
            this.reportData.forEach(itm => {
              itm.ReferralAmount = CommonFunctions.parseAmount(itm.ReferralAmount);
              itm.AssignedAmount = CommonFunctions.parseAmount(itm.AssignedAmount);
              itm.DocTotalAmount = CommonFunctions.parseAmount(itm.DocTotalAmount);
              itm.TDSAmount = CommonFunctions.parseAmount(itm.TDSAmount);
              //hospital amount is not shown in UI.
              itm.HospitalAmount = CommonFunctions.parseAmount(itm.HospitalAmount);
              //NetTotal is runtime variable
              itm.NetTotal = CommonFunctions.parseAmount(itm.DocTotalAmount - itm.TDSAmount);
            });

            //this.CalculateTDSAndTotalAmt(this.reportData);
            this.CalculateSummaryAmounts(this.reportData);
            this.showBillDocSummary = true;
          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
            this.showBillDocSummary = false;
            this.changeDetector.detectChanges();
          }
        }
      });
  }

  public ExportToExcelDocSummaryReport(tableId) {
    //this.dlService.ReadExcel("/ReportingNew/ExportToExcelRefSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate)
    //  .map(res => res)
    //  .subscribe(data => {
    //    let blob = data;
    //    let a = document.createElement("a");
    //    a.href = URL.createObjectURL(blob);
    //    a.download = "INCTV_DocterSummaryReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
    //    document.body.appendChild(a);
    //    a.click();
    //  },
    //    err => this.ErrorMsg(err));

    if (tableId) {
      let workSheetName = 'Incentive Doctor Summary Report';
      let Heading = 'Incentive Doctor Summary';
      let filename = 'IncentiveDoctorSummary';
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.FromDate, this.ToDate, workSheetName,
        Heading, filename);
    }
  }

  public ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  public LoadDoctorItems(row) {
    this.selDoctorId = row.ReferrerId;
    this.showItemSummary = true;
    this.showBillDocSummary = false;
  }

  public CalculateSummaryAmounts(data) {
    //initailize to zero
    this.summary.tot_RefAmount = this.summary.tot_AssignAmount = this.summary.tot_TotIncome = this.summary.tot_TDSAmount = this.summary.tot_NetIncome = 0;

    data.forEach(a => {
      this.summary.tot_RefAmount += a.ReferralAmount;
      this.summary.tot_AssignAmount += a.AssignedAmount;
      this.summary.tot_TotIncome += a.DocTotalAmount;
      this.summary.tot_TDSAmount += a.TDSAmount;
      this.summary.tot_NetIncome += a.NetTotal;
    });

    this.summary.tot_RefAmount = CommonFunctions.parseAmount(this.summary.tot_RefAmount);
    this.summary.tot_AssignAmount = CommonFunctions.parseAmount(this.summary.tot_AssignAmount);
    this.summary.tot_TotIncome = CommonFunctions.parseAmount(this.summary.tot_TotIncome);
    this.summary.tot_TDSAmount = CommonFunctions.parseAmount(this.summary.tot_TDSAmount);
    this.summary.tot_NetIncome = CommonFunctions.parseAmount(this.summary.tot_NetIncome);

  }

  public CalculateTDSAndTotalAmt(data) {

    //data.forEach(a => {
    //  this.summary.tot_TDS = a.DocTotalamount * (this.TDS.TDSPercent / 100);
    //  this.summary.tot_NetTotal = a.DocTotalamount - this.summary.tot_TDS;

    //  this.summary.tot_TDS = CommonFunctions.parseAmount(this.summary.tot_TDS);
    //  this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);

    //  a['tot_TDS'] = this.summary.tot_TDS;
    //  a['tot_NetTotal'] = this.summary.tot_NetTotal;

    //});

  }

  public DoctorItemOnClose() {
    this.showItemSummary = false;
    this.showBillDocSummary = true;
    this.changeDetector.detectChanges();
  }

  //LoadTDSRate() {
  //  let allParams = this.coreservice.Parameters;
  //  if (allParams.length) {
  //    let CalParms = allParams.find(a => a.ParameterName == "TDSConfiguration" && a.ParameterGroupName == "Incentive");
  //    if (CalParms) {
  //      let Obj = JSON.parse(CalParms.ParameterValue);
  //      this.TDS.TDSEnabled = Obj.TDSEnabled;
  //      this.TDS.TDSPercent = Obj.TDSPercent;
  //    }
  //  }
  //}
}
