import { Component } from "@angular/core";
import { BillingFiscalYear } from "../../../billing/shared/billing-fiscalyear.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { InventoryReportsBLService } from "../shared/inventory-reports.bl.service";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CommonFunctions } from "../../../shared/common.functions";
@Component({
    templateUrl: './Vendor-transaction-report.html'
})
export class VendorTransactionReportComponent {

    public allFiscalYrs: Array<BillingFiscalYear> = [];
    public selFiscYrId: number = 2;
    public VendorList: any[] = [];
    public VendorId: number = null;
    public VendorTransactionList: Array<any> = new Array<any>();
    public VendorTransactionData: Array<any> = new Array<any>();
    public CurrentVendor = { VendorName: '', VendorId: 0, CreatedOn: '', SelectedVendor: '' };
    VedorTransactionReportColumns: Array<any> = null;
    public showTransactionDetails: boolean = false;
    public VendorDetails = { VendorName: '', VendorId: 0, FiscalYear: '', StartDate:'', EndDate:'' };
    public TotalDetails = { 
                                Sum_Sales_SubTotal: 0,
                                Sum_Sales_VatAmount: 0,
                                Sum_Sales_DiscountAmount: 0,
                                Sum_Sales_TotalAmount: 0,
                                Sum_Ret_SubTotal: 0,
                                Sum_Ret_VatAmount: 0,
                                Sum_Ret_DiscountAmount: 0,
                                Sum_Ret_TotalAmount: 0,
                                Sum_Total: 0
                          };

