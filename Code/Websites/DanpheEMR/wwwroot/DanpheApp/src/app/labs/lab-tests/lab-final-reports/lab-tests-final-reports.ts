import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { LabsBLService } from '../../shared/labs.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import * as moment from 'moment/moment';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PatientService } from '../../../patients/shared/patient.service';
import { CoreService } from "../../../core/shared/core.service";
@Component({
  selector: 'lab-final-reports',
  templateUrl: "./lab-tests-final-reports.html"
})
export class LabTestsFinalReports implements AfterViewInit {
  public reportList: Array<any>;
  gridColumns: Array<any> = null;
  public showAddEditResult: boolean = false;
  public showReport: boolean = false;
  public showGrid: boolean = true;
  public requisitionIdList = [];
  public verificationRequired: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "last1Week";//default show last 1 week records.
  searchText: string = '';
  public enableServerSideSearch: boolean = false;

  //@ViewChild('searchBox') someInput: ElementRef;

  public printReportFromGrid: boolean = false;

  constructor(public labBLService: LabsBLService, public coreService: CoreService,
    public msgBoxService: MessageboxService,
    public patientService: PatientService) {
    this.getParamter();
    this.gridColumns = LabGridColumnSettings.FinalReportListColumnFilter(this.coreService.GetFinalReportListColumnArray());
    // this.GetPendingReportList(this.fromDate,this.toDate);
  }

  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus()
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetPendingReportList(this.fromDate, this.toDate, this.searchText);
      } else {
        this.msgBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["LaboratoryFinalReports"];
  }
  GetPendingReportList(frmdate, todate, searchtxt = '') {

    this.labBLService.GetLabTestFinalReports(frmdate, todate, searchtxt).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status == 'OK') {
        const reports = res.Results;
        reports.forEach(result => {
          let testNameCSV: string;
          let templateNameCSV: string;
          const AllowOutPatientWithProvisional = this.coreService.AllowOutpatientWithProvisional();
          result['allowOutpatientWithProvisional'] = AllowOutPatientWithProvisional;
          result.Tests.forEach(test => {
            if (!testNameCSV) {
              testNameCSV = test.TestName;
            } else {
              testNameCSV = testNameCSV + ',' + test.TestName;
            }

            //this is removed because it didnt show the same TestName of single patient Twice
            //testNameCSV += testNameCSV.includes(test.TestName) ? "" : "," + test.TestName;

            if (!templateNameCSV) {
              templateNameCSV = test.ReportTemplateShortName;
            } else {
              templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? '' : ',' + test.ReportTemplateShortName;
            }
          });
          result.LabTestCSV = testNameCSV;
          result.TemplateName = templateNameCSV;
        });
        this.reportList = reports.slice();
      } else {
        this.msgBoxService.showMessage('failed', ['Unable to get Pending Report List']);
        console.log(res.ErrorMessage);
      }
    }, err => {
      this.msgBoxService.showMessage('failed', [err]);
      console.log(err);
    });
  }
  GridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "ViewDetails":
        {
          this.AssignRequisitionData($event.Data);

          //this is removed because it didnt show the two diff. RequisitionID of same TestName of single patient Twice
          //this.requisitionIdList = $event.Data.Tests.map(test => { return test.RequisitionId });

          this.printReportFromGrid = false;
          this.verificationRequired = false;
          this.showGrid = false;
          this.showAddEditResult = false;
          this.showReport = true;

        }
        break;
      case "Print":
        {
          this.AssignRequisitionData($event.Data);

          //this is removed because it didnt show the two diff. RequisitionID of same TestName of single patient Twice
          //this.requisitionIdList = $event.Data.Tests.map(test => { return test.RequisitionId });

          this.printReportFromGrid = true;
          this.verificationRequired = false;
          this.showGrid = false;
          this.showAddEditResult = false;
          this.showReport = true;


        }
        break;
      default:
        break;
    }
  }

  AssignRequisitionData(data) {
    this.patientService.getGlobal().PatientId = data.PatientId;
    this.patientService.getGlobal().ShortName = data.PatientName;
    this.patientService.getGlobal().PatientCode = data.PatientCode;
    this.patientService.getGlobal().DateOfBirth = data.DateOfBirth;
    this.patientService.getGlobal().Gender = data.Gender;
    this.patientService.getGlobal().WardName = data.WardName;

    data.Tests.forEach(reqId => {
      if (this.requisitionIdList && this.requisitionIdList.length) {
        if (!this.requisitionIdList.includes(reqId.RequisitionId)) {
          this.requisitionIdList.push(reqId.RequisitionId);
        }
      }
      else {
        this.requisitionIdList.push(reqId.RequisitionId);
      }
    });
  }

  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.GetPendingReportList(this.fromDate, this.toDate, this.searchText);
  }

  BackToGrid() {
    this.showGrid = true;
    //reset patient on header;
    this.patientService.CreateNewGlobal();
    this.reportList = [];
    this.requisitionIdList = [];

    this.GetPendingReportList(null, null);
  }

  public CallBackBackToGrid($event) {
    if ($event.backtogrid) {
      this.printReportFromGrid = false;
      this.BackToGrid();
    }
  }
}
