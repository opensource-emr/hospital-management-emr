import { Component, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { BillingGridColumnSettings } from "../../shared/billing-grid-columns";
import { BillingBLService } from "../../shared/billing.bl.service";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  templateUrl: './bill-dailycollectionVsHandover-reports.html'
})
export class BillingDailyCollectionVsHandoverReportComponent {

  public FromDate: string = null;
  public ToDate: string = null;
  public dateRange: string = '';
  public footer: any = null;
  public DailyCollectionVsHandoverReportGridColumns: Array<any> = [];
  public DailyCollectionVsHandoverReportList: Array<any> = [];
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public NepaliDateInGridSettingsForHandoverDetail: NepaliDateInGridParams = new NepaliDateInGridParams();

  public showHandoverDetail: boolean = false;
  public HandoverDetailReportGridColumns: Array<any> = [];
  public HandoverDetailReportList: Array<any> = [];
  public summaryData: Array<any> = [];
  public billing: string = "billing";
  public summaryOfTotal = { "TotalCollection": 0, "TotalHandover": 0, "TotalDueAmount": 0 };

  constructor(public billingBLService: BillingBLService,
    public dLService: DLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public nepaliCalendarService:NepaliCalendarService,
    public securityService:SecurityService) {
    this.DailyCollectionVsHandoverReportGridColumns = BillingGridColumnSettings.DailyCollectionVsHandoverReportList;
    this.HandoverDetailReportGridColumns = BillingGridColumnSettings.HandoverDetailReportList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Date', false));
    this.NepaliDateInGridSettingsForHandoverDetail.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ReceivedOn', true));
    this.FromDate = moment().format('YYYY-MM-DD');
    this.ToDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {
    //this.loadDailyCollectionVsHandoverReport();
  }
  ngAfterViewChecked() {
    var myElement = document.getElementById("summaryFooter");
    if (myElement) {
      this.footer = document.getElementById("summaryFooter").innerHTML;
    }

  }

  loadDailyCollectionVsHandoverReport() {
    if (this.FromDate && this.ToDate && (moment(this.FromDate).isBefore(this.ToDate) || moment(this.FromDate).isSame(this.ToDate))) {
      this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
      this.summaryData = [];
      this.billingBLService.GetDailyCollectionVsHandoverReport(this.FromDate, this.ToDate)
        .subscribe(
          res => {
            if (res.Status == "OK") {

              this.DailyCollectionVsHandoverReportList = res.Results
              this.getSummary(res.Results);

            }
            else {
              this.msgBoxServ.showMessage("failed", ["Something Wrong."]);
              console.log(res.ErrorMessage);
            }
          });
    }
  }


  //   getSummary(data:any){
  //     let filteredData = data.filter(a=>(a.CollectionTillDate !=0 || a.HandoverTillDate!=0));
  // var result = [];
  //     this.summaryData = filteredData.reduce((acc,currVal) => {
  //       if(acc.hasOwnProperty(currVal.EmployeeId)){
  //         acc[currVal.EmployeeId].CollectionTillDate += currVal.CollectionTillDate;
  //         acc[currVal.EmployeeId].HandoverTillDate +=currVal.HandoverTillDate;
  //         acc[currVal.EmployeeId].DueAmount +=currVal.DueAmount;
  //       } else{
  //         acc[currVal.EmployeeId] = currVal;
  //         result.push(acc[currVal.EmployeeId]);
  //       }
  //       return acc;
  //   },{});
  // let aa = result;
  //   }

  getSummary(data: any) {
    let filteredData = data.filter(a => (a.CollectionTillDate != 0 || a.HandoverTillDate != 0));
    var result = [];
    this.summaryData = [];
    var acc = {};

    this.summaryOfTotal.TotalCollection = 0;
    this.summaryOfTotal.TotalDueAmount = 0;
    this.summaryOfTotal.TotalHandover = 0;

    filteredData.forEach(currVal => {

      this.summaryOfTotal.TotalCollection += (+currVal.CollectionTillDate);
      this.summaryOfTotal.TotalDueAmount += (+currVal.DueAmount);
      this.summaryOfTotal.TotalHandover += (+currVal.HandoverTillDate);

      if (acc.hasOwnProperty(currVal.EmployeeId)) {
        acc[currVal.EmployeeId].CollectionTillDate += currVal.CollectionTillDate;
        acc[currVal.EmployeeId].HandoverTillDate += currVal.HandoverTillDate;
        acc[currVal.EmployeeId].DueAmount += currVal.DueAmount;
      } else {
        acc[currVal.EmployeeId] = Object.assign({}, currVal);
        result.push(acc[currVal.EmployeeId]);
      }

    });


    this.summaryData = result;
  }


  OnDateRangeChange($event) {
    if ($event) {
      this.FromDate = $event.fromDate;
      this.ToDate = $event.toDate;
    }
    //this.loadDailyCollectionVsHandoverReport();
  }

  gridExportOptions = {
    fileName: 'BillingDailyCollectionVsHandoverReport_' + moment().format('YYYY-MM-DD') + '.xls'
  };


  DailyCollectionVsHandoverListGridActions($event) {
    switch ($event.Action) {
      case "view-detail":
        {
          var aa = $event.Data;
          this.loadHandoverDetailReport(aa.Date, aa.EmployeeId);
          console.log($event);
        }
        break;

      default:
        break;
    }
  }

  loadHandoverDetailReport(date, employeeId) {
    this.billingBLService.loadHandoverDetailReport(date, date, employeeId)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            console.log(res.Results);
            this.HandoverDetailReportList = res.Results;
            if (this.HandoverDetailReportList && this.HandoverDetailReportList.length > 0) {
              this.showHandoverDetail = true;
            }
            else {
              this.showHandoverDetail = false;
              this.msgBoxServ.showMessage("failed", ["Handover Detail not found."]);
            }
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Something Wrong."]);
            console.log(res.ErrorMessage);
          }
        });
  }

  CloseHandoverDetail() {
    this.showHandoverDetail = false;
  }

  HandoverDetailgridExportOptions = {
    fileName: 'BillingHandoverDetailReport_' + moment().format('YYYY-MM-DD') + '.xls'
  };

  PrintSummary(){
    let popupWindow;
    let headerContent = {"hospitalName":"Danphe Health Pvt. Ltd", "address":"Dillibazar, Kathmandu, Nepal","email":"info@danphehealth.com","tel":"01-430363/4416468"};
    let customerHeader = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
    if(customerHeader){
      headerContent = JSON.parse(customerHeader.ParameterValue);
    }
    let hospitalName = headerContent.hospitalName;
    let address = headerContent.address;
    let tel = headerContent.tel;
    
    let Header = '<div class = "form-group" style="text-align:center; font-size:large;"><div>'+hospitalName+'</div><div>' + address +'</div></div>';
    let fromDateNepali = this.nepaliCalendarService.ConvertEngToNepDateString(this.FromDate);
    let toDateNepali = this.nepaliCalendarService.ConvertEngToNepDateString(this.ToDate);
    let printedOnNepaliDate = this.nepaliCalendarService.ConvertEngToNepDateString(moment().format('YYYY-MM-DD'));
    let dates = `<div>
    <div style= "margin-left:20px;"><b>Date Range:</b>&nbsp;` + this.FromDate + `&nbsp;to&nbsp;` + this.ToDate+`&nbsp;(`+fromDateNepali + `&nbsp;to&nbsp;`+toDateNepali+`)</div>`;

    let reportHdr =  `<h4 style="font-weight:bold;text-align: center;">
                      Collection vs Handover Summary Report</h4>`

    let printedOn = '<div style = "margin-left:20px;float: left;"><b>Printed On:</b> '+ moment().format('YYYY-MM-DD') + '('+printedOnNepaliDate+')&nbsp;'+moment().format('hh:mm:ss A')+'</span></div>';
    let printedBy = '<div style="float:right; margin-right:20px"><b> Printed By:</b> '+this.securityService.loggedInUser.Employee.FullName+'</div>';
    let printContents = Header + reportHdr + dates + document.getElementById("summaryFooter").innerHTML + printedBy + printedOn;

    popupWindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWindow.document.write(documentContent);
    popupWindow.document.close();
  }
}
