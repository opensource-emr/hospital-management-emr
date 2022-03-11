import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import { PurchaseRequestItemModel } from './purchase-request-item.model';
import * as moment from 'moment';
import { ENUM_GRItemCategory } from '../../shared/shared-enums';

export class PurchaseRequestModel {
  public PurchaseRequestId: number = 0;
  public PRNumber: number;
  public VendorId: number;
  public RequestDate: string = moment().format("YYYY-MM-DD");
  public RequestStatus: string; // active,withdrawn,cancelled,pending,complete
  public VerificationId: number;
  public Remarks: number;
  public CancelledBy: number = null;
  public CancelledOn: string = null;
  public CancelRemarks: string = "";
  public IsActive: boolean = true;
  public IsPOCreated: boolean = false;
  public CreatedBy: number = 0;
  public CreatedOn: string = moment().format("YYYY-MM-DD");
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public PurchaseRequestValidator: FormGroup = null;
  public PurchaseRequestItems: Array<PurchaseRequestItemModel> = new Array<PurchaseRequestItemModel>();


  //other properties
  public VendorName: string;
  public CreditPeriod: number;
  public CurrentVerificationLevelCount: number;
  public CurrentVerificationLevel: number;
  public MaxVerificationLevel: number;
  public isVerificationAllowed: boolean;
  public VerificationStatus: string;
  public PRCategory: string = ENUM_GRItemCategory.Consumables;
  public StoreId: number;
  public RequestFromStoreName: string = '';
  PRGroupId: number;
  constructor() {

    var _formBuilder = new FormBuilder();
    this.PurchaseRequestValidator = _formBuilder.group({});
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PurchaseRequestValidator.dirty;
    else
      return this.PurchaseRequestValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.PurchaseRequestValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.PurchaseRequestValidator.valid;
    }
    else
      return !(this.PurchaseRequestValidator.hasError(validator, fieldName));
  }

}
