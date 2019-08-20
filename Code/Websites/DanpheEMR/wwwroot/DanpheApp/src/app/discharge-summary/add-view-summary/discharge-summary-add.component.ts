
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { DischargeSummaryBLService } from '../shared/discharge-summary.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { Employee } from '../../employee/shared/employee.model';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { DischargeSummary } from "../../admission/shared/discharge-summary.model";
import { Admission } from "../../admission/shared/admission.model";
import { DischargeType } from "../../admission/shared/discharge-type.model";
import { TouchSequence } from "selenium-webdriver";
import { LabTest } from '../../labs/shared/lab-test.model';
import { DischargeSummaryMedication } from "../../admission/shared/discharge-summary-medication.model";
import { BabyBirthDetails } from "../../admission/shared/baby-birth-details.model";
import { CoreService } from "../../core/shared/core.service";
import { of } from "rxjs";
@Component({
  selector: 'discharge-summary-add',
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
  public imagingResults: any;
  public IsSelectTest: boolean = false;
  public update: boolean = false;
  public showSummaryView: boolean = false;
  public showDischargeSummary: boolean = false;
  public disablePrint: boolean = false;
  public showUnpaidPopupBox: boolean = false;//to display the Alert-Box when trying to discharge with pending bills.

  public consultant: any = null;
  public drIncharge: any = null;
  public labtest: any = null;
  public diagnosis: any = null;
  public anasthetists: any = null;
  public residenceDr: any = null;
  public icdsID: Array<number> = null;
  public labTestId: Array<number> = null;
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
  public CurrentBabyBirthDeails: BabyBirthDetails = new BabyBirthDetails();
  public showBabyDetails: boolean = false;
  today: string;
  public tempBabyBirthDetails : Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
  public deathType: any = null;
  public selectedBaby: BabyBirthDetails = new BabyBirthDetails();
  public showBirthCertificate: boolean = false;
  public showDeathCertificate: boolean = false;
  public CurrentFiscalYear:string = null;
  public NewMedications : Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
  public OldMedications : Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
  public StoppedOldMedications : Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
  public DeathCertificateNumber:string = null;
 
  constructor(public dischargeSummaryBLService: DischargeSummaryBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService,
    public router: Router) {
    this.GetProviderList();
    this.GetDischargeType();
    this.GetAnasthetistsEmpList();
    this.GetICDList();
    this.GetAllTests();
    this.GetMedicationFrequency();
    this.GetFiscalYear();
  }

  @Input("showDischargeSummary")
  public set value(val: boolean) {
    this.showDischargeSummary = val;
    if (this.selectedDischarge && this.showDischargeSummary) {
      this.GetImagingResults();
      this.GetLabRequests();
      this.GetAllTests();
      this.GetICDList();
      this.medicationtype = 0;
      // this.AddMedicine(0);
      // this.AddMedicine(1);
      // this.AddMedicine(2);
      this.GetMedicationFrequency();
      this.AddedTests = [];
      this.CheckDeathType();
      this.GetDischargeConditions();
      this.GetDeliveryTypes();
      this.GetBabyBirthCondition();
      this.GetDeathType();
      this.today = moment().format('YYYY-MM-DD');
      this.GetDischargeSummary();
    
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
  public GetDeathType(){
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

          if (this.labTestId != null) {
            this.AddedTests = [];
            this.labTestId.forEach(a => {
              var valid = this.labRequests.filter(c => c.TestId == a);
              if (valid.length == 0) {
                this.LabTestList.forEach(s => {
                  if (a == s.LabTestId) {
                    this.AddedTests.push({ TestId: a, TestName: s.LabTestName });
                  }
                });
              }
            });
          }
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
  private GetBabyBirthCondition() {
    this.dischargeSummaryBLService.GetBabyBirthCondition()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.babybirthCondition = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      })
  }
  //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
  public GetLabRequests() {
    this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedDischarge.PatientId, this.selectedDischarge.PatientVisitId)
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
  public GetImagingResults() {
    this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedDischarge.PatientVisitId)
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
        this.AddedTests.push({ TestId: temp, IsSelectTest: true, TestName: this.labtest.LabTestName });
      }
    }
  }
  //discharge summary
  GetDischargeSummary() {
    this.dischargeSummaryBLService.GetDischargeSummary(this.selectedDischarge.PatientVisitId)
      .subscribe(res => {
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
            else if(this.CurrentDischargeSummary.DeathTypeId){
              this.Isdeath = true;
            }
            if (res.Results.BabyBirthDetails.length) {
              this.CurrentDischargeSummary.BabyBirthDetails = new Array<BabyBirthDetails>();
              res.Results.BabyBirthDetails.forEach(a => {
                this.CurrentBabyBirthDeails = Object.assign(this.CurrentBabyBirthDeails, a);
                this.CurrentDischargeSummary.BabyBirthDetails.push(this.CurrentBabyBirthDeails);
              });
              this.CurrentDischargeSummary.BabysFathersName = this.CurrentDischargeSummary.BabyBirthDetails[0].FathersName;
              this.CurrentDischargeSummary.BabyBirthDetails.forEach(a => {
                a.BirthDate = moment(a.BirthDate).format('YYYY-MM-DD');
                this.tempBabyBirthDetails.push(a);
              });
              this.NoOfBabies = res.Results.BabyBirthDetails.length;
              this.showBabyDetails = true;
            }
            if (res.Results.Medications.length) {
              this.CurrentDischargeSummary.DischargeSummaryMedications = new Array<DischargeSummaryMedication>();
              res.Results.Medications.forEach(a => {
                this.Medication = new DischargeSummaryMedication();
                if(a.OldNewMedicineType == 0){
                  this.Medication = Object.assign(this.Medication, a);
                  this.NewMedications.push(this.Medication);
                }
                else if(a.OldNewMedicineType == 1){
                  this.Medication = Object.assign(this.Medication, a);
                  this.OldMedications.push(this.Medication);
                }
                else{
                  this.Medication = Object.assign(this.Medication, a);
                  this.StoppedOldMedications.push(this.Medication);
                }
              });
              if(!this.NewMedications.length)
                this.AddMedicine(0);
                if(!this.OldMedications.length)
                this.AddMedicine(1);
                if(!this.StoppedOldMedications.length)
                this.AddMedicine(2);
            }
            else {
              this.AddMedicine(0);
              this.AddMedicine(1);
              this.AddMedicine(2);
            }
            if (this.CurrentDischargeSummary.LabTests != null) {
              this.labTestId = this.CurrentDischargeSummary.LabTests.split(",").map(Number);
              if (this.labRequests.length > 0) {
                this.labRequests.forEach(a => {
                  var check = this.labTestId.includes(a.TestId);
                  if (check) {
                    a.IsSelectTest = true;
                  }
                });
              }
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
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get discharge summary.. please check log for details.']);
          this.logError(err.ErrorMessage);
        });
  }

  Save() {
    this.CheckValidation();
    this.CurrentDischargeSummary.DischargeSummaryMedications = new Array<DischargeSummaryMedication>();
    for (var i in this.CurrentDischargeSummary.DischargeSummaryValidator.controls) {
      this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].markAsDirty();
      this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].updateValueAndValidity();
    }
    let validDischarge = true;
    let validBaby = true;
    if (this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {
      if (this.DeliveryType && this.CheckDatesValidation()) {
        this.CurrentDischargeSummary.BabyBirthDetails.forEach(a => {
          a.FathersName = this.CurrentDischargeSummary.BabysFathersName;
        });
        for (var baby of this.CurrentDischargeSummary.BabyBirthDetails) {
          for (var b in baby.BabyBirthDetailsValidator.controls) {
            baby.BabyBirthDetailsValidator.controls[b].markAsDirty();
            baby.BabyBirthDetailsValidator.controls[b].updateValueAndValidity();
          }
          if (!baby.IsValidCheck(undefined, undefined)) {
            validBaby = false;
            return;
          }
        };
      }
      if(this.NewMedications.length && this.Isdeath ==false){
        for (var summ of this.NewMedications) {
          for (var b in summ.DischargeSummaryMedicationValidator.controls) {
            summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
            summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
          }
          if (!summ.IsValidCheck(undefined, undefined)) {
            validDischarge = false;
            return;
          }
        };
        if(validDischarge){
          this.NewMedications.forEach(a=>{
            this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
          });
        }
      }
      if(this.OldMedications.length && this.Isdeath ==false){
        for (var summ of this.OldMedications) {
          for (var b in summ.DischargeSummaryMedicationValidator.controls) {
            summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
            summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
          }
          if (!summ.IsValidCheck(undefined, undefined)) {
            validDischarge = false;
            return;
          }
        };
        if(validDischarge){
          this.OldMedications.forEach(a=>{
            this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
          });
        }
      }
      if(this.StoppedOldMedications.length && this.Isdeath ==false){
        for (var summ of this.StoppedOldMedications) {
          for (var b in summ.DischargeSummaryMedicationValidator.controls) {
            summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
            summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
          }
          if (!summ.IsValidCheck(undefined, undefined)) {
            validDischarge = false;
            return;
          }
        };
        if(validDischarge){
          this.StoppedOldMedications.forEach(a=>{
            this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
          });
        }
      }
    }

    if (validDischarge && validBaby && this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {
      if (this.AddedTests.length > 0) {
        if (this.labRequests.length == 0) {
          this.labTestId = [];
        }
        this.AddedTests.forEach(a => {
          this.labTestId.push(a.TestId);
        });
      }
      if (this.labTestId != null) {
        this.CurrentDischargeSummary.LabTests = this.labTestId.join(',');
      }
      // if (this.CurrentDischargeSummary.DischargeSummaryMedications.length) {
      //   this.CurrentDischargeSummary.DischargeSummaryMedications.forEach(a => {
      //     a.OldNewMedicineType = this.medicationtype;
      //   });
      // }
      this.dischargeSummaryBLService.PostDischargeSummary(this.CurrentDischargeSummary)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Discharge Summary Saved"]);
              this.update = true;
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
    else {
      this.msgBoxServ.showMessage("failed", ["Enter Manditory fields"]);
    }
  }

  Update() {
    this.CurrentDischargeSummary.DischargeSummaryMedications = new Array<DischargeSummaryMedication>();
    for (var i in this.CurrentDischargeSummary.DischargeSummaryValidator.controls) {
      this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].markAsDirty();
      this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].updateValueAndValidity();
    }
    let validDischarge = true;
    let validBaby = true;
    if (this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {

      if (this.DeliveryType && this.CheckDatesValidation()) {
        this.CurrentDischargeSummary.BabyBirthDetails.forEach(a => {
          a.FathersName = this.CurrentDischargeSummary.BabysFathersName;
        });
        for (var baby of this.CurrentDischargeSummary.BabyBirthDetails) {
          for (var b in baby.BabyBirthDetailsValidator.controls) {
            baby.BabyBirthDetailsValidator.controls[b].markAsDirty();
            baby.BabyBirthDetailsValidator.controls[b].updateValueAndValidity();
          }
          if (!baby.IsValidCheck(undefined, undefined)) {
            validBaby = false;
            return;
          }
        };
      }
      if(this.NewMedications.length && this.Isdeath ==false){
        for (var summ of this.NewMedications) {
          for (var b in summ.DischargeSummaryMedicationValidator.controls) {
            summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
            summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
          }
          if (!summ.IsValidCheck(undefined, undefined)) {
            validDischarge = false;
            return;
          }
        };
        if(validDischarge){
          this.NewMedications.forEach(a=>{
            this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
          });
        }
      }
      if(this.OldMedications.length && this.Isdeath ==false){
        for (var summ of this.OldMedications) {
          for (var b in summ.DischargeSummaryMedicationValidator.controls) {
            summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
            summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
          }
          if (!summ.IsValidCheck(undefined, undefined)) {
            validDischarge = false;
            return;
          }
        };
        if(validDischarge){
          this.OldMedications.forEach(a=>{
            this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
          });
        }
      }
      if(this.StoppedOldMedications.length && this.Isdeath ==false){
        for (var summ of this.StoppedOldMedications) {
          for (var b in summ.DischargeSummaryMedicationValidator.controls) {
            summ.DischargeSummaryMedicationValidator.controls[b].markAsDirty();
            summ.DischargeSummaryMedicationValidator.controls[b].updateValueAndValidity();
          }
          if (!summ.IsValidCheck(undefined, undefined)) {
            validDischarge = false;
            return;
          }
        };
        if(validDischarge){
          this.StoppedOldMedications.forEach(a=>{
            this.CurrentDischargeSummary.DischargeSummaryMedications.push(a);
          });
        }
      }
    }

    if (validDischarge && validBaby && this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {
      if (this.AddedTests.length > 0) {
        if (this.labRequests.length == 0) {
          this.labTestId = [];
        }
        this.AddedTests.forEach(a => {
          if (!this.labTestId.includes(a.TestId)) {
            this.labTestId.push(a.TestId);
          }
        });
      }
      // this.labRequests.forEach(a=> {
      //     if(a.IsSelectTest == true){
      //         this.labTestId.push(a.TestId);
      //     }
      // });
      if (this.labTestId != null) {
        this.CurrentDischargeSummary.LabTests = this.labTestId.join(',');
      }
      // if (this.CurrentDischargeSummary.DischargeSummaryMedications.length) {
      //   this.CurrentDischargeSummary.DischargeSummaryMedications.forEach(a => {
      //     a.OldNewMedicineType = this.medicationtype;
      //   });
      // }
      this.CurrentDischargeSummary.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentDischargeSummary.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
      this.dischargeSummaryBLService.UpdateDischargeSummary(this.CurrentDischargeSummary)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Discharge Summary Updated"]);
              this.CallBackAddUpdate(res);
              this.showDischargeSummary = false;
              this.showSummaryView = true;
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
    else {
      this.msgBoxServ.showMessage("failed", ["Enter fill Manditory fields"]);
    }
  }
  CallBackAddUpdate(dischargeSummary: DischargeSummary) {
    this.CurrentDischargeSummary = Object.assign(this.CurrentDischargeSummary, dischargeSummary);
  }
  SubmitAndViewSummary() {
    var view: boolean;
    view = window.confirm("You won't be able to make further changes. Do you want to continue?");
    if (view) {
      this.CurrentDischargeSummary.IsSubmitted = true;
      this.Update();
      // this.showDischargeSummary = false;
      // this.showSummaryView = true;
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
        let selectedCount = this.labRequests.filter(s => s.IsSelectTest == true).length;
        this.labTestId = [];
        for (let itm of this.labRequests) {
          if (itm.IsSelectTest == true) {
            this.labTestId.push(itm.TestId);
          }
        }
      }
      else {
      }
    } catch (ex) {
      // this.ShowCatchErrMessage(ex);
    }
  }
  RemoveAddedTest(index: number) {
    this.AddedTests.splice(index, 1);
  }

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

  AddMedicine(val) {
    try {
      var newMedicine = new DischargeSummaryMedication();
      newMedicine.FrequencyId = 0;
      if(val == 0){
      newMedicine.OldNewMedicineType = 0;
      this.NewMedications.push(newMedicine);
      }
      else if(val == 1){
        newMedicine.OldNewMedicineType = 1;
        this.OldMedications.push(newMedicine);
        }
        else if(val == 2){
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
      if(type == 0){
        this.NewMedications.splice(index, 1);
        }
        else if(type == 1){
          this.OldMedications.splice(index, 1);
          }
          else{
            this.StoppedOldMedications.splice(index, 1);
          }
      if(this.NewMedications.length == 0)
        this.AddMedicine(0);
      else if(this.OldMedications.length == 0)
        this.AddMedicine(1);
        else if(this.StoppedOldMedications.length == 0)
        this.AddMedicine(2);
    }
    catch{

    }
  }
  OnChangeDischargeType(newtype) {
    this.DischargeConditionType = false;
    this.DeliveryType = false;
    this.showBabyDetails = false;
    this.Isdeath = false;
    this.CurrentDischargeSummary.DeliveryTypeId = null;
    this.CurrentDischargeSummary.BabyBirthConditionId = null;
    this.CurrentDischargeSummary.DeathTypeId = null;
    this.CurrentDischargeSummary.DeathPeriod =null;
    this.FilteredDischargeConditions = new Array<any>();
    var checktypeId = this.CurrentDischargeSummary.DischargeTypeId;
    checktypeId = newtype;
    this.FilteredDischargeConditions = this.dischargeCondition.filter(a => a.DischargeTypeId == newtype);
    var tempCheckDeath = this.deathType.filter(a => a.DischargeTypeId == newtype);
    if (this.FilteredDischargeConditions.length > 0) {
      this.DischargeConditionType = true;
    }
    else if(tempCheckDeath.length > 0){
      this.Isdeath = true;
      this.GenerateDeathCertificateNumber();
      this.CurrentDischargeSummary.DeathPeriod = tempCheckDeath[0].DischargeTypeName;
    }
    
  }
  OnChangeDischargeConditionType(condition) {
    var checkDeliveryId = Number(condition);
    this.DeliveryType = false;
    this.showBabyDetails = false;
    var check = this.deliveryTypeList.filter(a => a.DischargeConditionId == checkDeliveryId);
    if (check.length > 0) {
      this.DeliveryType = true;
      var babyDetails = new BabyBirthDetails();
      this.showBabyDetails = true;
      this.CurrentDischargeSummary.BabyBirthDetails = new Array<BabyBirthDetails>();
      babyDetails.BirthDate = this.today;
      babyDetails.BirthTime = moment().format("hh:mm:ss");
      babyDetails.CertificateNumber = this.GenerateCertificateNumber(babyDetails.BirthDate);
      this.CurrentDischargeSummary.BabyBirthDetails.push(babyDetails);
    }
  }

  onChangeNumber() {
    var tempBabies = this.NoOfBabies;
    //this.CurrentDischargeSummary.BabyBirthDetails = new Array<BabyBirthDetails>();
    if (tempBabies > 0) {
      this.showBabyDetails = true;
      var check = this.CurrentDischargeSummary.BabyBirthDetails.length;
      if (check > tempBabies) {
        var minus = check - tempBabies;
        for (var i = check; i > tempBabies; i--) {
          this.CurrentDischargeSummary.BabyBirthDetails.splice(i-1, 1);
        }
      }
      else {
        var plus = tempBabies - check;
        for (var i = 0; i < plus; i++) {
          var babyDetails = new BabyBirthDetails();
          babyDetails.BirthDate = this.today;
          babyDetails.BirthTime = moment().format("hh:mm:ss");
          babyDetails.CertificateNumber = this.GenerateCertificateNumber(babyDetails.BirthDate);
          this.CurrentDischargeSummary.BabyBirthDetails.push(babyDetails);
        };
      }
    }
    else {
      this.showBabyDetails = false;
    }

  }

  public CheckValidation() {
    if (this.CurrentDischargeSummary) {
      this.CurrentDischargeSummary.UpdateValidator("off", "DischargeConditionId", "required");
      this.CurrentDischargeSummary.UpdateValidator("off", "DeliveryTypeId", "required");
      this.CurrentDischargeSummary.UpdateValidator("off", "BabyBirthConditionId", "required");
      this.CurrentDischargeSummary.UpdateValidator("off", "DeathTypeId", "required");
      this.CurrentDischargeSummary.UpdateValidator("off", "BabysFathersName", "required");
      if (this.DischargeConditionType) {
        //set validator on
        this.CurrentDischargeSummary.UpdateValidator("on", "DischargeConditionId", "required");
        if (this.DeliveryType) {
          this.CurrentDischargeSummary.UpdateValidator("on", "DeliveryTypeId", "required");
          this.CurrentDischargeSummary.UpdateValidator("on", "BabyBirthConditionId", "required");
          this.CurrentDischargeSummary.UpdateValidator("on", "BabysFathersName", "required")
        }
      }
      else if (this.Isdeath) {
        //set validator off
        this.CurrentDischargeSummary.UpdateValidator("on", "DeathTypeId", "required");
      }
    }
  }
  public CheckDatesValidation() {
    var temp = true;
    this.CurrentDischargeSummary.BabyBirthDetails.forEach(a => {
      if (a.BirthDate > this.today) {
        temp = false;
        return temp;
      }
    });
    return temp;
  }

  public GetFiscalYear(){
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

  public GenerateCertificateNumber( birthdate : string){
    return this.CurrentFiscalYear + "" + moment(birthdate).format("MM") + "" + moment(birthdate).format("DD") + "" + this.CurrentDischargeSummary.PatientVisitId;
  }
  public GenerateDeathCertificateNumber(){
   return this.DeathCertificateNumber = this.CurrentFiscalYear + "" + moment(this.today).format("MM") + "" + moment(this.today).format("DD") + "" + this.CurrentDischargeSummary.PatientVisitId;
  }
  public ViewBirthCertificate(){
    this.CurrentDischargeSummary.PatientId = this.selectedDischarge.PatientId;
    this.CurrentDischargeSummary.FiscalYearName = this.CurrentFiscalYear;
    this.CurrentDischargeSummary.BabyBirthDetails.forEach(a=>{
      a.MotherName = this.selectedDischarge.Name;
      a.FathersName = this.CurrentDischargeSummary.BabysFathersName;
      a.CertificateNumber = a.CertificateNumber + "" + a.DischargeSummaryId;
    });
    // this.selectedBaby = this.CurrentDischargeSummary.BabyBirthDetails[0];
    // this.selectedBaby.MotherName = this.selectedDischarge.Name;
    // this.selectedBaby.FathersName = this.CurrentDischargeSummary.BabysFathersName;
    // this.selectedBaby.FiscalYearName = this.CurrentFiscalYear;
    // this.selectedBaby.CertificateNumber =   this.selectedBaby.CertificateNumber + ""+this.selectedBaby.BabyBirthDetailsId; 
    // this.selectedBaby.PatientId = this.selectedDischarge.PatientId;
    this.showBirthCertificate = true;
  }

  public ViewDeathCertificate(){
    this.CurrentDischargeSummary.DeathCertificateNumber = this.GenerateDeathCertificateNumber();
    this.CurrentDischargeSummary.PatientId = this.selectedDischarge.PatientId;
    this.CurrentDischargeSummary.FiscalYearName = this.CurrentFiscalYear;
    this.showDeathCertificate = true;
  }

  CloseEditReport(){
    this.showDeathCertificate = false;
    this.showBirthCertificate = false;
  }
}
