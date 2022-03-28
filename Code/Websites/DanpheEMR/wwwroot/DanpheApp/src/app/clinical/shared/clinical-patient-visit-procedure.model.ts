export class PatientVisitProcedureModel {
    public PatientVisitProcedureId :number=0;
    public PatientId :number=0;
    public PatientVisitId:number=0;
    public ProviderId :number=0;
    public BillItemPriceId :number=0;
    public  ItemName :string='';
    public Status:string='';
    public Remarks :string=null;
    public CreatedBy :number=0;
    public CreatedOn : string = null;
    public ModifiedBy :number=0;
    public ModifiedOn : string = null;
    public IsActive :boolean=true;
}