import { FormBuilder, Validators, FormControl } from "@angular/forms";
import * as moment from 'moment/moment';

export class EmployeeLeaveModel{
    public EmpLeaveRuleId : number = 0;
    public LeaveRuleId:number = 0;
    public Date: string = "";
    public CreatedBy: number = 0;
    public CreatedOn:string = "";
    public RequestedTo: number = 0;
    public ApprovedBy : number = 0;
    public ApprovedOn : string ="";
    public EmployeeId : number =0;
    public EmployeeLeaveValidator: any;
    public Description: string ="";
    public LeaveStatus: string = "";
    public CancelledOn: string = "";
    public CancelledBy: number =0;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.EmployeeLeaveValidator = _formBuilder.group({
            'LeaveRuleId': ['', Validators.compose([])],
            'Description': ['', Validators.compose([Validators.maxLength(100)])],
            'Date': ['', Validators.compose([Validators.required])],
            'EmployeeId': ['', Validators.compose([])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.EmployeeLeaveValidator.dirty;
        else
            return this.EmployeeLeaveValidator.controls[fieldName].dirty;
    }
    public IsValid():boolean{if(this.EmployeeLeaveValidator.valid){return true;}else{return false;}} 
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.EmployeeLeaveValidator.valid;
        }
        else
            return !(this.EmployeeLeaveValidator.hasError(validator, fieldName));
    }
}