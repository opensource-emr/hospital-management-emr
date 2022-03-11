import { Component, ChangeDetectorRef } from "@angular/core";
import { ReportingService } from "../../../../reporting/shared/reporting-service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { InventoryReportsBLService } from "../../shared/inventory-reports.bl.service";
import { InventoryReportsDLService } from "../../shared/inventory-reports.dl.service";
import * as moment from "moment/moment";
import { CancelledPOandGRReport } from "../../shared/cancelled-poandgr-report.model";
import { GridEmitModel } from "../../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./CancelledPOandGR.html",
})
export class CancelledPOandGR {
  public fromDate: string = moment().format("YYYY-MM-DD");
  public toDate: string = moment().format("YYYY-MM-DD");

  public CurrentCancelledPOGR: CancelledPOandGRReport = new CancelledPOandGRReport();

  public CancelledGRColumns: Array<any> = Array<any>();
  public CancelledPOColumns: Array<any> = Array<any>();
  public CancelledGRData: Array<CancelledPOandGRReport> = new Array<CancelledPOandGRReport>();
  public CancelledPOData: Array<CancelledPOandGRReport> = new Array<CancelledPOandGRReport>();
  public showGRGrid: boolean = false;
  public showPOGrid: boolean = false;
  public NepaliDateInGRGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public NepaliDateInPOGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public poId: number = 0;
  public grId: number = 0;
  public showPoDetail: boolean = false;
  public showGrDetail: boolean = false;
  public loading: boolean = false;
  constructor(
    public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService
  ) {
    this.CurrentCancelledPOGR.FromDate = moment().format("YYYY-MM-DD");
    this.CurrentCancelledPOGR.ToDate = moment().format("YYYY-MM-DD");
    this.CancelledGRColumns = this.reportServ.reportGridCols.CancelledGRReport;
    this.CancelledPOColumns = this.reportServ.reportGridCols.CancelledPOReport;
    this.NepaliDateInGRGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('GoodsReceiptDate', true));
    this.NepaliDateInGRGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CancelledOn', true));
    this.NepaliDateInPOGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('PoDate', true));
    this.NepaliDateInPOGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CancelledOn', true));
    // this.GetReportDetails();
  }

  gridExportOptions = {
    fileName:
      this.CurrentCancelledPOGR.isGR == "true"
        ? "CancelledGR" + moment().format("YYYY-MM-DD") + ".xls"
        : "CancelledPO" + moment().format("YYYY-MM-DD") + ".xls",
  };

  GetReportDetails() {
    this.loading = true;
    this.CancelledGRData = new Array<CancelledPOandGRReport>();
    this.CancelledPOData = new Array<CancelledPOandGRReport>();
    var valiDate = this.CurrentCancelledPOGR.IsValid;
    if (
      this.CurrentCancelledPOGR.FromDate != null &&
      this.CurrentCancelledPOGR.ToDate != null
    ) {
      this.inventoryBLService
        .ShowCancelledPOGRReport(this.CurrentCancelledPOGR)
        .map((res) => res)
        .subscribe(
          (res) => this.Success(res),
          (res) => this.Error(res)
        );
    } else {
      this.msgBoxServ.showMessage("Error", ["please select valid date"]);
      this.loading = false;
    }
  }
  Error(err) {
    this.msgBoxServ.showMessage("Error", [err]);
    this.loading = false;
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      if (this.CurrentCancelledPOGR.isGR == "false") {
        this.showGRGrid = false;
        this.showPOGrid = false;
        this.changeDetector.detectChanges();
        res.Results.forEach((element) => {
          element.PoDate = moment(element.PoDate).format("YYYY-MM-DD");
          element.CancelledOn = moment(element.CancelledOn).format(
            "YYYY-MM-DD"
          );
        });
        this.showPOGrid = true;
        this.CancelledPOData = res.Results;
      } else {
        this.showGRGrid = false;
        this.showPOGrid = false;
        this.changeDetector.detectChanges();
        res.Results.forEach((element) => {
          element.GoodsReceiptDate = moment(element.GoodsReceiptDate).format(
            "YYYY-MM-DD"
          );
          element.CancelledOn = moment(element.CancelledOn).format(
            "YYYY-MM-DD"
          );
        });
        this.showGRGrid = true;
        this.CancelledGRData = res.Results;
      }
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Notice", ["There is no data available."]);
    } else {
      this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);
    }
    this.loading = false;
  }

  OnChangePOGRCheckbox() {
    this.GetReportDetails();
  }

  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "viewGR": {
        var data = $event.Data;
        this.changeDetector.detectChanges();
        this.showGrDetail = true;
        this.grId = data.GoodsReceiptID;
        break;
      }

      case "viewPO": {
        var data = $event.Data;
        this.changeDetector.detectChanges();
        this.showPoDetail = true;
        this.poId = data.PurchaseOrderId
        break;
      }
      default:
        break;
    }
  }
  OnDateRangeChange($event) {
    if ($event) {
      this.CurrentCancelledPOGR.FromDate = $event.fromDate;
      this.CurrentCancelledPOGR.ToDate = $event.toDate;
    }
  }
}
