import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import { Patient } from '../../patients/shared/patient.model'
export class WardConsumptionModel {
    public ConsumptionId: number = 0;
    public WardId: number = 0;
    public InvoiceId: number = 0;
    public InvoiceItemId: number = 0;
    public PatientId: number = 0;
    public ItemId: number = 0;
    public VisitId: number = 0;
    public ItemName: string = '';
    public BatchNo: string = '';
    public ExpiryDate: string = '';
    public Quantity: number = 0;
    public MRP: number = 0;
    public SubTotal : number = 0;
    public Remark: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public ModifiedBy: number = 0;
    public ModifiedOn: Date = null;
    public ModifiedByName: string = ''; 
    public StoreId: number = 0;
    //OnClient side
    public AvailableQuantity: number = 0;
    public SelectedItem: any;
    public selectedPatient: Patient = new Patient();

    public ConsumptionValidator: FormGroup = null;
    public TotalAmount: any;
    public User: any;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.ConsumptionValidator = _formBuilder.group({
            'Quantity': ['', Validators.compose([Validators.required])]
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ConsumptionValidator.dirty;
        else
            return this.ConsumptionValidator.controls[fieldName].dirty;
    }


    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ConsumptionValidator.valid;
        }
        else
            return !(this.ConsumptionValidator.hasError(validator, fieldName));
    }
}
