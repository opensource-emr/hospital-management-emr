export class Scheme_DTO {
    SchemeId: number = 0;
    SchemeCode: string = '';
    SchemeName: string = '';
    CommunityName: string = '';
    IsDiscountApplicable: boolean = false;
    DiscountPercent: number = 0;
    IsDiscountEditable: boolean = false;
    IsMembershipApplicable: boolean = false;
    IsMemberNumberCompulsory: boolean = false;
    DefaultPaymentMode: string = '';
    IsCreditApplicable: boolean = false;
    IsCreditOnlyScheme: boolean = false;
    CreditLimit: number = 0;
    DefaultCreditOrganizationId: number = 0;
    IsCoPayment: boolean = false;
    CoPaymentCashPercent: number = 0;
    CoPaymentCreditPercent: number = 0;
    DefaultPriceCategoryId: number = 0;
    DefaultPriceCategoryName: string = '';
    IsGeneralCreditLimited: boolean = false;
    IsCreditLimited: boolean = false;
    GeneralCreditLimit: number = 0;
}