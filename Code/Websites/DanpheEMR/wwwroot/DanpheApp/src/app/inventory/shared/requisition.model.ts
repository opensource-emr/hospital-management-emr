import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import { RequisitionItems } from "./requisition-items.model";

export class Requisition {
    public  RequistionId : number = 0;
    public DepartmentId: number = null;
    public RequisitionDate: string = null;
    public RequisitionStatus: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public RequisitionValidator: FormGroup = null;
    public RequisitionItems: Array<RequisitionItems> = new Array<RequisitionItems>();
    public canDispatchItem: boolean= false;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.RequisitionValidator = _formBuilder.group({
            'DepartmentId': ['', Validators.compose([Validators.required])],

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