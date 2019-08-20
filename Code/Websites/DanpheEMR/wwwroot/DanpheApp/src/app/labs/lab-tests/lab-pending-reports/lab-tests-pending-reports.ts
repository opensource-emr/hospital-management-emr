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

    //@ViewChild('searchBox') someInput: ElementRef;

    constructor(public labBLService: LabsBLService,public coreService: CoreService,
        public changeDetector: ChangeDetectorRef,       
        public msgBoxService: MessageboxService,
        public patientService: PatientService) {
        this.gridColumns = LabGridColumnSettings.PendingReportListColumnFilter(this.coreService.GetPendingReportListColumnArray());
        this.GetPendingReportList();
    }

    ngAfterViewInit() {
        document.getElementById('quickFilterInput').focus()
    }

    BackToGrid() {
        this.showGrid = true;
        //reset patient on header;
        this.requisitionIdList = [];
        this.patientService.CreateNewGlobal();
        this.GetPendingReportList();
    }
    GetPendingReportList() {
        this.labBLService.GetLabTestPendingReports()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.reportList = res.Results;
                    this.reportList.forEach(result => {
                        let testNameCSV: string;
                        let templateNameCSV: string;
                        let IsVerificationEnabled = this.coreService.EnableVerificationStep();
                        result["verificationEnabled"] = IsVerificationEnabled;
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
                    this.requisitionIdList = [];
                    this.patientService.getGlobal().PatientId = $event.Data.PatientId;
                    this.patientService.getGlobal().ShortName = $event.Data.PatientName;
                    this.patientService.getGlobal().PatientCode = $event.Data.PatientCode;
                    this.patientService.getGlobal().DateOfBirth = $event.Data.DateOfBirth;
                    this.patientService.getGlobal().Gender = $event.Data.Gender;
                 

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
                }
                break;

                case "verify":
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
    
                        var finalConfirmation = window.confirm("Are You sure you want to verify these tests, withour viewing its result ?");
                    
                        if(finalConfirmation){
                            this.VerifyTestsDirectlyFromList();
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
                    } else if (this.PatientLabInfo.VisitType.toLowerCase() == 'emergency'){
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

    VerifyTestsDirectlyFromList(){
        this.labBLService.VerifyAllLabTestsDirectly(this.requisitionIdList)
        .subscribe(res => {
            if(res.Status == "OK"){
                this.GetPendingReportList();
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

    public CallBackBackToGrid($event){
      if ($event.backtogrid) {
        this.BackToGrid();
      } 
    }
}
