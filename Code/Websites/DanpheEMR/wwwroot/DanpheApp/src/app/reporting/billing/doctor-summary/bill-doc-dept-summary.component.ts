import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";
@Component({
    selector: 'rpt-bill-doc-dept-summary',
    templateUrl: './bill-doc-dept-summary.html'
})
export class RPT_BIL_DocDeptSummaryComponent {
    @Input("fromDate")
    public FromDate: string = "";
    @Input("toDate")
    public ToDate: string = "";
    @Input("providerId")
    public ProviderId: number = null;
    public showBillDocDeptSummaryReport: boolean = false;
    public reportData: Array<any> = [];
    public showItemLevelReport: boolean = false;
    public selServDeptName: string = "";
    public summary = {
        tot_Quantity: 0, tot_SubTotal: 0, tot_Discount: 0, tot_Refund: 0, tot_TotalAmount: 0,
        tot_NetTotal: 0, tot_Provisional: 0, tot_Credit: 0, tot_Cancel: 0, tot_SalesTotal: 0, tot_CashCollection: 0
    };
    @Output("callbackdocs")
    callbackdocs: EventEmitter<Object> = new EventEmitter<Object>();
    @Input("showBackButton")
    public showBackBtn: boolean = false;
    public currentDate: string = "";
    public headerDetail:any;
    public headerProperties:any;

    constructor(
        public msgBoxServ: MessageboxService,
        public dlService: DLService,
        public coreService: CoreService,
        public changeDetector: ChangeDetectorRef) {
        this.currentDate = moment().format('YYYY-MM-DD');
        this.LoadHeaderDetailsCalenderTypes();
    }
    @Input("showDocDeptSummary")
    public set value(val: boolean) {
        if (val) {
            this.loadDocDeptSummary();
        }
        else
            this.showBillDocDeptSummaryReport = false;
    }

    public loadDocDeptSummary() {
        this.dlService.Read("/BillingReports/BillDocDeptSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&ProviderId=" + this.ProviderId)
            .map(res => res)
            .subscribe(res => {
                if (res.Status == "OK") {
                    let data = JSON.parse(res.Results.JsonData);
                    if (data.ReportData.length > 0) {
                        this.reportData = data.ReportData;
                        this.reportData.forEach(itm => {
                            itm.SubTotal = CommonFunctions.parseAmount(itm.SubTotal);
                            itm.DiscountAmount = CommonFunctions.parseAmount(itm.DiscountAmount);
                            itm.ReturnAmount = CommonFunctions.parseAmount(itm.ReturnAmount);
                            itm.NetSales = CommonFunctions.parseAmount(itm.NetSales);
                            itm.Quantity = CommonFunctions.parseAmount(itm.Quantity);
                            itm.TotalAmount = CommonFunctions.parseAmount(itm.TotalAmount);
                        });
                        this.CalculateSummaryAmounts(this.reportData);
                        this.summary.tot_Provisional = CommonFunctions.parseAmount(data.Summary[0].ProvisionalAmount);
                        //this.summary.tot_Credit = CommonFunctions.parseAmount(data.Summary[0].CreditAmount);
                        this.summary.tot_Cancel = CommonFunctions.parseAmount(data.Summary[0].CancelledAmount);
                        this.summary.tot_SalesTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
                        this.summary.tot_CashCollection = CommonFunctions.parseAmount(this.summary.tot_NetTotal - this.summary.tot_Credit);


                        this.showBillDocDeptSummaryReport = true;
                    }
                    else {
                        this.msgBoxServ.showMessage("notice-message", ['No Data is Available for Selected Parameters...']);
                    }
                }
            });
    }

    // public ExportToExcelDocDeptSummary() {
    //     this.dlService.ReadExcel("/ReportingNew/ExportToExcelBilDocDeptSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&ProviderId=" + this.ProviderId)
    //         .map(res => res)
    //         .subscribe(data => {
    //             let blob = data;
    //             let a = document.createElement("a");
    //             a.href = URL.createObjectURL(blob);
    //             a.download = "BilDocDeptSummaryReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
    //             document.body.appendChild(a);
    //             a.click();
    //         },
    //             err => this.ErrorMsg(err));
    // }

    LoadHeaderDetailsCalenderTypes() {
        let allParams = this.coreService.Parameters;
        if (allParams.length) {
          let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
          if (HeaderParms) {
            this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
            let header = allParams.find(a => a.ParameterGroupName == 'BillingReport' && a.ParameterName == 'TableExportSetting');
            if(header){
                this.headerProperties = JSON.parse(header.ParameterValue)["DoctorSummary"];
            }
          }
        }
      }

    public ExportToExcelDocDeptSummary(tableId){
        if(tableId){
            let workSheetName = 'Doctor Department Summary Report';
            //let Heading = 'DOCTOR DEPARTMENT SUMMARY REPORT';
            let filename = 'DoctorDepartmentSummaryReport';
            var Heading;
            var phoneNumber;
            var hospitalName;
            var address;
            if(this.headerProperties.HeaderTitle!=null){
              Heading = this.headerProperties.HeaderTitle;
            }else{
              Heading = 'DOCTOR DEPARTMENT SUMMARY REPORT';
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

    public loadDocDeptItems(row) {
        this.selServDeptName = row.ServiceDepartment;
        this.showItemLevelReport = true;
        this.showBillDocDeptSummaryReport = false;
        this.changeDetector.detectChanges();
    }
    public loadAllDocDeptItems() {
        this.selServDeptName = "";
        this.showItemLevelReport = true;
        this.showBillDocDeptSummaryReport = false;
        this.changeDetector.detectChanges();
    }

    public CalculateSummaryAmounts(data) {
        //initailize to zero
        this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_Refund = this.summary.tot_NetTotal = this.summary.tot_TotalAmount = this.summary.tot_Quantity = 0;

        data.forEach(a => {
            this.summary.tot_SubTotal += a.SubTotal;
            this.summary.tot_Discount += a.DiscountAmount;
            this.summary.tot_Refund += a.ReturnAmount;
            this.summary.tot_NetTotal += a.NetSales;
            this.summary.tot_Quantity += a.Quantity;
            this.summary.tot_TotalAmount += a.TotalAmount;

            this.summary.tot_Credit += a.CreditAmount;
            //this.summary.tot_CreditReceived += a.CreditReceivedAmount;
        });

        this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
        this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
        this.summary.tot_Refund = CommonFunctions.parseAmount(this.summary.tot_Refund);
        this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
        this.summary.tot_Quantity = CommonFunctions.parseAmount(this.summary.tot_Quantity);
        this.summary.tot_TotalAmount = CommonFunctions.parseAmount(this.summary.tot_TotalAmount);
        this.summary.tot_Credit = CommonFunctions.parseAmount(this.summary.tot_Credit);
    }

    public CallBackDocDept() {
        this.showItemLevelReport = false;
        this.showBillDocDeptSummaryReport = true;
        this.changeDetector.detectChanges();
    }

    public CallBackDocs() {
        this.callbackdocs.emit();
    }
}
