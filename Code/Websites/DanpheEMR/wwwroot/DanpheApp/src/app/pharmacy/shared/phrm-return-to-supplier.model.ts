import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PHRMItemMasterModel } from "./phrm-item-master.model";
import { PHRMReturnToSupplierItemModel } from "./phrm-return-to-supplier-items.model";
export class PHRMReturnToSupplierModel {


    public ReturnToSupplierId: number = 0;
    public CreditNoteId: string = "";
    public CreditNotePrintId: number = 0;
    public SupplierId: number = null;
    public ReturnDate: string = "";
    public SubTotal: number = 0;
    public VATAmount: number = 0;
    public TotalAmount: number = 0;
    public CreatedBy: number = 0;
    public CreateOn: string = "";
    public Remarks: string = "";

    public ReturnToSupplierValidator: FormGroup = null;

    public returnToSupplierItems: Array<PHRMReturnToSupplierItemModel> = new Array<PHRMReturnToSupplierItemModel>();
    public DiscountAmount: number = 0;

    constructor() {
       
        var _formBuilder = new FormBuilder();
        this.ReturnToSupplierValidator = _formBuilder.group({
            'SupplierId': ['', Validators.compose([Validators.required])],
            'ReturnDate': ['', Validators.compose([Validators.required])],
            'CreditNoteId': ['', Validators.compose([Validators.required])]
        });

        ///this.ReturnDate = moment().format("YYYY-MM-DD");
    }
    public IsValid():boolean{if(this.ReturnToSupplierValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReturnToSupplierValidator.valid;
        }
        else
            return !(this.ReturnToSupplierValidator.hasError(validator, fieldName));
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ReturnToSupplierValidator.dirty;
        else
            return this.ReturnToSupplierValidator.controls[fieldName].dirty;
    }

 
}