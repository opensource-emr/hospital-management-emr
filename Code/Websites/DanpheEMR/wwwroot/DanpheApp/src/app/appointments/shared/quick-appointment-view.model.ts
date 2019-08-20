import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

import { Appointment } from "./appointment.model";
import { Patient } from "../../patients/shared/patient.model";
import { BillingTransaction } from "../../billing/shared/billing-transaction.model"
import { Visit } from "./visit.model"

///this is a virtual model for QuickAppointment
//created: 5July2017-sudarshanr.
export class QuickAppointmentView {
    Patient: Patient = null;
    Appointment: Appointment = null;
    BillingTransaction: BillingTransaction = null;
    Visit: Visit = null;
    //remove createdon-createdby, it's not used.
    CreatedOn: string = null;
    CreatedBy: number = null;

    PatientMembershipTypeId: number = 4;///    @*Remove this hardcode "value=1" from here: sudarshan-6July2017*@

    Price: number = null;
    DiscountAmount: number = null;
    DiscountPercent: number = null;
    SubTotal: number = null;
    TotalAmount: number = null;
    IsTaxApplicable: boolean = true;
    TaxAmount: number = null;
    EthnicGroup: string = null;
    public QuickAppointmentValidator: FormGroup = null;

    constructor() {
        this.Patient = new Patient();
        this.Appointment = new Appointment();
        this.BillingTransaction = new BillingTransaction();
        this.Visit = new Visit();

        var _formBuilder = new FormBuilder();
        this.QuickAppointmentValidator = _formBuilder.group({
            'CountryId': ['', Validators.compose([Validators.required])],
            'CountrySubDivisionId': ['', Validators.compose([Validators.required])],
            'MiddleName': ['', Validators.compose([Validators.maxLength(30)])],
            'FirstName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'LastName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'Age': ['', Validators.compose([])],
            'Gender': ['', Validators.compose([Validators.required])],
            'PhoneNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$')])],
            'Doctor': ['', Validators.compose([Validators.required])],
            'DateOfBirth': ['', Validators.compose([])],
            'Address': ['', Validators.required],
            'Remark': ['', Validators.compose([Validators.maxLength(200)])],
        });
    }
    //the date should be in past and we are allowing till 200yrs in past
    dateValidators(control: FormControl): { [key: string]: boolean } {
        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');
        //if positive then selected date is of future else it of the past
        if ((moment(control.value).diff(currDate) > 0) ||
            (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
            return { 'wrongDate': true };
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.QuickAppointmentValidator.dirty;
        else
            return this.QuickAppointmentValidator.controls[fieldName].dirty;
    }


    public IsValid():boolean{if(this.QuickAppointmentValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.QuickAppointmentValidator.valid;
        }
        else
            return !(this.QuickAppointmentValidator.hasError(validator, fieldName));
    }
    //conditional sets ON and OFF the validation on age and dob
    public UpdateValidator(onOff: string, formControlName: string) {
        let validator = null;
        if (formControlName == "Age" && onOff == "on") {
            this.QuickAppointmentValidator.controls['Age'].validator = Validators.compose([Validators.required]);
            this.QuickAppointmentValidator.controls['DateOfBirth'].validator = Validators.compose([]);
        }
        else {
            this.QuickAppointmentValidator.controls['DateOfBirth'].validator = Validators.compose([Validators.required, this.dateValidators]);
            this.QuickAppointmentValidator.controls['Age'].validator = Validators.compose([]);
        }

    }
}

