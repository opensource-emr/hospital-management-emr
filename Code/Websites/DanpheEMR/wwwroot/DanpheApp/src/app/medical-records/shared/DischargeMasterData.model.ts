import { ICD10 } from '../../clinical/shared/icd10.model';
import { BabyBirthConditionModel } from './babyBirthConditions.model';
import { GravitaModel } from './gravita.model';


export class DischargeTypeModel {
  public DischargeTypeId: number = 0;
  public DischargeTypeName: string = null;
  public Description: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: number = null;

  public DeathTypes: Array<DeathTypeModel> = [];
  public DischargeConditionTypes: Array<DischargeConditionTypeModel> = [];
}

export class DeliveryTypeModel {
  public DeliveryTypeId: number = 0;
  public DischargeConditionId: number = null;
  public DeliveryTypeName: string = null;  
}

export class DischargeConditionTypeModel {
  public DischargeConditionId: number = 0;
  public DischargeTypeId: number = null;
  public Condition: string = null;

  public CurrentConditionTypes: Array<DeliveryTypeModel> = [];
}

export class DeathTypeModel {
  public DeathTypeId: number = 0;
  public DeathType: string = null;
  public DischargeTypeId: number = null;
}

export class OperationTypeModel {
  public OperationId: number = 0;
  public OperationName: string = null;
}

export class MedicalRecordsMasterDataVM {
  public AllOperationType: Array<OperationTypeModel> =[];
  public AllDischargeType: Array<DischargeTypeModel> = [];
  public AllBirthConditions: Array<BabyBirthConditionModel> = [];
  public AllICDCodes: Array<ICD10> = [];
  public AllGravita: Array<GravitaModel> = [];
}
