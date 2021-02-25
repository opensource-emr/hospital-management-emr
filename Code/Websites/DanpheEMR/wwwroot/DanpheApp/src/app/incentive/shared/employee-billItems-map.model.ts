import { ItemGroupDistributionModel } from "./item-group-distribution.model";
import { EmployeeIncentiveInfoModel } from "./employee-incentiveInfo.model";

export class EmployeeBillItemsMapModel {

  public EmployeeBillItemsMapId: number = 0;
  public EmployeeId: number = 0;
  public PriceCategoryId: number = 0;
  public BillItemPriceId: number = 0;
  public AssignedToPercent: number = 0;
  public ReferredByPercent: number = 0;
  public HasGroupDistribution: boolean = false;
  public IsActive: boolean = true;
  public BillingTypesApplicable: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public GroupDistribution: Array<ItemGroupDistributionModel> = [];

  //for client side only
  public IsSelected: boolean = false;
  public IsPercentageValid: boolean = false;
  public ItemName: string = '';
  public DepartmentName: string = '';
  public DocObj = {};
  public GroupDistributionCount: number = 0;
  public OpdSelected: boolean = true;
  public IpdSelected: boolean = true;



  constructor() {

  }



}
