import { StockModel } from "./stock.model"
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { Requisition } from "./requisition.model";
import { ItemMaster } from "./item-master.model"
import * as moment from 'moment/moment';

export class RequisitionItems {
  public RequisitionItemId: number = 0;
  public ItemId: number = null;
  public Quantity: number = null;
  public ReceivedQuantity: number = 0;
  public PendingQuantity: number = 0;
  public RequisitionId: number = null;
  public RequisitionItemStatus: string = null
  public Remark: string = null;
  public AuthorizedBy: number = null;
  public AuthorizedOn: string = null;
  public AuthorizedRemark: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = moment().format('YYYY-MM-DD');
  public ModifiedBy: number = null;
  public ModifiedOn: Date = null;
  public IsActive: boolean = true;
  public ReceivedBy: string = "";
  public DispatchRemarks: string = "";
  public RequisitionItemValidator: FormGroup = null;
  public RequisitionNo: number = 0;
  public IssueNo: number = null;
  public MSSNO: string = null;
  public FirstWeekQty: string = null;
  public SecondWeekQty: string = null;
  public ThirdWeekQty: string = null;
  public FourthWeekQty: string = null;
  public MINNo: string = null;
  public MINDate: Date = null;
  //for selected itm
  public IsSelected: boolean;
  public IsEdited: boolean = false;
  public IsEditApplicable: boolean = true;


  //cancel itm qty
  public CancelQuantity: number = 0;
  public CancelBy: number = null;
  public CancelOn: string = "";
  public CancelRemarks: string = "";

  ////to make the instance ItemMaster with new row
  public SelectedItem: ItemMaster = null;

  //ItemName only for display purpose
  public ItemName: string = "";
  public Code: string = ""
  public Item: ItemMaster = null;
  public Requisition: Requisition = null;
  public RequestedByName: string = null;
  public CreatedByName: string = null;
  public DispatchedByName: string = null;
  public UOMName: string = null;
  public Remarks: string = null; //this is the main remark against requisition.
  public MatIssueTo: string = null;
  public MatIssueDate: Date = null;
  AvailableQuantity: number = 0;
  RequisitionDate: string;
  SourceStoreName: string;
  TargetStoreName: string;
  constructor() {

    var _formBuilder = new FormBuilder();
    this.RequisitionItemValidator = _formBuilder.group({
      'ItemId': ['', Validators.compose([Validators.required])],
      'Quantity': ['', Validators.compose([this.positiveNumberValidator])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.RequisitionItemValidator.dirty;
    else
      return this.RequisitionItemValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.RequisitionItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.RequisitionItemValidator.valid;
    }
    else
      return !(this.RequisitionItemValidator.hasError(validator, fieldName));
  }

  positiveNumberValidator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value <= 0)
        return { 'invalidNumber': true };
    }

  }

}
