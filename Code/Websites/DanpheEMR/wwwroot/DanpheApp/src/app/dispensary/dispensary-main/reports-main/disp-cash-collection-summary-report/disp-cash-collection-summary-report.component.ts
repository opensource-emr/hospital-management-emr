
import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../../../pharmacy/shared/phrm-reports-grid-columns';
import { PHRMReportsModel } from '../../../../pharmacy/shared/phrm-reports-model';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { DispensaryService } from '../../../shared/dispensary.service';
import { DispensaryReportModel } from '../dispensary-reports.model';


@Component({
  selector: 'app-disp-cash-collection-summary-report',
  templateUrl: './disp-cash-collection-summary-report.component.html',
  styleUrls: ['./disp-cash-collection-summary-report.component.css']

})

export class DispCashCollectionSummaryReportComponent {

  PHRMUserReportColumn: Array<any> = null;
  PHRMUserReportData: Array<any> = new Array<any>();
  public phrmReports: DispensaryReportModel = new DispensaryReportModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public dispensaryList: Array<any>;
  currentDispensary: PHRMStoreModel;
  selectedDispensary: any;

  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService, public _dispensaryService: DispensaryService) {
    this.PHRMUserReportColumn = PHRMReportsGridColumns.PHRMCashCollectionSummaryReport;
    this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
    this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
    this.currentDispensary = this._dispensaryService.activeDispensary;
    this.phrmReports.StoreId = this.currentDispensary.StoreId;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    this.GetActiveDispensarylist();
  };

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyCashCollectionSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  GetActiveDispensarylist() {
    this._dispensaryService.GetAllDispensaryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.dispensaryList = res.Results;
          this.selectedDispensary = this.currentDispensary.Name;
        }
      })
  }
  DispensaryListFormatter(data: any): string {
    return data["Name"];
  }
  OnDispensaryChange() {
    let dispensary = null;
    if (!this.selectedDispensary) {
      this.phrmReports.StoreId = null;
    }
    else if (typeof (this.selectedDispensary) == 'string') {
      dispensary = this.dispensaryList.find(a => a.Name.toLowerCase() == this.selectedDispensary.toLowerCase());
    }
    else if (typeof (this.selectedDispensary) == "object") {
      dispensary = this.selectedDispensary;
    }
    if (dispensary) {
      this.phrmReports.StoreId = dispensary.StoreId;
    }
    else {
      this.phrmReports.StoreId = null;
    }
  }

  Load() {
    this.pharmacyBLService.GetPHRMCashCollectionSummaryReport(this.phrmReports)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.PHRMUserReportData = res.Results;
          if (res.Status == 'OK' && res.Results.length == '') {
            this.msgBoxServ.showMessage("notice", ["no record found."]);
          }
        }
        else {

          this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
        }
      });

  }

  OnFromToDateChange($event) {
    this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
    this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
  }
}
