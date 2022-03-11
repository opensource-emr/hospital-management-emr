
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import { DischargeSummaryBLService } from '../shared/discharge-summary.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { Employee } from '../../employee/shared/employee.model';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { DischargeSummary } from "../../adt/shared/discharge-summary.model";
import { Admission } from "../../adt/shared/admission.model";
import { DischargeType } from "../../adt/shared/discharge-type.model";
import { LabTest } from '../../labs/shared/lab-test.model';
import { DischargeSummaryMedication } from "../../adt/shared/discharge-summary-medication.model";
import { CoreService } from "../../core/shared/core.service";
import { trigger, transition, style, animate } from "@angular/animations";
import { Observable } from "rxjs/Rx";
import { catchError } from "rxjs/operators";
import { of } from "rxjs/internal/observable/of";
import { forkJoin } from "rxjs";

@Component({
  selector: 'discharge-summary-add',
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(30%)', opacity: 0 }),
        animate('1000ms', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(10%)', opacity: 0 }))
      ])
    ]
    )
  ],
  templateUrl: './discharge-summary-add.html',
})
export class DischargeSummaryAddComponent {
  public CurrentDischargeSummary: DischargeSummary = new DischargeSummary();

  @Input("selectedDischarge")
  public selectedDischarge: any;

  public admission: Admission = new Admission();
  public dischargeTypeList: Array<DischargeType> = new Array<DischargeType>();
  public providerList: Array<Employee> = new Array<Employee>();
  public AnasthetistsList: Array<Employee> = new Array<Employee>();
  public LabTestList: Array<LabTest> = new Array<LabTest>();
  public labResults: any;
  public labRequests: Array<any> = new Array<any>();
  public AddedTests: Array<any> = new Array<any>();
  public AddedImgTests: Array<any> = new Array<any>();
  public imagingResults: Array<any> = new Array<any>();
  public IsSelectTest: boolean = false;
  public update: boolean = false;
  public showSummaryView: boolean = false;
  public showDischargeSummary: boolean = false;
  public disablePrint: boolean = false;
  public showUnpaidPopupBox: boolean = false;//to display the Alert-Box when trying to discharge with pending bills.
  @Input("fromClinical")
  public fromClinical: boolean = false;

  public consultant: any = null;
  public drIncharge: any = null;
  public labtest: any = null;
  public diagnosis: any = null;
  public provisonalDiagnosis: any = null;
  public anasthetists: any = null;
  public residenceDr: any = null;
  public icdsID: Array<number> = new Array<number>();
  public labTests: Array<any> = new Array<any>();
  public icd10List: Array<any> = null;
  public medicationtype: number = null;
  // public IsOldMedication:boolean = false;
  public Medication: DischargeSummaryMedication = new DischargeSummaryMedication();
  public medicationFrequency: Array<any> = new Array<any>();
  public dischargeCondition: Array<any> = new Array<any>();
  public FilteredDischargeConditions: Array<any> = new Array<any>();
  public deliveryTypeList: Array<any> = new Array<any>();
  public babybirthCondition: Array<any> = new Array<any>();
  public DischargeConditionType: boolean = false;
  public DeliveryType: boolean = false;
  public deathTypeList: Array<any> = new Array<any>();
  public Isdeath: boolean = false;
  public NoOfBabies: number = 1;
  public emptyMed: boolean = true;
  //public CurrentBabyBirthDeails: BabyBirthDetails = new BabyBirthDetails();
  public showBabyDetails: boolean = false;
  today: string;
  //public tempBabyBirthDetails: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
  public deathType: any = null;
  //public selectedBaby: BabyBirthDetails = new BabyBirthDetails();
  //public showBirthCertificate: boolean = false;
  public selectUnselectAllLabTests: boolean = false;
  public CurrentFiscalYear: string = null;
  public NewMedications: Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
  public OldMedications: Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
  public StoppedOldMedications: Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
  public DeathCertificateNumber: string = null;
  public dischargeSummaryClassObj = { col9: "col-md-9 col-xs-12", col12: "col-md-12" }
  //public sendableData: any;
  @Output("sendData") sendData: EventEmitter<any> = new EventEmitter<any>();
  @Output("CallBackFromAdd") callback: EventEmitter<any> = new EventEmitter<any>();
  public selectedDiagnosisList: Array<any> = new Array<any>();
  public selectedProviDiagnosisList: Array<any> = new Array<any>();
  public IsReportWithResult: boolean = false;
  public showChooseTestResultPopup: boolean = false;
  imagingItems: any[];
  // public showTestsWithoutResult: boolean = true;
  // stringifiedDiagnosisList: string;
  constructor(public dischargeSummaryBLService: DischargeSummaryBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService,
    public router: Router) {
    this.GetProviderList();
    this.GetDischargeType();
    this.GetAnasthetistsEmpList();
    // this.GetICDList();
    // this.GetAllTests();
    // this.GetMedicationFrequency();
    this.GetFiscalYear();
  }

  @Input("showDischargeSummary")
  public set value(val: boolean) {
    this.showDischargeSummary = val;
    if (this.selectedDischarge && this.showDischargeSummary) {
      this.LoadAllFunctions();
    }
  }

  LoadAllFunctions() {

    var reqs: Observable<any>[] = [];
    reqs.push(this.dischargeSummaryBLService.GetDischargeSummary(this.selectedDischarge.PatientVisitId).pipe(
      catchError((err) => {
        // Handle specific error for this call
        return of(err.error);
      }
      )
    ));
    reqs.push(this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedDischarge.PatientId, this.selectedDischarge.PatientVisitId).pipe(
      catchError((err) => {
        // Handle specific error for this call
        return of(err.error);
      }
      )
    ));
    reqs.push(this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedDischarge.PatientVisitId).pipe(
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

    this.GetICDList();
    this.GetAllTests();
    this.medicationtype = 0;
    // this.AddMedicine(0);
    // this.AddMedicine(1);
    // this.AddMedicine(2);
    // this.GetMedicationFrequency();
    this.AddedTests = [];
    this.CheckDeathType();
    this.GetDischargeConditions();
    this.GetDeliveryTypes();
    //this.GetBabyBirthCondition();
    this.GetDeathType();
    this.today = moment().format('YYYY-MM-DD');
  }

