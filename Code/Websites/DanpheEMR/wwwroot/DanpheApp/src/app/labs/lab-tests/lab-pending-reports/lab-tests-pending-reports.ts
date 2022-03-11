import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { LabsBLService } from '../../shared/labs.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { LabSticker } from '../../shared/lab-sticker.model';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PatientService } from '../../../patients/shared/patient.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { LabService } from '../../shared/lab.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'lab-pending-reports',
  templateUrl: "./lab-tests-pending-reports.html"

})
export class LabTestsPendingReports {
  public reportList: Array<any>;
  gridColumns: Array<any> = null;
  public showAddEditResult: boolean = false;
  public showlabsticker: boolean = false;
  public showReport: boolean = false;
  public PatientLabInfo: LabSticker = new LabSticker();
  public showGrid: boolean = true;
  public requisitionIdList = [];
  public verificationRequired: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public pendingReportGridCol: LabPendingReportColumnSettings = null;
  //@ViewChild('searchBox') someInput: ElementRef;

  public timeId: any = null;
  public catIdList: Array<number> = [];
  public isInitialLoad: boolean = true;
  public routeAfterVerification: string;

  public loading: boolean = false;

  constructor(public labBLService: LabsBLService, public coreService: CoreService,
    public changeDetector: ChangeDetectorRef, public labService: LabService,
    public msgBoxService: MessageboxService, public router: Router,
    public patientService: PatientService, public securityService: SecurityService) {
    this.pendingReportGridCol = new LabPendingReportColumnSettings(this.securityService, this.coreService);
    this.gridColumns = this.pendingReportGridCol.PendingReportListColumnFilter(this.coreService.GetPendingReportListColumnArray());

    if (this.labService.routeNameAfterverification) {
      if (this.labService.routeNameAfterverification.toLowerCase() == 'addresult') {
        this.routeAfterVerification = 'PendingLabResults';
      } else if (this.labService.routeNameAfterverification.toLowerCase() == 'finalreports') {
        this.routeAfterVerification = 'FinalReports';
      } else if (this.labService.routeNameAfterverification.toLowerCase() == 'pendingreports') {
        this.routeAfterVerification = 'PendingReports';
      }

    }
    //this.GetPendingReportList();
  }

