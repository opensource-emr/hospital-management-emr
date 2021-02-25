import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import { PHRMStoreRequisitionItems } from "./phrm-store-requisition-items.model";

export class PHRMStoreRequisition {
    public  RequistionId : number = 0;
    public RequisitionDate: string = null;
    public RequisitionStatus: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public RequisitionValidator: FormGroup = null;
      public RequisitionItems: Array<PHRMStoreRequisitionItems> = new Array<PHRMStoreRequisitionItems>();
    public canDispatchItem: boolean= false;
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


    public IsValid():boolean{if(this.RequisitionValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.RequisitionValidator.valid;
        }
        else
            return !(this.RequisitionValidator.hasError(validator, fieldName));
    }
    
}
