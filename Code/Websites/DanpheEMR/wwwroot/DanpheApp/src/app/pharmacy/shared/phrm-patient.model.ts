
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';
export class PHRMPatient {
    public PatientId: number = 0;
    public FirstName: string = "";
    public MiddleName: string = null;
    public LastName: string = "";
    public Age: string = null;
    public Address: string = null;

    public PhoneNumber: string = "";
    public Gender: string = null;

    public DateOfBirth: string = null;
    public PhoneAcceptsText: boolean = false;
    public AgeUnit: string = 'Y';
    public IsDobVerified: boolean = false;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public PatientCode: string = null;
    public IsActive: boolean = true;
    public IsOutdoorPat: boolean = true;
    public ProviderId: number = 0;
    public IsAdmitted: boolean = true;
    public CountrySubDivisionName: string = "";
    //only for read purpose
    public ShortName: string = "";
    public PHRMPatientValidator: FormGroup = null;
    public PANNumber: string = null;
    public CountryId: any;
    public CountrySubDivisionId: any;
    //Constructor of class
    constructor() {
        var _formBuilder = new FormBuilder();
        this.PHRMPatientValidator = _formBuilder.group({
            'FirstName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'LastName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'MiddleName': ['', Validators.compose([Validators.maxLength(30)])],
            'PhoneNumber': ['', Validators.compose([Validators.pattern('^[0-9]{1,10}$')])],
            'Address': ['', Validators.compose([Validators.maxLength(30)])],
            'Age': ['', Validators.compose([Validators.required, Validators.maxLength(10)])],
            'Gender': ['', Validators.required],
        });
    }

    //Check is dirt or not control
    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.PHRMPatientValidator.dirty;
        }
        else {
            return this.PHRMPatientValidator.controls[fieldname].dirty;
        }
    }
    //Check Is valid or not control
    public IsValid(): boolean { if (this.PHRMPatientValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldname, validator): boolean {
        if (this.PHRMPatientValidator.valid) {
            return true;
        }

        if (fieldname == undefined) {
            return this.PHRMPatientValidator.valid;
        }
        else {

            return !(this.PHRMPatientValidator.hasError(validator, fieldname));
        }
    }
}