  ngOnInit() {
    //this.GetPendingReportList(this.fromDate, this.toDate, this.catIdList);
  }

  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus()
  }

  OnDateRangeChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

  BackToGrid() {
    this.showGrid = true;
    //reset patient on header;
    this.requisitionIdList = [];
    this.patientService.CreateNewGlobal();
    this.GetPendingReportList(this.fromDate, this.toDate, this.catIdList);
  }
  GetPendingReportList(frmdate, todate, categoryList) {
    this.reportList = [];
    this.labBLService.GetLabTestPendingReports(frmdate, todate, categoryList)
      .finally(() => { this.loading = false })//re-enable button after response comes back.
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.reportList = res.Results;
          this.reportList.forEach(result => {
            let testNameCSV: string;
            let templateNameCSV: string;
            let IsVerificationEnabled = this.coreService.EnableVerificationStep();
            result["verificationEnabled"] = IsVerificationEnabled;
            result["signatureUpdated"] = true;
            result.Tests.forEach(test => {
              if (!test.LabReportId) { result["signatureUpdated"] = false; }
              if (!testNameCSV)
                testNameCSV = test.TestName;
              else
                testNameCSV = testNameCSV + "," + test.TestName;
              //this is removed because it didnt show the same TestName of single patient Twice
              //testNameCSV += testNameCSV.includes(test.TestName) ? "" : "," + test.TestName;

              if (!templateNameCSV)
                templateNameCSV = test.ReportTemplateShortName;
              else
                templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
            });
            result.LabTestCSV = testNameCSV;
            result.TemplateName = templateNameCSV;
          });
          this.reportList = this.reportList.slice();
        }
        else {
          this.msgBoxService.showMessage('failed', ['Unable to get Final Report List']);
          console.log(res.ErrorMessage);
        }
      });
  }
  GridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "ViewDetails":
        {
          this.ViewDetail($event);
        }
        break;

      case "verify":
        {
          this.requisitionIdList = [];

          if ($event.Data.signatureUpdated) {
            $event.Data.Tests.forEach(reqId => {
              if (this.requisitionIdList && this.requisitionIdList.length) {
                if (!this.requisitionIdList.includes(reqId.RequisitionId)) {
                  this.requisitionIdList.push(reqId.RequisitionId);
                }
              }
              else {
                this.requisitionIdList.push(reqId.RequisitionId);
              }
            });

            var finalConfirmation = window.confirm("Are You sure you want to verify these tests, without viewing its result ?");

            if (finalConfirmation) {
              this.VerifyTestsDirectlyFromList();
            }
          }
          else {
            this.ViewDetail($event);
          }

        }
        break;

      case "labsticker":
        {
          this.requisitionIdList = [];
          this.PatientLabInfo.HospitalNumber = $event.Data.PatientCode;
          let dob = $event.Data.DateOfBirth;
          let gender: string = $event.Data.Gender;
          this.PatientLabInfo.AgeSex = CommonFunctions.GetFormattedAgeSex(dob, gender);
          this.PatientLabInfo.Age = CommonFunctions.GetFormattedAge(dob);
          this.PatientLabInfo.Sex = gender;
          this.PatientLabInfo.PatientName = $event.Data.PatientName;
          this.PatientLabInfo.RunNumber = $event.Data.SampleCode;
          this.PatientLabInfo.SampleCodeFormatted = $event.Data.SampleCodeFormatted;
          this.PatientLabInfo.VisitType = $event.Data.VisitType;
          this.PatientLabInfo.BarCodeNumber = $event.Data.BarCodeNumber;
          this.PatientLabInfo.TestName = $event.Data.LabTestCSV;

          $event.Data.Tests.forEach(reqId => {
            if (this.requisitionIdList && this.requisitionIdList.length) {
              if (!this.requisitionIdList.includes(reqId.RequisitionId)) {
                this.requisitionIdList.push(reqId.RequisitionId);
              }
            }
            else {
              this.requisitionIdList.push(reqId.RequisitionId);
            }
          });

          if (this.PatientLabInfo.VisitType.toLowerCase() == 'inpatient') {
            this.PatientLabInfo.VisitType = 'IP';
          } else if (this.PatientLabInfo.VisitType.toLowerCase() == 'outpatient') {
            this.PatientLabInfo.VisitType = 'OP';
          } else if (this.PatientLabInfo.VisitType.toLowerCase() == 'emergency') {
            this.PatientLabInfo.VisitType = 'ER';
          }



          this.showlabsticker = false;
          this.changeDetector.detectChanges();
          this.showlabsticker = true;


        }
      default:
        break;
    }
  }

  public ViewDetail($event) {
    this.requisitionIdList = [];
    this.patientService.getGlobal().PatientId = $event.Data.PatientId;
    this.patientService.getGlobal().ShortName = $event.Data.PatientName;
    this.patientService.getGlobal().PatientCode = $event.Data.PatientCode;
    this.patientService.getGlobal().DateOfBirth = $event.Data.DateOfBirth;
    this.patientService.getGlobal().Gender = $event.Data.Gender;
    this.patientService.getGlobal().Ins_HasInsurance = $event.Data.HasInsurance;


    //this is removed because it didnt show the two diff. RequisitionID of same TestName of single patient Twice
    //this.requisitionIdList = $event.Data.Tests.map(test => { return test.RequisitionId });
    $event.Data.Tests.forEach(reqId => {
      if (this.requisitionIdList && this.requisitionIdList.length) {
        if (!this.requisitionIdList.includes(reqId.RequisitionId)) {
          this.requisitionIdList.push(reqId.RequisitionId);
        }
      }
      else {
        this.requisitionIdList.push(reqId.RequisitionId);
      }
    });

    this.showGrid = false;
    this.showAddEditResult = false;
    this.showReport = true;
    this.verificationRequired = this.coreService.EnableVerificationStep();
    if (this.verificationRequired) {
      this.coreService.FocusInputById('btnVerify')
    }
  }



  VerifyTestsDirectlyFromList() {
    this.labBLService.VerifyAllLabTestsDirectly(this.requisitionIdList)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.GetPendingReportList(this.fromDate, this.toDate, this.catIdList);
          if (this.routeAfterVerification && this.routeAfterVerification.trim() && this.routeAfterVerification.trim().length > 0) {
            let route = '/Lab/' + this.routeAfterVerification;
            this.router.navigate([route]);
          }
        }
      });
  }

  ExitOutCall($event) {
    if ($event.exit) {
      this.PatientLabInfo = new LabSticker();
      this.requisitionIdList = [];
      this.showlabsticker = false;
    }
  }

  CloseSticker() {
    this.PatientLabInfo = new LabSticker();
    this.requisitionIdList = [];
    this.showlabsticker = false;
  }

  public CallBackBackToGrid($event) {
    if ($event.backtogrid) {
      this.BackToGrid();
    }
  }


  public GetTestListFilterByCategories() {
    if ((this.fromDate != null) && (this.toDate != null) && (this.catIdList.length > 0)) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetPendingReportList(this.fromDate, this.toDate, this.catIdList);
      } else {
        this.msgBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }

  public LabCategoryOnChange($event) {
    this.isInitialLoad = false;
    this.catIdList = [];
    // this.reportList = [];
    if ($event && $event.length) {
      $event.forEach(v => {
        this.catIdList.push(v.TestCategoryId);
      })
    }
    if (this.timeId) {
      window.clearTimeout(this.timeId);
      this.timeId = null;
    }
    this.timeId = window.setTimeout(() => {
      this.GetTestListFilterByCategories();
    }, 500);
  }

}


