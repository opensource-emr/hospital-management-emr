import { Component } from "@angular/core";
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { IGridFilterParameter } from "../../../shared/danphe-grid/grid-filter-parameter.interface";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";

@Component({
    selector: 'item-wise-wardsupply-report',
    templateUrl: './item-wise-wardsupply-report.component.html'
})
export class ItemWiseWardSupplyReportComponent {
    FromDate: string = null;
    ToDate: string = null;
    dateRange: string = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    ItemWiseWardSupplyData: ItemWiseWardSupply_VM[] = [];
    ItemWiseWardSupplyReportColumns: any;
    ItemList: { ItemId: number, ItemName: string }[] = [];
    ItemId: number = null;
    SelectedItem: { ItemId: number, ItemName: string };
    SubStoreList: { WardId: number, WardName: string }[] = [];
    SelectedWard: { WardId: number, WardName: string };
    WardId: number = null;
    ItemWiseWardSupplySummaryData: ItemWiseWardSupplySummary_VM[] = [];
    IsSummaryViewMode: boolean = false;
    ShowItemWiseWardSupplySummary: boolean = false;
    headerDetailParam: any;
    public total_SummaryView = { DispatchValue: 0, ConsumedValue: 0, BalanceValue: 0 }
    public ViewMode: string = "Summary View";
    loading: boolean = false;
    public FilterParameters: IGridFilterParameter[] = [];
    ItemName: string = null;
    WardName: string = null;


