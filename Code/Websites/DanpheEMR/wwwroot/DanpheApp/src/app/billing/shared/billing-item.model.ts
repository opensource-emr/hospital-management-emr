export class BillingItem {  //need to map with theese parmeters while billing the items from every department(BillingRequisition form page external)
    public ProcedureCode: string = null;
    public ItemName: string = null;
    public Price: number = 0;
    public ItemId: number = 0;  //for external billing itemId is required to send to the respective departments
    public TaxApplicable: boolean = true;
    public EHSPrice: number = 0;
    public SAARCCitizenPrice: number = 0;
    public ForeignerPrice: number = 0;
    public GovtInsurancePrice: number = 0;
}