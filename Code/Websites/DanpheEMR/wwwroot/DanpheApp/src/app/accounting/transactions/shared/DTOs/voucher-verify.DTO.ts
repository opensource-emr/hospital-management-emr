export class VoucherVerify_DTO {
    public VoucherNumber: string = "";
    public Items: Array<VoucherLedgerInfo_DTO> = new Array<VoucherLedgerInfo_DTO>();
    public Remarks: string = "";
    public FiscalYearId = 0;
}

export class VoucherLedgerInfo_DTO {
    public LedgerId: number = 0;
    public Description: string = "";
    public CostCenterId = -1;
    public TransactionItemId = 0;
}