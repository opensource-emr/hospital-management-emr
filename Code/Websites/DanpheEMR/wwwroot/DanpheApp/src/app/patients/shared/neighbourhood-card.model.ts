import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

export class NeighbourhoodCardModel {
    public NeighbourhoodCardId: number = 0;
    public PatientId: number = null;
    public PatientCode: string = "";
    public CreatedOn: string = "";
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = "";
}