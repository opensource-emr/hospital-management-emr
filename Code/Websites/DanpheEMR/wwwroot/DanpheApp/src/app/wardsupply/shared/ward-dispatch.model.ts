import { WardDispatchItemsModel } from './ward-dispatch-items.model'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class WardispatchModel {
    public DispatchId: number = 0;
    public RequisitionId: number = 0;
    public StoreId: number = 0;
    public SubTotal: number = 0;
    public Remark: string = '';
    public CreatedBy: number = 0;
  public CreatedOn: string = '';
  public ReceivedBy: string = null;

  public WardDispatchedItemsList: Array<WardDispatchItemsModel> = new Array<WardDispatchItemsModel>();

  public DispatchValidator: FormGroup = null;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.DispatchValidator = _formBuilder.group({
      'ReceivedBy': ['', Validators.compose([Validators.required])]
    });
  }


  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.DispatchValidator.dirty;
    else
      return this.DispatchValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.DispatchValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.DispatchValidator.valid;
    }
    else
      return !(this.DispatchValidator.hasError(validator, fieldName));
  }

}
