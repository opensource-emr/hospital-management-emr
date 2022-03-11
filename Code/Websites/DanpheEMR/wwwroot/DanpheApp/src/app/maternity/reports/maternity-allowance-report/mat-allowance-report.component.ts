import { Component, Injectable, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import MaternityGridColumnSettings from '../../shared/maternity.grid.settings';
import { MaternityBLService } from '../../shared/maternity.bl.service';
import * as moment from 'moment/moment';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';

@Component({
  templateUrl: "./mat-allowance-report.html"
})

export class MaternityReportsMatAllowanceComponent {
  // binding logic
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "";
  public matRptAllowanceGridColumns: any;
  public matRptAllowanceGridReportData: any;
  public loading: boolean = false;
  public IsSummaryViewMode: boolean = false;
  public patientPaymentId: number = 0;
  public summaryFormatted = {
    NetPaidAmount: 0,
    PaidToPatient: 0,
    ReturnedFromPatient: 0,
  }
  public footerContent: any;
  public gridExportOptions: any;
  public showPaymentReceipt: boolean = false;
  constructor(public securityService: SecurityService,
    public maternityBLService: MaternityBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {

  }
  ngOnInit() {


  }
  ngAfterViewChecked() {
    this.LoadExportOptions();
  }
  public onFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
  public Load() {
    this.loading = true;
    //reset all values of Summary to Zero.
    this.summaryFormatted.PaidToPatient = this.summaryFormatted.ReturnedFromPatient = this.summaryFormatted.NetPaidAmount = 0;
    // NetPaidAmount: 0,
    // PaidToPatient: 0,
    // ReturnedFromPatient: 0,
    this.IsSummaryViewMode = false;
    this.maternityBLService.GetMaternityAllowanceReportList(this.fromDate, this.toDate)
      .finally(() => { this.loading = false })
      .subscribe((res) => {
        if (res.Status == 'OK') {
          if (res.Results.Table2.length) {
            this.matRptAllowanceGridColumns = MaternityGridColumnSettings.MaternityAllowanceReportColSettings;
            this.matRptAllowanceGridReportData = res.Results.Table2;
            this.matRptAllowanceGridReportData.forEach(element => {
              element.CreatedOn = moment(element.CreatedOn).format("YYYY-MM-DD");
            });
            let summaryData = res.Results.Table1;
            summaryData.forEach(ele => {
              this.summaryFormatted.PaidToPatient += ele.PaidToPatient;
              this.summaryFormatted.ReturnedFromPatient += ele.ReturnedFromPatient;
              this.summaryFormatted.NetPaidAmount += ele.NetPaidAmount;
            });
            // this.summaryFormatted.PaidToPatient=res.Results.Table1[0].PaidToPatient;
            // this.summaryFormatted.ReturnedFromPatient=res.Results.Table1[0].ReturnedFromPatient;
            // this.summaryFormatted.NetPaidAmount=res.Results.Table1[0].NetPaidAmount;
            this.IsSummaryViewMode = true;
            this.changeDetector.detectChanges();
            this.footerContent = document.getElementById("print_netCashCollection").innerHTML;
          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['Data is not available between selected dates']);
          }
        }
      }, err => {
        this.msgBoxServ.showMessage("failed", ['Failed to load']);
      });
  }
  LoadExportOptions() {

    this.gridExportOptions = {
      fileName: 'MaternityAllowanceReportList_' + moment().format('YYYY-MM-DD') + '.xls'
    };
  }
  MaternityAllowanceGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "viewDetails":
        this.patientPaymentId = $event.Data.PatientPaymentId;
        this.showPaymentReceipt = true;
        break;
    }
  }
  closePaymentPopup(event: any) {
    if (event) {
      this.showPaymentReceipt = false;
      this.patientPaymentId = 0;
    }
  }
}
