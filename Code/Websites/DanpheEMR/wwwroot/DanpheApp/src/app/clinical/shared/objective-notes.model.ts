export class ObjectiveNote {
    public ObjectiveNotesId: number = 0;
    public NoteId: number = null;
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public HEENT: string = null;
    public Chest : string = null;
    public CVS: string = null;
    public Abdomen : string = null;
    public Extremity : string = null;
    public Skin: string = null;
    public Neurological: string = null;

    public CreatedBy: number = null;    
    public CreatedOn: string = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;

    //public ModifiedBy: number = null;
    //public ModifiedOn: string = null;
}