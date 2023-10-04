import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  templateUrl: "./department-revenue-report.html"
})

export class RPT_BIL_DepartmentRevenueReportComponent {
    public fromDate: string;
    public toDate: string;
    public calType: string = "";
    public headerDetails: any = null;
    public reportData: any;
    public totalReportAmount: any;
    public departmentNameList: any;
    public departmentList: any;
    public displayData: Array<{ Name: string, SubTotal: number, Discount: number, Refund: number, NetTotal: number, Level: string, ShowChild: boolean }> = [];
    public rowData: any = [];
    public ServDeptView: boolean = false;
    public ItemView: boolean = false;

    constructor(
        public msgBoxServ: MessageboxService,
        public dlService: DLService,
        public coreService: CoreService,
        public changeDetector: ChangeDetectorRef) {
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
        this.LoadHeaderCalenderDetails();
    }
    //calendertypes and header from parameter table
    public LoadHeaderCalenderDetails() {
        let allParams = this.coreService.Parameters;
        if (allParams.length) {
            let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
            if (CalParms) {
                let Obj = JSON.parse(CalParms.ParameterValue);
                this.calType = Obj.DepartmentSummary;
            }
            let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
            if (HeaderParms) {
                this.headerDetails = JSON.parse(HeaderParms.ParameterValue);
            }
        }
    }

