import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core'
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MR_BLService } from '../shared/mr.bl.service';
import { CoreService } from '../../core/shared/core.service';
import { MedicalRecordsMasterDataVM, DischargeConditionTypeModel, DischargeTypeModel } from '../shared/DischargeMasterData.model';
import { Employee } from '../../employee/shared/employee.model';
import { MasterType, DanpheCache } from '../../shared/danphe-cache-service-utility/cache-services';
import { MedicalRecordsSummary } from '../shared/medical-records.model';
import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import { DeathDetails } from '../../adt/shared/death.detail.model';
import { ICD10 } from '../../clinical/shared/icd10.model';
import { AddBirthDetailsSharedComponent } from '../add-birth-details-shared/add-birth-details-shared.component';
// schemas: [CUSTOM_ELEMENTS_SCHEMA]
@Component({
  selector: "add-mr-summary",
  templateUrl: "./mr-summary-add.html",
  styleUrls: ['./MR-summary.css']
})

export class AddNewMedicalRecordComponent {

  @ViewChild("sendToChild")
  public birthDetailsSharedComponent: AddBirthDetailsSharedComponent;

  @Output("closeAddNewMrPopup") closeAddNewMrPopup: EventEmitter<object> = new EventEmitter<object>();
  @Input("patDetail") patientDetail: any = null;


  public loading: boolean = false;
  emittedDeathDetails: Array<any> = [];
  public duplicateFileNumber: boolean = false;

  public allMasterDataForMR: MedicalRecordsMasterDataVM = new MedicalRecordsMasterDataVM();
  public AllDoctors: Array<Employee> = [];


  public birthCertDetailEdit: boolean = false;
  public allInvestigationsLoaded: boolean = false;
  public selectedBirthCertIndex: number = -1;

  public RecordSummary: MedicalRecordsSummary = null;

  public patientId: number = null;
  public patientVisitId: number = null;
  public medicalRecordId: number = null;
  public isEditMode: boolean = false;
  public icdCode: any = null;

  public IsDeliveryCase: boolean = false;

  public submited: boolean = false;
  public IsDeathCase: boolean = false;
  public NormalDeliveryICD10: ICD10 = new ICD10();
  public CSDeliveryICD10: ICD10 = new ICD10();
  public ForcepsDeliveryICD10: ICD10 = new ICD10();
  public VaccumDeliveryICD10: ICD10 = new ICD10();
  public AllMRFileNumbers: Array<any> = [];
  public ValidGestationalDay: boolean = true;
  public ValidGestationalWeek: boolean = true;
  public ValidBloodLostAmount: boolean = true;
  public BreechDeliveryICD10: ICD10 = new ICD10();
  public deathDetailsEmitted: boolean = false;
  public newBabyBirthDetails: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
  public IsReferredCase: boolean = false;
  public IsPatDead: boolean = false;
  public IsDeadOnDifferentVisit: boolean = false;

  constructor(public MedicalRecordsBLService: MR_BLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.RecordSummary = new MedicalRecordsSummary();
    this.GetAllMRFileNumbers();
  }

