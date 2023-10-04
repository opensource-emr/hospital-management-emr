export class LedgerReportRequest_DTO {
    public LedgerIds: Array<number> = [];
    public FromDate: string = "";
    public ToDate: string = "";
    public FiscalYearId: number = 0;
    public CostCenterId: number = 0;
}