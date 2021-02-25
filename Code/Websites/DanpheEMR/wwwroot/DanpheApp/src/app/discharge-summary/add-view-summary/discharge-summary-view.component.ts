import { Component, Input } from "@angular/core";

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DischargeSummaryBLService } from '../shared/discharge-summary.bl.service';

import * as moment from 'moment/moment';
import { DischargeSummary } from "../../adt/shared/discharge-summary.model";
import { DischargeSummaryMedication } from "../../adt/shared/discharge-summary-medication.model";
import { LabTest } from '../../labs/shared/lab-test.model';
//import { CommonFunctions } from "../../shared/common.functions";
import { BabyBirthDetails } from "../../adt/shared/baby-birth-details.model";
import { Observable } from "rxjs/Rx";
import { catchError } from "rxjs/internal/operators/catchError";
import { forkJoin, of } from "rxjs";
//import { BedInformation } from "../../adt/shared/bedinformation.model";

@Component({
    selector: 'discharge-summary-view',
    templateUrl: './discharge-summary-view.html',
})
export class DischargeSummaryViewComponent {
    public CurrentDischargeSummary: DischargeSummary = new DischargeSummary();
    public dischargeSummary: DischargeSummary;
    public patDischargeSummary: DischargeSummary;
    @Input("selectedADT")
    public selectedADT: any;
    //public labResults: any;
    public labRequests: Array<any> = Array<any>();
    public imagingResults: any;
    public showSummaryView: boolean = false;
    public Medication: DischargeSummaryMedication = new DischargeSummaryMedication();
    public allMedications: Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
    public LabTestList: Array<LabTest> = new Array<LabTest>();
    public labTestId: Array<number> = null;
    public medicationFrequency: Array<any> = new Array<any>();
    public dischargeCondition: any;
    public deliveryTypeList: any;
    public babybirthCondition: any;
    public deathTypeList: any;
    public MedicationType: string;
    public newMedicines: Array<any> = Array<any>();
    public oldMedicinesCon: any;
    public oldStoppedMed: any;
    public showBirthCertificate: boolean = false;
    public Certificate: boolean = false;
    public showDeathCertificate: boolean = false;
    public selectedBaby: BabyBirthDetails = new BabyBirthDetails();
    public selectedDiagnosisList: Array<any> = new Array<any>();

    public AddedTests: Array<any> = new Array<any>();
    public NewPendingTests: Array<any> = new Array<any>();
    public labTests: Array<any> = new Array<any>();
    public imagingItems: Array<any> = new Array<any>();


    constructor(public dischargeSummaryBLService: DischargeSummaryBLService,
        public msgBoxServ: MessageboxService,) {
    }

