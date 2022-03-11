import {
  Component,
  Directive,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RPT_ADT_DischargedPatientModel } from "../../shared/discharged-patient.model";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment/moment";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { Patient } from "../../../patients/shared/patient.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./discharged-patient.html",
})
export class RPT_ADT_DischargedPatientComponent {
  public dateRange : string = '';
  public fromDate: string = null;
  public toDate: string = null;
  DischargedPatientColumns: Array<any> = null;
  DischargedPatientData: Array<any> = new Array<any>();
  public currentdischargepatient: RPT_ADT_DischargedPatientModel = new RPT_ADT_DischargedPatientModel();
  public dischargedPat: RPT_ADT_DischargedPatientModel = new RPT_ADT_DischargedPatientModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  dlService: DLService = null;
  http: HttpClient = null;
  public showDischargeBillBreakup = false;
  public visitId: any;
  public eventData: any;

  constructor(
    _http: HttpClient,
    public changeDetector: ChangeDetectorRef,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService
  ) {
    this.http = _http;
    this.dlService = _dlService;
    this.currentdischargepatient.fromDate = moment().format("YYYY-MM-DD");
    this.currentdischargepatient.toDate = moment().format("YYYY-MM-DD");
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("AdmissionDate", false));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("DischargedDate", false));
  }

  gridExportOptions = {
    fileName: "DischargedPatientList_" + moment().format("YYYY-MM-DD") + ".xls",
  };

  Load() {
    if (this.currentdischargepatient.fromDate != null && this.currentdischargepatient.toDate != null) {
      this.dlService
        .Read(
          "/Reporting/DischargedPatient?FromDate=" +
          this.currentdischargepatient.fromDate +
          "&ToDate=" +
          this.currentdischargepatient.toDate
        )
        .map((res) => res)
        .subscribe(
          (res) => this.Success(res),
          (res) => this.Error(res)
        );
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
    
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DischargedPatientColumns = this.reportServ.reportGridCols.DischargedPatient;
      this.DischargedPatientData = res.Results;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", [
        "Data is Not Available Between Selected dates...Try Different Dates",
      ]);
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  public DischargeBillGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "bill-summary":
        {
          this.dischargedPat = new RPT_ADT_DischargedPatientModel();
          this.showDischargeBillBreakup = false;
          this.changeDetector.detectChanges();
          this.dischargedPat = $event.Data;
          this.showDischargeBillBreakup = true;
        }
        break;
      default:
        break;
    }
  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdischargepatient.fromDate = this.fromDate;
    this.currentdischargepatient.toDate = this.toDate;
    
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}
