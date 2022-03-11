import { Component, EventEmitter, Input, Output } from "@angular/core";

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DischargeSummaryBLService } from '../shared/discharge-summary.bl.service';

import * as moment from 'moment/moment';
import { DischargeSummaryMedication } from "../../adt/shared/discharge-summary-medication.model";
//import { CommonFunctions } from "../../shared/common.functions";
import { BabyBirthDetails } from "../../adt/shared/baby-birth-details.model";
import { Observable } from "rxjs/Rx";
import { catchError } from "rxjs/internal/operators/catchError";
import { forkJoin, of } from "rxjs";
import { CoreService } from "../../../../src/app/core/shared/core.service";
import { DischargeSummaryViewModel } from "./view-templates/discharge-summary-view-model";

@Component({
    selector: 'discharge-summary-view',
    templateUrl: './discharge-summary-view.html'
})
export class DischargeSummaryViewComponent {
    public dischargeSummaryViewModel: DischargeSummaryViewModel = new DischargeSummaryViewModel();
    @Input("selectedADT")
    public selectedADT: any;
    public showSummaryView: boolean = false;
    public allMedications: Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();

    public labTestId: Array<number> = null;
    public medicationFrequency: Array<any> = new Array<any>();
    public dischargeCondition: any;
    public deliveryTypeList: any;
    public babybirthCondition: any;
    public deathTypeList: any;
    public MedicationType: string;
    public oldMedicinesCon: any;
    public oldStoppedMed: any;
    public selectedBaby: BabyBirthDetails = new BabyBirthDetails();

    public AddedTests: Array<any> = new Array<any>();
    public labTests: Array<any> = new Array<any>();
    public imagingItems: Array<any> = new Array<any>();


    public IsDefaultTemplate: boolean = false;
    public IsSCHTemplate: boolean = false;

    public ShowDoctorsSignatureImage: boolean = false;


    public IsFinalSubmited: boolean = false;;

    @Output('EditRecordEvent') sendData: EventEmitter<any> = new EventEmitter<any>();
    public IsEditMode: boolean;



    constructor(public dischargeSummaryBLService: DischargeSummaryBLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService) {
        this.AssignDischargeSummaryFormat();
        this.GetParameterValue();
    }



    @Input("showSummaryView")
    public set value(val: boolean) {
        if (val && this.selectedADT) {
            this.IsFinalSubmited = this.selectedADT.IsSubmitted;
            var reqs: Observable<any>[] = [];
            reqs.push(this.dischargeSummaryBLService.GetDischargeSummary(this.selectedADT.PatientVisitId).pipe(
                catchError((err) => {
                    // Handle specific error for this call
                    return of(err.error);
                }
                )
            ));
            reqs.push(this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedADT.PatientId, this.selectedADT.PatientVisitId).pipe(
                catchError((err) => {
                    // Handle specific error for this call
                    return of(err.error);
                }
                )
            ));
            reqs.push(this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedADT.PatientVisitId).pipe(
                catchError((err) => {
                    // Handle specific error for this call
                    return of(err.error);
                }
                )
            ));

