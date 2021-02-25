import { Component, ChangeDetectorRef, ElementRef, ViewChild, Input,Output } from "@angular/core";

import { PatientService } from '../../../patients/shared/patient.service';
import { LabsBLService } from '../../shared/labs.bl.service';

import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { LabPendingResultVM } from "../../shared/lab-view.models";
import { LabSticker } from '../../shared/lab-sticker.model';
import { CommonFunctions } from "../../../shared/common.functions";
import { CoreService } from "../../../core/shared/core.service";

@Component({
    selector: "danphe-lab-pending-results",
    templateUrl: "./lab-tests-pending-results.html"
})

export class LabTestsPendingResultsComponent {

    public showAddEditResult: boolean = false;
    public showlabsticker: boolean = false;
    public showReport: boolean = false;
    public showGrid: boolean = true;
    public showUndoOption: boolean = false;
    public requisitionIdList = [];
    public pendingResults: Array<LabPendingResultVM>;
    pendingLabResultsGridColumns: Array<any> = null;
    public PatientLabInfo: LabSticker = new LabSticker();
    //@ViewChild('searchBox') someInput: ElementRef;

  public verificationRequired: boolean = false;
  public showPrintEmptySheet: boolean = false;
  public showEmptySheet: boolean = false;
  public allReqIdListForPrint: Array<number> = [];

    constructor(public patientService: PatientService,public coreService: CoreService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public labBLService: LabsBLService) {
            
        this.pendingLabResultsGridColumns = LabGridColumnSettings.AddResultColumnFilter(this.coreService.GetAddResultListColumnArray());

        this.GetPendingLabResults();
    }

    ngAfterViewInit() {
        document.getElementById('quickFilterInput').focus();
    }

    BackToGrid() {
        this.showGrid = true;
        //reset patient on header;
        this.patientService.CreateNewGlobal();
        this.pendingResults = [];
        this.requisitionIdList = [];
        this.GetPendingLabResults();
    }

    GetPendingLabResults(): void {

        this.labBLService.GetPendingLabResults()
            .subscribe(res => {
                if (res.Status == "OK") {
                    if (res.Results.length) {
                        this.pendingResults = res.Results;
                        this.changeDetector.detectChanges();
                        this.pendingResults = this.pendingResults.slice();
                        this.pendingResults.forEach(result => {
                            let testNameCSV: string;
                            let templateNameCSV: string;
                            result.Tests.forEach(test => {
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
                    }
                    else {
                        this.pendingResults = null;
                        this.changeDetector.detectChanges();
                    }

                }
                else {
                    this.msgBoxServ.showMessage("failed", ["failed to get lab test of patient.. please check log for details."]);
                    console.log(res.ErrorMessage);
                }
            });
    }


    PendingResultGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "addresult":
                {                
                    this.patientService.getGlobal().PatientId = $event.Data.PatientId;
                    this.patientService.getGlobal().ShortName = $event.Data.PatientName;
                    this.patientService.getGlobal().PatientCode = $event.Data.PatientCode;
                    this.patientService.getGlobal().DateOfBirth = $event.Data.DateOfBirth;
                    this.patientService.getGlobal().Gender = $event.Data.Gender;
                    this.patientService.getGlobal().WardName = $event.Data.WardName;

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


                    this.verificationRequired = this.coreService.EnableVerificationStep();
                    this.showGrid = false;
                    this.showAddEditResult = true;
                    this.showReport = false;
                }
                break;

            case "undo":
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

                    this.showUndoOption = false;
                    this.changeDetector.detectChanges();
                    this.showUndoOption = true;

                }
                break;

          case "print-empty-sheet":
            {

              this.requisitionIdList = [];
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

              this.showEmptySheet = false;
              this.changeDetector.detectChanges();
              this.showEmptySheet = true;

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

                    if (this.PatientLabInfo.VisitType.toLocaleLowerCase() == 'inpatient') {
                        this.PatientLabInfo.VisitType = 'IP';
                    } else {
                        this.PatientLabInfo.VisitType = 'OP';
                    }
                    
                    this.showlabsticker = false;
                    this.changeDetector.detectChanges();
                    this.showlabsticker = true;

                    
                }
            default:
                break;
        }

    }

    CloseSticker() {
        this.PatientLabInfo = new LabSticker();
        this.requisitionIdList = [];
        this.showlabsticker = false;
    }

    CloseUndoBox() {
        this.PatientLabInfo = new LabSticker();
        this.requisitionIdList = [];
        this.GetPendingLabResults();
        this.showUndoOption = false;
    }

    ExitOutCall($event) {
        if ($event.exit) {
            this.PatientLabInfo = new LabSticker();
            this.requisitionIdList = [];
            this.showlabsticker = false;
        }
    }

    ExitOutUndoCall($event) {
      if ($event.exit) {
        if ($event.exit == 'exitonsuccess') {
          this.PatientLabInfo = new LabSticker();
          this.requisitionIdList = [];
          this.GetPendingLabResults();
          this.showUndoOption = false;
        }
        else if ($event.exit == 'close') {
          this.CloseUndoBox();
        }
        
      }
  }

  CancelAction($event) {
    if ($event.cancel) {
      this.BackToGrid();
    }
  }
  
  public CloseEmptyReportSheetPopUp($event) {
    if ($event.close) { this.CloseEmptySheet(); }
  }

  public CloseEmptySheet() {
    this.showEmptySheet = false;
  }


}
