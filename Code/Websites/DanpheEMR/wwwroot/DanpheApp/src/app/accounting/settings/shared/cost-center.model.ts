import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import * as moment from 'moment';
import { ENUM_DateTimeFormat } from '../../../shared/shared-enums';


export class CostCenterModel {
    public CostCenterId: number = 0;
    public CostCenterName: string = "";
    public ParentCostCenterId: number = 0;
    public ParentCostCenterName: string = '';
    public Description: string = null;
    public IsActive: boolean = true;
    public CreatedOn: string = "";
    public CostCenterCode: number = 0;
    public CostCenterValidator: FormGroup = null;
    public HierarchyLevel: number = 0;
    public IsDefault: boolean = false;

    constructor() {
        this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        var _formBuilder = new FormBuilder();
        this.CostCenterValidator = _formBuilder.group({
            'CostCenterName': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.CostCenterValidator.dirty;
        else
            return this.CostCenterValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean {
        if (this.CostCenterValidator.valid) {
            return true;
        }
        else {
            return false;
        }
    }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.CostCenterValidator.valid;

        }
        else
            return !(this.CostCenterValidator.hasError(validator, fieldName));
    }
}