import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import { CoreService } from "../../../core/shared/core.service";
import { IncentiveBLService } from "../../shared/incentive.bl.service";
import { CommonFunctions } from "../../../shared/common.functions";


@Component({
  selector: 'incentive-itemgroup-summary',
  templateUrl: './incentive-item-group-summary.html'
})
export class INCTV_BIL_IncentiveItemGroupComponent {
  @Input("fromDate")
  public FromDate: string = "";
  @Input("toDate")
  public ToDate: string = "";
  @Input("referrerId")
  public employeeId: number = null;

  @Input("doctorName")
  public doctorName: string = "";

  public showReport: boolean = false;
  public allReportData: Array<any> = [];
  public currentDate: string = "";

  public summary = {
    tot_BilAmt: 0, tot_InctvAmt: 0, tot_TDSAmt: 0, tot_NetPayable: 0, total_Qty: 0
  };
  @Output("callback")
  callback: EventEmitter<Object> = new EventEmitter<Object>();
   

  constructor(
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public coreService: CoreService,
    public incentiveBLService: IncentiveBLService) {
    this.currentDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.LoadDocDeptItemSummary();


  }





  LoadDocDeptItemSummary() {
    //let srvDept = this.ServDeptName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
    this.dlService.Read("/BillingReports/INCTV_Doc_ItemGroupSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&employeeId=" + this.employeeId)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          if (data && data.Table1 && data.Table1[0]) {
            this.allReportData = data.Table1;
            this.allReportData.forEach(itm => {
              itm['NetPayableAmt'] = itm.TotalIncentiveAmount - itm.TotalTDSAmount;
            });

            this.showReport = true;

            this.CalculateSummaryAmounts(this.allReportData);

          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
          }
        }
      });
  }



  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Doctor Incentive Summary Details';
      let Heading = 'Doctor Incentive Summary Details';
      let filename = 'doctorIncentiveDetails';
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

  public CalculateSummaryAmounts(data) {
    //initailize to zero
    this.summary.tot_BilAmt = this.summary.tot_InctvAmt = this.summary.tot_TDSAmt = this.summary.tot_NetPayable = this.summary.total_Qty = 0;

    data.forEach(a => {
      this.summary.total_Qty += a.TotalQty;
      this.summary.tot_BilAmt += a.TotalBillAmt;
      this.summary.tot_InctvAmt += a.TotalIncentiveAmount;
      this.summary.tot_TDSAmt += a.TotalTDSAmount;
      this.summary.tot_NetPayable += a.NetPayableAmt;
    });
  }

  public CallBackDepts() {
    this.showReport = false;

    this.callback.emit({ showBillDocSummary: true });
  }

}

