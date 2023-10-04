import {
    FormBuilder, FormControl, FormGroup, Validators
} from '@angular/forms';
import * as moment from 'moment';
import { PharmacyPOVerifier } from './pharmacy-po-verifier.model';
import { PHRMItemMasterModel } from "./phrm-item-master.model";
import { PHRMPurchaseOrderItems } from "./phrm-purchase-order-items.model";
import { PHRMSupplierModel } from "./phrm-supplier.model";
//import { ItemMaster } from "../shared/item-master.model"
export class PHRMPurchaseOrder {

    public PurchaseOrderId: number = 0;
    public PurchaseOrderNo: number = 0;
    public SupplierId: number = null;
    public PODate: string = moment().format('YYYY-MM-DD');;
    public POStatus: string = null;
    public SubTotal: number = null;
    public CCChargeAmount: number = 0;
    public DiscountAmount: number = 0;
    public VATAmount: number = 0;
    public TotalAmount: number = 0;
    public DeliveryAddress: string = null;
    public InvoicingAddress: string = null;
    public DeliveryDays: number = 0;
    public Contact: string = null;
    public ContactNo: string = null;
    public DeliveryDate: string = moment().format('YYYY-MM-DD');
    public Remarks: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public TermsId: number = null;
    public SupplierName: string = null;
    public PHRMPurchaseOrderItems: Array<PHRMPurchaseOrderItems> = new Array<PHRMPurchaseOrderItems>();
    public PurchaseOrderValidator: FormGroup = null;
    public Item: PHRMItemMasterModel = null;
    public Supplier: PHRMSupplierModel = null;
    public UOMName: string;//for UI view of unit of measurement of Item
    public ReferenceNo: string = null;
    public IsVerificationEnabled: boolean = false;
    public VerifierList: PharmacyPOVerifier[] = [];
    public TermsConditions: string = '';
    public Adjustment: number = 0;
    public NonTaxableAmount: number = 0;
    public TaxableAmount: number = 0;
    public DiscountPercentage: number = 0;
    public ContactAddress: string = '';
    public City: string = '';
    public PANNumber: string = '';
    public EmployeeName: string = '';
    public VerifierIds: string = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.PurchaseOrderValidator = _formBuilder.group({
            'SupplierId': ['', Validators.compose([Validators.required])],
            'DeliveryDays': ['', Validators.compose([Validators.required, this.positiveNumberValdiator])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PurchaseOrderValidator.dirty;
        else
            return this.PurchaseOrderValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.PurchaseOrderValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.PurchaseOrderValidator.valid;
        }
        else
            return !(this.PurchaseOrderValidator.hasError(validator, fieldName));
    }
    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'invalidNumber': true };
        }
    }

}
