export class PriceCategory_DTO {

    public PriceCategoryId: number = 0;
    public OldPriceCategoryId: number = 0;
    public NewPriceCategoryId: number = 0;
    public PriceCategoryCode: string = '';
    public PriceCategoryName: string = '';
    public Description: string = '';
    public ShowInRegistration: boolean = false;
    public ShowInAdmission: boolean = false;
    public IsDefault: boolean = false;
    public IsRateDifferent: boolean = false;
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public IsActive: boolean = true;
    public PharmacyDefaultCreditOrganizationId: number = 0;
    public IsPharmacyRateDifferent: boolean = false;
    public DisplaySequence: number = 0;
    public IsCoPayment: boolean = false;
    public DefaultCreditOrganizationId: number = 0;
    public Copayment_CashPercent: number = 0;
    public Copayment_CreditPercent: number = 0;
}
