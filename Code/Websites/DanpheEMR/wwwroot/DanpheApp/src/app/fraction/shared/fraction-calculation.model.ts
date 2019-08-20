import { FormGroup, Validators, FormBuilder } from '@angular/forms';

export class FractionCalculationModel {

    public FractionCalculationId: number = 0;
    public PercentSettingId: number = 0;
    public DepartmentId: string = null;
    public BillTxnItemId: number;
    public DoctorId: number;
    public ParentId: number = 0;
    public IsParentId: number = 0;
    public DesignationId: number;
    public InitialPercent: number = 0;
    public FinalPercent: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: number = 0;
    public FinalAmount: number = 0;
    public filteredDocList: Array<{ DepartmentId: number, DepartmentName: string, ProviderId: number, ProviderName: string }>;
    public selectedDoctor = { DepartmentId: 0, DepartmentName: "", ProviderId: 0, ProviderName: "" };
    public FractionCalculationValidator: FormGroup = null;
    public IsParent: boolean = false;
    public IsChild: boolean = false;
    public IsGrandChild: boolean = false;
    public doctorList: any[];
    public OrderId: number = 0;
    public CountForOrder: number = 0;
    public ParentIndex: number = 0;
    public indexList: any[];
    public Hierarchy: number = 0;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.FractionCalculationValidator = _formBuilder.group({
            'DesignationId': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'DoctorId': ['', Validators.compose([Validators.required])],
            'InitialPercent': ['', Validators.compose([Validators.required])],
            //'Email': ['', Validators.compose([Validators.email])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.FractionCalculationValidator.dirty;
        else
            return this.FractionCalculationValidator.controls[fieldName].dirty;
    }

    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.FractionCalculationValidator.valid;
        }
        else
            return !(this.FractionCalculationValidator.hasError(validator, fieldName));
    }

}