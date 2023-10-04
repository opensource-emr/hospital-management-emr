import {NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder } from '@angular/forms'
import * as moment from 'moment/moment';

export class InsuranceInfo {

    public patientId: number=0;
    public InsuranceNumber: string = null;
    public InsuranceName: string = null;
    public CardNumber: string = null;
    public SubscriberFirstName: string = null;
    public SubscriberLastName: string = null;
    public SubscriberDOB: string = null;
    public SubscriberGender: string = null;
    public SubscriberIDCardNumber: string = null;
    public SubscriberIDCardType: string = null;
    public IMISCode: string= null;
    //additional
    public InitialBalance: number = 0;
    public CurrentBalance: number = 0;
    public InsuranceProviderId: number = 0;
    public  Ins_HasInsurance: boolean=null;
    public Ins_NshiNumber:string=null;
    public Ins_InsuranceBalance : number=0;
    public Ins_InsuranceProviderId :number=0;
    public Ins_IsFamilyHead:string=null;
    public Ins_FamilyHeadNshi :string=null;
    public Ins_FamilyHeadName:boolean=null;
    public Ins_IsFirstServicePoint:boolean=null;

    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;

    //---------------------------------------------

    public InsuranceValidator: FormGroup = null;


    //it is only used to show InsuranceProviderName during edit patient
    public InsuranceProviderName: string = null;
    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.InsuranceValidator.dirty;
        }
        else {
            return this.InsuranceValidator.controls[fieldname].dirty;
        }

    }

    public IsValid():boolean{if(this.InsuranceValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {
        //if nothing's has changed in insurance then return true..
        //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
        if (!this.InsuranceValidator.dirty) {
            return true;
        }

        if (fieldname == undefined) {
            return this.InsuranceValidator.valid;
        }
        else {

            return !(this.InsuranceValidator.hasError(validator, fieldname));
        }
    }


    constructor() {
        var _formBuilder = new FormBuilder();

        function dateValidators(control: FormControl): { [key: string]: boolean } {

            var currDate = moment().format('YYYY-MM-DD');

            //if positive then selected date is of future else it of the past
            if ((moment(control.value).diff(currDate) > 0) ||
                (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past

                return { 'wrongDate': true };
        }
        this.InsuranceValidator = _formBuilder.group({
            'InsuranceNumber': ['', Validators.required,],
            'CardNumber': ['', Validators.required,],
            'IMISCode': ['', Validators.required,],
            //'InsuranceName': ['', Validators.required,],
            'SubscriberDOB': ['', dateValidators,],
            'InsuranceProviderId': ['', Validators.required,],
            'InitialBalance': ['', Validators.required,],
        });
    }
}