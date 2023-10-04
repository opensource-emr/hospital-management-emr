import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
export class CurrencyMasterModel {

    public CurrencyID: number = 0;
    public CurrencyCode: string = null
    public Description: string = null;
   
}