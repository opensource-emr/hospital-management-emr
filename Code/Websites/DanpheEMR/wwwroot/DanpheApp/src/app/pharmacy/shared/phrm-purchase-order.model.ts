import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PHRMPurchaseOrderItems } from "./phrm-purchase-order-items.model";
import { PHRMItemMasterModel } from "./phrm-item-master.model"
import { PHRMSupplierModel } from "./phrm-supplier.model"
//import { ItemMaster } from "../shared/item-master.model"
export class PHRMPurchaseOrder {

    public PurchaseOrderId: number = 0;
    public SupplierId: number = null;
    public PODate: string = null;
    public POStatus: string = null;
    public SubTotal: number = null;
    public VATAmount: number = 0;
    public TotalAmount: number = 0;
    public DeliveryAddress: string = null;
    public Remarks: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public TermsId: number = null;
    public SupplierName: string = null;
    public PHRMPurchaseOrderItems: Array<PHRMPurchaseOrderItems> = new Array<PHRMPurchaseOrderItems>();
    public PurchaseOrderValidator: FormGroup = null;
    public Item: PHRMItemMasterModel = null;
    public Supplier: PHRMSupplierModel = null;
    public UOMName:string;//for UI view of unit of measurement of Item
    constructor() {

        var _formBuilder = new FormBuilder();
        this.PurchaseOrderValidator = _formBuilder.group({
            'SupplierId': ['', Validators.compose([Validators.required])],

        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PurchaseOrderValidator.dirty;
        else
            return this.PurchaseOrderValidator.controls[fieldName].dirty;
    }


    public IsValid():boolean{if(this.PurchaseOrderValidator.valid){return true;}else{return false;}}
     public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.PurchaseOrderValidator.valid;
        }
        else
            return !(this.PurchaseOrderValidator.hasError(validator, fieldName));
    }
    
}