    constructor(public inventoryReportBLService: InventoryReportsBLService,
        public inventoryService: InventoryBLService,
        public reportServ: ReportingService,
        public msgBoxServ: MessageboxService) {
        this.VedorTransactionReportColumns = this.reportServ.reportGridCols.VedorTransactionReport;
        this.GetAllFiscalYrs();
        this.SetCurrentFiscalYear();
        this.LoadVendorList();

    }
    LoadVendorList(): void {
        this.inventoryService.GetVendorList()
            .subscribe(res => {
                this.CallBackGetVendorList(res)
            },
                err => {
                    this.msgBoxServ.showMessage("failed", [err]);
                });

    }
    CallBackGetVendorList(res) {
        if (res.Status == 'OK') {
            this.VendorList = [];
            if (res.Results.length > 0) {
                res.Results.forEach(a => {
                    this.VendorList.push({
                        "VendorId": a.VendorId, "VendorName": a.VendorName, StandardRate: a.StandardRate, VAT: a.VAT
                    });
                });
            }
            else {
                this.msgBoxServ.showMessage("notice", ['Empty vendor list']);
            }
        }
    }
    public myListFormatter(data: any): string {
        let html = data["VendorName"];
        return html;
    }
    SelectVendorFromSearchBox(Vendor) {
        this.CurrentVendor.VendorId = Vendor.VendorId;
    }
    checkVndorchanged(Vendor) {
        (Vendor != "") ? this.CurrentVendor.VendorId = Vendor.VendorId : this.CurrentVendor.VendorId = 0;
    }
    GetAllFiscalYrs() {
        this.inventoryReportBLService.GetAllFiscalYears()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allFiscalYrs = res.Results;
                }
            });
    }

    SetCurrentFiscalYear() {
        this.inventoryReportBLService.GetCurrentFiscalYear()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    let fiscYr: BillingFiscalYear = res.Results;
                    if (fiscYr) {
                        this.selFiscYrId = fiscYr.FiscalYearId;
                    }
                }
            });
    }

    //
    showDetails() {
        if (this.selFiscYrId > 0) {
            this.inventoryReportBLService.showVendorTrasactionDetails(this.selFiscYrId, this.CurrentVendor.VendorId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        if (res.Results.length > 0) {
                            this.VendorTransactionList = res.Results;
                            this.VendorTransactionList.forEach(itm => {
                                itm.FiscalYearName = this.allFiscalYrs.find(a => a.FiscalYearId == itm.FiscalYearId).FiscalYearName;
                                itm.VendorName = this.VendorList.find(v => v.VendorId == itm.VendorId).VendorName;
                            })
                        }
                        else {
                            this.msgBoxServ.showMessage("notice", ['No Records']);
                            this.VendorTransactionList = new Array<any>();
                        }


                    }
                });
        }
        else {

        }

    }

    TransactionGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "view": {
                var data = $event.Data;
                this.showTransactionDetails = true;
                this.GetVendorTransactionDetails(data);
            }
            default:
                break;
        }
    }
    backbutton() {
        this.showTransactionDetails = false;
    }

    GetVendorTransactionDetails(data) {
        if (data != null) {

            this.VendorDetails.VendorName = this.VendorList.find(v=>v.VendorId == data.VendorId).VendorName;
            this.VendorDetails.FiscalYear = this.allFiscalYrs.find(f=>f.FiscalYearId == this.selFiscYrId).FiscalYearName;
            this.VendorDetails.StartDate = this.allFiscalYrs.find(f=>f.FiscalYearId == this.selFiscYrId).StartYear;
            this.VendorDetails.EndDate = this.allFiscalYrs.find(f=>f.FiscalYearId == this.selFiscYrId).EndYear;

            this.inventoryReportBLService.showVendorTrasactionData(this.selFiscYrId, data.VendorId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        if (res.Results.length > 0) {
                            this.VendorTransactionData = res.Results;
                            this.TotalSum(this.VendorTransactionData);
                        }
                        else {
                            this.msgBoxServ.showMessage("notice", ['No Records']);
                            this.VendorTransactionData = new Array<any>();
                        }

                    }
                });
        }
    }

 TotalSum(VendorTransactionData){

    let sales = VendorTransactionData;
    this.TotalDetails.Sum_Sales_SubTotal = sales.reduce(function (acc, obj) { return acc + obj.Sales_SubTotal; }, 0);
    this.TotalDetails.Sum_Sales_VatAmount = sales.reduce(function (acc, obj) { return acc + obj.Sales_VatAmount; }, 0);
    this.TotalDetails.Sum_Sales_DiscountAmount = sales.reduce(function (acc, obj) { return acc + obj.Sales_DiscountAmount; }, 0);  
    this.TotalDetails.Sum_Sales_TotalAmount = sales.reduce(function (acc, obj) { return acc + obj.Sales_TotalAmount; }, 0);
    this.TotalDetails.Sum_Ret_SubTotal = sales.reduce(function (acc, obj) { return acc + obj.Ret_SubTotal; }, 0);
    this.TotalDetails.Sum_Ret_VatAmount = sales.reduce(function (acc, obj) { return acc + obj.Ret_VATTotal; }, 0);
    this.TotalDetails.Sum_Ret_DiscountAmount = sales.reduce(function (acc, obj) { return acc + obj.Ret_DiscountAmount; }, 0);
    this.TotalDetails.Sum_Ret_TotalAmount = sales.reduce(function (acc, obj) { return acc + obj.Ret_TotalAmount; }, 0);  
    this.TotalDetails.Sum_Total = (this.TotalDetails.Sum_Sales_TotalAmount) - (this.TotalDetails.Sum_Ret_TotalAmount);

 }
  Print() {
    let popupWinindow;
    var headerContent = document.getElementById("headerForPrint").innerHTML;
    var printContents = '<style> table { border-collapse: collapse; border-color: black; } th { color:black; background-color: #599be0; } </style>';
    printContents += document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + headerContent + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Vendor Transaction Details';
      let Heading = 'Vendor Transaction Details';
      let filename = 'VendorTransactionDetails';
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.VendorDetails.StartDate, this.VendorDetails.EndDate, workSheetName,
        Heading, filename);
    }
  }

}
