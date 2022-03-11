import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class PHRMDepositModel {
    public DepositId: number = 0;
    public StoreId: number;
    public FiscalYearId: number = 0;
    public ReceiptNo: number = 0;
    public PatientVisitId: number = 0;
    public PatientId: number = 0;
    public DepositType: string = "";
    public DepositAmount: number = 0;
    public Remark: string = "";
    public CounterId: number = 0;
    public PrintCount: number = 0;
    public PaymentMode: string = "";
    public PaymentDetails: string = "";
    public TransactionId: number = 0;
    public SettlementId: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = "";
    public DepositBalance: number = 0;
    public DepositValidator: FormGroup = null;
    //used only in client side
    public PatientName: string = null;
    public PatientCode: string = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.DepositValidator = _formBuilder.group({
            //'Remark': ['', Validators.compose([Validators.required])],
            'PaymentDetails': ['', Validators.compose([])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.DepositValidator.dirty;
        else
            return this.DepositValidator.controls[fieldName].dirty;
    }

    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.DepositValidator.valid;

        }
        else
            return !(this.DepositValidator.hasError(validator, fieldName));
    }
    public UpdateValidator(onOff: string, formControlName: string, validatorType: string) {
        let validator = null;
        if (validatorType == 'required' && onOff == "on") {
            validator = Validators.compose([Validators.required]);
        }
        else {
            validator = Validators.compose([]);
        }
        if (formControlName == 'PaymentDetails') {
            this.DepositValidator.controls['PaymentDetails'].validator = validator;
            this.DepositValidator.controls['PaymentDetails'].updateValueAndValidity();
        }
    }
}
