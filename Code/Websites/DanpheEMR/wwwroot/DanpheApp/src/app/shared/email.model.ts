import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
export class EmailModel {

    public EmailAddress: string = null;
    public Subject: string = null;
    public Content: string = null;

}