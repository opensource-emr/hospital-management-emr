import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MR_BLService } from '../shared/mr.bl.service';
import { CoreService } from '../../core/shared/core.service';
import { HttpClient } from '@angular/common/http';
import { MedicalRecordsMasterDataVM, OperationTypeModel, DeathTypeModel, DischargeConditionTypeModel, DeliveryTypeModel, DischargeTypeModel } from '../shared/DischargeMasterData.model';
import { Employee } from '../../employee/shared/employee.model';
import { MasterType, DanpheCache } from '../../shared/danphe-cache-service-utility/cache-services';
import { MedicalRecordsSummary, AllTestsModelInMR } from '../shared/medical-records.model';
import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import { DeathDetails } from '../../adt/shared/death.detail.model';

@Component({
  selector: "add-mr-summary",
  templateUrl: "./mr-summary-add.html",
  styleUrls: ['./MR-summary.css']
})

export class AddNewMedicalRecordComponent {
  @Output("closeAddNewMrPopup") closeAddNewMrPopup: EventEmitter<object> = new EventEmitter<object>();
  @Input("patDetail") patientDetail: any = null;
  public loading: boolean = false;

  public allMasterDataForMR: MedicalRecordsMasterDataVM = new MedicalRecordsMasterDataVM();
  public AllDoctors: Array<Employee> = [];

  public showDeathPeriod: boolean = false;
  public birthCertDetailEdit: boolean = false;
  public allInvestigationsLoaded: boolean = false;

  public selectedBirthCertIndex: number = -1;

  public RecordSummary: MedicalRecordsSummary = null;
  public patientId: number = null;
  public patientVisitId: number = null;
  public medicalRecordId: number = null;
  public isEditMode: boolean = false;
  public icdCode: any = null;

  constructor(public MedicalRecordsBLService: MR_BLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.RecordSummary = new MedicalRecordsSummary();    
  }

  ngOnInit() {
    this.patientVisitId = this.patientDetail.PatientVisitId;
    this.patientId = this.patientDetail.PatientId;
    this.medicalRecordId = this.patientDetail.MedicalRecordId;

    this.allMasterDataForMR.AllICDCodes = this.coreService.Masters.ICD10List;
    this.AllDoctors = DanpheCache.GetData(MasterType.Employee, null);

    if (this.medicalRecordId) {
      this.isEditMode = true;
      this.GetPatientMRDetail();
    } else {
      this.isEditMode = false;
      this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
      this.RecordSummary.DeathDetail.DeathDate = moment().format("YYYY-MM-DD");
      this.RecordSummary.OperationDate = moment().format("YYYY-MM-DD"); 
      this.GetAllTheMasterDataForMrRecords();
      if (this.patientVisitId && this.patientId) {
        this.GetallLabTestsOfPatient(this.patientId, this.patientVisitId);
      } 
    }

    

  }

