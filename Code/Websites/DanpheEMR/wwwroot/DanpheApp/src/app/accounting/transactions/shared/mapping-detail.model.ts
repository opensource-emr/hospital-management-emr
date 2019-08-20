export class MappingDetailModel{
    public AccountingMappingDetailId: number = 0;
    public GroupMappingId: number = 0; 
    public LedgerGroupId: number = 0;
    public DrCr: boolean = true;
    public LedgerReferenceId: number = 0;
    public Description: string = null;
    public LedgerGroupName: string = null; //not in database    
    public Name: string = "";
}