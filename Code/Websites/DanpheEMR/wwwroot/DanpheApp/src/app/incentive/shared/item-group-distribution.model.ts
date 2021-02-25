

export class ItemGroupDistributionModel {

  public ItemGroupDistributionId: number = 0;
  public IncentiveType: string = null;
  public BillItemPriceId: number = 0;
  public EmployeeBillItemsMapId: number = 0;
  public FromEmployeeId: number = 0;
  public DistributeToEmployeeId: number = 0;
  public DistributionPercent: number = 0;
  public FixedDistributionAmount: number = 0;
  public IsFixedAmount: boolean = null;
  public DisplaySeq: number = 0;
  public Remarks: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;

  //for client side only
  public IsRemoved: boolean = false;
  public DocObj = { EmployeeId: null, FullName: '' };
  public isSelfGroupDistribution: boolean = false;


  constructor() {

  }

}
