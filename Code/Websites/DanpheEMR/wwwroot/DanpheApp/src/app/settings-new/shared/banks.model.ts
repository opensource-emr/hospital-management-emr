import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class BanksModel {

  public BankId: number = 0;
  public BankShortName: string = null;
  public BankName: string = null;
  public Description: string = null;
  public IsActive: boolean = true;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;

  public BanksValidator: FormGroup = null;


  constructor() {
    var _formBuilder = new FormBuilder();
    this.BanksValidator = _formBuilder.group({
       'BankName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      // //'ContactNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$'), Validators.maxLength(15)])],
      // 'ContactNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$')])],
      // 'EmailAddress': ['', Validators.compose([Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')])], 
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.BanksValidator.dirty;
    }
      
    else
      return this.BanksValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.BanksValidator.valid) {
      return true;
    }
    else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {

    if (fieldName == undefined) {
      return this.BanksValidator.valid;
    }
    else {
      return !(this.BanksValidator.hasError(validator, fieldName));
    }
      
  }
}
