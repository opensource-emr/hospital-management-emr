
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';
export class PHRMInvoiceReturnItemsModel {
    public InvoiceReturnItemId: number = 0;
    public InvoiceItemId: number = null;
    public InvoiceId: number = null;
    public BatchNo: string = "";
    public Quantity: number = null;
    public TotalQty: number = null;
    public MRP: number = null;
    public Price: number = null;
    public SubTotal: number = null;
    public VATPercentage: number = null;
    public DiscountPercentage: number = null;
    public TotalAmount: number = null;
    public Remark: string = "";
    public CreatedBy: number = null;
    public CreatedOn: string = "";
    public ReturnedQty: number = null;
    public CounterId: number = null;

    //some more variables for show only not for mapping with server
    public ItemId: number = null;
    public ItemName: string = "";
    public SaledQty: number = null;//all sale invoice qty details
    public FreeQty: number = null;  //It's shows only FreeQty at sale time only for information
    public IsReturn: boolean = true;//it's flag for checkbox at client side for all select/deselect functionality

    public IsInsert: boolean = true;//mart Insert or update below is desc
    //When we post data to server
    //that data is PHRMInvoiceReturnItems table data,from this data some items already returned so , we need to update only quantity
    //and which records are return first time need to insert that record as new in PHRMInvoiceReturnItems

    public GRItemId: number = null;//only for refer update GRItem after sale return 
    public ExpiryDate: string = null;
    public InvoiceItemsReturnValidator: FormGroup = null;

    //Constructor of class
    constructor() {
        var _formBuilder = new FormBuilder();
        this.InvoiceItemsReturnValidator = _formBuilder.group({
            'Quantity': ['', Validators.compose([this.positiveNumberValdiator])],
            'Remark': ['', Validators.compose([Validators.required])],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.InvoiceItemsReturnValidator.dirty;
        else
            return this.InvoiceItemsReturnValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.InvoiceItemsReturnValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.InvoiceItemsReturnValidator.valid;
        else
            return !(this.InvoiceItemsReturnValidator.hasError(validator, fieldName));
    }
 
    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value <= 0)
                return { 'invalidNumber': true };
        }
    }   
 
}