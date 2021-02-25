import { Component, ChangeDetectorRef } from '@angular/core';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import * as moment from 'moment/moment';
import { GoodReceiptEvaluationReport } from './goodreceipt-evaluation-report.model';

@Component({
  templateUrl: "./GoodReceiptEvaluation.html"
})

export class GoodReceiptEvaluation {
  public FromDate: Date = null;
  public ToDate: Date = null;
  public GoodReceiptNo: number = null;
  public TransactionType: string = null;

  public CurrentGREvaluationReport: GoodReceiptEvaluationReport = new GoodReceiptEvaluationReport();

  public GREvaluationColumns: Array<any> = null;
  public GREvaluationData: Array<any> = new Array<any>();
  public showGrid: boolean = true;

  constructor(
    public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService, public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.ShowValuation();
    this.CurrentGREvaluationReport.FromDate = moment().format('YYYY-MM-DD');
    this.CurrentGREvaluationReport.ToDate = moment().format('YYYY-MM-DD');
  }

  gridExportOptions = {
    fileName: 'GREvaluation' + moment().format('YYYY-MM-DD') + '.xls',
  };

  ShowValuation() {
//  this.GREvaluationData= null;

    this.inventoryBLService.ShowGREvaluationReport(this.CurrentGREvaluationReport)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res)
      );
  }
  Error(err) {
    this.msgBoxServ.showMessage("Error", [err]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {

      this.showGrid = false;
      this.changeDetector.detectChanges();
      this.GREvaluationColumns = this.reportServ.reportGridCols.GREvaluationReport;
      this.showGrid = true;

      this.GREvaluationData = res.Results;

    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }
    else {
      this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);
    }
  }

  LoadCancelledPOGR() {
    this.ShowValuation();
  }
}
