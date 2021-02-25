import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { DischargeSummaryMedication } from '../../adt/shared/discharge-summary-medication.model';
import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import { DeathTypeModel, DischargeConditionTypeModel, DischargeTypeModel } from './DischargeMasterData.model';
import { Employee } from '../../employee/shared/employee.model';
import { ICD10 } from '../../clinical/shared/icd10.model';
import { BabyBirthConditionModel } from './babyBirthConditions.model';
import { DeathDetails } from '../../adt/shared/death.detail.model';


export class MedicalRecordsSummary {
  public MedicalRecordId: number = 0;
  public PatientVisitId: number = null;
  public PatientId: number = 0;
  public DischargeTypeId: number = 0;
  public DischargeConditionId: number = 0;
  public DeliveryTypeId: number = 0;
  public BabyBirthConditionId: number = 0;
  public DeathPeriodTypeId: number = 0;
  public OperationTypeId: number = null;
  public OperatedByDoctor: number = null;
  public OperationDiagnosis: string = null;
  public OperationDate: string = null;
  public IsOperationConducted: boolean = false;
  public FileNumber: string = null;
  public Remarks: string = null;
  public AllTests: string = null;
  public ICDCode: string = null;
  public GravitaId: number = 0;
  public GestationalWeek: number = null;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;  

  public ShowBirthCertDetail: boolean = false;
  public BirthDetail: BabyBirthDetails = new BabyBirthDetails();
  public ShowDeathCertDetail: boolean = false;
  public DeathDetail: DeathDetails = new DeathDetails();

  public OperatedDoctor: any = null;
  public ICDCodeList: Array<ICD10> = new Array<ICD10>();
  public AllTestList: Array<AllTestsModelInMR> = new Array<AllTestsModelInMR>();  
  public BabyBirthDetails: Array<BabyBirthDetails> = [];
  
  public CurrentDischargeType: DischargeTypeModel = new DischargeTypeModel();
  public DischargeConditionTypes: DischargeConditionTypeModel = new DischargeConditionTypeModel();
  public BirthConditionList: Array<BabyBirthConditionModel> = [];

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
  public BabyBirthConditionName: string = null;  
  public OperationTypeName: string = null;
  public OperatedByDoctorName: string = null;
  public GravitaName: string = null;
}
