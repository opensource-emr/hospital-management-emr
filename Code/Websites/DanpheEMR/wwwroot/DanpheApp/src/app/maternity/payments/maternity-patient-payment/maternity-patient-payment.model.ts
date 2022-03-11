
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

export class MaternitypatientPaymentModel{
        public PatientPaymentId : number = 0;
		public FiscalYearId : number = 0
		public ReceiptNo : number = 0
		public TransactionType: string = "";
		public PatientId: number = 0
		public InAmount : number = 0
		public OutAmount : number = 0
		public Remarks : string = "";
		public CreatedBy : number = 0
		public CreatedOn : string = "";
		public IsActive : boolean = false;
		public CounterId : number = 0;
		public InOrOutAmount: number = null; //just for client side
		public EmployeeName : string = "";

		public MaternityPaymentDetailsValidator: FormGroup = null;
        constructor() {
        var _formBuilder = new FormBuilder();
        this.MaternityPaymentDetailsValidator = _formBuilder.group({
        'Remarks': ['', Validators.compose([Validators.required])],
		'Amount': ['', Validators.compose([Validators.required])],
    });
  }

		public IsDirty(fieldname): boolean {
			if (fieldname == undefined) {
			  return this.MaternityPaymentDetailsValidator.dirty;
			}
			else {
			  return this.MaternityPaymentDetailsValidator.controls[fieldname].dirty;
			}
		
		  }
		
		  public IsValid(fieldname, validator): boolean {
			if (this.MaternityPaymentDetailsValidator.valid) {
			  return true;
			}
		
			if (fieldname == undefined) {
			  return this.MaternityPaymentDetailsValidator.valid;
			}
			else {
			  return !(this.MaternityPaymentDetailsValidator.hasError(validator, fieldname));
			}
		  }
		
		  public IsValidCheck(fieldname, validator): boolean {
			// this is used to check for patient form is valid or not 
			if (this.MaternityPaymentDetailsValidator.valid) {
			  return true;
			}
		
			if (fieldname == undefined) {
			  return this.MaternityPaymentDetailsValidator.valid;
			}
			else {
		
			  return !(this.MaternityPaymentDetailsValidator.hasError(validator, fieldname));
			}
		  }
}