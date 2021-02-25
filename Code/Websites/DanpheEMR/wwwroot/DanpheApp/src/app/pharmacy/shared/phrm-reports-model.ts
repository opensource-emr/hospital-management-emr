import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class PHRMReportsModel {
   
    public FromDate: string = null;
    public ToDate: string = null;
    public Status: string = null;
   
    public CounterId: string = "";
    public CreatedBy: string = "";
   /// public CompanyValidator: FormGroup = null;

    constructor() {
       
    }

    }