    constructor(public pharmacyBLService: PharmacyBLService, public messageBoxService: MessageboxService,
        public nepaliCalendarService: NepaliCalendarService, public securityService: SecurityService,
        public coreService: CoreService) {
        this.GetOnlyItemNameList();
        this.GetSubStores();
        this.GetOnlyItemNameList();
        this.GetPharmacyHeader()
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("IssueDate", false));
        this.ItemWiseWardSupplyReportColumns = PHRMReportsGridColumns.PHRMItemWiseWardSupplyReportColumns;

    }
    OnFromToDateChange($event): void {
        if ($event) {
            this.FromDate = $event.fromDate;
            this.ToDate = $event.toDate;
            this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
        }
    }

    gridExportOptions = {
        fileName: 'PharmacyItemWiseWardSupplyReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    public GetOnlyItemNameList(): void {
        this.pharmacyBLService.getOnlyItemNameList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.ItemList = res.Results;
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to load item list']);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to load item list' + err.ErrorMessage]);
                });
    }

    ItemListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }
    OnItemChange($event): void {
        if ($event && $event.ItemId > 0) {
            this.ItemId = this.SelectedItem.ItemId;
            this.ItemName = this.SelectedItem.ItemName;
        }
        else {
            this.ItemId = null;
        }
    }
    GetSubStores(): void {
        this.pharmacyBLService.GetSubStores().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.SubStoreList = res.Results;
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to load Sub Store List']);
            }
        }, err => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to load Sub Store List' + err.ErrorMessage]);
        });
    }
    SubStoreFormatter(data): string {
        return data['WardName'];
    }

    OnWardChange($event): void {
        if ($event && $event.WardId > 0) {
            this.WardId = this.SelectedWard.WardId;
            this.WardName = this.SelectedWard.WardName;
        }
        else {
            this.WardId = null;
        }
    }
    GetItemWiseWardSupplyReport(): void {
        if (!this.FromDate && !this.ToDate) {
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Select valid date']);
        }
        this.FilterParameters = [
            { DisplayName: "ItemName:", Value: this.ItemName == null ? 'All' : this.ItemName },
            { DisplayName: "WardName:", Value: this.WardName == undefined || null ? 'All' : this.WardName },
            { DisplayName: "DateRange:", Value: this.dateRange },
        ];
        this.pharmacyBLService.GetItemWiseWardSupplyReport(this.FromDate, this.ToDate, this.WardId, this.ItemId).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.ItemWiseWardSupplyData = res.Results.ItemWiseWardSupplyDetails;
                this.ItemWiseWardSupplySummaryData = res.Results.ItemWiseWardSupplySummary;
                if (this.ItemWiseWardSupplySummaryData && this.ItemWiseWardSupplySummaryData.length) {
                    this.ShowItemWiseWardSupplySummary = true;
                    this.total_SummaryView.DispatchValue = this.ItemWiseWardSupplySummaryData.reduce((a, b) => a + b.DispatchValue, 0);
                    this.total_SummaryView.ConsumedValue = this.ItemWiseWardSupplySummaryData.reduce((a, b) => a + b.ConsumedValue, 0);
                    this.total_SummaryView.BalanceValue = this.ItemWiseWardSupplySummaryData.reduce((a, b) => a + b.BalanceValue, 0);
                }
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get data']);
            }
        }, err => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get data' + err.ErrorMessage]);
        });
    }
    Print(idToBePrinted: string = "item-wise-ward-supply-summary-print-page") {
        var np_FromDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.FromDate);
        var np_ToDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.ToDate);
        let popupWinindow;
        let headerInnerHTML = document.getElementById("headerForPrint").innerHTML;
        var printContents = headerInnerHTML;
        printContents += `<b style="display:grid; place-items:center;">Item-wise Ward Supply Summary Report</b>`;
        printContents += `<b style="display:grid; place-items:center;">${this.FromDate} - ${this.ToDate} AD (${np_FromDate} - ${np_ToDate} BS)</b>`;
        printContents += document.getElementById(idToBePrinted).innerHTML;
        printContents += `<div style="display: flex; justify-content: space-between;">
                            <div>Printed By: ${this.securityService.GetLoggedInUser().UserName}</div>
                            <div>Printed On: ${moment().format('YYYY-MM-DD HH:mm')}</div>
                          </div>`
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        let documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }

    ExportToExcel(tableId) {
        if (tableId) {
            let workSheetName = 'User Collection Summary Report';

            var np_FromDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.FromDate);
            var np_ToDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.ToDate);


            let phrmReportHeaderString = `
                            <tr>
                              <td></td>
                              <td colspan="3" style="text-align:center;font-size:large;"><strong>${this.headerDetailParam.hospitalName}</strong></td>
                              <td></td>
                            </tr>

                             <tr>
                              <td></td>
                              <td colspan="3" style="text-align:center;font-size:small;"><strong>${this.headerDetailParam.address}</strong></td>
                              <td></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td colspan="3" style="text-align:center;font-size:small;"><strong>Department Of Pharmacy</strong></td>
                                <td style="text-align:left;"> Exported By : ${this.securityService.GetLoggedInUser().UserName}</td>
                            </tr>
                            <tr>
                                <td >Date Range: ${this.FromDate} - ${this.ToDate} AD (${np_FromDate} - ${np_ToDate} BS) </td>
                                <td colspan="3" style="text-align:center;font-size:small;"><strong>Item Wise Ward Supply Summary</strong></td>
                                <td style="text-align:left;"> Exported On : ${moment().format('YYYY-MM-DD HH:mm')}</td>
                            </tr>`;
            this.ConvertHTMLTableToExcel(tableId, workSheetName, "ItemWiseWardSupplySummaryReport", phrmReportHeaderString);
        }
    }
    public ConvertHTMLTableToExcel(table: any, SheetName: string, FileName: string, Heading: string) {
        try {
            if (table) {
                let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';

                let filename = (FileName.length > 0) ? FileName : 'Exported_Excel_File';
                filename = filename + '_' + moment().format('YYYYMMMDHHmmss') + '.xls';

                let uri = 'data:application/vnd.ms-excel;base64,'
                    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{Heading}{table}</table></body></html>'
                    , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
                    , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
                if (!table.nodeType) table = document.getElementById(table)
                var ctx = { worksheet: workSheetName, table: table.innerHTML, Heading: Heading }
                //return window.location.href = uri + base64(format(template, ctx))             
                var link = document.createElement('a');
                link.href = uri + base64(format(template, ctx));
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    GetPharmacyHeader() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "Pharmacy Receipt Header").ParameterValue;
        if (paramValue)
            this.headerDetailParam = JSON.parse(paramValue);
        else
            this.messageBoxService.showMessage("Failed", ["Error getting header parameters."]);
    }
    SwitchViews() {
        try {
            if (this.ItemWiseWardSupplySummaryData.length > 0) {
                let flag = (this.IsSummaryViewMode == true) ? false : true;
                this.IsSummaryViewMode = flag;
                this.ViewMode = (this.IsSummaryViewMode) ? "Show Detailed" : "Show Summary";
            }
        } catch (exception) {
            console.log(exception);
        }
    }
}

class ItemWiseWardSupply_VM {
    WardName: string;
    IssueNo: string;
    IssueDate: string;
    RequisitionNo: string;
    RequisitionDate: string;
    ItemCode: string;
    ItemName: string;
    ExpiryDate: string;
    BatchNo: string;
    Quantity: number;
    CostPrice: number;
    DispatchValue: number;
    SupplyBy: string;
    ReceivedBy: string;
    ConsumedQuantity: number;
    ConsumedValue: number;
    BalanceQuantity: number;
    BalanceValue: number;

}

class ItemWiseWardSupplySummary_VM {
    WardName: string;
    DispatchValue: number;
    ConsumedValue: number;
    BalanceValue: number;
}