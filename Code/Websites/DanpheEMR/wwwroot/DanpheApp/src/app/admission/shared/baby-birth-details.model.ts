import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class BabyBirthDetails{
     public BabyBirthDetailsId : number = 0;
    public CertificateNumber:string = null;
    public  Sex: string= "Male";
    public  FathersName :string =null;
    public  WeightOfBaby: number = null;
    public   BirthDate : string = null;
    public  BirthTime : string = null;
    public  DischargeSummaryId : number = 0;
    public BabyBirthDetailsValidator: FormGroup = null;
    public IsDeleted: boolean = false;
    public PatientVisitId: number = null;
    public MotherName : string = null;
    public  FiscalYearName:string = null;
    public PatientId: number = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.BabyBirthDetailsValidator = _formBuilder.group({
            'Sex': ['', Validators.compose([Validators.required])],
            'BirthDate': ['', Validators.compose([Validators.required])],
            'BirthTime': ['', Validators.compose([Validators.required ])],
            'WeightOfBaby': ['', Validators.compose([Validators.required ])],
      });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.BabyBirthDetailsValidator.dirty;
        else
            return this.BabyBirthDetailsValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.BabyBirthDetailsValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.BabyBirthDetailsValidator.valid;
        else
            return !(this.BabyBirthDetailsValidator.hasError(validator, fieldName));
    }
}

