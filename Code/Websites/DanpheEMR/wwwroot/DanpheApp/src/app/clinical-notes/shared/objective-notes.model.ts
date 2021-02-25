export class ObjectiveNotesModel {
    public ObjectiveNotesId: number = 0;
    public NoteId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
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
