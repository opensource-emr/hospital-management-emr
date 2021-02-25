import { EmployeeBillItemsMapModel } from "./employee-billItems-map.model";


export class EmployeeIncentiveInfoModel {

  public EmployeeIncentiveInfoId: number = 0;
  public EmployeeId: number = 0;
  public TDSPercent: number = 0;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public IsActive: boolean = true;
  public EmployeeBillItemsMap: Array<EmployeeBillItemsMapModel> = [];

  public PriceCategoryName: string = null;
  public PriceCategoryId: number = 0;

  
  constructor() {

  }

}
