import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';
import { PHRMItemMasterModel } from "./phrm-item-master.model";
import { PHRMStoreRequisition } from "./phrm-store-requisition.model";

export class PHRMStoreRequisitionItems {
    public RequisitionItemId: number = 0;
    public ItemId: number = 0;
    public Quantity: number = 0;
    public ReceivedQuantity: number = 0;
    public PendingQuantity: number = 0;
    public RequisitionId: number = 0;
    public RequisitionItemStatus: string = ""
    public Remark: string = "";
    public AuthorizedBy: number = 0;
    public AuthorizedOn: string = "";
    public AuthorizedRemark: string = "";
    public CreatedBy: number = 0;
    public CreatedOn: string = "";
    public ReceivedBy: string = "";
    public RequisitionItemValidator: FormGroup = null;
    public BatchNo: string = "";

    ////to make the instance ItemMaster with new row
    public SelectedItem: PHRMItemMasterModel = null;

    //ItemName only for display purpose
    public ItemName: string = "";
    public Code: string = ""
    public Item: PHRMItemMasterModel = null;
    public Requisition: PHRMStoreRequisition = null;
    public CreatedByName: string = null;
    public DispatchedByName: string = null;
    StoreRackName: string = '';
    public RequiredQuantity: number = 0;
    AvailableQuantity: number = 0;
    DispatchedQuantity: number = 0;
    StoreId: any;
    //for display purpose ie Requisiting Store Name
    public RequestedSourceStore: string;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.RequisitionItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([Validators.required])],
            'Quantity': ['', Validators.compose([this.positiveNumberValidator])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.RequisitionItemValidator.dirty;
        else
            return this.RequisitionItemValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.RequisitionItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.RequisitionItemValidator.valid;
        }
        else
            return !(this.RequisitionItemValidator.hasError(validator, fieldName));
    }

    positiveNumberValidator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value <= 0)
                return { 'invalidNumber': true };
        }

    }

}
