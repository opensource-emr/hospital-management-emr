import { ChangeDetectorRef, Component } from "@angular/core";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { GoodsReceipt } from "../../../shared/goods-receipt.model";
import { InventoryReportsBLService } from "../../shared/inventory-reports.bl.service";
import { ReportingService } from "../../../../reporting/shared/reporting-service";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { GridEmitModel } from "../../../../shared/danphe-grid/grid-emit.model";
import { CommonFunctions } from "../../../../shared/common.functions";
import { NepaliCalendarService } from "../../../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../../../core/shared/core.service";
import { VendorMaster } from "../../../shared/vendor-master.model";
import { InventoryService } from "../../../shared/inventory.service";


@Component({
  templateUrl: "./inv-purchase-summary.component.html"
})
export class PurchaseSummaryComponent {

  public purchaseSummaryRecordList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public purchaseSummaryRecordListFiltered: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public purchaseSummaryGridColumns: Array<any> = new Array<any>();
  public summaryOfReport: Array<PurchaseSummaryReportSummaryModel> = new Array<PurchaseSummaryReportSummaryModel>();
  public fromDate: string = null;
  public toDate: string = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public dateRange: string = null;
  public grId: number = 0;
  public showGrDetail: boolean = false;
  public vendorName: string = "";
  public loading: boolean = false;
  constructor(private inventoryReportsBLService: InventoryReportsBLService, private reportService: ReportingService
    , public changeDetector: ChangeDetectorRef, private msgBoxService: MessageboxService,
    private nepCalendarService: NepaliCalendarService, private coreService: CoreService, private inventoryService: InventoryService) {
    this.dateRange = 'None'; //means last 1 month
    this.purchaseSummaryGridColumns = this.reportService.reportGridCols.InvPurchaseSummaryReportCol;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('GoodsReceiptDate', false), new NepaliDateInGridColumnDetail('VendorBillDate', false)]);
    this.GetVendorList();
    this.vendorName = '';
  }


  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
      } else {
        this.msgBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }
  public GetPurchaseSummaryReport() {
    this.loading = true;
    this.purchaseSummaryRecordList = new Array<any>();
    this.purchaseSummaryRecordListFiltered = new Array<any>();
    this.summaryOfReport = new Array<PurchaseSummaryReportSummaryModel>();
    this.vendorName = '';
    let vendorId = (this.selectedVndr && this.selectedVndr.VendorId > 0) ? this.selectedVndr.VendorId : 0;
    this.inventoryReportsBLService.GetPurchaseSummaryReport(this.fromDate, this.toDate, vendorId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.vendorName = (this.selectedVndr && this.selectedVndr.VendorId > 0) ? this.selectedVndr.VendorName : "";
          this.changeDetector.detectChanges();
          this.purchaseSummaryRecordList = res.Results.PurchaeSummaryList;
          if (res.Results.GRCategoryList) {
            this.purchaseSummaryRecordListFiltered = this.purchaseSummaryRecordList;
            this.SummaryCalculation();
          }
        }
        else {
          this.msgBoxService.showMessage("error", ["Failed to get purchase summary report data. " + res.ErrorMessage]);
          this.vendorName = '';
        }
        this.loading = false;
      },
        err => {
          this.msgBoxService.showMessage("error", ["Failed to get purchase summary report data. " + err.ErrorMessage]);
          this.loading = false;
        });
  }

  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'PurchaseSummary-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["GoodsReceiptNo", "GoodsReceiptDate", "VendorBillDate",
        "VendorName", "ContactNo", "BillNo", "SubTotal", "DiscountAmount", "VATTotal", "OtherCharges", "TotalAmount",
        "PaymentMode", "Remarks"]
    };
    return gridExportOptions;
  }
  GridAction($event: GridEmitModel) {
    this.grId = 0;
    this.showGrDetail = false;
    switch ($event.Action) {
      case "view": {
        var data = $event.Data;
        this.changeDetector.detectChanges();
        this.showGrDetail = true;
        this.grId = data.GoodsReceiptID;
        break;
      }
      default:
        break;
    }
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
  SummaryCalculation() {
    this.summaryOfReport = new Array<PurchaseSummaryReportSummaryModel>();
    if (this.purchaseSummaryRecordListFiltered.filter(a => a.PaymentMode == "Credit").length > 0) {
      var grandTotalCredit = CommonFunctions.getGrandTotalData(this.purchaseSummaryRecordListFiltered.filter(s => s.PaymentMode == "Credit"));
      let modelData = new PurchaseSummaryReportSummaryModel()
      modelData.Title = "Credit";
      modelData.SubTotal = grandTotalCredit[0].SubTotal;
      modelData.Discount = grandTotalCredit[0].DiscountAmount;
      modelData.VAT = grandTotalCredit[0].VATTotal;
      modelData.TotalOtherCharges = grandTotalCredit[0].OtherCharges;
      modelData.TotalAmount = grandTotalCredit[0].TotalAmount;
      this.summaryOfReport.push(modelData);
    } else {
      let modelData = new PurchaseSummaryReportSummaryModel()
      modelData.Title = "Credit";
      this.summaryOfReport.push(modelData);
    }
    if (this.purchaseSummaryRecordListFiltered.filter(a => a.PaymentMode == "Cash").length > 0) {
      var grandTotalCash = CommonFunctions.getGrandTotalData(this.purchaseSummaryRecordListFiltered.filter(s => s.PaymentMode == "Cash"));
      let modelDataCash = new PurchaseSummaryReportSummaryModel()
      modelDataCash.Title = "Cash";
      modelDataCash.SubTotal = grandTotalCash[0].SubTotal;
      modelDataCash.Discount = grandTotalCash[0].DiscountAmount;
      modelDataCash.VAT = grandTotalCash[0].VATTotal;
      modelDataCash.TotalOtherCharges = grandTotalCash[0].OtherCharges;
      modelDataCash.TotalAmount = grandTotalCash[0].TotalAmount;
      this.summaryOfReport.push(modelDataCash);
    } else {
      let modelDataCash = new PurchaseSummaryReportSummaryModel()
      modelDataCash.Title = "Cash";
      this.summaryOfReport.push(modelDataCash);
    }

    let modelDataTotal = new PurchaseSummaryReportSummaryModel()
    modelDataTotal.Title = "Total";
    this.summaryOfReport.forEach(element => {
      modelDataTotal.SubTotal = modelDataTotal.SubTotal + element.SubTotal;
      modelDataTotal.Discount = modelDataTotal.Discount + element.Discount;
      modelDataTotal.VAT = modelDataTotal.VAT + element.VAT;
      modelDataTotal.TotalOtherCharges = modelDataTotal.TotalOtherCharges + element.TotalOtherCharges;
      modelDataTotal.TotalAmount = modelDataTotal.TotalAmount + element.TotalAmount;
    })
    this.summaryOfReport.push(modelDataTotal);
  }

  public selectedVndr: any;
  public VendorList: Array<VendorMaster> = new Array<VendorMaster>();

  GetVendorDetails() {
    if (this.selectedVndr && typeof (this.selectedVndr) == "string") {
      var selectedVndr = this.VendorList.find(a => a.VendorName == this.selectedVndr);
      if (selectedVndr && selectedVndr.VendorId) {
        this.selectedVndr = selectedVndr;
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
}
class PurchaseSummaryReportSummaryModel {
  public Title: string = "";
  public SubTotal: number = 0;
  public Discount: number = 0;
  public VAT: number = 0;
  public TotalOtherCharges: number = 0;
  public TotalAmount: number = 0;
}