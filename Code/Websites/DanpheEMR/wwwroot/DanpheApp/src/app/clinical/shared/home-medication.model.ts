import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

export class HomeMedication {
    public HomeMedicationId: number = 0;
    public PatientId: number = 0;
    public MedicationId: number = null;
    public MedicationName: string = null;
    public Dose: string = null;
    public Route: string = null;
    public LastTaken: string = null;
    public Comments: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public Frequency: number = 0;
    public MedicationType: string = null;
    public HomeMedicationValidator: FormGroup = null;
    public PatientVisitId:number=0;
    public FrequencyId:number = null;
    public FrequencyType: string = null;
    public Days: number = 0;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.HomeMedicationValidator = _formBuilder.group({
            'MedicationId': ['', Validators.compose([Validators.required])],
            'Dose': ['', Validators.compose([Validators.required])],
            'Route': ['', Validators.compose([Validators.required])],
            'LastTaken': ['', Validators.compose([Validators.required, this.dateValidator])],
            'Comments': ['', Validators.compose([Validators.maxLength(200)])],
            'Frequency': ['', Validators.compose([Validators.required])],
            'MedicationType': ['', Validators.compose([Validators.required])],
            'Days': ['', Validators.compose([Validators.required])],
        });
    }
    dateValidator(control: FormControl): { [key: string]: boolean } {

        var currDate = moment().format('YYYY-MM-DD');
        if (control.value) { // gets empty string for invalid date such as 30th Feb or 31st Nov)
            if ((moment(control.value).diff(currDate) > 0)
                || (moment(currDate).diff(control.value, 'years') > 200)) //cannot make entry of 200 year before from today.
                return { 'wrongDate': true };
        }
        else
            return { 'wrongDate': true };
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.HomeMedicationValidator.dirty;
        else
            return this.HomeMedicationValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.HomeMedicationValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.HomeMedicationValidator.valid;
        else
            return !(this.HomeMedicationValidator.hasError(validator, fieldName));
    }

    public UpdateValidator(onOff: string){
        if(onOff == "on"){
            this.HomeMedicationValidator.controls['MedicationId'].validator = Validators.compose([Validators.required]);
            this.HomeMedicationValidator.controls['Dose'].validator = Validators.compose([Validators.required]);
            this.HomeMedicationValidator.controls['Route'].validator = Validators.compose([Validators.required]);
            this.HomeMedicationValidator.controls['LastTaken'].validator = Validators.compose([Validators.required, this.dateValidator]);
            this.HomeMedicationValidator.controls['Comments'].validator = Validators.compose([Validators.maxLength(200)]);
            this.HomeMedicationValidator.controls['Frequency'].validator = Validators.compose([Validators.required]);
            this.HomeMedicationValidator.controls['MedicationType'].validator = Validators.compose([Validators.required]);
            this.HomeMedicationValidator.controls['Days'].validator = Validators.compose([Validators.required]);
        }
        else{
            this.HomeMedicationValidator.controls['MedicationId'].validator = Validators.compose([]);
            this.HomeMedicationValidator.controls['Dose'].validator = Validators.compose([]);
            this.HomeMedicationValidator.controls['Route'].validator = Validators.compose([]);
            this.HomeMedicationValidator.controls['LastTaken'].validator = Validators.compose([]);
            this.HomeMedicationValidator.controls['Comments'].validator = Validators.compose([]);
            this.HomeMedicationValidator.controls['Frequency'].validator = Validators.compose([]);
            this.HomeMedicationValidator.controls['MedicationType'].validator = Validators.compose([]);
            this.HomeMedicationValidator.controls['Days'].validator = Validators.compose([]);
        }
        this.HomeMedicationValidator.controls['MedicationId'].updateValueAndValidity();
        this.HomeMedicationValidator.controls['Dose'].updateValueAndValidity();
        this.HomeMedicationValidator.controls['Route'].updateValueAndValidity();
        this.HomeMedicationValidator.controls['LastTaken'].updateValueAndValidity();
        this.HomeMedicationValidator.controls['Comments'].updateValueAndValidity();
        this.HomeMedicationValidator.controls['Frequency'].updateValueAndValidity();
        this.HomeMedicationValidator.controls['MedicationType'].updateValueAndValidity();
        this.HomeMedicationValidator.controls['Days'].updateValueAndValidity();
    }
}
