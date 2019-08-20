import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DischargeSummaryBLService } from '../shared/discharge-summary.bl.service';

import * as moment from 'moment/moment';
import { DischargeSummary } from "../../admission/shared/discharge-summary.model";
import { DischargeSummaryMedication } from "../../admission/shared/discharge-summary-medication.model";
import { LabTest } from '../../labs/shared/lab-test.model';
import { CommonFunctions } from "../../shared/common.functions";
import { BabyBirthDetails } from "../../admission/shared/baby-birth-details.model";

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
    public newMedicines: any;
    public oldMedicinesCon: any;
    public oldStoppedMed : any;
    public showBirthCertificate: boolean = false;
    public Certificate: boolean = false;
  public showDeathCertificate: boolean = false;
  public selectedBaby: BabyBirthDetails = new BabyBirthDetails();
    constructor(public dischargeSummaryBLService: DischargeSummaryBLService,
        public msgBoxServ: MessageboxService, ) {
    }

    @Input("showSummaryView")
    public set value(val: boolean) {
        this.showSummaryView = val;
        if (this.showSummaryView && this.selectedADT) {
            this.getAllTests();
            this.GetMedicationFrequency();
            this.GetLabRequests();
            this.GetImagingResults();
            this.FormatDates();
            this.GetDischargeSummary();
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

    GetDischargeSummary() {
        this.dischargeSummaryBLService.GetDischargeSummary(this.selectedADT.PatientVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results)
                   
                    this.patDischargeSummary = res.Results.DischargeSummary;
                    if (this.patDischargeSummary.LabTests != null) {
                        this.labTestId = this.patDischargeSummary.LabTests.split(",").map(Number);
                    }

                    if(res.Results.Medications.length){
                        res.Results.Medications.forEach(a=>{
                                this.Medication = new DischargeSummaryMedication();
                                  this.Medication = Object.assign(this.Medication, a);
                                  this.allMedications.push(this.Medication);
                       });
                       this.allMedications.forEach(a=>{
                           a.Type = this.medicationFrequency.find(s=> a.FrequencyId==s.FrequencyId).Type;
                       })
                       this.newMedicines = this.allMedications.filter(a=> a.OldNewMedicineType==0);
                       this.oldMedicinesCon =this.allMedications.filter(a=> a.OldNewMedicineType==1);
                       this.oldStoppedMed = this.allMedications.filter(a=> a.OldNewMedicineType ==2);
                    }
                    if(res.Results.BabyBirthDetails.length){
                        this.selectedBaby = new BabyBirthDetails();
                        res.Results.BabyBirthDetails.forEach(a=>{
                            a.WeightOfBaby = CommonFunctions.parseAmount(a.WeightOfBaby);
                            a.BirthDate = moment(a.BirthDate).format('YYYY-MM-DD');
                        });
                        this.selectedBaby = res.Results.BabyBirthDetails[0];
                        this.patDischargeSummary.BabyBirthDetails = res.Results.BabyBirthDetails;
                        
                    }
                    if(res.Results.Certificate.length){
                        this.Certificate = true;
                    }
                    this.dischargeSummary = res.Results;

                    
                    if (this.labTestId != null) {
                        this.labRequests = [];
                        this.labTestId.forEach(a => {
                            var valid = this.LabTestList.filter(c => c.LabTestId == a);
                            if (valid.length > 0) {
                                valid.forEach(s => {
                                    this.labRequests.push({ TestId: a, TestName: s.LabTestName });
                                });
                            }
                        });
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get discharge summary.. please check log for details.'], err.ErrorMessage);
                });
    }

    //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
    public GetLabRequests() {
        this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedADT.PatientId, this.selectedADT.PatientVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.labRequests = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
                    this.logError(err.ErrorMessage);
                });
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
    public GetImagingResults() {
        this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedADT.PatientVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length)
                        this.imagingResults = res.Results;
                } else {
                    this.msgBoxServ.showMessage("error", ["Failed to get Imaigng Results. Check log for detail"]);
                    this.logError(res.ErrorMessage);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get imaging results.. please check log for details.'], err.ErrorMessage);
                });
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
        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>'


        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }
    logError(err: any) {
        console.log(err);
    }
    public ViewBirthCertificate(){
        this.CurrentDischargeSummary = this.patDischargeSummary;
        this.CurrentDischargeSummary.PatientId = this.selectedADT.PatientId;
        // this.selectedBaby.MotherName = this.selectedADT.Name;
        // this.selectedBaby.PatientId = this.selectedADT.PatientId;

        this.CurrentDischargeSummary.BabyBirthDetails.forEach(a=>{
            a.MotherName = this.selectedADT.Name;
          });
        this.showBirthCertificate = true;
      }
    ViewDeathCertificate(){
        this.CurrentDischargeSummary = this.patDischargeSummary;
        this.CurrentDischargeSummary.PatientId = this.selectedADT.PatientId;
        this.showDeathCertificate= true;
    }

    CloseViewReport(){
        this.showBirthCertificate = false;
        this.showDeathCertificate = false;
    }
}