import { Component, Directive, ViewChild } from '@angular/core';
import { PHRMReportsModel } from "../../shared/phrm-reports-model"
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";

@Component({
  templateUrl: "./phrm-narcotics-stock-report.html"
})
export class PHRMNarcoticsStockReportComponent {
  totalstockvalue: any;
  PHRMNarcoticsStockReportColumns: Array<any> = null;
  PHRMNarcoticsStockReportData: Array<any> = new Array<PHRMReportsModel>();

  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
    this.PHRMNarcoticsStockReportColumns = PHRMGridColumns.PHRMNArcoticsStockDetailsList;
    this.Load();
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyNarcoticsStockReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  public Load() {
    this.pharmacyBLService.GetNarcoticsStoreReport()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.PHRMNarcoticsStockReportColumns = PHRMGridColumns.PHRMNArcoticsStockDetailsList;
          this.PHRMNarcoticsStockReportData = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
        }
      });
  }
}






