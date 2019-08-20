import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
export class MedicationPrescription {
     //review:25Jan'17-sudarshan: check if Dose property is needed<confirm with hari or domain team>
    public MedicationPrescriptionId: number = 0;
    public PatientId: number = 0;
    public MedicationId: number = null;
    public MedicationName: string = null;
    public ProviderId: number = null;
    public ProviderName: string = null;
    
    public Frequency: string = null;
    public Route: string = null;
    public Duration: number = null;
    public DurationType: string = null;
    public Dose: string = null;
    public Refill: number = null;
    public TypeofMedication: string = null;
    public MedicationValidator: FormGroup = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    // this is used to show ..selected medicine with tick mark  in order list 
    public IsSelected: boolean = false;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.MedicationValidator = _formBuilder.group({
            'MedicationId': ['', Validators.compose([Validators.required])],
            'Frequency': ['', Validators.compose([Validators.required])],
            'Route': ['', Validators.compose([Validators.required])],
            'Duration': ['', Validators.compose([Validators.required])],
            'DurationType': ['', Validators.compose([Validators.required])],
            'Dose': ['', Validators.compose([Validators.required])],
        });
    }
   
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.MedicationValidator.dirty;
        else
            return this.MedicationValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.MedicationValidator.valid){return true;}else{return false;}} 
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.MedicationValidator.valid;
        else
            return !(this.MedicationValidator.hasError(validator, fieldName));
    }

}