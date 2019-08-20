import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class TransactionItemDetailModel {
  public TransactionItemDetailId: number = 0;
    public TransactionItemId: number = null;
  //  public PatientId: number = null;
    public Amount: number = 0;
    public Description: string = null;
    public TransactionDetailValidator: FormGroup = null;
    public fromDate: string = "";
    public toDate: string = "";
   // public VendorId: number = null;
   // public SupplierId: number = null;
    public ReferenceId: number = null;
    public ReferenceType: string = "";
    constructor() {
        var _formBuilder = new FormBuilder();
        this.TransactionDetailValidator = _formBuilder.group({
            'fromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
            'toDate': ['', Validators.compose([Validators.required, this.dateValidators])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.TransactionDetailValidator.dirty;
        else
            return this.TransactionDetailValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.TransactionDetailValidator.valid){return true;}else{return false;}} 
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.TransactionDetailValidator.valid;

        }
        else
            return !(this.TransactionDetailValidator.hasError(validator, fieldName));
    }
    public dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {
        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');
        if (control.value) {
            //if positive then selected date is of future else it of the past
            if ((moment(control.value).diff(currDate) > 0) ||
                (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
                return { 'wrongDate': true };
        }
        else
            return { 'wrongDate': true };
    }

    public dateValidators(control: FormControl): { [key: string]: boolean } {

        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');

        //if positive then selected date is of future else it of the past
        if ((moment(control.value).diff(currDate) > 0) ||
            (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
            return { 'wrongDate': true };
    }
}