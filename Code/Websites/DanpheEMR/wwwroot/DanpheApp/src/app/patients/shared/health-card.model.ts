import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

export class HealthCard {
    public PatHealthCardId: number = 0;
    public PatientId: number = null;
    public InfoOnCardJSON: string = "";
    public BillingDate: string = "";
    public CreatedOn: string = "";
    public CreatedBy: number = null;
}