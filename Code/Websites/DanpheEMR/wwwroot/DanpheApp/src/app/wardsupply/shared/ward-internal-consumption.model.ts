import {
    NgForm,
    FormGroup,
    Validators,
    FormControl,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import { WardInternalConsumptionItems } from './ward-internal-consumption-items.model';

export class WardInternalConsumption {
    public ConsumptionId: number = 0;
    public WardId: number = 0;
    public SubstoreId: number = 0;
    public DepartmentId: number = 0;
    public TotalAmount: number = 0;
    public Remark: string = '';
    public CreatedOn: Date = new Date();
    public CreatedBy: number = 0;
    public ModifiedBy: number = 0;
    public ModifiedOn: string = '';
    public ConsumedBy: string = '';
    public WardInternalConsumptionItemsList: Array<WardInternalConsumptionItems>=[];

    public InternalConsumptionValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.InternalConsumptionValidator = _formBuilder.group({
            'DepartmentId': ['', Validators.compose([Validators.required])],
            'Remark': ['', Validators.compose([Validators.required])],
            'ConsumedBy': ['', Validators.compose([Validators.required])]
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.InternalConsumptionValidator.dirty;
        else
            return this.InternalConsumptionValidator.controls[fieldName].dirty;
    }


    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.InternalConsumptionValidator.valid;
        }
        else
            return !(this.InternalConsumptionValidator.hasError(validator, fieldName));
    }
}