  ngOnInit() {
    //this.GetAllTheMasterDataForMrRecords();
    this.patientVisitId = this.patientDetail.PatientVisitId;
    this.patientId = this.patientDetail.PatientId;
    this.medicalRecordId = this.patientDetail.MedicalRecordId;
    this.allMasterDataForMR.AllICDCodes = this.coreService.Masters.ICD10List;
    this.AssignDeliveryICD10();
    this.AllDoctors = DanpheCache.GetData(MasterType.Employee, null);

    if (this.medicalRecordId) {
      this.isEditMode = true;
      this.GetPatientMRDetail();
    } else {
      this.isEditMode = false;
      this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
      // this.RecordSummary.DeathDetail.DeathDate = moment().format("YYYY-MM-DD");
      this.RecordSummary.OperationDate = moment().format("YYYY-MM-DD");
      if (this.patientVisitId && this.patientId) {
        this.GetallLabTestsOfPatient(this.patientId, this.patientVisitId);
      }
    }

  }
  public AssignDeliveryICD10() {
    if (this.allMasterDataForMR.AllICDCodes) {
      // Normal Deivery ICD10 code = o80
      let NICD10: ICD10 = this.allMasterDataForMR.AllICDCodes.find(di => di.ICD10Code == "O80");
      if (NICD10 && NICD10.ICD10ID > 0) {
        this.NormalDeliveryICD10 = NICD10;
      }
      // CS Deivery ICD10 code = o82
      let CsICD10 = this.allMasterDataForMR.AllICDCodes.find(cs => cs.ICD10Code == "O82");
      if (CsICD10 && CsICD10.ICD10ID > 0) {
        this.CSDeliveryICD10 = CsICD10;
      }
      // Forceps Deivery ICD10 code = o81.0
      let FICD10 = this.allMasterDataForMR.AllICDCodes.find(f => f.ICD10Code == "O81.0");
      if (FICD10 && FICD10.ICD10ID > 0) {
        this.ForcepsDeliveryICD10 = FICD10;
      }
      // Breech Deivery ICD10 code = o83.0
      let BICD10 = this.allMasterDataForMR.AllICDCodes.find(b => b.ICD10Code == "O83.0");
      if (BICD10 && BICD10.ICD10ID > 0) {
        this.BreechDeliveryICD10 = BICD10;
      }

      // Vaccum Deivery ICD10 code = o81.4
      let VICD10 = this.allMasterDataForMR.AllICDCodes.find(v => v.ICD10Code == "O81.4");
      if (VICD10 && VICD10.ICD10ID > 0) {
        this.VaccumDeliveryICD10 = VICD10;
      }
    }
  }

