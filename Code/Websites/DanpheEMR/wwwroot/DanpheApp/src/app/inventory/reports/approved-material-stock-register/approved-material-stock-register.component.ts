import { Component } from "@angular/core";
import * as moment from "moment";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { ApprovedMaterialStockRegisterReportModel } from "../shared/approved-material-stock-register-report.model";
import { InventoryReportsBLService } from "../shared/inventory-reports.bl.service";
import { InventoryReportsDLService } from "../shared/inventory-reports.dl.service";




@Component({
  //selector: 'my-app',
  templateUrl: "./ApprovedMaterialStockRegister.html"  //"/InventoryReports/StockLevel"

})
export class ApprovedMaterialStockRegisterComponent {
  public invReport: ApprovedMaterialStockRegisterReportModel = new ApprovedMaterialStockRegisterReportModel();
  ApprovedMaterialStockRegisterColumn: Array<any> = null;
  ApprovedMaterialStockRegisterData: Array<any> = new Array<ApprovedMaterialStockRegisterReportModel>();

  constructor(public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public inventoryService: InventoryBLService,
    public reportServ: ReportingService,
    public msgBoxServ: MessageboxService) {
    this.invReport.FromDate = moment().format('YYYY-MM-DD');
    this.invReport.ToDate = moment().format('YYYY-MM-DD');
    this.ApprovedMaterialStockRegisterColumn = this.reportServ.reportGridCols.ApprovedMaterialStockRegisterReport;



  }


  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'ApprovedMaterialStockRegister' + moment().format('YYYY-MM-DD') + '.xls',
  };


  Load() {
    this.inventoryBLService.ShowApprovedMaterialStockRegister(this.invReport)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("Error", [err]);
  }

  Success(res) {
    this.ApprovedMaterialStockRegisterData = new Array<ApprovedMaterialStockRegisterReportModel>();
    if (res.Status == "OK" && res.Results.length > 0) {

      this.ApprovedMaterialStockRegisterColumn = this.reportServ.reportGridCols.ApprovedMaterialStockRegisterReport;
      this.ApprovedMaterialStockRegisterData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
}