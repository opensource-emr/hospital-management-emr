import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { BillingItem } from "./billing-item.model";

export class BillingItemVM {
    public DoAutoAddBillingItems: boolean = false;
    public DoAutoAddBedItem: boolean = false;

    public ItemList: Array<TxnBillItem> = new Array<TxnBillItem>();
}

export class TxnBillItem {

    public ItemId: number = null;
    public ServiceDepartmentId: number = null;
    public ItemName: string = null;
    public ServiceDepartmentName: string = null;

    public BillingItemValidator: FormGroup = null;
    public filteredItem: Array<BillingItem> = new Array<BillingItem>();
    //Below variable only for check duplicate item or not
    public IsDuplicateItem: boolean = false; //yub--27th Sept 2018
    public IsValidSelDepartment: boolean = true; //yub--27th Sept 2018
    public IsValidSelItemName: boolean = true; //yub--27th Sept 2018

    constructor() {
        var _formBuilder = new FormBuilder();
        this.BillingItemValidator = _formBuilder.group({
            'ServiceDepartmentId': ['', Validators.compose([Validators.required])],
            'ItemId': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.BillingItemValidator.dirty;
        else
            return this.BillingItemValidator.controls[fieldName].dirty;
    }

    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.BillingItemValidator.valid;
        else
            return !(this.BillingItemValidator.hasError(validator, fieldName));
    }
}