  public GetallLabTestsOfPatient(patId, visitId) {
    this.MedicalRecordsBLService.GetAllTestsByPatIdAndVisitId(patId, visitId).subscribe(
      res => {
        if (res.Status == "OK") {
          this.RecordSummary.AllTestList = res.Results.AllTest;
          this.IsPatDead = res.Results.DeathDetailsObj.IsPatDead;
          this.IsDeadOnDifferentVisit = res.Results.DeathDetailsObj.IsDeadOnDifferentVisit;
          this.allInvestigationsLoaded = true;
          this.GetAllTheMasterDataForMrRecords();
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }

  public GetAllMRFileNumbers() {
    this.MedicalRecordsBLService.GetAllMRFileNumbers().subscribe(
      res => {
        if (res.Status == "OK") {
          this.AllMRFileNumbers = res.Results;

        }
      }
    );
  }

  public CheckFileNumberDuplication() {

    this.duplicateFileNumber = undefined;

    let a = this.AllMRFileNumbers.some(a => a.MRFileNumbers == this.RecordSummary.FileNumber.trim());

    if (this.RecordSummary.FileNumber && a) {
      this.duplicateFileNumber = true;
    } else {
      this.duplicateFileNumber = false;
    }

  }

  public OnNoOfBabiesChange() {
    this.birthDetailsSharedComponent.AutoSelectBirthType();
  }

  public GetAllTheMasterDataForMrRecords() {
    this.MedicalRecordsBLService.GetAllMasterDataForMR().subscribe(
      res => {
        if (res.Status == 'OK') {
          this.allMasterDataForMR.AllOperationType = res.Results.AllOperationType;
          this.allMasterDataForMR.AllDischargeType = res.Results.AllDischargeType;
          this.allMasterDataForMR.AllGravita = res.Results.AllGravita;

          if (this.IsPatDead) {
            this.ForAlreadyDeadPatient();
          }
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
          if (this.RecordSummary.DeathDetail && this.RecordSummary.DeathDetail.DeathId != 0) {
            this.IsPatDead = true;
            this.ForAlreadyDeadPatient();
          }
          if (this.RecordSummary.AllTestList) {
            this.RecordSummary.AllTestList.forEach(v => v.IsSelected = true);
          }

          if (res.Results.AllTestList && res.Results.AllTestList.length > 0) {
            res.Results.AllTestList.forEach(l => {
              if (!this.RecordSummary.AllTestList.find(m => m.RequisitionId == l.RequisitionId && m.Department == l.Department)) {
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

          if (this.RecordSummary.ShowBirthCertDetail) {
            if (this.RecordSummary.BabyBirthDetails && this.RecordSummary.BabyBirthDetails.length > 0) {
              this.RecordSummary.BabyBirthDetails.forEach(brthDet => {
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

  public CheckDeathDetailValidation(): boolean {
    if (this.RecordSummary.DeathDetail.IsValidCheck(undefined, undefined) == false) {
      for (var i in this.RecordSummary.DeathDetail.DeathDetailsValidator.controls) {
        this.RecordSummary.DeathDetail.DeathDetailsValidator.controls[i].markAsDirty();
        this.RecordSummary.DeathDetail.DeathDetailsValidator.controls[i].updateValueAndValidity();
      }
      return false;
    }
    else { return true; }
  }

  public ValidateAndAddNewMedicalRecords() {
    this.submited = true;
    this.loading = true;

    if (this.RecordSummary.DischargeTypeId) {
      if (this.ValidateMrData()) {
        this.AddNewMedicalRecord();
      } else {
        this.loading = false;
      }
    } else {
      this.msgBoxServ.showMessage("Warning", ['Please Select Discharge Type!']);
      this.loading = false;
    }
  }

  ValidateMrData(): boolean {
    if (this.RecordSummary.ShowDeathCertDetail && !this.RecordSummary.SaveDeathDetailsLater && !this.isEditMode) {
      if (!this.CheckDeathDetailValidation()) {
        this.msgBoxServ.showMessage('Error', ['Please Enter Valid Death Details!']);
        return false;
      }
    }

    if (this.IsDeathCase) {
      let msg: Array<string> = [];
      if (!this.RecordSummary.DeathPeriodTypeId || this.RecordSummary.DeathPeriodTypeId <= 0) msg.push('Death Period is Required!');
      if (!this.RecordSummary.DischargeConditionId || this.RecordSummary.DischargeConditionId <= 0) msg.push('Discharge Condition is Required!');
      if (!this.RecordSummary.DischargeConditionId || this.RecordSummary.DeathPeriodTypeId <= 0 || !this.RecordSummary.DeathPeriodTypeId || this.RecordSummary.DischargeConditionId <= 0) {
        this.msgBoxServ.showMessage('Error', msg);
        return false;
      }
    }

    if (!this.ValidGestationalDay) {
      this.msgBoxServ.showMessage('Error', ['Invalid gestational day!']);
      return false;
    }
    if (!this.ValidGestationalWeek) {
      this.msgBoxServ.showMessage('Error', ['Invalid gestational week!']);
      return false;
    }
    if (!this.ValidBloodLostAmount) {
      this.msgBoxServ.showMessage('Error', ['Invalid blood lost amount!']);
      return false;
    }

    if (this.IsDeliveryCase && this.RecordSummary.BabyBirthDetails && this.RecordSummary.BabyBirthDetails.length <= 0 && this.RecordSummary.ShowBirthCertDetail) {
      this.msgBoxServ.showMessage('Warning', ['Add Birth Details Or Select \' Save Birth Details Later\' checkbox!']);
      return false;
    }

    if (this.IsDeathCase && this.RecordSummary.ShowDeathCertDetail && this.deathDetailsEmitted == false && !this.IsPatDead && !this.RecordSummary.DeathDetail.DeathId) {
      this.msgBoxServ.showMessage('Warning', ['Add Death Details Or Select \' Save Death Details Later\' checkbox!']);
      return false;
    }
    return true;
  }

  public ValidateAndUpdateMedicalRecords() {

    this.loading = true;
    if (this.RecordSummary.DischargeTypeId) {

      if (this.ValidateMrData()) {
        this.UpdateMedicalRecord();
      } else {
        this.loading = false;
      }

    } else {
      this.loading = false;
      this.msgBoxServ.showMessage("failed", ['Please Select Discharge Type']);
    }
  }

  public AddNewMedicalRecord() {
    this.AssignData();
    this.MedicalRecordsBLService.PostMRofPatient(this.RecordSummary).subscribe(res => {
      if (res.Status == "OK") {
        this.msgBoxServ.showMessage("success", ['Medical Record Added Successfully.']);

        //we get MedicalRecord object as a Result in case of add..
        this.closeAddNewMrPopup.emit({ close: true, action: 'add', medicalRecObj: res.Results });
        this.loading = false;
      } else {

        this.loading = false;
        this.msgBoxServ.showMessage("Error", ['Something went wrong. Unable to add Medical Record!!']);
      }
    });
  }

  public UpdateMedicalRecord() {
    this.AssignData();
    this.MedicalRecordsBLService.PutMedicalRecord(this.RecordSummary).subscribe(res => {
      if (res.Status == "OK") {
        this.msgBoxServ.showMessage("success", ['Medical Record Updated Successfully.']);
        this.closeAddNewMrPopup.emit({ close: true, action: 'update', medicalRecordId: res.Results.MedicalRecordId });
      } else {
        this.msgBoxServ.showMessage("Error", ['Medical Record Cannot be Updated!']);
      }
      this.loading = false;
    });
  }

  public AssignData() {
    if (!this.RecordSummary.IsOperationConducted) {
      this.RecordSummary.OperationDate = undefined;
      this.RecordSummary.OperationDiagnosis = undefined;
      this.RecordSummary.OperationTypeId = undefined;
      this.RecordSummary.OperatedDoctor = undefined;
    }
    if (this.RecordSummary.OperatedDoctor && this.RecordSummary.OperatedDoctor.EmployeeId) {
      this.RecordSummary.OperatedByDoctor = this.RecordSummary.OperatedDoctor.EmployeeId;
    }
    this.RecordSummary.PatientId = this.patientDetail.PatientId;
    this.RecordSummary.PatientVisitId = this.patientDetail.PatientVisitId;


    if (this.RecordSummary.AllTestList) {
      this.RecordSummary.AllTests = JSON.stringify(this.RecordSummary.AllTestList); // 2nd-Jun'21: Bikash, All the tested investigations should be recorded in MR 
    }
    if (this.RecordSummary.BabyBirthDetails && this.RecordSummary.BabyBirthDetails.length > 0) {
      this.RecordSummary.BabyBirthDetails = this.RecordSummary.BabyBirthDetails.filter(a => a.BabyBirthDetailsId == 0);

      this.RecordSummary.BabyBirthDetails.forEach(a => { (a.PatientId = this.patientId) });
    }
  }

  public DischargeTypeChanged() {
    var dischargeTypeId = this.RecordSummary.DischargeTypeId;
    this.RecordSummary.DischargeConditionId = undefined;
    this.RecordSummary.DeliveryTypeId = undefined;
    this.RecordSummary.DeathPeriodTypeId = undefined;
    this.IsDeliveryCase = false;
    this.RecordSummary.NumberOfBabies = null;

    this.RecordSummary.ICDCodeList = [];
    this.RecordSummary.BirthConditionList = [];
    this.RecordSummary.DischargeConditionTypes = new DischargeConditionTypeModel();

    if (dischargeTypeId && dischargeTypeId > 0) {
      this.AssignCurrentDischargeType(dischargeTypeId);
    } else {
      this.IsDeathCase = false;
      this.RecordSummary.CurrentDischargeType = new DischargeTypeModel();
    }
    // Remove Discharge Condition "Delivery" if patient is Male.
    this.RemoveDeliveryCaseIfMalePatient();
  }



  public RemoveDeliveryCaseIfMalePatient() {
    if (this.patientDetail.Gender.toLowerCase() == 'male' && this.RecordSummary.CurrentDischargeType.DischargeConditionTypes.length > 0) {

      let value = this.RecordSummary.CurrentDischargeType.DischargeConditionTypes.find(a => a.Condition.toLowerCase() == 'delivery');
      if (value) {
        let valueIndex = this.RecordSummary.CurrentDischargeType.DischargeConditionTypes.indexOf(value);
        this.RecordSummary.CurrentDischargeType.DischargeConditionTypes.splice(valueIndex, 1);

      }
    }
  }

  public AssignCurrentDischargeType(dischargeTypeId: number) {
    this.RecordSummary.CurrentDischargeType = this.allMasterDataForMR.AllDischargeType.find(d => d.DischargeTypeId == dischargeTypeId);
    if (this.RecordSummary.CurrentDischargeType.DischargeTypeName.toLowerCase() == 'death') {
      this.IsDeathCase = true;
      this.RecordSummary.ShowDeathCertDetail = true;
      this.RecordSummary.ReferredDate = undefined;
    } else if (this.RecordSummary.CurrentDischargeType.DischargeTypeName.toLowerCase() == 'referred') {
      this.RecordSummary.ReferredDate = moment().format("YYYY-MM-DD");
      this.IsReferredCase = true;
      this.IsDeliveryCase = false;
      this.IsDeathCase = false;
    }
    else {
      this.RecordSummary.ReferredDate = undefined;
      this.IsReferredCase = false;
      this.IsDeliveryCase = false;
      this.IsDeathCase = false;
      this.RecordSummary.ShowDeathCertDetail = false;
    }
    // Remove Discharge Condition "Delivery" if patient is Male.
    this.RemoveDeliveryCaseIfMalePatient();
  }

  public DischargeConditionChanged() {
    var dischargeConditionId = this.RecordSummary.DischargeConditionId;
    this.RecordSummary.DeliveryTypeId = undefined;
    this.RecordSummary.ICDCodeList = [];


    if (dischargeConditionId && dischargeConditionId > 0) {
      this.AssignCurrentDischargeCondition(dischargeConditionId);
    } else {
      this.RecordSummary.DischargeConditionTypes = new DischargeConditionTypeModel();
      this.RecordSummary.BirthConditionList = [];

    }
  }

  public CheckGestationaryDay() {
    if (this.RecordSummary.GestationalDay > 6) {
      this.ValidGestationalDay = false;
    }
    else {
      this.ValidGestationalDay = true;
    }

  }
  public CheckGestationaryWeek() {
    if (this.RecordSummary.GestationalWeek > 48) {
      this.ValidGestationalWeek = false;
    }
    else {
      this.ValidGestationalWeek = true;
    }

  }
  public CheckBloodLostAmount() {
    if (this.RecordSummary.BloodLost > 2500) {
      this.ValidBloodLostAmount = false;
    }
    else {
      this.ValidBloodLostAmount = true;
    }

  }
  public AssignCurrentDischargeCondition(dischargeConditionId: number) {
    var selDischType = this.allMasterDataForMR.AllDischargeType.find(d => d.DischargeTypeId == this.RecordSummary.DischargeTypeId);
    if (selDischType) {
      this.RecordSummary.DischargeConditionTypes = selDischType.DischargeConditionTypes.find(typ => typ.DischargeConditionId == dischargeConditionId);
      if (this.RecordSummary.DischargeConditionTypes && this.RecordSummary.DischargeConditionTypes.Condition && this.RecordSummary.DischargeConditionTypes.Condition.toLowerCase() == 'delivery') {

        this.IsDeliveryCase = true;
        this.RecordSummary.ShowBirthCertDetail = true;
        this.RecordSummary.BirthConditionList = this.allMasterDataForMR.AllBirthConditions;

        if (!this.isEditMode) {
          //            this.RecordSummary.NumberOfBabies = 1;
        }

      } else {
        this.IsDeliveryCase = false;
        this.RecordSummary.ShowBirthCertDetail = false;
        this.RecordSummary.BirthConditionList = [];
        if (!this.isEditMode) {
          this.RecordSummary.NumberOfBabies = null;
        }
      }
    }
  }


  public ShowHideOperationInfo() {
    if (!this.isEditMode) {
      this.RecordSummary.OperationTypeId = undefined;
      this.RecordSummary.OperatedDoctor = undefined;
    }
  }

  public CloseMRAddPupUp() {
    this.closeAddNewMrPopup.emit({ close: true });
  }

  public ShowValueChangedData() {
    var duplicateICD = this.RecordSummary.ICDCodeList.find(i => i.ICD10ID == this.icdCode.ICD10ID);
    if (!duplicateICD) {
      this.RecordSummary.ICDCodeList.push(this.icdCode);
      this.icdCode = undefined;
    }
  }

  public SaveBirthDetail() {
    this.loading = true;
    for (var i in this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls) {
      this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].markAsDirty();
      this.RecordSummary.BirthDetail.BabyBirthDetailsValidator.controls[i].updateValueAndValidity();
    }
    if (this.RecordSummary.BirthDetail.IsValidCheck(undefined, undefined)) {
      if (this.RecordSummary.BirthDetail.BabyBirthDetailsId && this.RecordSummary.BirthDetail.BabyBirthDetailsId > 0) {
        this.MedicalRecordsBLService.PutBirthDetail(this.RecordSummary.BirthDetail).subscribe(res => {
          if (res.Status == 'OK') {
            this.loading = false;
            this.RecordSummary.BabyBirthDetails[this.selectedBirthCertIndex] = this.RecordSummary.BirthDetail;
            this.RecordSummary.BirthDetail = new BabyBirthDetails();
            this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
            this.selectedBirthCertIndex = -1;
            this.birthCertDetailEdit = false;
            this.msgBoxServ.showMessage('success', ["Birth Detail is Updated."])
          }
        });
      } else {
        this.RecordSummary.BabyBirthDetails[this.selectedBirthCertIndex] = this.RecordSummary.BirthDetail;
        this.RecordSummary.BirthDetail = new BabyBirthDetails();
        this.RecordSummary.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
        this.selectedBirthCertIndex = -1;
        this.birthCertDetailEdit = false;
        this.loading = false;
      }

    } else {
      this.msgBoxServ.showMessage('Warning!', ['Invalid fields! Please fill properly!']);
      this.loading = false;
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
    let html = data["ICD10Code"] + ' | ' + data["ICD10Description"];
    return html;
  }

  public SaveBirthDetailsLater() {
    if (this.RecordSummary.SaveBirthDetailsLater) {
      this.RecordSummary.ShowBirthCertDetail = false;

    } else {
      this.RecordSummary.ShowBirthCertDetail = true;
    }

  }

  public SaveDeathDetailsLater() {
    if (this.RecordSummary.SaveDeathDetailsLater) {
      this.RecordSummary.ShowDeathCertDetail = false;
      this.loading = false;
    } else {
      this.RecordSummary.ShowDeathCertDetail = true;

    }
  }


  public OnDeliveryTypeChange() {
    let SelectedDeliveryType = undefined;
    let data: any = this.RecordSummary.DischargeConditionTypes.CurrentConditionTypes.find(a => a.DeliveryTypeId == this.RecordSummary.DeliveryTypeId);
    if (data && data.DeliveryTypeName) {
      SelectedDeliveryType = data.DeliveryTypeName;
      this.AutoSelectDeliveryDiagnosisICD(data.DeliveryTypeName);
    }
    this.birthDetailsSharedComponent.AutoSelectDeliveryType(SelectedDeliveryType);

  }

  public AutoSelectDeliveryDiagnosisICD(deliveryTypeName) {
    let ndIndx = this.RecordSummary.ICDCodeList.findIndex(I => I.ICD10Code == this.NormalDeliveryICD10.ICD10Code);
    let csdIndx = this.RecordSummary.ICDCodeList.findIndex(I => I.ICD10Code == this.CSDeliveryICD10.ICD10Code);
    let fdIndx = this.RecordSummary.ICDCodeList.findIndex(I => I.ICD10Code == this.ForcepsDeliveryICD10.ICD10Code);
    let bdIndx = this.RecordSummary.ICDCodeList.findIndex(I => I.ICD10Code == this.BreechDeliveryICD10.ICD10Code);
    let vdIndx = this.RecordSummary.ICDCodeList.findIndex(I => I.ICD10Code == this.VaccumDeliveryICD10.ICD10Code);

    // Removing all 5 delivery ICD10Code
    if (ndIndx >= 0) { this.RecordSummary.ICDCodeList.splice(ndIndx, 1); }
    if (csdIndx >= 0) { this.RecordSummary.ICDCodeList.splice(csdIndx, 1); }
    if (fdIndx >= 0) { this.RecordSummary.ICDCodeList.splice(fdIndx, 1); }
    if (bdIndx >= 0) { this.RecordSummary.ICDCodeList.splice(bdIndx, 1); }
    if (vdIndx >= 0) { this.RecordSummary.ICDCodeList.splice(vdIndx, 1); }

    if (deliveryTypeName == "Normal" && this.NormalDeliveryICD10 && this.NormalDeliveryICD10.ICD10ID > 0) {
      this.RecordSummary.ICDCodeList.push(this.NormalDeliveryICD10);
    }
    else if (deliveryTypeName == "C/S" && this.CSDeliveryICD10 && this.CSDeliveryICD10.ICD10ID > 0) {

      this.RecordSummary.ICDCodeList.push(this.CSDeliveryICD10);
    }
    else if (deliveryTypeName == "Forceps" && this.ForcepsDeliveryICD10 && this.ForcepsDeliveryICD10.ICD10ID > 0) {
      this.RecordSummary.ICDCodeList.push(this.ForcepsDeliveryICD10);
    }
    else if (deliveryTypeName == "Breech" && this.BreechDeliveryICD10 && this.BreechDeliveryICD10.ICD10ID > 0) {
      this.RecordSummary.ICDCodeList.push(this.BreechDeliveryICD10);
    }
    else if (deliveryTypeName == "Vacuum" && this.VaccumDeliveryICD10 && this.VaccumDeliveryICD10.ICD10ID > 0) {
      this.RecordSummary.ICDCodeList.push(this.VaccumDeliveryICD10);
    }
  }

  OnBabyBirthDetailSaved($event) {
    this.RecordSummary.BabyBirthDetails = $event;

  }
  callBackForDeathDetails(parentData) {

    if (parentData.Status = 'Submit' && parentData.data) {
      this.deathDetailsEmitted = true;
      this.RecordSummary.DeathDetail = parentData.data;
    }
  }


  public ForAlreadyDeadPatient() {
    let value = this.allMasterDataForMR.AllDischargeType.find(a => a.DischargeTypeName.toLowerCase() == "death");
    if (value && this.IsDeadOnDifferentVisit) {
      // If Patient is Already Dead on differrent visit then removing 'death' discharge type from master list 
      let i = this.allMasterDataForMR.AllDischargeType.indexOf(value);
      this.allMasterDataForMR.AllDischargeType.splice(i);
    }
    else {
      this.RecordSummary.DischargeTypeId = value.DischargeTypeId;
      this.AssignCurrentDischargeType(this.RecordSummary.DischargeTypeId);
    }
  }
}
