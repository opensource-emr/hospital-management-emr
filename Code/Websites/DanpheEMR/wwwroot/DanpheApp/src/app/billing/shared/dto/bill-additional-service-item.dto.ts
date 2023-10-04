export class BillingAdditionalServiceItem_DTO {
  AdditionalServiceItemId: number = null;
  GroupName: string = '';
  ServiceItemId: number = null;
  PriceCategoryId: number = null;
  ItemName: string = '';
  UseItemSelfPrice: boolean = false;
  PercentageOfParentItemForSameDept: number = 0;
  PercentageOfParentItemForDiffDept: number = 0;
  IsPreAnaesthesia: boolean = false;
  WithPreAnaesthesia: boolean = false;
  IsOpServiceItem: boolean = false;
  IsIpServiceItem: boolean = false;
  HasChildServiceItems: boolean = false;
  MinimumChargeAmount: number = 0;
  IsActive: boolean = false;
  IsMasterServiceItemActive: boolean = false;
  Price: number = 0;
  LegalName: string = "";
  ServiceDepartmentId: number = 0;
  ServiceDepartmentName: string = "";
  IsDiscountApplicable: boolean = false;
  IsTaxApplicable: boolean = false;
  IsCoPayment: boolean = false;
  CoPaymentCashPercent: number = 0;
  CoPaymentCreditPercent: number = 0;
  DiscountPercent: number = 0;
  DiscountAmount: number = 0;
  ItemCode: string = "";
  IsSelected: boolean = false;
}


