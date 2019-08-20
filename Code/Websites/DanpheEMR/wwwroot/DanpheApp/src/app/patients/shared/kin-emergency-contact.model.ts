import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

export class KinEmergencyContact {

    public PatientId: number = null;
    public KinContactType: string = null;
    public KinFirstName: string = null;
    public KinLastName: string = null;
    public KinPhoneNumber: string = null;
    public KinComment: string = null;
    public RelationShip: string = null;
    public KinValidator: FormGroup = null;
   


    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.KinValidator.dirty;
        }
        else {
            return this.KinValidator.controls[fieldname].dirty;
        }

    }

    public IsValid():boolean{if(this.KinValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {

        //if nothing's has changed in KIN/Emergency then return true..
        //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
        if (!this.KinValidator.dirty) {
            return true;
        }

        if (fieldname == undefined) {
            return this.KinValidator.valid;
        }
        else {

            return !(this.KinValidator.hasError(validator, fieldname));
        }
    }


    constructor() {
        this.PatientId = 0;

        var _formBuilder = new FormBuilder();

         
         this.KinValidator = _formBuilder.group({
             'KinFirstName': ['', Validators.required,],
             'KinLastName': ['', Validators.required,],
             'KinPhoneNumber': ['', Validators.pattern('^[0-9]{1,10}$')],
             'KinContactType': ['', Validators.required,],
             'RelationShip': ['', Validators.required,]        

        });
    }

}