
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
import { ItemMaster } from "../shared/item-master.model"

export class WriteOffItems {

    public  WriteOffId:number = 0;
    public  StockId:number = 0;
    public  ItemId:number = 0;
    public  ItemRate:number = 0;
    public WriteOffQuantity: number = 0;
    public TotalAmount: number = 0;
    public  WriteOffDate : string = moment().format("YYYY-MM-DD");
    public  Remark:string = null;
    public  CreatedBy:number = 0;
    public CreatedOn: string = "";
    public GoodsReceiptItemId: number = 0;
    public BatchNO: string = "";

    ////Selected Item as ItemMaster Model for New row
    public SelectedItem: ItemMaster = null;
    //Only for Display purpose
    public ItemName: string = "";
    public BatchNo: string = "";
    public VAT: number = 0;
    public AvailableQty: number = 0;
    public SubTotal: number = 0;
    public BatchNoList: Array<{ BatchNo: string, AvailableQuantity: number }> = new Array<{ BatchNo: string, AvailableQuantity: number }>();
    public WriteOffItemValidator: FormGroup = null;
    public Code:string=null;
    public StoreId: number;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.WriteOffItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([Validators.required])],
            'WriteOffDate': ['', Validators.compose([Validators.required])],
            'WriteOffQuantity': ['', Validators.compose([Validators.required])],
            'BatchNo': ['', Validators.compose([Validators.required])],
            'Remark': ['', Validators.required]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.WriteOffItemValidator.dirty;
        else
            return this.WriteOffItemValidator.controls[fieldName].dirty;
    }


    public IsValid():boolean{if(this.WriteOffItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.WriteOffItemValidator.valid;
        }
        else
            return !(this.WriteOffItemValidator.hasError(validator, fieldName));
    }

    /*dateValidator(control: FormControl): { [key: string]: boolean } {
        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');
       
        if (control.value) {
            if ((moment(control.value).diff(currDate) < 0)
                || (moment(control.value).diff(currDate, 'years') > 1)) //can make writeOff upto 1 year from today only.
                return { 'wrongDate': true };
        }

        else
            return { 'wrongDate': true };
    }*/

  
   
 
}