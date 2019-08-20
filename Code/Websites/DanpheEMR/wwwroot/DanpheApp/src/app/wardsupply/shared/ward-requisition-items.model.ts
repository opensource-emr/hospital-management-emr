
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

export class WardRequisitionItemsModel {
    public RequisitionItemId: number = 0;
    public RequisitionId: number = 0;
    public ItemId: number = 0;
    public Quantity: number = 0;
    public DispatchedQty: number = 0;

    public selectedItem: any;
    public ItemName: string = "";
    public WardRequestValidator: FormGroup = null; 
    public enableItmSearch: boolean = true;

    public BatchNo: string = "";
    public ExpiryDate: string = null;
    
    //Constructor of class
    constructor() {
        var _formBuilder = new FormBuilder();
        this.WardRequestValidator = _formBuilder.group({
            'Quantity': ['', Validators.compose([this.positiveNumberValdiator])],
                
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.WardRequestValidator.dirty;
        else
            return this.WardRequestValidator.controls[fieldName].dirty;
    }

    public IsValid(fieldName, validator): boolean {
        
        if (fieldName == undefined)
            return this.WardRequestValidator.valid;
        else
            return !(this.WardRequestValidator.hasError(validator, fieldName));
    }
    public WardRequestValidatortest() {
        var _formBuilder = new FormBuilder();
        _formBuilder.group({
            'Quantity': ['', Validators.compose([this.positiveNumberValdiatortest])] 
        });
    }
    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value <= 0)
                return { 'invalidNumber': true };
        }

    }
    positiveNumberValdiatortest(control: FormControl): { [key: string]: boolean } {
        
                return { 'invalidNumber': true };
    }
}