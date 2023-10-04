export class SubLedger_DTO {
    public SubLedgerId: number = 0;
    public SubLedgerName: string = "";
    public SubLedgerCode: string = "";
    public LedgerId: number = 0;
    public LedgerName: string = "";
    public Description: string = "";
    public IsActive: boolean = true;
    public OpeningBalance: number = 0;
    public DrCr: boolean = true;
    public HospitalId: number = 0;
    public IsDefault: boolean = false;
}