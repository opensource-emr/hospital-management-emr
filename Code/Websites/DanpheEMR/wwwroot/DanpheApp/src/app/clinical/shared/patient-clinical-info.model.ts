export class PatientClinicalInfoModel {
    public InfoId: number = 0;
    public PatientId: number;
    public PatientVisitId: number;
    public KeyName: string = "";
    public Value: string = "";
    public CreatedBy: number;
    public CreatedOn: string;
    public ModifiedBy: number;
    public ModifiedOn: string;
    public IsActive: boolean;

}
