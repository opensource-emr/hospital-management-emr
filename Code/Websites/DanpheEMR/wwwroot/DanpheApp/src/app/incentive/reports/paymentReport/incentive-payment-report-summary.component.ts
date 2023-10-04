import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { RPT_BIL_IncentiveReportModel } from "../incentive-report.model";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { INCTVGridColumnSettings } from "../../shared/inctv-grid-column-settings";

@Component({
  templateUrl: './incentive-payment-report-summary.html'
})
export class RPT_INCTV_PaymentReportSummaryComponent {

  public curDocReportMain: RPT_BIL_IncentiveReportModel = new RPT_BIL_IncentiveReportModel();
  //public FromDate: string = '';
  //public ToDate: string = '';
  public currentDate: string = '';
  public calType: string = '';
  public headerDetail: any = null;
  public PaymentReportGridColumns: Array<any> = null;

  public allReportData: Array<any> = [];
  public showReport: boolean = false;
  public voucherNumber: string = null;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public showpaymentDetails:boolean=false ;
  public paymentDetails: RPT_BIL_IncentiveReportModel = new RPT_BIL_IncentiveReportModel();
  public showPrint: boolean = false;  
  public printDetaiils:any;

  constructor(
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public coreservice: CoreService,
    public changeDetector: ChangeDetectorRef) {
    this.currentDate = this.curDocReportMain.fromDate = this.curDocReportMain.toDate = moment().format('YYYY-MM-DD');

    this.PaymentReportGridColumns = INCTVGridColumnSettings.PaymentReportGridColumns;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('PaymentDate', false));

    this.LoadCalenderTypes();
    

  }



  ngOnInit() {

  }


  LoadCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.IncentiveModule;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
      }
    }
  }

  public loadDocPaymentSummary() {
    this.dlService.Read("/BillingReports/INCTV_DocterPaymentSummary?FromDate=" + this.curDocReportMain.fromDate + "&ToDate=" + this.curDocReportMain.toDate)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          if (data.length > 0) {
            this.allReportData = data;

            this.allReportData.forEach(a => {
              a.TotalAmount = CommonFunctions.parseAmount(a.TotalAmount);
              a.TDSAmount = CommonFunctions.parseAmount(a.TDSAmount);
              a.NetPayAmount = CommonFunctions.parseAmount(a.NetPayAmount);
              a.AdjustedAmount = CommonFunctions.parseAmount(a.AdjustedAmount);
            });


            this.showReport = true;
          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
            this.showReport = false;
          }
        }
      });
  }


  PaymentReportGridActions($event) {
    console.log($event);
    switch ($event.Action) {
      case "viewDetail": {
        this.paymentDetails = new RPT_BIL_IncentiveReportModel();
        this.showpaymentDetails =true;
        this.paymentDetails = $event.Data;
      }
      default:
        break;
    }
  }

  Close(){
    this.showpaymentDetails =false;

  }
  Print(){
    this.showPrint=false;
    this.printDetaiils=null;
    this.changeDetector.detectChanges();
    this.showPrint=true;
    this.printDetaiils = document.getElementById("printpageTransactionView");
    this.Close();
  }


    //sud:28May'20--For Reusable From-Date-To-Date component
    OnDateRangeChange($event) {
      if ($event) {
        this.curDocReportMain.fromDate = $event.fromDate;
        this.curDocReportMain.toDate = $event.toDate;
      }
    }
}
