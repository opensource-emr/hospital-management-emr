export class BillServiceItemSchemeSetting_DTO {
  public ServiceItemSchemeSettingId: number = 0;
  public SchemeId: number = 0;
  public ServiceItemId: number = 0;
  public ServiceItemCode: string = '';
  public ServiceItemName: string = '';
  public RegDiscountPercent: number = 0;
  public OpBillDiscountPercent: number = 0;
  public IpBillDiscountPercent: number = 0;
  public AdmissionDiscountPercent: number = 0;
  public IsCoPayment: boolean = false;
  public CoPaymentCashPercent: number = 0;
  public CoPaymentCreditPercent: number = 0;
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;
  public ServiceDepartmentId: number = 0;
  public itemIsSelected: boolean = false;

  public IsValidRegDiscountPercent: boolean = true;
  public IsValidOpBillDiscountPercent: boolean = true;
  public IsValidIpBillDiscountPercent: boolean = true;
  public IsValidAdmissionDiscountPercent: boolean = true;
  public IsValidCopayCashPercent: boolean = true;

  public IsValidCopayCreditPercent: boolean = true;
  public initialSelectionState: boolean;

}
