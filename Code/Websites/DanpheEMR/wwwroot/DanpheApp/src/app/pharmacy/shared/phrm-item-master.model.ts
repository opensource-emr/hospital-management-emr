import { FormGroup, Validators, FormBuilder } from '@angular/forms'

export class PHRMItemMasterModel {
    public ItemId: number = 0;
    public ItemName: string = null;
    public ItemCode: string = null;
    public CompanyId: number = 0;
    public SupplierId: number = null;
    public ItemTypeId: number = 0;
    public UOMId: number = null;
    public ReOrderQuantity: number = 0;
    public MinStockQuantity: number = 0;
    public BudgetedQuantity: number = 0;
    public PurchaseVATPercentage: number = 0;
    public SalesVATPercentage: number = 0;
    public IsVATApplicable: boolean = false;
    public PackingTypeId: number = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    public IsInternationalBrand: boolean = false;
    public GenericId: number = 0;
    public ABCCategory: string;
    public Dosage: string;
    public RackName: string = null; //Dispensary Rack Name
    public StoreRackId: number = null;
    public VED: string;
    public SalesCategoryId: number = 0;
    public CCCharge: number = 0;
    public ItemValidator: FormGroup = null;
    public IsNarcotic: boolean = false;
    public IsInsuranceApplicable: boolean = false;
    public GovtInsurancePrice: number;
    public GenericName: string;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.ItemValidator = _formBuilder.group({
            'ItemName': ['', Validators.required],
            'CompanyId': ['', Validators.required],
            'SalesCategoryId': ['', Validators.required],
            'ItemTypeId': ['', Validators.required],
            'UOMId': ['', Validators.required],
            'GenericId': ['', Validators.required],
            'PackingTypeId': ['', Validators.required],
            'ReOrderQuantity': ['', Validators.compose([Validators.pattern('^(0|[1-9]{1}[0-9]*)$')])],
            'MinStockQuantity': ['', Validators.compose([Validators.pattern('^(0|[1-9]{1}[0-9]*)$')])],
            'BudgetedQuantity': ['', Validators.compose([Validators.pattern('^(0|[1-9]{1}[0-9]*)$')])],
            'PurchaseVATPercentage': ['', Validators.compose([Validators.pattern('^(0|[1-9]{1}[0-9]{0,1})(\.[0-9]{2})?$')])],
            'SalesVATPercentage': ['', Validators.compose([Validators.pattern('^(0|[1-9]{1}[0-9]{0,1})(\.[0-9]{2})?$')])],
        });

    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ItemValidator.dirty;
        else
            return this.ItemValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.ItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.ItemValidator.valid;
        else
            return !(this.ItemValidator.hasError(validator, fieldName));
    }
}
