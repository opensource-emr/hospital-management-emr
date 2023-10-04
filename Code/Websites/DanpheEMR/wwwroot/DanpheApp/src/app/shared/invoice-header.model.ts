import { FormGroup, FormBuilder, Validators } from "@angular/forms";

export class InvoiceHeaderModel {

  public InvoiceHeaderId: number = 0;
  public Module: string = null;
  public HeaderDescription: string = null;
  public HospitalName: string = null;
  public Address: string = null;
  public Email: string = null;
  public PAN: string = null;
  public Telephone: string = null;
  public DDA: string = null;
  public LogoFileName: string = "";
  public LogoFileExtention: string = "";
  public CreatedOn: string = null;
  public CreatedBy: number = 0;
  public IsActive: boolean = true;
  public ModifiedOn: string = null;
  public ModifiedBy: number = 0;
  public FileBinaryData: string = "";


  public HeaderValidators: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.HeaderValidators = _formBuilder.group({
      'HospitalName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      'Address': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      'Telephone': ['', Validators.compose([Validators.required])],
      'Email': ['', Validators.compose([Validators.required, Validators.pattern('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$')])],
      'PAN': ['', Validators.compose([Validators.pattern('^[a-zA-Z0-9_@./#&+-]+$')])],
      'DDA': ['', Validators.compose([Validators.maxLength(200)])],

    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.HeaderValidators.dirty;
    else
      return this.HeaderValidators.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.HeaderValidators.valid) { return true; } else
    { return false; }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.HeaderValidators.valid;
    }
    else {
      return !(this.HeaderValidators.hasError(validator, fieldName));
    }
  }
}
