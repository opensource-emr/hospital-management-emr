import { Tax } from "../billing/shared/tax-model";
import { Department } from "../settings-new/shared/department.model";
import { UniquePastDataModel } from "../core/shared/allUniquePast.data.model";
import { PriceCategory } from "../settings-new/shared/price.category.model";
import { ICD10 } from "../clinical/shared/icd10.model";
export class CommonMaster {

  ServiceDepartments: Array<ServiceDepartmentVM> = new Array<ServiceDepartmentVM>();
  PriceCategories: Array<PriceCategory> = new Array<PriceCategory>();
  Departments: Array<Department> = new Array<Department>();
  Taxes: Array<Tax> = new Array<Tax>();
  ICD10List: Array<ICD10> = new Array<ICD10>();
  UniqueDataList: UniquePastDataModel = new UniquePastDataModel();
  constructor() {

  }
}


export class ServiceDepartmentVM {
  public ServiceDepartmentId: number = 0;
  public ServiceDepartmentName: string = null;
  public DepartmentName: string = null;
  public DepartmentId: number = 0;
  public IntegrationName: string = null;
}
