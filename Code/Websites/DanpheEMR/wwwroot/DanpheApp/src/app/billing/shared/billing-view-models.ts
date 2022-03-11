export class BillItemPriceVM {
  public ProcedureCode: string = null;
  public ItemName: string = null;
  public Price: number = 0;
  public ItemId: number = 0;  //for external billing itemId is required to send to the respective departments
  public ItemCode: string = null;  //pratik :17 jan2020 --- for item search in billing transaction by itemcode
  public TaxApplicable: boolean = true;
  public EHSPrice: number = 0;
  public SAARCCitizenPrice: number = 0;
  public ForeignerPrice: number = 0;
  public InsForeignerPrice: number = 0;
  public GovtInsurancePrice: number = 0;
  public ServiceDepartmentId: number = 0;//sud:4Sept'19
  public ServiceDepartmentName: string = null;//sud:24Sept'19--this is used only in client side.
  public DiscountApplicable: boolean = true;//sud:4Sept'19

  public AllowMultipleQty: boolean = true;//pratik:18oct2019
  public IsDoctorMandatory: boolean = false;//pratik:15May2020
  public IsZeroPriceAllowed: boolean = false;//pratik:28Jan'21
  public IsErLabApplicable: boolean = false;//pratik:10Feb'21
  public IsAutoAdded: boolean = false; //anish: 16 May 2021
}
