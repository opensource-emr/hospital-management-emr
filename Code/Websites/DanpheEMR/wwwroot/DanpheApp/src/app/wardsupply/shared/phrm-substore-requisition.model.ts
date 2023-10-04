import { FormBuilder, FormGroup } from '@angular/forms';
import { PharmacyWardRequisitionVerifier_DTO } from '../phrm-substore-requisition-add/shared/phrm-ward-requisition-verifier.dto';
import { PHRMSubStoreRequisitionItems } from './phrm-substore-requisition-items.model';

export class PHRMSubStoreRequisition {
    public RequisitionId: number = 0;
    public RequistionNo: number = 0;
    public StoreId: number = 0;
    public RequisitionDate: string = "";
    public RequisitionStatus: string = "";
    public CreatedBy: number = 0;
    public CreatedOn: string = "";
    public Remarks: string = "";
    public RequisitionValidator: FormGroup = null;
    public RequisitionItems: Array<PHRMSubStoreRequisitionItems> = new Array<PHRMSubStoreRequisitionItems>();
    public canDispatchItem: boolean = false;
    public CanApproveTransfer: boolean;
    public IsVerificationEnabled: boolean = false;
    public VerifierList: PharmacyWardRequisitionVerifier_DTO[] = [];
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
