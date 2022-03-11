import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'

export class WardStockModel {
    public StockId: number = 0;
    public WardId: number = 0;
    public StoreId: number = 0;
    public ItemId: number = 0;
    public AvailableQuantity: number = 0;
    public UnConfirmedQty: number = 0;
    public MRP: number = 0;
    public BatchNo: string = '';
    public ExpiryDate: string = "";
    public SubTotal: number = 0;
    public DispachedQuantity: number = 0;
    public Quantity: number = 0;
    public Price: number = 0;
    public TotalAmount: number = 0;
    public WardName: string = "";
    public ItemName: string = "";
    public Remarks: string = "";
    public newWardId: number = 0;
    public IsSelected: boolean = false;
    public StockType: string = "";
    public DepartmentId: number = 0;
    public DepartmentName: string = "";
    public StockManageValidator: FormGroup = null;
    //Constructor of class
    constructor() {
        var _formBuilder = new FormBuilder();
        this.StockManageValidator = _formBuilder.group({
            'DispachedQuantity': ['', Validators.compose([this.positiveNumberValdiator])],
            //'Price': ['', Validators.compose([this.positiveNumberValdiator])]
            'Remark': ['', Validators.required],
            'newWardId': ['', Validators.required]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.StockManageValidator.dirty;
        else
            return this.StockManageValidator.controls[fieldName].dirty;
    }

    public IsValid(fieldName, validator): boolean {

        if (fieldName == undefined)
            return this.StockManageValidator.valid;
        else
            return !(this.StockManageValidator.hasError(validator, fieldName));
    }

    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'invalidNumber': true };
        }

    }
}
