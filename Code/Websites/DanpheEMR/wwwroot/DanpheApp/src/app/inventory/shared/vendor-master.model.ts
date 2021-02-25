export class VendorMaster {

  public VendorId: number = 0;
  public VendorName: string = null;
  public ContactAddress: string = null;
  public ContactNo: string = null;
  public Email: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public IsActive: boolean = false;
  public DefaultCurrencyId: number = 0;
  public CreditPeriod: number = 0;
  public IsTDSApplicable: boolean = false;
  public DefaultItem: Array<number> = new Array<number>();
}
