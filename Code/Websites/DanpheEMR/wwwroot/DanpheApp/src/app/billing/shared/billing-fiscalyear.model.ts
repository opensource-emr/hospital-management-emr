export class BillingFiscalYear { 
    public FiscalYearId: number = null;
    public FiscalYearName: string = null;
    public FiscalYearFormatted: string = null;
    public StartYear: string = null;
    public EndYear: string = null;
    public Description: string = null;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public IsActive: boolean = true;

    public currentlyActive: boolean = false;
}