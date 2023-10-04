import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class RequestForQuotationVendorModel {
    public ReqForQuotationVendorId: number = null;
    public ReqForQuotationId: number = null;
    public VendorId: number = null;
    public VendorName: string = "";
    public CreatedBy: number = null;
    public CreatedOn: string = "";
    public ReqForQuotationVendorValidator: FormGroup = null;


    constructor() {

        var _formBuilder = new FormBuilder();
        this.ReqForQuotationVendorValidator = _formBuilder.group({
            'VendorId': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ReqForQuotationVendorValidator.dirty;
        else
            return this.ReqForQuotationVendorValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.ReqForQuotationVendorValidator.valid) { return true; } else { return false; } } 
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReqForQuotationVendorValidator.valid;
        }
        else
            return !(this.ReqForQuotationVendorValidator.hasError(validator, fieldName));
    }
}
