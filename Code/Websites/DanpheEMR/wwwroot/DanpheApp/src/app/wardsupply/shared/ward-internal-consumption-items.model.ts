import {
    NgForm,
    FormGroup,
    Validators,
    FormControl,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import { PHRMItemMasterModel } from '../../pharmacy/shared/phrm-item-master.model';
import { WardStockModel } from './ward-stock.model';


export class WardInternalConsumptionItems {
    public ConsumptionItemId: number = 0;
    public ConsumptionId: number = 0;
    public WardId: number = 0;
    public ItemId: number = 0;
    public SubstoreId: number = 0;
    public DepartmentId: number = 0;
    public Quantity: number = 0;
    public AvailableQuantity: number = 0;
    public SubTotal: number = 0;
    public ExpiryDate: string = '';
    public SalePrice: number = 0;
    public Price: number = 0;
    public ItemName: string = null;
    public Remark: string = '';
    public BatchNo: string = '';
    public CreatedOn: Date = new Date();
    public CreatedBy: number = 0;
    public ModifiedBy: number = 0;
    public ModifiedOn: Date = null;

    public SelectedItem: WardStockModel = new WardStockModel();
    public StockId: number = null;
    public SubStoreId: number = null;

    public InternalConsumptionItemsValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.InternalConsumptionItemsValidator = _formBuilder.group({
            'ItemName': ['', Validators.compose([Validators.required])],
            'Quantity': ['', Validators.compose([Validators.required, this.wholeNumberRequired, this.positiveNumberValdiator])],
            //'Remark': ['', Validators.compose([Validators.required])]
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.InternalConsumptionItemsValidator.dirty;
        else
            return this.InternalConsumptionItemsValidator.controls[fieldName].dirty;
    }


    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.InternalConsumptionItemsValidator.valid;
        }
        else
            return !(this.InternalConsumptionItemsValidator.hasError(validator, fieldName));
    }

    wholeNumberRequired(control: FormControl): { [key: string]: boolean } {
        if (control.value) {
            if (control.value % 1 != 0 && control.value <= 0) return { 'wrongDecimalValue': true };
        }
        else
            return { 'wrongDecimalValue': true };
    }

    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'invalidNumber': true };
        }
    }
}
