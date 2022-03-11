import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { StoreVerificationMapModel } from '../../settings-new/shared/store-role-map.model';


export class StoreBillHeader {
  PanNo: string = '';
  StoreLabel: string = '';
  Code: string = '';
  Address: string = '';
  ContactNo: string = '';
  Email: string = '';
}

export class PHRMStoreModel extends StoreBillHeader {
  public StoreId: number = 0;
  public ParentStoreId: number = 0;
  public Name: string = "";
  public ParentName: string = "";
  public StoreDescription: string = "";
  public MaxVerificationLevel: number = 0;
  public PermissionId: number;
  public CreatedBy: number = 0;
  public CreatedOn: string = "";
  public ModifiedBy: number = 0;
  public ModifiedOn: string = "";
  public IsActive: boolean = true;
  public Category: string;
  public SubCategory: string;
  public StoreVerificationMapList: Array<StoreVerificationMapModel> = new Array<StoreVerificationMapModel>();
  public StoreValidator: FormGroup = null;
  UseSeparateInvoiceHeader: boolean = false;
  AvailablePaymentModes: PaymentModeSettings[] = [];
  DefaultPaymentMode: string;

  // Receipt Variables
  INV_GRGroupId : number;
  INV_POGroupId : number;
  INV_PRGroupId : number;
  INV_ReqDisGroupId : number;
  INV_RFQGroupId : number;
  INV_ReceiptDisplayName : string;
  INV_ReceiptNoCode : string;
  constructor() {
    super();
    var _formBuilder = new FormBuilder();
    this.StoreValidator = _formBuilder.group({
      'Name': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      'Email': ['', Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')],
      'ContactNo': ['', [Validators.pattern('^[a-zA-Z0-9_@./#)(&+-]+$'), Validators.maxLength(20)]],
      'StoreLabel': ['']
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

class PaymentModeSettings {
  PaymentModeName: string;
  IsRemarksMandatory: boolean = false;
}

