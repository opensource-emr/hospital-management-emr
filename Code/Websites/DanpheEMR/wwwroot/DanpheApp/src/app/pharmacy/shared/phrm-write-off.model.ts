import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
///import { PHRMItemMasterModel } from "./phrm-item-master.model";
import { PHRMWriteOffItemModel } from "./phrm-write-off-items.model";
export class PHRMWriteOffModel {


    public WriteOffId: number = 0;
    public WriteOffDate: string = "";
    public StoreId: number;
    public SubTotal: number = 0;
    public TotalAmount: number = 0;
    public WriteOffRemark: string = null;
    public CreatedBy: number = 0;
    public CreateOn: string = "";

    ////Only to Display in UI
    public DiscountAmount: number = 0;
    public VATAmount: number = 0;

    public WriteOffValidator: FormGroup = null;

    public phrmWriteOffItem: Array<PHRMWriteOffItemModel> = new Array<PHRMWriteOffItemModel>();

    constructor() {

        var _formBuilder = new FormBuilder();
        this.WriteOffValidator = _formBuilder.group({
            // 'WriteOffDate': ['', Validators.compose([Validators.required])],
            'WriteOffRemark': ['', Validators.compose([Validators.required])]
        });

        this.WriteOffDate = moment().format("YYYY-MM-DD");
    }
    public IsValid(): boolean { if (this.WriteOffValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.WriteOffValidator.valid;
        }
        else
            return !(this.WriteOffValidator.hasError(validator, fieldName));
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.WriteOffValidator.dirty;
        else
            return this.WriteOffValidator.controls[fieldName].dirty;
    }

    dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {

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

}