    //Load all Report Data of department
    LoadReportData() {
        if (this.CheckDateValidation()) {
          this.dlService.Read("/BillingReports/DepartmentRevenueReport?FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
                .map(res => res)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.reportData = [];
                        this.totalReportAmount = [];
                        this.displayData = [];
                        this.ServDeptView = false;
                        this.ItemView = false;
                        let data = JSON.parse(res.Results.JsonData);
                        if (data.ReportData.length > 0) {
                            this.reportData = data.ReportData;
                            this.totalReportAmount = CommonFunctions.getGrandTotalData(this.reportData)[0];
                            this.FormatDataToDisplay();
                        } else {
                            this.msgBoxServ.showMessage("error", ["Data not found!!"]);
                        }
                    }
                    else {
                        this.msgBoxServ.showMessage("error", ["Data not found!!"]);
                    }
                },
                    err => {
                        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                    });
        }
    }

    CheckDateValidation() {
        let currentDate = moment().format('YYYY-MM-DD');
        if (this.fromDate > currentDate || this.toDate > currentDate) {
            this.msgBoxServ.showMessage('error', ['Can\'t select future date.!']);
            return false;
        }
        if (this.fromDate > this.toDate) {
            this.msgBoxServ.showMessage('error', ['From date must be less than to date']);
            return false;
        }
        return true;
    }

    FormatDataToDisplay() {
        let subtotal = 0, discount = 0, refund = 0, nettotal = 0;
        this.displayData = [];

        //get department name list from report data
        this.departmentNameList = Array.from([new Set(this.reportData.map(i => i.DepartmentName))][0]);
        this.departmentNameList.forEach(deptname => {
            //get department data
            let deptData = this.reportData.filter(b => b.DepartmentName == deptname);
            this.rowData = [];
            subtotal = 0, discount = 0, refund = 0, nettotal = 0;
            //calculate total amount for department
            deptData.forEach(c => {
                subtotal += c.SubTotal;
                discount += c.Discount;
                refund += c.Refund;
                nettotal += c.NetTotal;
            });
            //adding department in display list
            this.rowData.Name = deptname;
            this.rowData.SubTotal = subtotal;
            this.rowData.Discount = discount;
            this.rowData.Refund = refund;
            this.rowData.NetTotal = nettotal;
            this.rowData.Level = "Department";
            this.rowData.ShowChild = true;
            this.displayData.push(this.rowData);

            //get service department name list for selected department
            let serDeptNameList = Array.from([new Set(deptData.map(i => i.ServiceDepartmentName))][0]);
            serDeptNameList.forEach(serdeptname => {
                //get service department data for selected department
                let servDeptData = deptData.filter(b => b.ServiceDepartmentName == serdeptname);
                this.rowData = [];
                subtotal = 0, discount = 0, refund = 0, nettotal = 0;
                //calculate total amount for service department
                servDeptData.forEach(c => {
                    subtotal += c.SubTotal;
                    discount += c.Discount;
                    refund += c.Refund;
                    nettotal += c.NetTotal;
                });
                //adding service department in dispaly list
                this.rowData.Name = serdeptname;
                this.rowData.SubTotal = subtotal;
                this.rowData.Discount = discount;
                this.rowData.Refund = refund;
                this.rowData.NetTotal = nettotal;
                this.rowData.Level = "ServiceDepartment";
                this.rowData.ShowChild = false;
                this.displayData.push(this.rowData);

                servDeptData.forEach(item => {
                    //adding item list for selected service department
                    this.rowData = [];
                    this.rowData.Name = item.ItemName;
                    this.rowData.SubTotal = item.SubTotal;
                    this.rowData.Discount = item.Discount;
                    this.rowData.Refund = item.Refund;
                    this.rowData.NetTotal = item.NetTotal;
                    this.rowData.Level = "Item";
                    this.rowData.ShowChild = false;
                    this.displayData.push(this.rowData);
                });
            });
        });
        //adding total in display list
        this.rowData = [];
        this.rowData.Name = "Grand Total";
        this.rowData.SubTotal = this.totalReportAmount.SubTotal;
        this.rowData.Discount = this.totalReportAmount.Discount;
        this.rowData.Refund = this.totalReportAmount.Refund;
        this.rowData.NetTotal = this.totalReportAmount.NetTotal;
        this.rowData.Level = "Total";
        this.rowData.ShowChild = true;
        this.displayData.push(this.rowData);
    }
    ShowChild(row) {
        let flag = 1;
        let parentflag = true;
        for (let i = 0; i < this.displayData.length; i++) {
            if (flag == 0) {
                if (row.Level == 'Department') {
                    if (this.displayData[i].Level == 'Department') {
                        break;
                    }
                    if (this.displayData[i].Level == 'ServiceDepartment') {
                        parentflag = this.displayData[i].ShowChild = (this.displayData[i].ShowChild == true) ? false : true;
                    }
                    if (this.displayData[i].Level == 'Item') {
                        if (parentflag == false) {
                            this.displayData[i].ShowChild = false;
                        }
                    }
                }
                if (row.Level == 'ServiceDepartment') {
                    if (this.displayData[i].Level == 'ServiceDepartment' || this.displayData[i].Level == 'Department') {
                        break;
                    }
                    this.displayData[i].ShowChild = (this.displayData[i].ShowChild == true) ? false : true;
                }
            }
            if (this.displayData[i] == row) {
                flag = 0;
            }
        }
    }
    DetailView(level) {
        for (let i = 0; i < this.displayData.length; i++) {
            if (level == 'Department') {
                if (this.displayData[i].Level == 'ServiceDepartment') {
                    this.displayData[i].ShowChild = this.ServDeptView;
                }
                if (this.displayData[i].Level == 'Item') {
                    if (this.ServDeptView == false) {
                        this.displayData[i].ShowChild = false;
                        this.ServDeptView = false;
                        this.ItemView = false;
                    }
                }
            }
            if (level == 'ServiceDepartment') {
                if (this.displayData[i].Level != 'Department') {
                    this.displayData[i].ShowChild = this.ItemView;
                    this.ServDeptView = this.ItemView;
                }
            }
        }
    }
    Print() {
        let popupWinindow;
        var printContents = '<b>Report Date Range: ' + this.fromDate + ' To ' + this.toDate + '</b>';
        printContents += '<span style="padding-left:40%;"> PrintDate: ' + moment().format('YYYY-MM-DD') + '</span><br />';
        printContents += '<h3 style = "text-align:center;"><b>Department Revenue Report</b></h3>';
        var headerContent = '<div class="col-md-12" style="padding:0px">';
        headerContent += '<div class="text-center bill-head col-md-12" style = "text-align:center;font-family:sans-serif;padding-top: 5px;">';
        headerContent += '<span style="font-size:20px;" > <strong>' + this.headerDetails.hospitalName + '</strong></span > <br />'
        headerContent += '<span style = "font-size:14px;">' + this.headerDetails.address + '</span><br / >'
        headerContent += '</div> </div>';

        printContents += document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        let documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '<style> table { border-collapse: collapse; border-color: black; } th { color:black; }</style>';
        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + headerContent + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }
    ExportToExcel(id) {
        if (id) {
            let workSheetName = 'Billing Department Revenue Report';
            let Heading = 'Billing Department Revenue Report';
            let filename = 'Billing Department Revenue Report';
            CommonFunctions.ConvertHTMLTableToExcel(id, this.fromDate, this.toDate, workSheetName, Heading, filename);
        }
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    //this.reportData.fromDate = this.fromDate;
    //this.reportData.toDate = this.toDate;
  }
}