    @Input("showSummaryView")
    public set value(val: boolean) {
        this.showSummaryView = val;
        if (this.showSummaryView && this.selectedADT) {
            // this.GetMedicationFrequency();

            // this.GetDischargeSummary();
            // this.GetLabRequests();

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
            });
            this.FormatDates();
            this.getAllTests();
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
        // this.dischargeSummaryBLService.GetDischargeSummary(this.selectedADT.PatientVisitId)
        //     .subscribe(res => {
        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ['Failed to get discharge summary.. please check log for details.'], err.ErrorMessage);
        //         });

        if (res.Status == 'OK') {
            if (res.Results) {
                this.patDischargeSummary = res.Results.DischargeSummary;
                this.dischargeSummary = res.Results;
            }


            if (this.patDischargeSummary.LabTests != null) {
                this.labTests = new Array<any>();
                this.labTests = JSON.parse(this.patDischargeSummary.LabTests);
            }

            if (res.Results.Medications.length) {
                res.Results.Medications.forEach(a => {
                    this.Medication = new DischargeSummaryMedication();
                    this.Medication = Object.assign(this.Medication, a);
                    this.allMedications.push(this.Medication);
                });
                // this.allMedications = this.allMedications.filter(a => a.FrequencyId > 0)
                this.allMedications = this.allMedications.filter(a => a.FrequencyId == 0);
                //    this.allMedications.forEach(a=>{
                //        a.Type = this.medicationFrequency.find(s=> a.FrequencyId==s.FrequencyId).Type;
                //    })
                this.newMedicines = this.allMedications.filter(a => a.OldNewMedicineType == 0);
                // this.oldMedicinesCon = this.allMedications.filter(a => a.OldNewMedicineType == 1);
                // this.oldStoppedMed = this.allMedications.filter(a => a.OldNewMedicineType == 2);
            }
            if (this.patDischargeSummary && this.patDischargeSummary.Diagnosis) {
                this.selectedDiagnosisList = JSON.parse(this.patDischargeSummary.Diagnosis);
            }
            this.dischargeSummary = res.Results;


            // if (this.labTestId != null) {
            //     this.labRequests = [];
            //     this.labTestId.forEach(a => {
            //         var valid = this.LabTestList.filter(c => c.LabTestId == a);
            //         if (valid.length > 0) {
            //             valid.forEach(s => {
            //                 this.labRequests.push({ TestId: a, TestName: s.LabTestName });
            //             });
            //         }
            //     });
            // }
            if (this.patDischargeSummary.SelectedImagingItems != null) {
                this.imagingItems = new Array<any>();
                this.imagingItems = JSON.parse(this.patDischargeSummary.SelectedImagingItems);
            }

        }
        else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }

    }

    //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
    public GetLabRequests(res) {
        // this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedADT.PatientId, this.selectedADT.PatientVisitId)
        //     .subscribe(res => {
        //         if (res.Status == 'OK') {
        //             this.labRequests = res.Results;
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
            this.labRequests = res.Results;
        }
        else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
    }
    public getAllTests() {
        this.dischargeSummaryBLService.GetAllTests()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.LabTestList = res.Results;

                    // if (this.labTestId != null) {
                    //     this.labRequests = [];
                    //     this.labTestId.forEach(a => {
                    //         var valid = this.LabTestList.filter(c => c.LabTestId == a);
                    //         if (valid.length > 0) {
                    //             valid.forEach(s => {
                    //                 this.labRequests.push({ TestId: a, TestName: s.LabTestName });
                    //             });
                    //         }
                    //     });
                    // }
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
                    this.logError(err.ErrorMessage);
                });
    }
    //public GetLabResults() {
    //    this.admissionBLService.GetLabReportByVisitId(this.selectedADT.PatientVisitId)
    //        .subscribe(res => {
    //            if (res.Status == 'OK') {
    //                this.labResults = res.Results;
    //            } else {
    //                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //            }
    //        },
    //        err => {
    //            this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
    //            this.logError(err.ErrorMessage);
    //        });
    //}
    public GetImagingResults(res) {
        // this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedADT.PatientVisitId)
        //     .subscribe(res => {

        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ['Failed to get imaging results.. please check log for details.'], err.ErrorMessage);
        //         });

        if (res.Status == 'OK') {
            if (res.Results.length)
                this.imagingResults = res.Results;
        } else {
            this.msgBoxServ.showMessage("error", ["Failed to get Imaigng Results. Check log for detail"]);
            this.logError(res.ErrorMessage);
        }
    }

    //thi sis used to print the receipt
    print() {
        let popupWinindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();

        let documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/Danphe_ui_style.css"/>';
        documentContent += `<style>
        .img-responsive{ position: static;left: -65px;top: 10px;}
        .qr-code{position: absolute; left: 1001px;top: 9px;}
        .invoice-print-header .col-md-2 {
            width: 20%;
            float: left;
        }
        .invoice-print-header .col-md-8 {
            width: 60%;
            float: left;
        }
        .sub-main-cls, ul.adviceSubList li {
            width: 50% !important;
            display: inline-block !important;
            padding: 1%;
        }
        ul.adviceSubList li {
             flex: 0 0 47%;
        }
        .sub-main-cls-fullwidth, ul.adviceSubList li .sub-main-cls {
            width: 100% !important;
            display: block !important;
        }
        .dsv-div .left-panel .patient-hdr-label, .left-panel .patient-hdr-label {
            display: inline-block;
            width: 33.33%;
        }
        .left-panel .patient-hdr-label.signature, .dr-signature-list .patient-hdr-label {
            max-width: 400px;
            width: 100%;
            display: block;
        }
        .left-panel .patient-hdr-label b:before,
  .p-relative b:before {
    display: none !important;    
  }
  .sub-main-cls-default {
    width: 100% !important;
  }

  .sub-main-cls-default .p-relative {
    position: relative;
  }

  .sub-main-cls-default strong {
    
    font-weight: bold;
    margin-right:10px;
  }
  .left-panel .patient-hdr-label b:before, .p-relative b:before {
    display: none;
}

.lab-test-list li::before {
    transform: rotate(45deg);
    height: var(--height);
    width: var(--width);
    border-bottom: var(--borderWidth) solid var(--borderColor);
    border-right: var(--borderWidth) solid var(--borderColor);
    display: block;
    position: absolute;
    top: 7px;
    left: 0;
}
.right-panel {
    font-weight: normal;
}
ol {
    padding-left: 20px!important;
}
  .lab-test-list ol {
      padding-left: 20px!important;
  }

      </style>`;

        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }
    logError(err: any) {
        console.log(err);
    }


    AssignSelectedLabTests() {
        // Below code helps to find which test is selected to show result in Reports.
        // if any labRequests is found in labTests then that test is selected to show its results and its component's results.


        this.AddedTests = [];

        if (this.labRequests.length > 0) {
            this.labRequests.forEach(a => {

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
        this.labTests.forEach(a => {
            let check = this.labRequests.some(f => a.TestId == f.TestId);
            if (!check) {
                this.AddedTests.push(a);
                this.NewPendingTests.push(a);
            }
        });

        var temp: any = this.NewPendingTests;
    }

    AssignSelectedImagings() {
        if (this.imagingResults && this.imagingResults.length) {
            this.imagingResults.forEach(a => {
                var check = this.imagingItems.some(im => im == a.ImagingItemId);
                if (check) {
                    a.IsImagingSelected = true;
                }
            });
        }
    }
    //public ViewBirthCertificate(){
    //    this.CurrentDischargeSummary = this.patDischargeSummary;
    //    this.CurrentDischargeSummary.PatientId = this.selectedADT.PatientId;
    //    // this.selectedBaby.MotherName = this.selectedADT.Name;
    //    // this.selectedBaby.PatientId = this.selectedADT.PatientId;

    //    this.CurrentDischargeSummary.BabyBirthDetails.forEach(a=>{
    //        a.MotherName = this.selectedADT.Name;
    //      });
    //    this.showBirthCertificate = true;
    //  }
    //ViewDeathCertificate(){
    //    this.CurrentDischargeSummary = this.patDischargeSummary;
    //    this.CurrentDischargeSummary.PatientId = this.selectedADT.PatientId;
    //    this.showDeathCertificate= true;
    //}

    //CloseViewReport(){
    //    this.showBirthCertificate = false;
    //    this.showDeathCertificate = false;
    //}
}
