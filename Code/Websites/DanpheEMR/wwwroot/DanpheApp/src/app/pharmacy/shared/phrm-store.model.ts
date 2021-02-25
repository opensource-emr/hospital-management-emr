import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { StoreVerificationMapModel } from '../../settings-new/shared/store-role-map.model';
export class PHRMStoreModel {
  public StoreId: number = 0;
  public ParentStoreId: number = 0;
  public Name: string = "";
  public Code: string = "";
  public ParentName: string = "";
  public Address: string = "";
  public ContactNo: string = "";
  public Email: string = "";
  public StoreLabel: string = "";
  public StoreDescription: string = "";
  public MaxVerificationLevel: number = 0;
  public PermissionId: number;
  public CreatedBy: number = 0;
  public CreatedOn: string = "";
  public ModifiedBy: number = 0;
  public ModifiedOn: string = "";
  public IsActive: boolean = true;

  public StoreVerificationMapList: Array<StoreVerificationMapModel> = new Array<StoreVerificationMapModel>();

  public StoreValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.StoreValidator = _formBuilder.group({
      'Name': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      'ContactNo': ['', Validators.compose([Validators.pattern('^[a-zA-Z0-9_@./#)(&+-]+$'),Validators.maxLength(20)])],
      'Email': ['', Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.StoreValidator.dirty;
    else
      return this.StoreValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.StoreValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.StoreValidator.valid;
    }
    else
      return !(this.StoreValidator.hasError(validator, fieldName));
  }
}
