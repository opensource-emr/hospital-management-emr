import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class RPT_BIL_SalesDaybookModel {
    public BillingDate: Date = null;
    public SubTotal: number = 0;
    public DiscountAmount: number = 0;
    public TaxableAmount: number = 0;
    public TaxAmount: number = 0;
    public TotalAmount: number = 0;
    public CashCollection: number = 0;
    public Paid_SubTotal: number = 0;
    public Paid_DiscountAmount: number = 0;
    public Paid_TaxableAmount: number = 0;
    public Paid_TaxAmount: number = 0;
    public Paid_TotalAmount: number = 0;
    public CrSales_SubTotal: number = 0;
    public CrSales_DiscountAmount: number = 0;
    public CrSales_TaxableAmount: number = 0;
    public CrSales_TaxAmount: number = 0;
    public CrSales_TotalAmount: number = 0;
    public CrReceived_SubTotal: number = 0;
    public CrReceived_DiscountAmount: number = 0;
    public CrReceived_TaxableAmount: number = 0;
    public CrReceived_TaxAmount: number = 0;
    public CrReceived_TotalAmount: number = 0;
    public DepositReceived: number = 0;
    public DepositReturn: number = 0;
    public SettlPaidAmount: number = 0;
    public SettlReturnAmount: number = 0;
    public SettlDiscountAmount: number = 0;
    public SettlDueAmount: number = 0;
    public CashRet_SubTotal: number = 0;
    public CashRet_DiscountAmount: number = 0;
    public CashRet_TaxableAmount: number = 0;
    public CashRet_TaxAmount: number = 0;
    public CashRet_TotalAmount: number = 0;
    public CrRet_SubTotal: number = 0;
    public CrRet_DiscountAmount: number = 0;
    public CrRet_TaxableAmount: number = 0;
    public CrRet_TaxAmount: number = 0;
    public CrRet_TotalAmount: number = 0;

    public ReturnAmount: number = 0;//sud:18Aug'18--this is for total returned amount. (Credit+Cash)
    public DepositDeducted : number = 0;
    public DepositRefund : number = 0;
    public TotalSalesReturn : number = 0;
    public TotalReturnDiscount : number = 0;

    public fromDate: string = "";
    public toDate: string = "";

    public SalesDaybookValidator: FormGroup = null;



    constructor() {

        var _formBuilder = new FormBuilder();
        this.SalesDaybookValidator = _formBuilder.group({
            //'FromDate': ['', Validators.compose([Validators.required])],
            'fromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
            'toDate': ['', Validators.compose([Validators.required, this.dateValidator])],

        });
    }




    dateValidator(control: FormControl): { [key: string]: boolean } {
        var currDate = moment().format('YYYY-MM-DD HH:mm');
        if (control.value) { // gets empty string for invalid date such as 30th Feb or 31st Nov)
            if ((moment(control.value).diff(currDate) > 0)
                || (moment(currDate).diff(control.value, 'years') > 200)) //can select date upto 200 year past from today.
                return { 'wrongDate': true };
        }
        else
            return { 'wrongDate': true };
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

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.SalesDaybookValidator.dirty;
        else
            return this.SalesDaybookValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.SalesDaybookValidator.valid){return true;}else{return false;}}
     public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.SalesDaybookValidator.valid;
        else
            return !(this.SalesDaybookValidator.hasError(validator, fieldName));
    }


}