  public GetallLabTestsOfPatient(patId, visitId) {
    this.MedicalRecordsBLService.GetAllTestsByPatIdAndVisitId(patId, visitId).subscribe(
      res => {
        if (res.Status == "OK") {
          this.RecordSummary.AllTestList = res.Results;          
          this.allInvestigationsLoaded = true;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }

  public GetAllTheMasterDataForMrRecords() {
    this.MedicalRecordsBLService.GetAllMasterDataForMR().subscribe(
      res => {
        if (res.Status == 'OK') {
          this.allMasterDataForMR.AllOperationType = res.Results.AllOperationType;
          this.allMasterDataForMR.AllDischargeType = res.Results.AllDischargeType;
          this.allMasterDataForMR.AllBirthConditions = res.Results.AllBirthConditions;
          this.allMasterDataForMR.AllGravita = res.Results.AllGravita;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
      err => {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
      });
  }
  

  public GetPatientMRDetail() {
    this.MedicalRecordsBLService.GetPatientMRDetailWithMasterData(this.medicalRecordId, this.patientVisitId).subscribe(
      res => {
        if (res.Status == 'OK') {
          this.RecordSummary = res.Results.MedicalRecordOfPatient;
          this.RecordSummary.BirthDetail = new BabyBirthDetails();
          this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
          this.RecordSummary.OperationDate = moment(this.RecordSummary.OperationDate).format("YYYY-MM-DD");
          this.allMasterDataForMR.AllOperationType = res.Results.AllOperationType;
          this.allMasterDataForMR.AllDischargeType = res.Results.AllDischargeType;
          this.allMasterDataForMR.AllBirthConditions = res.Results.AllBirthConditions;
          this.allMasterDataForMR.AllGravita = res.Results.AllGravita;

          if (this.RecordSummary.AllTestList) {
            this.RecordSummary.AllTestList.forEach(v => v.IsSelected = true);
          }
          
          if (res.Results.AllTestList && res.Results.AllTestList.length > 0) {            
            res.Results.AllTestList.forEach(l => {
              if (!this.RecordSummary.AllTestList.find(m => m.RequisitionId == l.RequisitionId && m.Department == l.Department )) {
                l.IsSelected = false;
                this.RecordSummary.AllTestList.push(l);
              }
            });
            this.allInvestigationsLoaded = true;
          }
          this.allInvestigationsLoaded = true;

          if (this.RecordSummary.OperatedByDoctor) {
            let doc = this.AllDoctors.find(d => d.EmployeeId == this.RecordSummary.OperatedByDoctor);
            if (doc) { this.RecordSummary.OperatedDoctor = doc; }
          }
          if (this.RecordSummary.DischargeTypeId) {
            this.AssignCurrentDischargeType(this.RecordSummary.DischargeTypeId);
          }
          this.RecordSummary.DischargeConditionId ? this.AssignCurrentDischargeCondition(this.RecordSummary.DischargeConditionId) : this.RecordSummary.DischargeConditionTypes = new DischargeConditionTypeModel();
          !this.RecordSummary.DeliveryTypeId ? this.RecordSummary.DeliveryTypeId = 0 : this.RecordSummary.DeliveryTypeId;
          !this.RecordSummary.BabyBirthConditionId ? this.RecordSummary.BabyBirthConditionId = 0 : this.RecordSummary.BabyBirthConditionId;

          if (this.RecordSummary.ShowBirthCertDetail) {
            if (this.RecordSummary.BabyBirthDetails && this.RecordSummary.BabyBirthDetails.length > 0) {
              this.RecordSummary.BabyBirthDetails.forEach(brthDet => {
                //brthDet = Object.assign(new BabyBirthDetails(), brthDet);
                brthDet.BirthDate = moment(brthDet.BirthDate).format('YYYY-MM-DD');
              });
            }
          }
          if (this.RecordSummary.ShowDeathCertDetail) {
            if (this.RecordSummary.DeathDetail && this.RecordSummary.DeathDetail.DeathId) {
              this.RecordSummary.DeathDetail.DeathDate = moment(this.RecordSummary.DeathDetail.DeathDate).format('YYYY-MM-DD');
              this.RecordSummary.DeathDetail = Object.assign(new DeathDetails(), this.RecordSummary.DeathDetail);
            }
          } else {
            this.RecordSummary.DeathDetail = new DeathDetails();
            this.RecordSummary.DeathDetail.DeathDate = moment().format("YYYY-MM-DD");
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ['Cannot Get the Record of Pateint. Please try later']);
        }
      },
      err => {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
      });
  }

  public CheckBirthDetailValidation() {
    if (this.RecordSummary.BabyBirthDetails && this.RecordSummary.BabyBirthDetails.length) {
      var det = this.RecordSummary.BabyBirthDetails.find(b => b.BabyBirthDetailsId == 0);
      if (!det && !this.isEditMode) {
        if (this.RecordSummary.BirthDetail.IsValidCheck(undefined, undefined) == false) {
          for (var i in this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls) {
            this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].markAsDirty();
            this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].updateValueAndValidity();
          }
          return false;
        } else {
          var newObj = Object.assign({}, this.RecordSummary.BirthDetail);
          this.RecordSummary.BabyBirthDetails.push(newObj);
          return true;
        }
      }
      return true;
    }
    else {
      if (this.RecordSummary.BirthDetail.IsValidCheck(undefined, undefined) == false) {
        for (var i in this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls) {
          this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].markAsDirty();
          this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].updateValueAndValidity();
        }
        return false;
      } else {
        newObj = Object.assign({}, this.RecordSummary.BirthDetail);
        this.RecordSummary.BabyBirthDetails.push(this.RecordSummary.BirthDetail);
        return true;
      }
    }

  }

  public CheckDeathDetailValidation() {
    if (this.RecordSummary.DeathDetail.IsValidCheck(undefined, undefined) == false) {
      for (var i in this.RecordSummary.DeathDetail.DeathDetailsValidator.controls) {
        this.RecordSummary.DeathDetail.DeathDetailsValidator.controls[i].markAsDirty();
        this.RecordSummary.DeathDetail.DeathDetailsValidator.controls[i].updateValueAndValidity();
      }
      return false;
    } else { return true; }
  }

  public ValidateAndAddNewMedicalRecords() {
    if (this.RecordSummary.DischargeTypeId) {
      if (this.RecordSummary.ShowBirthCertDetail) {
        if (!this.CheckBirthDetailValidation()) {
          this.loading = false;
          return;
        } 
      }

      if (this.RecordSummary.ShowDeathCertDetail) {
        if (!this.CheckDeathDetailValidation()) {
          this.loading = false;
          return;
        } 
      }

      if (!this.RecordSummary.FileNumber || this.RecordSummary.FileNumber.trim() == '') {
        this.msgBoxServ.showMessage("failed", ['Please Enter File Number']);
        this.loading = false;
        return;
      }

      this.AddNewMedicalRecord();

    } else {
      this.msgBoxServ.showMessage("failed", ['Please Select Discharge Type']);
    }
  }

  public ValidateAndUpdateMedicalRecords() {
    if (this.RecordSummary.DischargeTypeId) {
      if (this.RecordSummary.ShowBirthCertDetail) {
        if (!this.CheckBirthDetailValidation()) {
          this.loading = false;
          return;
        }
      } 

      if (this.RecordSummary.ShowDeathCertDetail) {
        if (!this.CheckDeathDetailValidation()) {
          this.loading = false;
          return;
        }
      }

      if (!this.RecordSummary.FileNumber || this.RecordSummary.FileNumber.trim() == '') {
        this.msgBoxServ.showMessage("failed", ['Please Enter File Number']);
        this.loading = false;
        return;
      }

      this.UpdateMedicalRecord();

    } else {
      this.msgBoxServ.showMessage("failed", ['Please Select Discharge Type']);
    }
  }

  public AddNewMedicalRecord() {
    this.AssignData();
    this.MedicalRecordsBLService.PostMRofPatient(this.RecordSummary).subscribe(res => {
      if (res.Status == "OK") {
        this.loading = false;
        this.msgBoxServ.showMessage("success", ['Medical Record Added Successfully.']);
        this.closeAddNewMrPopup.emit({ close: true, action: 'add', medicalRecordId: res.Results.MedicalRecordId });
      } else {
        this.loading = false;
      }
    });

  }

  public UpdateMedicalRecord() {
    this.AssignData();
    this.MedicalRecordsBLService.PutMedicalRecord(this.RecordSummary).subscribe(res => {
      if (res.Status == "OK") {
        this.loading = false;
        this.msgBoxServ.showMessage("success", ['Medical Record Updated Successfully.']);
        this.closeAddNewMrPopup.emit({ close: true, action: 'update', medicalRecordId: res.Results.MedicalRecordId });
      } else {
        this.loading = false;
      }
    });
  }

  public AssignData() {
    if (this.RecordSummary.OperatedDoctor && this.RecordSummary.OperatedDoctor.EmployeeId) {
      this.RecordSummary.OperatedByDoctor = this.RecordSummary.OperatedDoctor.EmployeeId;
    }
    this.RecordSummary.PatientId = this.patientDetail.PatientId;
    this.RecordSummary.PatientVisitId = this.patientDetail.PatientVisitId;

    if (this.RecordSummary.ICDCodeList) {
      this.RecordSummary.ICDCode = JSON.stringify(this.RecordSummary.ICDCodeList);
    }
    if (this.RecordSummary.AllTestList) {
      this.RecordSummary.AllTests = JSON.stringify(this.RecordSummary.AllTestList.filter(l => l.IsSelected == true));
    }
  }

  public DischargeTypeChanged() {
    var dischargeTypeId = this.RecordSummary.DischargeTypeId;
    this.RecordSummary.DischargeConditionId = 0;
    this.RecordSummary.DeliveryTypeId = 0;
    this.RecordSummary.DeathPeriodTypeId = 0;
    this.RecordSummary.BabyBirthConditionId = 0;

    this.RecordSummary.BirthConditionList = [];
    this.RecordSummary.DischargeConditionTypes = new DischargeConditionTypeModel();

    if (dischargeTypeId > 0) {
      this.AssignCurrentDischargeType(dischargeTypeId);
    } else {
      this.showDeathPeriod = false;
      this.RecordSummary.CurrentDischargeType = new DischargeTypeModel();
    }

    this.CheckForBirthCertView(dischargeTypeId, this.RecordSummary.DischargeConditionId, this.RecordSummary.BabyBirthConditionId);
  }

  public AssignCurrentDischargeType(dischargeTypeId: number) {
    this.RecordSummary.CurrentDischargeType = this.allMasterDataForMR.AllDischargeType.find(d => d.DischargeTypeId == dischargeTypeId);
    if (this.RecordSummary.CurrentDischargeType.DischargeTypeName.toLowerCase() == 'death') {
      this.showDeathPeriod = true;
      this.RecordSummary.ShowDeathCertDetail = true;
    } else {
      this.showDeathPeriod = false;
      this.RecordSummary.ShowDeathCertDetail = false;
    }
  }

  public DischargeConditionChanged() {
    var dischargeConditionId = this.RecordSummary.DischargeConditionId;
    this.RecordSummary.DeliveryTypeId = 0;
    this.RecordSummary.BabyBirthConditionId = 0;
    if (dischargeConditionId > 0) {
      this.AssignCurrentDischargeCondition(dischargeConditionId);
    } else {
      this.RecordSummary.DischargeConditionTypes = new DischargeConditionTypeModel();
      this.RecordSummary.BirthConditionList = [];
      this.CheckForBirthCertView(this.RecordSummary.DischargeTypeId, dischargeConditionId, this.RecordSummary.BabyBirthConditionId);
    }
  }

  public AssignCurrentDischargeCondition(dischargeConditionId: number) {   
    var selDischType = this.allMasterDataForMR.AllDischargeType.find(d => d.DischargeTypeId == this.RecordSummary.DischargeTypeId);
    if (selDischType) {
      this.RecordSummary.DischargeConditionTypes = selDischType.DischargeConditionTypes.find(typ => typ.DischargeConditionId == dischargeConditionId);
      if (this.RecordSummary.DischargeConditionTypes && this.RecordSummary.DischargeConditionTypes.Condition && this.RecordSummary.DischargeConditionTypes.Condition.toLowerCase() == 'delivery') {
        this.RecordSummary.BirthConditionList = this.allMasterDataForMR.AllBirthConditions;
      } else {
        this.RecordSummary.ShowBirthCertDetail = false;
        this.RecordSummary.BirthConditionList = [];
      }
      this.CheckForBirthCertView(this.RecordSummary.DischargeTypeId, dischargeConditionId, this.RecordSummary.BabyBirthConditionId);
    }
  }

  public BirthConditionChanged() {
    var selBirthCondition = this.allMasterDataForMR.AllBirthConditions.find(b => b.BabyBirthConditionId == this.RecordSummary.BabyBirthConditionId);
    if (selBirthCondition && selBirthCondition.BirthConditionType && selBirthCondition.BirthConditionType.trim().toLowerCase() == 'live birth') {
      this.RecordSummary.ShowBirthCertDetail = true;
    } else {
      this.RecordSummary.ShowBirthCertDetail = false;
    }
  }


  public CheckForBirthCertView(dischargeTypeId: number, dischargConditionId: number, brthConditionId: number) {
    var dischargTyp = this.allMasterDataForMR.AllDischargeType.find(d => d.DischargeTypeId == dischargeTypeId);
    if (dischargTyp) {
      var condition = dischargTyp.DischargeConditionTypes.find(cd => cd.DischargeConditionId == dischargConditionId);
      if (condition && condition.Condition && condition.Condition.toLowerCase() == 'delivery') {
        if (brthConditionId) {
          var birthType = this.allMasterDataForMR.AllBirthConditions.find(brt => brt.BabyBirthConditionId == brthConditionId);
          if (birthType && birthType.BirthConditionType.trim().toLowerCase() == 'live birth') { this.RecordSummary.ShowBirthCertDetail = true; } else { this.RecordSummary.ShowBirthCertDetail = false; }
        } else {
          this.RecordSummary.ShowBirthCertDetail = false;
        }
      } else {
        this.RecordSummary.ShowBirthCertDetail = false;
      }
    } else {
      this.RecordSummary.ShowBirthCertDetail = false;
    }
  }

  public ShowHideOperationInfo() {
    if (!this.isEditMode) {
      this.RecordSummary.OperationTypeId = 0;
      this.RecordSummary.OperatedDoctor = null;       
    }      
  }

  public CloseMRAddPupUp() {
    this.closeAddNewMrPopup.emit({ close: true });
  }

  public ShowValueChangedData() {
    var duplicateICD = this.RecordSummary.ICDCodeList.find(i => i.ICD10ID == this.icdCode.ICD10ID);
    if (!duplicateICD) {
      this.RecordSummary.ICDCodeList.push(this.icdCode);
    }
  }

  public AddBirthDetailToList() {
    for (var i in this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls) {
      this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].markAsDirty();
      this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].updateValueAndValidity();
    }
    if (this.RecordSummary.BirthDetail.IsValidCheck(undefined, undefined)) {
      if (this.birthCertDetailEdit && this.selectedBirthCertIndex > -1) {
        this.RecordSummary.BabyBirthDetails[this.selectedBirthCertIndex] = this.RecordSummary.BirthDetail;
      } else if (this.selectedBirthCertIndex == -1) {
        var newObj = Object.assign({}, this.RecordSummary.BirthDetail);
        this.RecordSummary.BabyBirthDetails.push(newObj);
      }
      this.RecordSummary.BirthDetail = new BabyBirthDetails();
      this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
      this.selectedBirthCertIndex = -1;
      this.birthCertDetailEdit = false;
    }
  }

  public SaveBirthDetail() {
    for (var i in this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls) {
      this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].markAsDirty();
      this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].updateValueAndValidity();
    }
    if (this.RecordSummary.BirthDetail.IsValidCheck(undefined, undefined)) {
      if (this.RecordSummary.BirthDetail.BabyBirthDetailsId && this.RecordSummary.BirthDetail.BabyBirthDetailsId > 0) {
        this.MedicalRecordsBLService.PutBirthDetail(this.RecordSummary.BirthDetail).subscribe(res => {
          if (res.Status == 'OK') {
            this.RecordSummary.BabyBirthDetails[this.selectedBirthCertIndex] = this.RecordSummary.BirthDetail;
            this.RecordSummary.BirthDetail = new BabyBirthDetails();
            this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
            this.selectedBirthCertIndex = -1;
            this.birthCertDetailEdit = false;
            this.msgBoxServ.showMessage('success',["Birth Detail is Updated."])
          }
        });
      } else {
        this.RecordSummary.BabyBirthDetails[this.selectedBirthCertIndex] = this.RecordSummary.BirthDetail;
        this.RecordSummary.BirthDetail = new BabyBirthDetails();
        this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
        this.selectedBirthCertIndex = -1;
        this.birthCertDetailEdit = false;
      }
          
    }
  }

  public EditCurrentBirthDetail(brthIndex: number) {
    this.selectedBirthCertIndex = brthIndex;
    var currBrth = this.RecordSummary.BabyBirthDetails[brthIndex];
    if (currBrth) {
      this.RecordSummary.BirthDetail = Object.assign(new BabyBirthDetails(), currBrth);
      this.birthCertDetailEdit = true;
    }
  }

  public RemoveCurrentBirthDetail(brthIndex: number) {
    this.RecordSummary.BabyBirthDetails.splice(brthIndex, 1);
  }

  public ResetBirthDetail() {
    this.selectedBirthCertIndex = -1;
    this.RecordSummary.BirthDetail = new BabyBirthDetails();
    this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
    this.birthCertDetailEdit = false;
  }

  public RemoveIcd(ind) {
    this.RecordSummary.ICDCodeList.splice(ind, 1);
  }

  public myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  public myICDListFormatter(data: any): string {
    //let html = '(' + data["ICD10Code"] + ')&nbsp;' + data["ICD10Description"];
    let html = data["ICD10Description"];
    return html;
  }
}