export class LabPendingReportColumnSettings {
  public IsVerificatioStepEnabled: boolean = true;
  public HasVerificationStepEnabled: boolean = false;
  static securityServ: any;

  constructor(public securityService: SecurityService, public coreService: CoreService) {
    this.IsVerificatioStepEnabled = this.coreService.EnableVerificationStep();
    this.HasVerificationStepEnabled = this.securityService.HasPermission('lab-verifier');
    LabPendingReportColumnSettings.securityServ = this.securityService;
  }



  public PendingReportListColumnFilter(columnObj: any): Array<any> {
    let LabTestPendingReportList: Array<any> = [
      { headerName: "Hospital No.", field: "PatientCode", width: 80 },
      { headerName: "Patient Name", field: "PatientName", width: 130 },
      { headerName: "Age/Sex", field: "", width: 90, cellRenderer: LabGridColumnSettings.AgeSexRendererPatient },
      { headerName: "Phone Number", field: "PhoneNumber", width: 100 },
      { headerName: "Test Name", field: "LabTestCSV", width: 170 },
      { headerName: "Requesting Dept.", field: "WardName", width: 70 },
      { headerName: "Run Num", field: "SampleCodeFormatted", width: 60 },
      { headerName: "BarCode Num", field: "BarCodeNumber", width: 70 },
      {
        headerName: "Action",
        field: "",
        width: 200,
        template: this.VerifyRenderer()
      }
    ];
    var filteredColumns = [];
    if (columnObj) {
      for (var prop in columnObj) {
        if (columnObj[prop] == true || columnObj[prop] == 1) {
          var headername: string = prop;
          var ind = LabTestPendingReportList.find(val => val.headerName.toLowerCase().replace(/ +/g, "") == headername.toLowerCase().replace(/ +/g, ""));
          if (ind) {
            filteredColumns.push(ind);
          }
        }
      }
      if (filteredColumns.length) {
        return filteredColumns;
      } else {
        return LabTestPendingReportList;
      }
    }
    else {
      return LabTestPendingReportList;
    }

  }

  public VerifyRenderer() {
    let template = "";
    if (LabPendingReportColumnSettings.securityServ.HasPermission("btn-pending-reports-view")) {
      template += `<a danphe-grid-action="ViewDetails" class="grid-action">
                 View Details
            </a>`
    }

    if (LabPendingReportColumnSettings.securityServ.HasPermission("btn-pending-reports-sticker")) {
      template += `<a danphe-grid-action="labsticker" class="grid-action"><i class="glyphicon glyphicon-print"></i> Sticker</a>
        `
    }

    if (this.IsVerificatioStepEnabled && this.HasVerificationStepEnabled) {
      template = template + `<a danphe-grid-action="verify" class="grid-action">Verify</a>`;
    }

    return template;
  }


}