            forkJoin(reqs).subscribe(result => {
                this.GetDischargeSummary(result[0]);
                this.GetLabRequests(result[1]);
                this.GetImagingResults(result[2]);
                this.AssignSelectedLabTests();
                this.AssignSelectedImagings();
                this.showSummaryView = true;
            });
            this.FormatDates();
        }
    }

    ngOnInit() {

    }

    AssignDischargeSummaryFormat() {
        let param = this.coreService.Parameters.find(f => f.ParameterName == "DischargeSummaryPrintFormat");
        if (param && param.ParameterValue) {

            switch (param.ParameterValue) {
                case 'Default_Format': {
                    this.IsSCHTemplate = false;
                    this.IsDefaultTemplate = true;
                    break;
                }
                case 'SCH_Format': {
                    this.IsDefaultTemplate = false;
                    this.IsSCHTemplate = true;
                    break;
                }
                default: {
                    this.IsSCHTemplate = false;
                    this.IsDefaultTemplate = true;
                    break;
                }
            }
        } else {
            this.IsDefaultTemplate = true;
        }
    }

    FormatDates() {
        this.selectedADT.DOB = moment(this.selectedADT.DateOfBirth).format('YYYY-MM-DD');
        this.selectedADT.AdmittedDate = moment(this.selectedADT.AdmittedDate).format('YYYY-MM-DD hh:mm A');
        if (this.selectedADT.DischargedDate) {
            this.selectedADT.DischargedDate = moment(this.selectedADT.DischargedDate).format('YYYY-MM-DD hh:mm A');
        }
        else
            this.selectedADT.DischargedDate = moment().format('YYYY-MM-DD HH:mm A');

    }
    GetMedicationFrequency() {
        this.dischargeSummaryBLService.GetMedicationFrequency()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.medicationFrequency = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get medication frequencies. please check log for detail.']);
                    this.logError(err.ErrorMessage);
                });
    }

    GetDischargeSummary(res) {

        if (res.Status == 'OK') {
            if (res.Results) {

                this.dischargeSummaryViewModel = res.Results;
                this.dischargeSummaryViewModel.patDischargeSummary = res.Results.DischargeSummary;

                this.dischargeSummaryViewModel.selectedADT = this.selectedADT;
                this.dischargeSummaryViewModel.selectedADT.Address = res.Results.Address;
                this.dischargeSummaryViewModel.selectedADT.DepartmentName = res.Results.DepartmentName;
            }


            if (this.dischargeSummaryViewModel.patDischargeSummary.LabTests != null) {
                this.labTests = new Array<any>();
                this.labTests = JSON.parse(this.dischargeSummaryViewModel.patDischargeSummary.LabTests);
            }

            if (res.Results.Medications.length) {
                res.Results.Medications.forEach(a => {
                    let Medication = new DischargeSummaryMedication();
                    Medication = Object.assign(Medication, a);
                    this.allMedications.push(Medication);
                });
                // this.allMedications = this.allMedications.filter(a => a.FrequencyId > 0)
                this.allMedications = this.allMedications.filter(a => a.FrequencyId == 0);
                //    this.allMedications.forEach(a=>{
                //        a.Type = this.medicationFrequency.find(s=> a.FrequencyId==s.FrequencyId).Type;
                //    })
                this.dischargeSummaryViewModel.newMedicines = this.allMedications.filter(a => a.OldNewMedicineType == 0);
                // this.oldMedicinesCon = this.allMedications.filter(a => a.OldNewMedicineType == 1);
                // this.oldStoppedMed = this.allMedications.filter(a => a.OldNewMedicineType == 2);
            }
            if (this.dischargeSummaryViewModel.patDischargeSummary && this.dischargeSummaryViewModel.patDischargeSummary.Diagnosis) {
                this.dischargeSummaryViewModel.selectedDiagnosisList = JSON.parse(this.dischargeSummaryViewModel.patDischargeSummary.Diagnosis);
            }
            if (this.dischargeSummaryViewModel.patDischargeSummary && this.dischargeSummaryViewModel.patDischargeSummary.ProvisionalDiagnosis) {
                this.dischargeSummaryViewModel.selectedProviDiagnosisList = JSON.parse(this.dischargeSummaryViewModel.patDischargeSummary.ProvisionalDiagnosis);
            }

            if (this.dischargeSummaryViewModel.patDischargeSummary.SelectedImagingItems != null) {
                this.imagingItems = new Array<any>();
                this.imagingItems = JSON.parse(this.dischargeSummaryViewModel.patDischargeSummary.SelectedImagingItems);
            }

        }
        else {
            this.showSummaryView = false;

            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }

    }

    //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
    public GetLabRequests(res) {
        // this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedADT.PatientId, this.selectedADT.PatientVisitId)
        //     .subscribe(res => {
        //         if (res.Status == 'OK') {
        //             this.dischargeSummaryViewModel.labRequests = res.Results;
        //         }
        //         else {
        //             this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        //         }
        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
        //             this.logError(err.ErrorMessage);
        //         });

        if (res.Status == 'OK') {
            this.dischargeSummaryViewModel.labRequests = res.Results;
        }
        else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
    }

    public GetImagingResults(res) {
        // this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedADT.PatientVisitId)
        //     .subscribe(res => {

        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ['Failed to get imaging results.. please check log for details.'], err.ErrorMessage);
        //         });

        if (res.Status == 'OK') {
            if (res.Results.length)
                this.dischargeSummaryViewModel.imagingResults = res.Results;
        } else {
            this.msgBoxServ.showMessage("error", ["Failed to get Imaigng Results. Check log for detail"]);
            this.logError(res.ErrorMessage);
        }
    }

    logError(err: any) {
        console.log(err);
    }


    AssignSelectedLabTests() {
        // Below code helps to find which test is selected to show result in Reports.
        // if any labRequests is found in labTests then that test is selected to show its results and its component's results.


        this.AddedTests = [];

        if (this.dischargeSummaryViewModel.labRequests.length > 0) {
            this.dischargeSummaryViewModel.labRequests.forEach(a => {

                let tempLabTests: any = this.labTests.filter(lbtst => lbtst.TestId == a.TestId);
                let selectedLabTest: any = tempLabTests[0];

                if (selectedLabTest) {

                    var aCheck = this.AddedTests.some(lt => lt.TestId == selectedLabTest.TestId);

                    if (!aCheck) {

                        // a.IsSelectTest = true;
                        if (a.labComponents && a.labComponents.length == 1) {
                            a.IsSelectTest = true;
                            this.AddedTests.push({ TestId: a.TestId, TestName: a.TestName, labComponents: [] });
                        }
                        else if (a.labComponents && a.labComponents.length > 1) {

                            var cmptArray: Array<any> = new Array<any>();

                            a.labComponents.forEach(c => {

                                if (selectedLabTest.labComponents && selectedLabTest.labComponents.length) {
                                    var cCheck = selectedLabTest.labComponents.some(ltc => ltc.ComponentName == c.ComponentName);
                                    if (cCheck) {
                                        cmptArray.push({ ComponentName: c.ComponentName });
                                        c.IsCmptSelected = true;
                                    } else {
                                        c.IsCmptSelected = false;
                                    }
                                }
                            });

                            this.AddedTests.push({ TestId: a.TestId, TestName: a.TestName, labComponents: cmptArray });

                        }
                        let selectedComponentCount: number = 0;
                        this.AddedTests.forEach(at => {
                            if (at.TestId == a.TestId) {
                                selectedComponentCount = at.labComponents.length;
                            }
                        });
                        if (selectedComponentCount == a.labComponents.length) {
                            a.IsSelectTest = true;
                        }
                        else {
                            a.IsSelectTest = false;
                            a.IsChildSelected = true;
                        }
                    }

                } else {
                    a.IsSelectTest = false;
                }
            });
        }
        // for newly added tests which doesnot has any results
        this.dischargeSummaryViewModel.NewPendingTests = [];
        this.labTests.forEach(a => {
            let check = this.dischargeSummaryViewModel.labRequests.some(f => a.TestId == f.TestId);
            if (!check) {
                this.AddedTests.push(a);
                this.dischargeSummaryViewModel.NewPendingTests.push(a);
            }
        });
    }

    AssignSelectedImagings() {
        if (this.dischargeSummaryViewModel.imagingResults && this.dischargeSummaryViewModel.imagingResults.length) {
            this.dischargeSummaryViewModel.imagingResults.forEach(a => {
                var check = this.imagingItems.some(im => im == a.ImagingItemId);
                if (check) {
                    a.IsImagingSelected = true;
                }
            });
        }
    }

    public GetParameterValue() {
        var parameter = this.coreService.Parameters.find(p => p.ParameterName == "ShowDoctorsSignatureImageInDischargeSummary" && p.ParameterGroupName == "Discharge Summary");
        if (parameter && parameter.ParameterValue && parameter.ParameterValue == "true") {
            this.ShowDoctorsSignatureImage = true;
        } else {
            this.ShowDoctorsSignatureImage = false;
        }
    }

    public AllowEditFromView($event) {
        this.IsEditMode = $event;
        this.sendData.emit(this.IsEditMode);
    }

}
