import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from "moment";
import { FixedAssetDispatchItems } from "./fixed-asset-dispatch-items.model";
//swapnil-2-april-2021 
export class FixedAssetDispatch {
  public DispatchId: number = 0;
  public RequisitionId: number = 0;
  public RequestedOn: string;
  public StoreId: number;
  public SubStoreId: number;
  public SubTotal: number;
  public Remark: string;
  public CreatedBy: number = 0;
  public CreatedOn: Date = null;
  public ReceivedBy: string;
  //ony for Display
  public DispatchedDate: string = moment().format();
  //for display purpose
  public SubStoreName: string;
  public DispatchItems: Array<FixedAssetDispatchItems> =
    new Array<FixedAssetDispatchItems>();


  public RequisitionValidator: FormGroup = null;
  constructor() {

    var _formBuilder = new FormBuilder();
    this.RequisitionValidator = _formBuilder.group({
      'SubStoreId': ['', Validators.compose([Validators.required])],

    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.RequisitionValidator.dirty;
    else
      return this.RequisitionValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.RequisitionValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.RequisitionValidator.valid;
    }
    else
      return !(this.RequisitionValidator.hasError(validator, fieldName));
  }

}