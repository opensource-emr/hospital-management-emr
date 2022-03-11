import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { SettingsBLService } from '../../../../settings-new/shared/settings.bl.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import CSSDGridColumns from '../../../shared/cssd-grid-columns';
import { CssdReportEndpointService } from '../cssd-report.endpoint';

@Component({
  selector: 'app-integrated-cssd-report',
  templateUrl: './integrated-cssd-report.component.html',
  styles: []
})
export class IntegratedCssdReportComponent implements OnInit {

  integratedCssdReportGridColumns: any[] = [];
  integratedCssdReportAllData: any[];
  integratedCssdReportGridData: any[];
  filteredIntegratedCssdReportGridData: any[];
  fromDate: any;
  toDate: any;
  dateRange: string = 'None';
  selectedDisinfectionMethod: string = 'all';
  selectedSubstore: number = 0;
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  substoreList: any;
  constructor(public msgBox: MessageboxService,
    public cssdReportService: CssdReportEndpointService,
    public settingsBLService: SettingsBLService) {
    this.integratedCssdReportGridColumns = CSSDGridColumns.IntegratedCssdReportColumns;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('RequestDate', false), new NepaliDateInGridColumnDetail('DisinfectedDate', false), new NepaliDateInGridColumnDetail('DispatchedDate', false)]);
    this.GetSubstoreList();
  }
  ngOnInit() {
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.loadIntegratedCssdReport();
      } else {
        this.msgBox.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }
  loadIntegratedCssdReport(): void {
    this.cssdReportService.getIntegratedCssdReport(this.fromDate, this.toDate).subscribe(res => {
      if (res.Status == "OK") {
        this.integratedCssdReportAllData = res.Results;
        this.OnFiltersChange();
      }
      else {
        this.msgBox.showMessage("Failed", ["Failed to load integrated cssd report."]);
      }
    }, err => {
      console.log(err);
      this.msgBox.showMessage("Failed", ["Failed to load integrated cssd report."]);
    });
  }
  gridExportOptions = {
    fileName: 'CSSD_IntegratedCssdReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };


  OnDisinfectionMethodChange() {
    if (this.selectedDisinfectionMethod && this.selectedDisinfectionMethod != "all") {

      this.integratedCssdReportGridData = [];
      this.integratedCssdReportGridData = this.integratedCssdReportAllData.filter(a => a.Disinfectant == this.selectedDisinfectionMethod);
    } else {
      this.integratedCssdReportGridData = [];
      this.integratedCssdReportGridData = this.integratedCssdReportAllData;
    }
  }

  OnSubstoreChange() {
    if (this.selectedSubstore > 0) {
      this.integratedCssdReportGridData = this.integratedCssdReportGridData.filter(a => a.StoreId == this.selectedSubstore);
    }
  }

  OnFiltersChange() {
    this.OnDisinfectionMethodChange();
    this.OnSubstoreChange();
  }

  private GetSubstoreList() {
    this.settingsBLService.GetStoreList().subscribe(res => {
      if (res.Status == "OK") {
        this.substoreList = res.Results;
      }
      else {
        this.msgBox.showMessage("Notice-Message", ["Failed to load substore list."]);
      }
    }, err => {
      console.log(err);
      this.msgBox.showMessage("Failed", ["Failed to load substore list."]);
    });
  }
}