import { Component } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { CommonFunctions } from "../../../shared/common.functions";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../../core/shared/core.service";
import { ActivateInventoryService } from "../../../shared/activate-inventory/activate-inventory.service";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { InventoryService } from "../../shared/inventory.service";
import { PurchaseRequestModel } from "../../shared/purchase-request.model";
import { ItemModel } from "../../settings/shared/item.model";
@Component({
  templateUrl: './inv-purchase-items-summary.html'
})

export class INVPurchaseItemsSummeryReport {
  InventoryPurchaseItemsReportColumns: Array<any> = new Array<any>();
  InventoryPurchaseItemsReportData: Array<any> = new Array<any>();
  PurchaseItemsReportData: Array<any> = new Array<any>();
  public FromDate: string = null;
  public ToDate: string = null;
  public summaryOfReport: Array<PurchaseItemSummaryReportSummaryModel> = new Array<PurchaseItemSummaryReportSummaryModel>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public dateRange: any;
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  public selecteditemIds: string = null;
  public selectedItem:any;
  public ItemId:number=null;
  public loading: boolean = false;
  constructor(public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService, public nepCalendarService: NepaliCalendarService, public coreService: CoreService,
 public inventoryblService:InventoryBLService,public inventoryService:InventoryService) {
    this.InventoryPurchaseItemsReportColumns = this.reportServ.reportGridCols.InventoryPurchaseItemsReport;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Dates', false));
    this.LoadItemList();
  }

  public validDate: boolean = true;
  public fiscalYearId: number = 0;
  selectDate(event) {
    if (event) {
      this.FromDate = event.fromDate;
      this.ToDate = event.toDate;
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
    }
    else {
      this.validDate = false;
    }
  }

    PurchaseItemsReport() {
        this.loading = true;
  if (this.selectedItem && this.selecteditemIds.length >0){
    this.inventoryBLService.PurchaseItemsReport(this.FromDate, this.ToDate, this.fiscalYearId,this.selecteditemIds)
      .map(res => res)
      .subscribe(
        res => this.Success(res),
        res => this.Error(res)
     
      );
    }
    else {
      this.msgBoxServ.showMessage("Warn", ['Please select Item']);
    }
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
    this.loading = false;
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.PurchaseItemsReportData = res.Results;
      this.InventoryPurchaseItemsReportData = this.PurchaseItemsReportData.filter(p => p.ItemType == this.ItemType);
      this.SummaryCalculation();
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
    this.loading = false;

  }
  public ItemType: string = "Consumables";
  OnItemTypeChange() {
    if (this.ItemType == "Consumables") {
      this.InventoryPurchaseItemsReportData = this.PurchaseItemsReportData.filter(p => p.ItemType == "Consumables");
      this.InventoryPurchaseItemsReportData = this.PurchaseItemsReportData.filter(p=>p.ItemType = this.selectedItem.ItemType);
    }
    else if (this.ItemType == "CapitalGoods") {
      this.InventoryPurchaseItemsReportData = this.PurchaseItemsReportData.filter(p => p.ItemType == "Capital Goods");
      this.InventoryPurchaseItemsReportData = this.PurchaseItemsReportData.filter(p=>p.ItemType = this.selectedItem.ItemType);
    }
    this.SummaryCalculation();
  }
  SummaryCalculation() {
    this.summaryOfReport = new Array<PurchaseItemSummaryReportSummaryModel>();
    if (this.InventoryPurchaseItemsReportData.length > 0) {
      var grandTotal = CommonFunctions.getGrandTotalData(this.InventoryPurchaseItemsReportData);
      let modelData = new PurchaseItemSummaryReportSummaryModel()
      modelData.TotalQty = grandTotal[0].TotalQty;
      modelData.SubTotal = grandTotal[0].SubTotal;
      modelData.Discount = grandTotal[0].DiscountAmount;
      modelData.VAT = grandTotal[0].VATAmount;
      modelData.TotalAmount = grandTotal[0].TotalAmount;
      this.summaryOfReport.push(modelData);
    } else {
      let modelData = new PurchaseItemSummaryReportSummaryModel()
      this.summaryOfReport.push(modelData);
    }
  }
  public datePreference: string = "np";
  Print(printId: string) {

    this.datePreference = this.coreService.DatePreference;
    let fromDate_string: string = "";
    let toDate_string: string = "";
    let calendarType: string = "BS";
    if (this.datePreference == "en") {
      fromDate_string = moment(this.FromDate).format("YYYY-MM-DD");
      toDate_string = moment(this.ToDate).format("YYYY-MM-DD");
      calendarType = "(AD)";
    }
    else {
      fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.FromDate, "YYYY-MM-DD");
      toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.ToDate, "YYYY-MM-DD");
      calendarType = "(BS)";
    }

    let popupWinindow;
    var printContents = '<b>Date Range' + calendarType + ':  From:' + fromDate_string + '  To:' + toDate_string + '</b>';
    printContents += document.getElementById(printId).innerHTML;
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
  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'PurchaseItemsSummary-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["Dates", "GoodsReceiptDate", "VendorName", "VendorContact",
        "SubCategoryName", "ItemName", "TotalQty", "ItemRate", "SubTotal", "DiscountAmount", "VATAmount", "TotalAmount",
        "BatchNO", "MRP", "ItemType"]
    };
    return gridExportOptions;
  }
  
  LoadItemList(): void {
    this.itemList = this.inventoryService.allItemList;
    this.itemList = this.itemList.filter(item => item.IsActive == true && item.ItemType == this.ItemType);
    if (this.itemList == undefined || this.itemList.length == 0) {
      this.msgBoxServ.showMessage("failed", [
        "failed to get Item.. please check log for details."
      ]);
    }
  }
  
  onChange($event) {
    let x = $event;
    this.selectedItem = $event;
    this.selecteditemIds = this.selectedItem.map(({ ItemId }) => ItemId).toString();
 
  }

ItemListFormatter(data: any): string {
  return data["ItemName"];
}
}
class PurchaseItemSummaryReportSummaryModel {
  public TotalQty: number = 0;
  public SubTotal: number = 0;
  public Discount: number = 0;
  public VAT: number = 0;
  public TotalAmount: number = 0;
}