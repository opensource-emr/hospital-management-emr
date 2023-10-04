import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { ItemMaster } from '../../inventory/shared/item-master.model';
import { QuotationItemsModel } from './quotation-items.model';

export class QuotationModel {
  public QuotationId: number = 0;
  public ItemId: number = 0;
  public ItemName: string = "";
  public VendorId: number = null;
  public VendorName: string = "";

  public ReqForQuotationId: number = 0;
  public ReqForQuotationItemId: number = 0;
  public CreatedBy: number = 0;
  public Status: string = "";
  public Quantity: number = 0;
  public TotalAmount: number = 0;

  public item: ItemMaster = null;
  public SelectedItem: any = null;
  public quotationItems: Array<QuotationItemsModel> = new Array<QuotationItemsModel>();
 // public QuotationValidator: FormGroup = null;
  public StoreId: number;
  public RFQGroupId: number;
  public IssuedDate: string;

  // constructor() {

  //   var _formBuilder = new FormBuilder();
  //   this.QuotationValidator = _formBuilder.group({
  //     'VendorId': ['', Validators.compose([Validators.required])],

  //   });
  // }
  // public IsDirty(fieldName): boolean {
  //   if (fieldName == undefined)
  //     return this.QuotationValidator.dirty;
  //   else
  //     return this.QuotationValidator.controls[fieldName].dirty;
  // }


  // public IsValid(): boolean { if (this.QuotationValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
  //   if (fieldName == undefined) {
  //     return this.QuotationValidator.valid;
  //   }
  //   else
  //     return !(this.QuotationValidator.hasError(validator, fieldName));
  // }



}