  focusOut() {
    this.DataValidation();
    if (this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {
      this.GenerateDischargeSummaryData();
      this.sendData.emit(this.CurrentDischargeSummary);
    }
  }

  CheckDeathType() {
    this.deathType = this.coreService.CheckDeathType();
  }

  public GetDischargeType() {
    this.dischargeSummaryBLService.GetDischargeType()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.dischargeTypeList = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get discharge type.. please check log for details.']);
          this.logError(err.ErrorMessage);
        });
  }
  public GetProviderList() {
    this.dischargeSummaryBLService.GetProviderList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.providerList = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get Doctors list.. please check log for details.']);
          this.logError(err.ErrorMessage);
        });
  }
  public GetDeathType() {
    this.dischargeSummaryBLService.GetDeathType()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.deathTypeList = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      })
  }
  public GetAnasthetistsEmpList() {
    this.dischargeSummaryBLService.GetAnasthetistsEmpList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.AnasthetistsList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get Anasthetist-Doctor list.. please check the log for details."]);
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get Anasthetist-Doctors list.. please check log for details.']);
          this.logError(err.ErrorMessage);
        });
  }

  public GetICDList() {
    this.dischargeSummaryBLService.GetICDList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.icd10List = res.Results;
          // this.icd10List.forEach(a=>{
          //     this.icdsID.push(a.ICD10Id);
          // });
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get ICD10.. please check log for detail.']);
          this.logError(err.ErrorMessage);
        });
  }
  public GetLabResults() {
    this.dischargeSummaryBLService.GetLabReportByVisitId(this.selectedDischarge.PatientVisitId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.labResults = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
          this.logError(err.ErrorMessage);
        });
  }
  public GetAllTests() {
    this.dischargeSummaryBLService.GetAllTests()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.LabTestList = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
          this.logError(err.ErrorMessage);
        });

  }

  public GetDischargeConditions() {
    this.dischargeSummaryBLService.GetDischargeConditions()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.dischargeCondition = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
          this.logError(err.ErrorMessage);
        });
  }
  private GetDeliveryTypes() {
    this.dischargeSummaryBLService.GetDeliveryType()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.deliveryTypeList = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      })
  }

  //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
  public GetLabRequests(res) {
    // this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedDischarge.PatientId, this.selectedDischarge.PatientVisitId)
    //   .subscribe(res => {
    //     if (res.Status == 'OK') {
    //       this.labRequests = res.Results;

    //       // Below code helps to find which test is selected to show result in Reports.
    //       // if any labRequests is found in labTests then that test is selected to show its results and its component's results.
    //       if (this.labRequests.length > 0) {
    //         this.labRequests.forEach(a => {
    //           var check = this.labTests.includes(a.TestId);
    //           if (check) {

    //             if (a.labComponents.length == 1) {
    //               a.IsSelectTest = true;
    //             }
    //             else if (a.labComponents.length > 1) {
    //               let selectedComponentCount: number = 0;
    //               a.labComponents.forEach(c => {

    //                 this.labTests.forEach(lt => {
    //                   var cCheck = lt.labComponents.includes(c.ComponentName);
    //                   if (cCheck) {
    //                     c.IsCmptSelected = true;
    //                     selectedComponentCount = +selectedComponentCount;
    //                   }
    //                 });

    //               });
    //               if (selectedComponentCount == a.labComponents.length) {
    //                 a.IsSelectTest = true;
    //               }
    //             }
    //           }
    //         });
    //       }
    //       // this.AssignLabTests();
    //     }
    //     else {
    //       this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //     }
    //   },
    //     err => {
    //       this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
    //       this.logError(err.ErrorMessage);
    //     });



    if (res.Status == 'OK') {
      this.labRequests = res.Results;

      // this.AssignLabTests();
    }
    else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
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
            // else {
            //   a.IsSelectTest = false;
            // }


            this.IsReportWithResult = true;
          }

        }
      });
    }
    var temp: any = this.labRequests;
    // for newly added tests which doesnot has any results
    this.labTests.forEach(a => {
      let check = this.labRequests.some(f => a.TestId == f.TestId);
      if (!check) {
        this.AddedTests.push(a);
      }
    });
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
  public GetImagingResults(res) {
    // this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedDischarge.PatientVisitId)
    //   .subscribe(res => {

    //   },
    //     err => {
    //       this.msgBoxServ.showMessage("error", ['Failed to get imaging results.. please check log for details.'], err.ErrorMessage);
    //     });

    if (res.Status == 'OK') {
      if (res.Results.length)
        this.imagingResults = res.Results;
    } else {
      this.msgBoxServ.showMessage("error", ["Failed to get Imaigng Results. Check log for detail"]);
      this.logError(res.ErrorMessage);
    }
  }
  //for doctor's list
  myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }
  //for anaesthetist doctor's list
  ListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  labTestFormatter(data: any): string {
    let html = data["LabTestName"];
    return html;
  }

  dischargeTypeListFormatter(data: any): string {
    let html = data["DischargeTypeName"];
    return html;
  }
  DignosisFormatter(data: any): string {
    let html = data["icd10Description"];
    return html;
  }
  //below methods loadConsultant(),loadDrIncharge(),loadAnasthetists(),loadResidenceDr() will set the EmployeeId for respective drs
  loadConsultant() {
    this.CurrentDischargeSummary.ConsultantId = this.consultant ? this.consultant.EmployeeId : null;
  }

  loadDrIncharge() {
    this.CurrentDischargeSummary.DoctorInchargeId = this.drIncharge ? this.drIncharge.EmployeeId : null;
  }

  loadAnasthetists() {
    this.CurrentDischargeSummary.AnaesthetistsId = this.anasthetists ? this.anasthetists.EmployeeId : null;
  }

  loadResidenceDr() {
    this.CurrentDischargeSummary.ResidenceDrId = this.residenceDr ? this.residenceDr.EmployeeId : null;
  }

  loadICDs() {
    this.CurrentDischargeSummary.Diagnosis = this.diagnosis ? this.diagnosis.icd10Description : null;
  }

  loadlabTest() {
    var temp = this.labtest ? this.labtest.LabTestId : null;
    if (temp > 0) {
      var check = this.AddedTests.filter(a => a.TestId == temp);
      if (!check.length) {
        this.AddedTests.push({ TestId: temp, TestName: this.labtest.LabTestName, labComponents: [] });
      } else {
        alert(`${this.labtest.TestName} Already Added !`);
        this.labtest = undefined;
      }
      this.labtest = '';
    }
  }
  //discharge summary
  GetDischargeSummary(res) {

    // this.dischargeSummaryBLService.GetDischargeSummary(this.selectedDischarge.PatientVisitId)
    //   .subscribe(res => {
    //     if (res.Status == 'OK') {
    //       if (res.Results) {
    //         this.CurrentDischargeSummary = new DischargeSummary();
    //         this.CurrentDischargeSummary = Object.assign(this.CurrentDischargeSummary, res.Results.DischargeSummary);
    //         if (this.CurrentDischargeSummary.DischargeConditionId) {
    //           this.FilteredDischargeConditions = this.dischargeCondition.filter(a => a.DischargeTypeId == this.CurrentDischargeSummary.DischargeConditionId);
    //           if (this.FilteredDischargeConditions.length > 0) {
    //             this.DischargeConditionType = true;
    //           }
    //         }
    //         if (this.CurrentDischargeSummary.DeliveryTypeId) {
    //           this.DeliveryType = true;
    //         }
    //         else if (this.CurrentDischargeSummary.DeathTypeId) {
    //           this.Isdeath = true;
    //         }
    //         if (this.CurrentDischargeSummary && this.CurrentDischargeSummary.Diagnosis) {
    //           this.selectedDiagnosisList = JSON.parse(this.CurrentDischargeSummary.Diagnosis);
    //         }
    //         //if (res.Results.BabyBirthDetails.length) {
    //         //  this.CurrentDischargeSummary.BabyBirthDetails = new Array<BabyBirthDetails>();
    //         //  res.Results.BabyBirthDetails.forEach(a => {
    //         //    this.CurrentBabyBirthDeails = Object.assign(this.CurrentBabyBirthDeails, a);
    //         //    this.CurrentDischargeSummary.BabyBirthDetails.push(this.CurrentBabyBirthDeails);
    //         //  });
    //         //  this.CurrentDischargeSummary.BabysFathersName = this.CurrentDischargeSummary.BabyBirthDetails[0].FathersName;
    //         //  this.CurrentDischargeSummary.BabyBirthDetails.forEach(a => {
    //         //    a.BirthDate = moment(a.BirthDate).format('YYYY-MM-DD');
    //         //    this.tempBabyBirthDetails.push(a);
    //         //  });
    //         //  this.NoOfBabies = res.Results.BabyBirthDetails.length;
    //         //  this.showBabyDetails = true;
    //         //}
    //         if (res.Results.Medications.length) {
    //           this.CurrentDischargeSummary.DischargeSummaryMedications = new Array<DischargeSummaryMedication>();
    //           res.Results.Medications.forEach(a => {
    //             this.Medication = new DischargeSummaryMedication();
    //             this.NewMedications = new Array<DischargeSummaryMedication>();

    //             if (a.OldNewMedicineType == 0) {
    //               this.Medication = Object.assign(this.Medication, a);
    //               this.NewMedications.push(this.Medication);
    //             }
    //             // else if (a.OldNewMedicineType == 1) {
    //             //   this.Medication = Object.assign(this.Medication, a);
    //             //   this.OldMedications.push(this.Medication);
    //             // }
    //             // else {
    //             //   this.Medication = Object.assign(this.Medication, a);
    //             //   this.StoppedOldMedications.push(this.Medication);
    //             // }
    //           });
    //           if (!this.NewMedications.length)
    //             this.AddMedicine(0);
    //           // if (!this.OldMedications.length)
    //           //   this.AddMedicine(1);
    //           // if (!this.StoppedOldMedications.length)
    //           //   this.AddMedicine(2);
    //         }
    //         else {
    //           this.AddMedicine(0);
    //           // this.AddMedicine(1);
    //           // this.AddMedicine(2);
    //         }
    //         if (this.CurrentDischargeSummary.LabTests != null) {

    //           // this.labTestId = new Array<number>();

    //           // this.labTestId = this.CurrentDischargeSummary.LabTests.split(",").map(Number);
    //           this.labTests = new Array<any>();
    //           this.labTests = JSON.parse(this.CurrentDischargeSummary.LabTests);
    //         }


    //         this.consultant = res.Results.ConsultantName;
    //         this.drIncharge = res.Results.DoctorInchargeName;
    //         //when given doctor is not present we get drname string as '.  ' , so we check if name length is greater than 3 then only will show name of doctor
    //         if (res.Results.Anaesthetists.length > 3) {
    //           this.anasthetists = res.Results.Anaesthetists;
    //         }
    //         if (res.Results.ResidenceDrName.length > 3) {
    //           this.residenceDr = res.Results.ResidenceDrName;
    //         }
    //         this.update = true;
    //       }
    //       else {
    //         this.update = false;
    //         this.CurrentDischargeSummary = new DischargeSummary();
    //         this.CurrentDischargeSummary.PatientVisitId = this.selectedDischarge.PatientVisitId;
    //         this.CurrentDischargeSummary.ConsultantId = this.selectedDischarge.AdmittingDoctorId;
    //         this.CurrentDischargeSummary.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //         //default residence doctor will be current logged in user.
    //         //Ashim: 15Dec2017 : RResidenceDr is not mandatory
    //         //this.CurrentDischargeSummary.ResidenceDrId = this.securityService.GetLoggedInUser().EmployeeId;
    //         this.CurrentDischargeSummary.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
    //         this.AddMedicine(0);
    //         this.AddMedicine(1);
    //         this.AddMedicine(2);
    //       }

    //     } else {
    //       this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //     }
    //   },
    //     err => {
    //       this.msgBoxServ.showMessage("error", ['Failed to get discharge summary.. please check log for details.']);
    //       this.logError(err.ErrorMessage);
    //     });

    if (res.Status == 'OK') {
      if (res.Results) {
        this.CurrentDischargeSummary = new DischargeSummary();
        this.CurrentDischargeSummary = Object.assign(this.CurrentDischargeSummary, res.Results.DischargeSummary);
        if (this.CurrentDischargeSummary.DischargeConditionId) {
          this.FilteredDischargeConditions = this.dischargeCondition.filter(a => a.DischargeTypeId == this.CurrentDischargeSummary.DischargeConditionId);
          if (this.FilteredDischargeConditions.length > 0) {
            this.DischargeConditionType = true;
          }
        }
        if (this.CurrentDischargeSummary.DeliveryTypeId) {
          this.DeliveryType = true;
        }
        else if (this.CurrentDischargeSummary.DeathTypeId) {
          this.Isdeath = true;
        }
        if (this.CurrentDischargeSummary && this.CurrentDischargeSummary.Diagnosis) {
          this.selectedDiagnosisList = JSON.parse(this.CurrentDischargeSummary.Diagnosis);
        }
        if (this.CurrentDischargeSummary && this.CurrentDischargeSummary.ProvisionalDiagnosis) {
          this.selectedProviDiagnosisList = JSON.parse(this.CurrentDischargeSummary.ProvisionalDiagnosis);
        }
        //if (res.Results.BabyBirthDetails.length) {
        //  this.CurrentDischargeSummary.BabyBirthDetails = new Array<BabyBirthDetails>();
        //  res.Results.BabyBirthDetails.forEach(a => {
        //    this.CurrentBabyBirthDeails = Object.assign(this.CurrentBabyBirthDeails, a);
        //    this.CurrentDischargeSummary.BabyBirthDetails.push(this.CurrentBabyBirthDeails);
        //  });
        //  this.CurrentDischargeSummary.BabysFathersName = this.CurrentDischargeSummary.BabyBirthDetails[0].FathersName;
        //  this.CurrentDischargeSummary.BabyBirthDetails.forEach(a => {
        //    a.BirthDate = moment(a.BirthDate).format('YYYY-MM-DD');
        //    this.tempBabyBirthDetails.push(a);
        //  });
        //  this.NoOfBabies = res.Results.BabyBirthDetails.length;
        //  this.showBabyDetails = true;
        //}
        if (res.Results.Medications.length) {
          this.CurrentDischargeSummary.DischargeSummaryMedications = new Array<DischargeSummaryMedication>();
          this.NewMedications = new Array<DischargeSummaryMedication>();
          res.Results.Medications.forEach(a => {
            this.Medication = new DischargeSummaryMedication();
            if (a.OldNewMedicineType == 0) {
              this.Medication = Object.assign(this.Medication, a);
              this.NewMedications.push(this.Medication);
            }
            // else if (a.OldNewMedicineType == 1) {
            //   this.Medication = Object.assign(this.Medication, a);
            //   this.OldMedications.push(this.Medication);
            // }
            // else {
            //   this.Medication = Object.assign(this.Medication, a);
            //   this.StoppedOldMedications.push(this.Medication);
            // }
          });
          if (!this.NewMedications.length)
            this.AddMedicine(0);
          // if (!this.OldMedications.length)
          //   this.AddMedicine(1);
          // if (!this.StoppedOldMedications.length)
          //   this.AddMedicine(2);
        }
        else {
          this.AddMedicine(0);
          // this.AddMedicine(1);
          // this.AddMedicine(2);
        }
        if (this.CurrentDischargeSummary.LabTests != null) {

          // this.labTestId = new Array<number>();

          // this.labTestId = this.CurrentDischargeSummary.LabTests.split(",").map(Number);
          this.labTests = new Array<any>();
          this.labTests = JSON.parse(this.CurrentDischargeSummary.LabTests);
        }

        if (this.CurrentDischargeSummary.SelectedImagingItems != null) {
          this.imagingItems = new Array<any>();
          this.imagingItems = JSON.parse(this.CurrentDischargeSummary.SelectedImagingItems);
          this.AddedImgTests = this.imagingItems;
        }


        this.consultant = res.Results.ConsultantName;
        this.drIncharge = res.Results.DoctorInchargeName;
        //when given doctor is not present we get drname string as '.  ' , so we check if name length is greater than 3 then only will show name of doctor
        if (res.Results.Anaesthetists.length > 3) {
          this.anasthetists = res.Results.Anaesthetists;
        }
        if (res.Results.ResidenceDrName.length > 3) {
          this.residenceDr = res.Results.ResidenceDrName;
        }
        this.update = true;
      }
      else {
        this.update = false;
        this.CurrentDischargeSummary = new DischargeSummary();
        this.CurrentDischargeSummary.PatientVisitId = this.selectedDischarge.PatientVisitId;
        this.CurrentDischargeSummary.ConsultantId = this.selectedDischarge.AdmittingDoctorId;
        this.CurrentDischargeSummary.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //default residence doctor will be current logged in user.
        //Ashim: 15Dec2017 : RResidenceDr is not mandatory
        //this.CurrentDischargeSummary.ResidenceDrId = this.securityService.GetLoggedInUser().EmployeeId;
        this.CurrentDischargeSummary.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
        this.AddMedicine(0);
        this.AddMedicine(1);
        this.AddMedicine(2);
      }

    } else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
  }

  DataValidation() {
    this.CheckValidation();
    this.CurrentDischargeSummary.DischargeSummaryMedications = new Array<DischargeSummaryMedication>();
    for (var i in this.CurrentDischargeSummary.DischargeSummaryValidator.controls) {
      this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].markAsDirty();
      this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].updateValueAndValidity();
      // this.CurrentDischargeSummary.DischargeSummaryMedications[i].DischargeSummaryMedicationValidator.controls['Medicine'].disable();
    }
  }

  GenerateDischargeSummaryData() {

    this.GenerateMedicationData();

    this.GenerateInvestigationData();

    // for multiple diagnosis
    if (this.selectedDiagnosisList.length > 0) {
      let tempString = JSON.stringify(this.selectedDiagnosisList);
      this.CurrentDischargeSummary.Diagnosis = tempString;
    }

    // for multiple provisional diagnosis
    if (this.selectedProviDiagnosisList.length > 0) {
      let tempString = JSON.stringify(this.selectedProviDiagnosisList);
      this.CurrentDischargeSummary.ProvisionalDiagnosis = tempString;
    }

    // Generating selected Imaging items
    this.CurrentDischargeSummary.SelectedImagingItems = JSON.stringify(this.AddedImgTests);
  }

  GenerateInvestigationData() {
    this.labTests = new Array<any>();
    this.CurrentDischargeSummary.LabTests = '';
    if (this.AddedTests.length > 0) {
      this.AddedTests.forEach(a => {
        this.labTests.push(a);
      });
    }
    this.CurrentDischargeSummary.LabTests = JSON.stringify(this.labTests);
  }

  GenerateMedicationData() {

    if (this.NewMedications.length > 0) {
      this.NewMedications.forEach(a => {
        if (a.Medicine) {
          this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);

        }
      });
    }

    // if (this.NewMedications.length && this.Isdeath == false) {
    //   for (var summ of this.NewMedications) {
    //     for (var b in summ.DischargeSummaryMedicationValidator.controls) {
    //       summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
    //       summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
    //     }
    //     if (!summ.IsValidCheck(undefined, undefined)) {
    //       validDischarge = false;
    //       return;
    //     }
    //   };
    //   if (validDischarge) {
    //     this.NewMedications.forEach(a => {
    //       this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
    //     });
    //   }
    // }

    // if (this.CurrentDischargeSummary.DischargeSummaryMedications.length) {
    //   this.CurrentDischargeSummary.DischargeSummaryMedications.forEach(a => {
    //     a.OldNewMedicineType = this.medicationtype;
    //   });
    // }

    // if (this.OldMedications.length > 0) {
    //   this.OldMedications.forEach(a => {
    //     this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
    //   });
    // }
    // if (this.StoppedOldMedications.length > 0) {
    //   this.StoppedOldMedications.forEach(a => {
    //     this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
    //   });
    // }



    // if (this.OldMedications.length && this.Isdeath == false) {
    //   for (var summ of this.OldMedications) {
    //     for (var b in summ.DischargeSummaryMedicationValidator.controls) {
    //       summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
    //       summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
    //     }
    //     if (!summ.IsValidCheck(undefined, undefined)) {
    //       validDischarge = false;
    //       return;
    //     }
    //   };
    //   if (validDischarge) {
    //     this.OldMedications.forEach(a => {
    //       this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
    //     });
    //   }
    // }
    // if (this.StoppedOldMedications.length && this.Isdeath == false) {
    //   for (var summ of this.StoppedOldMedications) {
    //     for (var b in summ.DischargeSummaryMedicationValidator.controls) {
    //       summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
    //       summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
    //     }
    //     if (!summ.IsValidCheck(undefined, undefined)) {
    //       validDischarge = false;
    //       return;
    //     }
    //   };
    //   if (validDischarge) {
    //     this.StoppedOldMedications.forEach(a => {
    //       this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
    //     });
    //   }
    // }
  }



  PostDischargeSummary() {
    this.CurrentDischargeSummary.IsSubmitted = false;
    this.dischargeSummaryBLService.PostDischargeSummary(this.CurrentDischargeSummary)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ["Discharge Summary Saved"]);
            this.showDischargeSummary = false;
            this.showSummaryView = true;
            this.update = true;
            this.CurrentDischargeSummary.DischargeSummaryId = res.Results.DischargeSummaryId;
            this.sendData.emit({ Status: "Ok" });
            this.CallBackAddUpdate(res);

          }
          else {
            this.msgBoxServ.showMessage("failed", ["Check log for errors"]);
            this.logError(res.ErrorMessage);
          }
        },
        err => {
          this.logError(err);

        });
  }

  PutDischargeSummary() {
    this.CurrentDischargeSummary.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.CurrentDischargeSummary.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
    this.dischargeSummaryBLService.UpdateDischargeSummary(this.CurrentDischargeSummary)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ["Discharge Summary Updated"]);

            this.showDischargeSummary = false;
            this.CallBackAddUpdate(res);
            this.sendData.emit({data:"res", Status: "Ok" });
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Check log for errors"]);
            this.logError(res.ErrorMessage);
          }
        },
        err => {
          this.logError(err);
        });
  }

  Save() {

    this.DataValidation();

    if (this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {

      this.GenerateDischargeSummaryData();

      this.PostDischargeSummary();

    }
    else {
      this.msgBoxServ.showMessage("failed", ["Enter Manditory fields"]);
    }
  }

  Update() {

    this.DataValidation();

    if (this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {

      this.GenerateDischargeSummaryData();

      this.PutDischargeSummary();

    }
    else {
      this.msgBoxServ.showMessage("failed", ["Enter fill Manditory fields"]);
    }
  }

  CallBackAddUpdate(dischargeSummary: DischargeSummary) {
    this.CurrentDischargeSummary = Object.assign(this.CurrentDischargeSummary, dischargeSummary);
    this.callback.emit(this.CurrentDischargeSummary);
    
  }

  SubmitAndViewSummary() {
    var view: boolean;
    view = window.confirm("You won't be able to make further changes. Do you want to continue?");
    if (view) {
      this.CurrentDischargeSummary.IsSubmitted = true;
      this.Update();
      this.showDischargeSummary = false;
      this.showSummaryView = true;
    }
  }

  logError(err: any) {
    console.log(err);
  }

  onChange($event) {
    this.icdsID = [];
    $event.forEach(a => {
      this.icdsID.push(a.ICD10Id);
    });
  }
  LabTestSelection(index: number) {
    try {
      if (this.labRequests[index].IsSelectTest) {

        // let check = this.AddedTests.some(a => a.TestId == this.labRequests[index].TestId);
        // if (!check) {
        //   this.AddedTests.push({ TestId: this.labRequests[index].TestId, TestName: this.labRequests[index].TestName, labComponents: [] });

        //   if (this.labRequests[index].labComponents.length > 1) {

        //     let addedIndex: number;
        //     this.AddedTests.forEach((f, i) => {
        //       if (f.TestId == this.labRequests[index].TestId) {
        //         addedIndex = i;
        //       }
        //     });

        //     this.labRequests[index].labComponents.forEach((c, ci) => {
        //       if (ci > 0) {
        //         this.AddedTests[addedIndex].labComponents.push({ ComponentName: c.ComponentName });
        //       }
        //     });

        //   }
        // } else {

        // }

        let check = this.AddedTests.some(a => a.TestId == this.labRequests[index].TestId);
        // Removing already existed lab test
        if (check) {
          let selectedTestId = this.labRequests[index].TestId;

          this.AddedTests.forEach((v, i) => {
            if (v.TestId == selectedTestId) {
              this.AddedTests.splice(i, 1);
              this.selectUnselectAllLabTests = false;
            }
          });

          if (this.labRequests[index].labComponents.length > 1) {
            this.labRequests[index].labComponents.forEach(c => {
              c.IsCmptSelected = false;
            });
          }

        }

        //Adding lab test with all the sub components
        if (this.labRequests[index].labComponents.length > 1) {

          let cmptArrary: Array<any> = new Array<any>();
          this.labRequests[index].labComponents.forEach((c) => {
            cmptArrary.push({ ComponentName: c.ComponentName });
          });
          this.AddedTests.push({ TestId: this.labRequests[index].TestId, TestName: this.labRequests[index].TestName, labComponents: cmptArrary });
        } else {
          this.AddedTests.push({ TestId: this.labRequests[index].TestId, TestName: this.labRequests[index].TestName, labComponents: [] });
        }

        if (this.labRequests[index].labComponents.length > 1) {
          this.labRequests[index].labComponents.forEach(c => {
            c.IsCmptSelected = true;
          });
        }
        this.selectUnselectAllLabTests = true;
      }
      else {
        let selectedTestId = this.labRequests[index].TestId;

        this.AddedTests.forEach((v, i) => {
          if (v.TestId == selectedTestId) {
            this.AddedTests.splice(i, 1);
            this.selectUnselectAllLabTests = false;
          }
        });

        if (this.labRequests[index].labComponents.length > 1) {
          this.labRequests[index].labComponents.forEach(c => {
            c.IsCmptSelected = false;
          });
        }
        this.selectUnselectAllLabTests = false;
      }
    } catch (ex) {
      // this.ShowCatchErrMessage(ex);
    }
  }

  RemoveAddedTest(index: number) {
    let selectedTestId = this.AddedTests[index].TestId;
    this.labRequests.forEach((v, i) => {
      if (v.TestId == selectedTestId) {
        this.labRequests[i].IsSelectTest = false;
      }
    })

    this.AddedTests.splice(index, 1);
    this.selectUnselectAllLabTests = false;

  }


  AddMedicine(val) {
    try {

      var newMedicine = new DischargeSummaryMedication();
      newMedicine.FrequencyId = 0;
      if (val == 0) {
        newMedicine.OldNewMedicineType = 0;

        if (this.NewMedications.length == 0) {
          this.NewMedications.push(newMedicine);
        } else {
          if (this.NewMedications[this.NewMedications.length - 1].Medicine) {
            this.NewMedications.push(newMedicine);
            // Focus to newly created medication input field
            let latestId = this.NewMedications.length - 1;
            this.FocusOnInputField(latestId);
          } else {
            alert("First Enter the medication in exising field!");
          }
        }
      }
      else if (val == 1) {
        newMedicine.OldNewMedicineType = 1;
        this.OldMedications.push(newMedicine);
      }
      else if (val == 2) {
        newMedicine.OldNewMedicineType = 2;
        this.StoppedOldMedications.push(newMedicine);
      }

    } catch (ex) {
      //this.ShowCatchErrMessage(ex);
    }
  }
  RemoveMedicine(index, type) {
    try {
      // this.CurrentDischargeSummary.DischargeSummaryMedications.splice(index, 1);
      if (type == 0) {
        this.NewMedications.splice(index, 1);
      }
      else if (type == 1) {
        this.OldMedications.splice(index, 1);
      }
      else {
        this.StoppedOldMedications.splice(index, 1);
      }
      if (this.NewMedications.length == 0)
        this.AddMedicine(0);
      else if (this.OldMedications.length == 0)
        this.AddMedicine(1);
      else if (this.StoppedOldMedications.length == 0)
        this.AddMedicine(2);
    }
    catch {

    }
  }

  public CheckValidation() {
    if (this.CurrentDischargeSummary) {
      this.CurrentDischargeSummary.UpdateValidator("off", "DischargeConditionId", "required");
      if (this.DischargeConditionType) {
        //set validator on
        this.CurrentDischargeSummary.UpdateValidator("on", "DischargeConditionId", "required");

      }
    }
  }


  public GetFiscalYear() {
    this.dischargeSummaryBLService.GetCurrentFiscalYear()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.CurrentFiscalYear = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  OnChangeDischargeType(newtype) {
    this.DischargeConditionType = false;
    this.DeliveryType = false;
    this.showBabyDetails = false;
    this.Isdeath = false;
    this.CurrentDischargeSummary.DeliveryTypeId = null;
    //this.CurrentDischargeSummary.BabyBirthConditionId = null;
    this.CurrentDischargeSummary.DeathTypeId = null;
    //this.CurrentDischargeSummary.DeathPeriod = null;
    this.FilteredDischargeConditions = new Array<any>();
    var checktypeId = this.CurrentDischargeSummary.DischargeTypeId;
    checktypeId = newtype;
    this.FilteredDischargeConditions = this.dischargeCondition.filter(a => a.DischargeTypeId == newtype);
    var tempCheckDeath = this.deathType.filter(a => a.DischargeTypeId == newtype);
    if (this.FilteredDischargeConditions.length > 0) {
      this.DischargeConditionType = true;
    }
    else if (tempCheckDeath.length > 0) {
      this.Isdeath = true;
      //this.GenerateDeathCertificateNumber();
      //this.CurrentDischargeSummary.DeathPeriod = tempCheckDeath[0].DischargeTypeName;
    }

  }
  OnChangeDischargeConditionType(condition) {
    var checkDeliveryId = Number(condition);
    this.DeliveryType = false;
    this.showBabyDetails = false;
    var check = this.deliveryTypeList.filter(a => a.DischargeConditionId == checkDeliveryId);
    if (check.length > 0) {
      this.DeliveryType = true;
      //var babyDetails = new BabyBirthDetails();
      //this.showBabyDetails = true;
      //this.CurrentDischargeSummary.BabyBirthDetails = new Array<BabyBirthDetails>();
      //babyDetails.BirthDate = this.today;
      //babyDetails.BirthTime = moment().format("hh:mm:ss");
      //babyDetails.CertificateNumber = this.GenerateCertificateNumber(babyDetails.BirthDate);
      //this.CurrentDischargeSummary.BabyBirthDetails.push(babyDetails);
    }
  }

  public MakeDiagnosisList() {
    // console.log(this.diagnosis);
    if (this.diagnosis != undefined && typeof (this.diagnosis) != "string") {
      if (this.selectedDiagnosisList.length > 0) {
        let temp: Array<any> = this.selectedDiagnosisList;
        let isICDDuplicate: boolean = false;


        if (temp.some(d => d.ICD10Id == this.diagnosis.ICD10Id)) {
          isICDDuplicate = true;
          alert(`${this.diagnosis.icd10Description} Already Added !`);
          this.diagnosis = undefined;

        }
        if (isICDDuplicate == false) {
          {
            this.selectedDiagnosisList.push(this.diagnosis);
            this.diagnosis = undefined;
          }
        }
      } else {
        this.selectedDiagnosisList.push(this.diagnosis);
        this.diagnosis = undefined;
      }
    } else if (typeof (this.diagnosis) == 'string') {
      alert("Enter Valid ICD10 !");
    }
  }
  RemoveDiagnosis(i) {
    let temp: Array<any> = this.selectedDiagnosisList;
    this.selectedDiagnosisList = [];
    this.selectedDiagnosisList = temp.filter((d, index) => index != i)
  }

  public MakeProvisonalDiagnosisList() {
    // console.log(this.diagnosis);
    if (this.provisonalDiagnosis != undefined && typeof (this.provisonalDiagnosis) != "string") {
      if (this.selectedProviDiagnosisList.length > 0) {
        let temp: Array<any> = this.selectedProviDiagnosisList;
        let isICDDuplicate: boolean = false;


        if (temp.some(d => d.ICD10Id == this.provisonalDiagnosis.ICD10Id)) {
          isICDDuplicate = true;
          alert(`${this.provisonalDiagnosis.icd10Description} Already Added !`);
          this.provisonalDiagnosis = undefined;

        }
        if (isICDDuplicate == false) {
          {
            this.selectedProviDiagnosisList.push(this.provisonalDiagnosis);
            this.provisonalDiagnosis = undefined;
          }
        }
      } else {
        this.selectedProviDiagnosisList.push(this.provisonalDiagnosis);
        this.provisonalDiagnosis = undefined;
      }
    } else if (typeof (this.provisonalDiagnosis) == 'string') {
      alert("Enter Valid ICD10 !");
    }
  }
  RemoveProvisonalDiagnosis(i) {
    let temp: Array<any> = this.selectedProviDiagnosisList;
    this.selectedProviDiagnosisList = [];
    this.selectedProviDiagnosisList = temp.filter((d, index) => index != i)
  }

  LabTestComponentSelection(index: number, ci: number, cName: string) {
    try {
      let selectedTest = this.labRequests[index];

      if (selectedTest.labComponents[ci].IsCmptSelected) {

        let check = this.AddedTests.some(a => a.TestId == selectedTest.TestId);
        if (!check) {
          this.AddedTests.push({ TestId: selectedTest.TestId, TestName: selectedTest.TestName, labComponents: [{ ComponentName: cName }] });
        }
        else { // else, already added
          this.AddedTests.forEach((v, i) => {
            if (v.TestId == selectedTest.TestId) {
              // this.AddedTests.splice(i, 1);
              let checkComp = v.labComponents.some(c => c.ComponentName == cName);
              if (!checkComp) {
                v.labComponents.push({ ComponentName: cName });
              }
            }
          });
        }

      } else {
        this.AddedTests.forEach((v, i) => {
          if (v.TestId == selectedTest.TestId) {
            // this.AddedTests.splice(i, 1);
            let checkComp = v.labComponents.some(c => c.ComponentName == cName);
            if (checkComp) {
              v.labComponents.splice(ci, 1);
              this.selectUnselectAllLabTests = false;
            }
          }
        });

      }


      let selectedComponentCount: number = 0;

      this.AddedTests.forEach(at => {
        if (at.TestId == selectedTest.TestId) {
          selectedComponentCount = at.labComponents.length;
        }
      });

      if (selectedComponentCount == selectedTest.labComponents.length) {
        this.labRequests[index].IsSelectTest = true;
        this.selectUnselectAllLabTests = true;
      } else {
        this.labRequests[index].IsSelectTest = false;
        this.selectUnselectAllLabTests = false;

      }

    } catch (ex) {
      // this.ShowCatchErrMessage(ex);
    }
  }

  ImagingSelection(index: number) {

    if (this.imagingResults[index] && this.imagingResults[index].IsImagingSelected) {

      var check = this.AddedImgTests.some(im => im == this.imagingResults[index].ImagingItemId);
      if (!check) {
        this.AddedImgTests.push(this.imagingResults[index].ImagingItemId);
      }

    } else {
      var check = this.AddedImgTests.some(im => im == this.imagingResults[index].ImagingItemId);
      if (check) {
        this.AddedImgTests.forEach((v, i) => {
          if (v == this.imagingResults[index].ImagingItemId) {
            this.AddedImgTests.splice(i, 1);
            this.selectUnselectAllLabTests = false;
          }
        });
      }
    }
  }

  AssignSelectedImagings() {
    if (this.imagingResults.length && this.imagingItems) {
      this.imagingResults.forEach(a => {
        var check = this.imagingItems.some(im => im == a.ImagingItemId);
        if (check) {
          a.IsImagingSelected = true;
        }
      });
    }
  }


  AllLabTestSelection() {
    try {


    }
    catch (ex) {
      // this.ShowCatchErrMessage(ex);
    }
  }

  LabTestsSelectUnselectALL() {



    if (this.selectUnselectAllLabTests && this.labRequests && this.labRequests.length > 0) { // Select all

      this.labRequests.forEach((lr, index) => {

        // lr.labConponents.forEach(lc=>{

        //   lc.IsCmpSelected = true;          


        // });
        lr.IsSelectTest = true;
        this.LabTestSelection(index);

      });

    }

    else if (this.selectUnselectAllLabTests == false && this.labRequests && this.labRequests.length > 0) {

      this.labRequests.forEach((lr, index) => {

        lr.IsSelectTest = false;
        this.LabTestSelection(index);

      });
    }

  }

  OnMedicineEnterKeyClick() {
    this.AddMedicine(0);
  }

  public FocusOnInputField(i: number) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("MedicineInput" + i);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }


  //CloseEditReport() {
  //  this.showDeathCertificate = false;
  //  this.showBirthCertificate = false;
  //}

  //private GetBabyBirthCondition() {
  //  this.dischargeSummaryBLService.GetBabyBirthCondition()
  //    .subscribe(res => {
  //      if (res.Status == "OK") {
  //        this.babybirthCondition = res.Results;
  //      } else {
  //        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
  //        console.log(res.ErrorMessage);
  //      }
  //    })
  //}


  //onChangeNumber() {
  //  var tempBabies = this.NoOfBabies;
  //  //this.CurrentDischargeSummary.BabyBirthDetails = new Array<BabyBirthDetails>();
  //  if (tempBabies > 0) {
  //    this.showBabyDetails = true;
  //    var check = this.CurrentDischargeSummary.BabyBirthDetails.length;
  //    if (check > tempBabies) {
  //      var minus = check - tempBabies;
  //      for (var i = check; i > tempBabies; i--) {
  //        this.CurrentDischargeSummary.BabyBirthDetails.splice(i - 1, 1);
  //      }
  //    }
  //    else {
  //      var plus = tempBabies - check;
  //      for (var i = 0; i < plus; i++) {
  //        var babyDetails = new BabyBirthDetails();
  //        babyDetails.BirthDate = this.today;
  //        babyDetails.BirthTime = moment().format("hh:mm:ss");
  //        babyDetails.CertificateNumber = this.GenerateCertificateNumber(babyDetails.BirthDate);
  //        this.CurrentDischargeSummary.BabyBirthDetails.push(babyDetails);
  //      };
  //    }
  //  }
  //  else {
  //    this.showBabyDetails = false;
  //  }

  //}


  // medicationtypeOnChange() {
  //   this.CurrentDischargeSummary.DischargeSummaryMedications = new Array<DischargeSummaryMedication>();
  //   //    if(this.medicationtype ==0){
  //   //        this.IsOldMedication = false;
  //   //    }
  //   //    else{
  //   //        this.IsOldMedication = true;
  //   //    }
  //   this.AddMedicine();
  // }

  //public GenerateCertificateNumber(birthdate: string) {
  //  return this.CurrentFiscalYear + "" + moment(birthdate).format("MM") + "" + moment(birthdate).format("DD") + "" + this.CurrentDischargeSummary.PatientVisitId;
  //}
  //public GenerateDeathCertificateNumber() {
  //  return this.DeathCertificateNumber = this.CurrentFiscalYear + "" + moment(this.today).format("MM") + "" + moment(this.today).format("DD") + "" + this.CurrentDischargeSummary.PatientVisitId;
  //}
  //public ViewBirthCertificate() {
  //  this.CurrentDischargeSummary.PatientId = this.selectedDischarge.PatientId;
  //  this.CurrentDischargeSummary.FiscalYearName = this.CurrentFiscalYear;
  //  this.CurrentDischargeSummary.BabyBirthDetails.forEach(a => {
  //    a.MotherName = this.selectedDischarge.Name;
  //    a.FathersName = this.CurrentDischargeSummary.BabysFathersName;
  //    a.CertificateNumber = a.CertificateNumber + "" + a.DischargeSummaryId;
  //  });
  //  // this.selectedBaby = this.CurrentDischargeSummary.BabyBirthDetails[0];
  //  // this.selectedBaby.MotherName = this.selectedDischarge.Name;
  //  // this.selectedBaby.FathersName = this.CurrentDischargeSummary.BabysFathersName;
  //  // this.selectedBaby.FiscalYearName = this.CurrentFiscalYear;
  //  // this.selectedBaby.CertificateNumber =   this.selectedBaby.CertificateNumber + ""+this.selectedBaby.BabyBirthDetailsId;
  //  // this.selectedBaby.PatientId = this.selectedDischarge.PatientId;
  //  this.showBirthCertificate = true;
  //}

  //public ViewDeathCertificate() {
  //  this.CurrentDischargeSummary.DeathCertificateNumber = this.GenerateDeathCertificateNumber();
  //  this.CurrentDischargeSummary.PatientId = this.selectedDischarge.PatientId;
  //  this.CurrentDischargeSummary.FiscalYearName = this.CurrentFiscalYear;
  //  this.showDeathCertificate = true;
  //}
  //  auto_grow(element){
  //     element.style.height = "5px";
  //     element.style.height = (element.scrollHeight)+"px";
  //   }
  // autogrow(){
  //   let textArea = document.getElementById("textarea")
  //   textArea.style.overflow = 'hidden';
  //   textArea.style.height = '0px';
  //   textArea.style.height = textArea.scrollHeight + 'px';
  // }
  // Dealing with Textarea Height

}
