
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

import { PHRMGoodsReceiptItemsModel } from "../../pharmacy/shared/phrm-goods-receipt-items.model";
export class DrugsRequistionItemModel {

    public RequisitionItemId: number = 0;
    public RequisitionId: number = 0;
    public ItemId: number = 0;
    public Quantity: number = 0;
    public ItemName: string = "";
    public TotalQty: number = null;
    public selectedItem: any;

    public PatientId: number = 0;
    public BatchNo: string = "";
    public ExpiryDate: string = null;
    public Remark: string = "";
    public GRItems: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    public SelectedGRItems: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();

    public DrugsRequestValidator: FormGroup = null;
    public enableItmSearch: boolean = true;

    //public InvoiceItemId: number = 0;
    //public InvoiceId: number = 0;
    //public CompanyId: number = null;

    //public Price: number = null;
    //public MRP: number = null;
    //public GrItemPrice: number = null;
    //public FreeQuantity: number = 0;
    //public SubTotal: number = 0;
    //public VATPercentage: number = 0;
    //public DiscountPercentage: number = 0;
    //public TotalAmount: number = 0;
    //public BilItemStatus: string = "";
 
    //public CreatedBy: number = 0;
    //public CreatedOn: string = "";
    //public PrescriptionItemId: number = null;

    //public GoodReceiptItemId: number = 0;
    //public GenericId: number = 0;
    //public GenericName: string = null;
    //public CounterId: number = 0;
    //  //for local usage
    //public ItemTypeId: number = 0;
    //public CompanyName: string = "";
    //public InvoiceItemsValidator: FormGroup = null;
 

    //Constructor of class
    constructor() {
        var _formBuilder = new FormBuilder();
        this.DrugsRequestValidator = _formBuilder.group({

            'Quantity': ['', Validators.compose([this.positiveNumberValdiator])],
                
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.DrugsRequestValidator.dirty;
        else
            return this.DrugsRequestValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.DrugsRequestValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        
        if (fieldName == undefined)
            return this.DrugsRequestValidator.valid;
        else
            return !(this.DrugsRequestValidator.hasError(validator, fieldName));
    }
    public DrugsRequestValidatortest() {
        var _formBuilder = new FormBuilder();
        _formBuilder.group({
            'Quantity': ['', Validators.compose([this.positiveNumberValdiatortest])] 
        });
    }
    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value <= 0)
                return { 'invalidNumber': true };
        }

    }
    positiveNumberValdiatortest(control: FormControl): { [key: string]: boolean } {
        
                return { 'invalidNumber': true };
    }
}