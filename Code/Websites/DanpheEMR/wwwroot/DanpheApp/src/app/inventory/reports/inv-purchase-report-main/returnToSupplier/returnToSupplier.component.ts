import { ChangeDetectorRef, Component } from "@angular/core";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { InventoryReportsBLService } from "../../shared/inventory-reports.bl.service";
import { ReportingService } from "../../../../reporting/shared/reporting-service";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { NepaliCalendarService } from "../../../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../../../core/shared/core.service";
import { VendorMaster } from "../../../shared/vendor-master.model";
import { InventoryService } from "../../../shared/inventory.service";
import { ItemModel } from "../../../../accounting/settings/shared/item.model";

@Component({
  templateUrl: "./returnToSupplier.component.html"
})
export class ReturnToSupplierComponent {
  public returnToSupplierObj : ReturnToSupplierModel = new  ReturnToSupplierModel();
  ReturnToSupplierData: Array<any> = new Array<ReturnToSupplierModel>();
  public returnToSupplierGridColumns: Array<any> = null;
  public fromDate: string = null;
  public toDate: string = null;
  public loading: boolean = false;
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  public VendorList: Array<VendorMaster> = new Array<VendorMaster>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public validDate: boolean = true;
  public selecteditem: any;
  public selectedVndr: any;
  public BatchNumber: string = '';
  public GoodReceiptNumber: number;
  public CreditNoteNumber: number;
  public fiscalYearId: number = 0;

  constructor(private inventoryReportsBLService: InventoryReportsBLService, private reportService: ReportingService,
    private msgBoxService: MessageboxService,private nepCalendarService: NepaliCalendarService, private coreService: CoreService, private inventoryService: InventoryService) {
    this.returnToSupplierGridColumns = this.reportService.reportGridCols.returnToSupplierReportCol;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('ReturnDate', false)]);
    this.GetVendorList();
    this.GetItem();
  }
  selectDate(event) {
    if (event) {
      this.fromDate = event.fromDate;
      this.toDate = event.toDate;
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
    }
    else {
      this.validDate = false;
    }
  }
  GetItem() {
    this.inventoryReportsBLService.GetItem()
        .subscribe(res => {
            if (res.Status == 'OK') {
                this.itemList = res.Results.filter(a => a.IsActive == true);
            } else {
                this.msgBoxService.showMessage("error", [res.ErrorMessage]);
            }

        });
 }

  ItemListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  GetItemDetails() {
    if (this.selecteditem && typeof (this.selecteditem) == "string") {
      var selecteditem = this.itemList.find(a => a.ItemName == this.selecteditem);
      if (selecteditem && selecteditem.ItemId) {
      this.selecteditem = selecteditem;
      }
    }
  }
  GetVendorList() {
    try {
      this.VendorList = this.inventoryService.allVendorList;
      if (this.VendorList.length <= 0) {
       this.msgBoxService.showMessage("Failed", ["Failed to load the vendor list."]);
      }
     else {
        this.VendorList = this.VendorList.filter(vendor => vendor.IsActive == true);
      }
    } catch (ex) {
      this.msgBoxService.showMessage("Failed", ["Something went wrong while loading vendor list."]);
    }
  }
  VendorListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }

  GetVendorDetails() {
    if (this.selectedVndr && typeof (this.selectedVndr) == "string") {
      var selectedVndr = this.VendorList.find(a => a.VendorName == this.selectedVndr);
      if (selectedVndr && selectedVndr.VendorId) {
        this.selectedVndr = selectedVndr;
      }
    }
  }
  Load(){
  if(this.selectedVndr && this.selecteditem){
      this.loading = true;
      this.returnToSupplierObj.FromDate = this.fromDate
      this.returnToSupplierObj.ToDate = this.toDate
      this.returnToSupplierObj.VendorId = this.selectedVndr.VendorId;
      this.returnToSupplierObj.ItemId= this.selecteditem.ItemId;
      this.returnToSupplierObj.BatchNumber= (this.BatchNumber != null) ? this.BatchNumber: null;
      this.returnToSupplierObj.GoodReceiptNumber= (this.GoodReceiptNumber > 0) ? this.GoodReceiptNumber : null;
      this.returnToSupplierObj.CreditNoteNumber= (this.CreditNoteNumber > 0) ? this.CreditNoteNumber : null;
      this.inventoryReportsBLService.GetReturnToSupplierReport(this.returnToSupplierObj)
      .subscribe(res => {
      if (res.Status == "OK" && res.Results.length > 0) {
        this.returnToSupplierGridColumns = this.reportService.reportGridCols.returnToSupplierReportCol;
        this.ReturnToSupplierData = res.Results;
      }
     else if (res.Status == "OK" && res.Results.length == 0) {
        this.ReturnToSupplierData = res.Results;
        this.msgBoxService.showMessage("Notice-Message", ["There is no data available."]);
        this.loading = false;
      }
      },
      err => {
        this.msgBoxService.showMessage("error", ["Failed to get Return To Supplier report data. " + err.ErrorMessage]);
        this.loading = false;
      });
      this.loading = false;
    }
    else{
      this.msgBoxService.showMessage("Error", ["Select Vendor Name and Item Name from list"]);
    }
  }

  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'ReturnToSupplierReport-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["VendorName", "ReturnDate",
        "ItemName", "BatchNo", "GoodsReceiptNo", "Quantity", "ItemRate", "DiscountAmount", "VAT", "TotalAmount",
        "CreditNoteNo","Remark"]
    };
    return gridExportOptions;
  }
  public datePreference: string = "np";
  Print(printId: string) {
    this.datePreference = this.coreService.DatePreference;
    let fromDate_string: string = "";
    let toDate_string: string = "";
    let calendarType: string = "BS";
    if (this.datePreference == "en") {
      fromDate_string = moment(this.fromDate).format("YYYY-MM-DD");
      toDate_string = moment(this.toDate).format("YYYY-MM-DD");
      calendarType = "(AD)";
    }
    else {
      fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
      toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.toDate, "YYYY-MM-DD");
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

  public OnDateRangeChange($event) {
    if ($event) {
     this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }
}
class ReturnToSupplierModel {
  public FromDate: string = null;
  public ToDate: string = null;
  public VendorId: number = null;
  public ItemId: number = null;
  public BatchNumber: string = "";
  public GoodReceiptNumber: number = null;
  public CreditNoteNumber: number = null;
}