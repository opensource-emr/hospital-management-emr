import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import { PHRMStoreRequisition } from "./phrm-store-requisition.model";
import { PHRMItemMasterModel } from "./phrm-item-master.model"

export class PHRMStoreRequisitionItems {
    public RequisitionItemId: number = 0;
    public ItemId: number = null;
    public Quantity: number = null;
    public ReceivedQuantity: number = 0;
    public PendingQuantity: number = 0;
    public RequisitionId: number = null;
    public RequisitionItemStatus: string = null
    public Remark: string = null;
    public AuthorizedBy: number = null;
    public AuthorizedOn: string = null;
    public AuthorizedRemark: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
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
    StoreRackName: string;
    public RequiredQuantity: number = 0;
    AvailableQuantity: number;
    DispatchedQuantity: number;
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
