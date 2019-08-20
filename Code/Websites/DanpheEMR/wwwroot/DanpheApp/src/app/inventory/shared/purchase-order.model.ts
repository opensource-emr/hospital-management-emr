import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PurchaseOrderItems } from "./purchase-order-items.model";

import { ItemMaster } from "../shared/item-master.model"
import { VendorMaster } from "../shared/vendor-master.model"
export class PurchaseOrder {

  public PurchaseOrderId: number = 0;
  public VendorId: number = null;
  public PoDate: string = null;
  public POStatus: string = null;
  public SubTotal: number = null;
  public VAT: number = 0;
  public TotalAmount: number = 0;
  public PORemark: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public TermsConditions: string = null;
  public VendorName: string = "";
  public VendorNo: string = "";
  public VATAmount: number = 0;
  public Terms: string = "";
  public VendorAddress: string = "";
  public ModifiedBy: number = null;
  public ModifiedOn: Date = null;

  public PurchaseOrderItems: Array<PurchaseOrderItems> = new Array<PurchaseOrderItems>();
  public PurchaseOrderValidator: FormGroup = null;


  public Item: ItemMaster = null;
  public Vendor: VendorMaster = null;
  constructor() {

    var _formBuilder = new FormBuilder();
    this.PurchaseOrderValidator = _formBuilder.group({
      'VendorId': ['', Validators.compose([Validators.required])],

    });
  }
  ngOnInit() {
    this.PurchaseOrderValidator.get('VendorId').valueChanges.subscribe(() => {
    this.PurchaseOrderValidator.updateValueAndValidity();
  });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PurchaseOrderValidator.dirty;
    else
      return this.PurchaseOrderValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.PurchaseOrderValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.PurchaseOrderValidator.valid;
    }
    else
      return !(this.PurchaseOrderValidator.hasError(validator, fieldName));
  }

}
