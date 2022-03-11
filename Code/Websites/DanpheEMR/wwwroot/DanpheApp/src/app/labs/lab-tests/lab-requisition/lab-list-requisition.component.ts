import {
  Component,
  ChangeDetectorRef,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { RouterOutlet, RouterModule, Router } from "@angular/router";
import "rxjs/Rx";
import { Observable } from "rxjs/Observable";

import LabGridColumnSettings from "../../shared/lab-gridcol-settings";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PatientService } from "../../../patients/shared/patient.service";
import { LabsBLService } from "../../shared/labs.bl.service";

import { LabTestRequisition } from "../../shared/lab-requisition.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LabTestResultService } from "../../shared/lab.service";
import { Subscription } from "rxjs/Rx";
import { CoreService } from "../../../core/shared/core.service";
import {
  NepaliDateInGridParams,
  NepaliDateInGridColumnDetail,
} from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import * as moment from 'moment/moment';
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  templateUrl: "./lab-list-requisition.html", // "/LabView/ListLabRequisition"
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class LabListRequisitionComponent {
  public requisitions: Array<LabTestRequisition>;
  //start: for angular-grid
  LabGridColumns: Array<any> = null;
  public showLabRequestsPage: boolean = false;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public NepaliDateForSampleCollectedList: NepaliDateInGridParams = new NepaliDateInGridParams();

  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "today";
  public labGridCols: any;


  public sampleCollectedList: any;
  public showSampleCollectedPage: boolean = false;
  public SamplesCollectedGridColumns;
  public reportHeaderHtml_SamplesCollectedList: string = '';

  public sampleCollectedHeader: any;

  //@ViewChild('searchBox') someInput: ElementRef;

  constructor(
    public labBLService: LabsBLService,
    public router: Router,
    public patientService: PatientService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public labResultService: LabTestResultService,
    public coreService: CoreService,
    public securityService: SecurityService
  ) {
    //labrequisition grid
    this.labGridCols = new LabGridColumnSettings(this.securityService);
    this.LabGridColumns = this.labGridCols.ListRequisitionColumnFilter(
      this.coreService.GetRequisitionListColumnArray()
    );
    this.SamplesCollectedGridColumns = this.labGridCols.SampleCollectedList;
    this.GetLabItems();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("LastestRequisitionDate", false)
    );
    this.NepaliDateForSampleCollectedList.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("SampleCreatedOn", true)
    );

    let param = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'CustomerHeader');

    if (param) {
      this.sampleCollectedHeader = JSON.parse(param.ParameterValue);
    }

    //this.GetSamplesCollectedData();
  }

  ngOnInit() {
    //this.LoadLabRequisition();
  }

  ngAfterViewInit() {
    document.getElementById("quickFilterInput") && document.getElementById("quickFilterInput").focus();
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if ((this.fromDate != null) && (this.toDate != null)) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.LoadLabRequisition();
      } else {
        this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }

  GetLabItems() {
    this.labBLService.GetLabBillingItems().subscribe((res) => {
      if (res.Status == "OK") {

        this.labResultService.labBillItems = res.Results;
        this.reportHeaderHtml_SamplesCollectedList = this.coreService.GetReportHeaderParameterHTML(moment(this.fromDate).format('YYYY-MM-DD'),
          moment(this.toDate).format('YYYY-MM-DD'), ('Samples Collected List'));
      } else {
        this.msgBoxServ.showMessage("failed", ["Unable to get lab items."]);
      }
    });
  }

  //getting the requsitions
  LoadLabRequisition(): void {
    this.requisitions = [];
    this.labBLService.GetLabRequisition(this.fromDate, this.toDate).subscribe(
      (res) => {
        if (res.Status == "OK") {
          this.requisitions = res.Results;
          this.requisitions = this.requisitions.slice();
        } else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      },
      (err) => {
        this.msgBoxServ.showMessage("error", [
          "failed to add result.. please check log for details.",
        ]);
      }
    );
  }

  //this.countPendingStatus = this.requisitions.filter(a => a.LabOrderStatus == "Pending").length;
  //this.countNewStatus = this.requisitions.filter(a => a.LabOrderStatus == "New").length;

  ViewDetails(req): void {
    this.patientService.getGlobal().PatientId = req.PatientId;
    this.patientService.getGlobal().ShortName = req.PatientName;
    this.patientService.getGlobal().PatientCode = req.PatientCode;
    this.patientService.getGlobal().DateOfBirth = req.DateOfBirth;
    this.patientService.getGlobal().Gender = req.Gender;
    this.patientService.getGlobal().PatientType = req.VisitType;
    this.patientService.getGlobal().RunNumberType = req.RunNumberType;
    this.patientService.getGlobal().RequisitionId = req.RequisitionId;
    this.patientService.getGlobal().WardName = req.WardName;
    this.patientService.getGlobal().PhoneNumber = req.PhoneNumber;
    this.patientService.getGlobal().Ins_HasInsurance = req.HasInsurance;
    this.router.navigate(["/Lab/CollectSample"]);
  }

  //lab requisition grid
  LabGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "ViewDetails":
        {
          this.ViewDetails($event.Data);
        }
        break;
      default:
        break;
    }
  }


  GetSamplesCollectedData(): void {
    let diff = moment(this.fromDate).diff(moment(this.toDate), 'days');
    if (Math.abs(diff) > 7) {
      this.msgBoxServ.showMessage("failed", ["Date Range should not be more than 7 days."]);
      return;
    }

    this.labBLService.GetSamplesCollectedData(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            this.sampleCollectedList = res.Results;
            this.showSampleCollectedPage = true;
            this.changeDetector.detectChanges();
          }
          else {
            this.sampleCollectedList = null;
            this.changeDetector.detectChanges();
          }

        }
        else {
          this.msgBoxServ.showMessage("failed", ["failed to get lab test of patient.. please check log for details."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  ShowHideSamplesCollected() {
    this.GetSamplesCollectedData();
  }

  Close() {
    this.showSampleCollectedPage = false;
  }

  gridExportOptions = {
    fileName:
      "SamplesCollectedList_" + moment().format("YYYY-MM-DD") + ".xls",
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.showSampleCollectedPage = false;
    }

  }

  public Print() {
    let popupWinindow;
    if (document.getElementById("labSampleCollectedlist")) {
      var printContents = document.getElementById("labSampleCollectedlist").innerHTML;
    }
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    var documentContent = `<html><head>
                          `;


    documentContent += `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" /></head>`;

    documentContent += '<body class="lab-rpt4moz" onload="window.print()">' + printContents + '</body></html>';
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
}
