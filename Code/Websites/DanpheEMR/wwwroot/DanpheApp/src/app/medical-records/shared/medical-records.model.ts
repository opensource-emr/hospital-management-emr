import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import { DischargeConditionTypeModel, DischargeTypeModel } from './DischargeMasterData.model';

import { ICD10 } from '../../clinical/shared/icd10.model';
import { BabyBirthConditionModel } from './babyBirthConditions.model';
import { DeathDetails } from '../../adt/shared/death.detail.model';
import * as moment from 'moment';
import { FormGroup } from '@angular/forms';


export class MedicalRecordsSummary {
  public MedicalRecordId: number = 0;
  public PatientVisitId: number = null;
  public PatientId: number = 0;
  public DischargeTypeId: number = 0;
  public DischargeConditionId: number;
  public DeliveryTypeId: number;
  // public BabyBirthConditionId: number = 0;
  public DeathPeriodTypeId: number;
  public OperationTypeId: number;
  public OperatedByDoctor: number = null;
  public OperationDiagnosis: string = null;
  public OperationDate: string = null;
  public IsOperationConducted: boolean = false;
  public FileNumber: string = null;
  public Remarks: string = null;
  public AllTests: string = null;
  public ICDCode: string = null;
  public GravitaId: number;
  public GestationalWeek: number = 0;

  public GestationalDay: number = 0;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;

  public ShowBirthCertDetail: boolean = false;
  public BirthDetail: BabyBirthDetails = new BabyBirthDetails();
  public ShowDeathCertDetail: boolean = false;
  public DeathDetail: DeathDetails = new DeathDetails();

  public OperatedDoctor: any;
  public ICDCodeList: Array<ICD10> = new Array<ICD10>();
  public AllTestList: Array<AllTestsModelInMR> = new Array<AllTestsModelInMR>();
  public BabyBirthDetails: Array<BabyBirthDetails> = [];

  public CurrentDischargeType: DischargeTypeModel = new DischargeTypeModel();
  public DischargeConditionTypes: DischargeConditionTypeModel = new DischargeConditionTypeModel();
  public BirthConditionList: Array<BabyBirthConditionModel> = new Array<BabyBirthConditionModel>();
  public SaveBirthDetailsLater: boolean = false;
  public SaveDeathDetailsLater: boolean = false;

  // Start: 12th-July'21, Bikash Aryal, New fields added in MR Summary
  public ReferredDate: string = moment().format("YYYY-MM-DD");
  public ReferredTime: string = null;
  // public IsMultipleBabyBirth: boolean = false;
  public NumberOfBabies: number;
  public BloodLost: number = 0;
  public BloodLostUnit: string = "ml";
  // public GestationalUnit: string = "weeks";
  // End: 12th-July'21, Bikash Aryal, New fields added in MR Summary
  
  // public MedicalRecordValidator : FormGroup = null;

  // constructor(){
  // }

}




export class AllTestsModelInMR {
  public TestId: number = null;
  public RequisitionId: number = null;
  public TestName: string = null;
  public TestCode: string = null;
  public Department: string = null;
  public IsSelected: boolean = null;
}

export class MRSelectTypeName {
  public DischargeTypeName: string = null;
  public DischargeConditionName: string = null;
  public DeliveryTypeName: string = null;
  public DeathPeriodTypeName: string = null;
  // public BabyBirthConditionName: string = null;
  public OperationTypeName: string = null;
  public OperatedByDoctorName: string = null;
  public GravitaName: string = null;
}
