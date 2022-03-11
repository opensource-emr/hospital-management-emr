import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  selector: 'referral-summary',
  templateUrl: './bill-referral-summary.html'
})
export class RPT_BIL_ReferralSummaryComponent {
  @Input("fromDate")
  public FromDate: string = "";
  @Input("toDate")
  public ToDate: string = "";
  @Input("isExternal")
  public isExternal: boolean = false;

  public reportData: Array<any> = [];
  public selReferrerId: number = null;
  public showBillRefSummary: boolean = false;
  public showItemSummary: boolean = false;
  public summary = {
    tot_SubTotal: 0, tot_Discount: 0, tot_Refund: 0, tot_Provisional: 0,
    tot_Cancel: 0, tot_Credit: 0, tot_NetTotal: 0, tot_SalesTotal: 0, tot_CashCollection: 0, tot_CreditReceived: 0, tot_DepositReceived: 0, tot_DepositRefund: 0
  };
  public currentDate: string = "";
  public headerDetail:any=null;
  public headerProperties:any;

  constructor(
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public coreService: CoreService,
    public changeDetector: ChangeDetectorRef) {
    this.currentDate = moment().format('YYYY-MM-DD');
    this.LoadHeaderDetailsCalenderTypes();
   
    //this.loadDocSummary();
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
    this.loadRefSummary();
  }

  public loadRefSummary() {
    this.dlService.Read("/BillingReports/Bill_ReferralSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&isExternal=" + this.isExternal)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          if (data.ReportData.length > 0) {
            this.reportData = data.ReportData;
            //parsing figures
            this.reportData.forEach(itm => {
              itm.SubTotal = CommonFunctions.parseAmount(itm.SubTotal);
              itm.Discount = CommonFunctions.parseAmount(itm.Discount);
              itm.Refund = CommonFunctions.parseAmount(itm.Refund);
              itm.NetTotal = CommonFunctions.parseAmount(itm.NetTotal);
            });
            this.CalculateSummaryAmounts(this.reportData);
            //this.summary.tot_Credit = CommonFunctions.parseAmount(data.Summary[0].CreditAmount);
            this.summary.tot_Cancel = CommonFunctions.parseAmount(data.Summary[0].CancelledAmount);
            this.summary.tot_Provisional = CommonFunctions.parseAmount(data.Summary[0].ProvisionalAmount);
            this.summary.tot_DepositReceived = CommonFunctions.parseAmount(data.Summary[0].AdvanceReceived);
            this.summary.tot_DepositRefund = CommonFunctions.parseAmount(data.Summary[0].AdvanceSettled);
            // this.summary.tot_SalesTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);

            this.summary.tot_CashCollection = CommonFunctions.parseAmount(this.summary.tot_NetTotal + data.Summary[0].AdvanceReceived - data.Summary[0].AdvanceSettled - this.summary.tot_Credit + this.summary.tot_CreditReceived);
            this.showBillRefSummary = true;

          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['No Data is Available for Selected Parameters...']);
            this.showBillRefSummary = false;
          }
        }
      });
  }

  LoadHeaderDetailsCalenderTypes() {
    let allParams = this.coreService.Parameters;
    if (allParams.length) {
   
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
        let header = allParams.find(a => a.ParameterGroupName == 'BillingReport' && a.ParameterName == 'TableExportSetting');
        if(header){
          this.headerProperties = JSON.parse(header.ParameterValue)["ReferralMain"];
        }
      }
    }
  }
  // public ExportToExcelRefSummary() {
  //   this.dlService.ReadExcel("/ReportingNew/ExportToExcelRefSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate)
  //     .map(res => res)
  //     .subscribe(data => {
  //       let blob = data;
  //       let a = document.createElement("a");
  //       a.href = URL.createObjectURL(blob);
  //       a.download = "ReferralSummaryReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
  //       document.body.appendChild(a);
  //       a.click();
  //     },
  //       err => this.ErrorMsg(err));
  // }

  ExportToExcelRefSummary(tableId){
    if(tableId){
      let workSheetName = 'Bill Referral Report';
      //let Heading = 'BILL REFERAL REPORT';
      let filename = 'BillREferralReport';
      var Heading;
      var phoneNumber;
      var hospitalName;
      var address;
      if(this.headerProperties.HeaderTitle!=null){
        Heading = this.headerProperties.HeaderTitle;
      }else{
        Heading = 'BILL REFERAL REPORT';
      }

      if(this.headerProperties.ShowHeader == true){
         hospitalName = this.headerDetail.hospitalName;
         address = this.headerDetail.address;
      }else{
        hospitalName = null;
        address = null;
      }

      if(this.headerProperties.ShowPhone == true){
        phoneNumber = this.headerDetail.tel; 
      }else{
        phoneNumber = null;
      }
      // let hospitalName = this.headerDetail.hospitalName;
      // let address = this.headerDetail.address;
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcelForBilling(tableId, this.FromDate, this.ToDate, workSheetName,
        Heading, filename, hospitalName,address,phoneNumber,this.headerProperties.ShowHeader,this.headerProperties.ShowDateRange);
    }
  }

  public ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  public loadRefDepts(row) {
    this.selReferrerId = row.ReferrerId;
    this.showItemSummary = true;
    this.showBillRefSummary = false;
    
  }

  public CalculateSummaryAmounts(data) {
    //initailize to zero
    this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_Refund = this.summary.tot_NetTotal = this.summary.tot_Credit = this.summary.tot_Provisional = this.summary.tot_Cancel = 0;

    data.forEach(a => {
      this.summary.tot_SubTotal += a.SubTotal;
      this.summary.tot_Discount += a.Discount;
      this.summary.tot_Refund += a.Refund;
      this.summary.tot_NetTotal += a.NetTotal;
      this.summary.tot_Credit += a.CreditAmount;
      this.summary.tot_CreditReceived += a.CreditReceivedAmount;
    });

    this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
    this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
    this.summary.tot_Refund = CommonFunctions.parseAmount(this.summary.tot_Refund);
    this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
  }



  public CallBackRefDept() {
    this.showItemSummary = false;
    this.showBillRefSummary = true;
    this.changeDetector.detectChanges();
  }
}
