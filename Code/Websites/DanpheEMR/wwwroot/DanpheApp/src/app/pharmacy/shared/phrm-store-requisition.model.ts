import { FormBuilder, FormGroup } from '@angular/forms';
import { PHRMStoreRequisitionItems } from "./phrm-store-requisition-items.model";

export class PHRMStoreRequisition {
    public RequisitionId: number = 0;
    public RequistionNo: number = 0;
    public StoreId: number = 0;
    public RequisitionDate: string = "";
    public RequisitionStatus: string = "";
    public CreatedBy: number = 0;
    public CreatedOn: string = "";
    public Remarks: string = "";
    public RequisitionValidator: FormGroup = null;
    public RequisitionItems: Array<PHRMStoreRequisitionItems> = new Array<PHRMStoreRequisitionItems>();
    public canDispatchItem: boolean = false;
    public CanApproveTransfer: boolean = false;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.RequisitionValidator = _formBuilder.group({
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.RequisitionValidator.dirty;
        else
            return this.RequisitionValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.RequisitionValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.RequisitionValidator.valid;
        }
        else
            return !(this.RequisitionValidator.hasError(validator, fieldName));
    }

}
