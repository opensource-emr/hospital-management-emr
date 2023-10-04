export class AdditionalServiceItem_DTO {
    public AdditionalServiceItemId: number = 0;
    public GroupName: string = '';
    public ServiceItemId: number = 0;
    public PriceCategoryId: number = 0;
    public ItemName: string = '';
    public PriceCategoryName: string = '';
    public UseItemSelfPrice: boolean = false;
    public PercentageOfParentItemForSameDept: number = 0;
    public PercentageOfParentItemForDiffDept: number = 0;
    public MinimumChargeAmount: number = 0;
    public IsPreAnaesthesia: boolean = false;
    public WithPreAnaesthesia: boolean = false;
    public IsOpServiceItem: boolean = false;
    public IsIpServiceItem: boolean = false;
    public IsActive: boolean = false;
}