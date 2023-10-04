import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PHRM_MAP_MstItemsPriceCategory } from './phrm-items-price-category-map';

export class PHRMItemMasterModel {
    public ItemId: number = 0;
    public ItemName: string = "";
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
    public RackNo: string = null;
    public StoreRackId: number = null;
    public VED: string;
    public SalesCategoryId: number = null;
    public CCCharge: number = 0;
    public ItemValidator: FormGroup = null;
    public RackValidator: FormGroup = null;
    public IsNarcotic: boolean = false;
    public IsInsuranceApplicable: boolean = false;
    public GovtInsurancePrice: number;
    public GenericName: string;
    public UOMName: string;
    public PurchaseRate: number = 0;
    public SalesRate: number = 0;
    public PurchaseDiscount: number = 0;
    public PHRM_MAP_MstItemsPriceCategories: Array<PHRM_MAP_MstItemsPriceCategory> = new Array<PHRM_MAP_MstItemsPriceCategory>();
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
            'PurchaseRate': ['', Validators.compose([Validators.required, this.positiveNumberValdiator])],
            'SalesRate': ['', Validators.compose([Validators.required, this.positiveNumberValdiator])],
            'PurchaseDiscount': ['', Validators.compose([Validators.required, this.positiveNumberValdiator])]
        });
        this.RackValidator = _formBuilder.group({
            "Rack": ''
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
    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'positivenum': true };
        }
    }
}
